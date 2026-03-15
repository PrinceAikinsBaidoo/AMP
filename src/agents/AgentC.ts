/**
 * AgentC.ts — Validator Agent
 *
 * Role: Independent quality assurance agent that controls payment release.
 */

import 'dotenv/config'
import { createWDKClient } from '../wallet/WDKClient.js'
import { TaskRegistry } from '../core/TaskRegistry.js'
import { EscrowManager } from '../core/EscrowManager.js'
import { Task, RawRates } from '../core/types.js'
import { runFullValidation } from '../validation/ValidationOrchestrator.js'
import { log, logValidation, printSection, printSettlement, printRefund } from '../dashboard/Dashboard.js'
import { broadcast } from '../ws/EventBroadcaster.js'

const RPC     = process.env.SEPOLIA_RPC_URL!
const USDT    = process.env.USDT_SEPOLIA_ADDRESS!
const POLL_MS = 2_000

export class AgentC {
  private address = ''

  constructor(
    private registry: TaskRegistry,
    private escrow: EscrowManager
  ) {}

  async run(): Promise<void> {
    const wallet = await createWDKClient(process.env.AGENT_C_SEED_PHRASE!, RPC)
    this.address = await wallet.getAddress()

    const usdtBal = await wallet.getUSDTBalance(USDT)
    log('Agent C', `Wallet ready — ${usdtBal} USDT`)
    broadcast({ type: 'agent_ready', agent: 'C', address: this.address, balance: usdtBal })
    log('Agent C', 'Polling for PENDING_VALIDATION tasks...')

    let taskToValidate: Task | null = null
    while (!taskToValidate) {
      const pending = this.registry.getPendingValidation()
      if (pending.length > 0) {
        taskToValidate = pending[0]
      } else {
        await sleep(POLL_MS)
      }
    }

    await this.validate(taskToValidate)
    wallet.dispose()
  }

  private async validate(task: Task): Promise<void> {
    const result = task.result!

    printSection('VALIDATION — Agent C')
    log('Agent C', `Task: ${task.id.slice(0, 8)}…  Worker: ${result.workerId.slice(0, 10)}…`)
    log('Agent C', 'Running 3-layer validation...')

    const rawRates: RawRates = {
      aave:      result.protocols.find(p => p.name === 'aave')?.supplyAPY ?? 0,
      compound:  result.protocols.find(p => p.name === 'compound')?.supplyAPY ?? 0,
      source:    result.dataSource === 'live-sepolia' ? 'live' : 'fallback',
      timestamp: result.timestamp,
    }

    // Print the actual data under review so every validation line is auditable
    log('Agent C', `Data source: ${result.dataSource}  |  age: ${Date.now() - result.timestamp}ms`)
    for (const p of result.protocols) {
      log('Agent C', `  ${p.name.padEnd(10)} APY: ${p.supplyAPY.toFixed(4)}%  rawRate: ${p.rawRate}`)
    }
    log('Agent C', `  rec → ${result.recommendation.protocol} @ ${result.recommendation.apy.toFixed(4)}%`)
    const reasoning = result.recommendation.reasoning
    log('Agent C', `  reasoning: "${reasoning.slice(0, 120)}${reasoning.length > 120 ? '…' : ''}"`)

    const verdict = await runFullValidation(result, rawRates)

    logValidation('Layer 1  Schema', verdict.layer1.passed, verdict.layer1.reason)
    logValidation('Layer 2  Sanity', verdict.layer2.passed, verdict.layer2.reason)
    logValidation('Layer 3  Claude', verdict.layer3.passed, verdict.layer3.reason)

    broadcast({ type: 'validation_layer', layer: 1, passed: verdict.layer1.passed, detail: verdict.layer1.reason ?? '' })
    broadcast({ type: 'validation_layer', layer: 2, passed: verdict.layer2.passed, detail: verdict.layer2.reason ?? '' })
    broadcast({ type: 'validation_layer', layer: 3, passed: verdict.layer3.passed, detail: verdict.layer3.reason ?? '' })

    if (verdict.finalVerdict === 'APPROVED') {
      const workerLabel = `${result.workerId.slice(0, 6)}…${result.workerId.slice(-4)}`
      log('Agent C', `Verdict: APPROVED — releasing escrow to ${workerLabel}...`)
      const txHash = await this.escrow.release(task.id, result.workerId)
      this.registry.settleTask(task.id, txHash, verdict)
      printSettlement(txHash, task.reward, workerLabel)
      broadcast({ type: 'verdict', result: 'APPROVED', reason: '' })
      broadcast({ type: 'escrow_released', txHash, recipient: result.workerId, amount: task.reward })
    } else {
      const reason = verdict.layer3.reason ?? verdict.layer2.reason ?? 'Validation failed'
      log('Agent C', `Verdict: REJECTED — ${reason}`)
      log('Agent C', 'Refunding escrow to Agent A...')
      const txHash = await this.escrow.refund(task.id, task.postedBy)
      this.registry.failTask(task.id, reason, verdict)
      printRefund(txHash, task.reward)
      broadcast({ type: 'verdict', result: 'REJECTED', reason })
      broadcast({ type: 'escrow_refunded', txHash, amount: task.reward })
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
