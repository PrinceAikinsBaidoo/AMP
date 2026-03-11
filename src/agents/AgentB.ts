/**
 * AgentB.ts — Worker Agent
 *
 * Role: DeFi analyst that earns USDT by executing yield analysis tasks.
 * After receiving payment, autonomously supplies earnings to Aave V3 via WDK.
 *
 * Key design: Agent B is task-driven, not hardcoded.
 * doWork() passes the task description to Claude, which uses the tool_use API
 * to decide which protocols to query, fetches live on-chain data, and submits
 * a structured recommendation — all without Agent B knowing the task in advance.
 */

import 'dotenv/config'
import { createWDKClient, WDKClient } from '../wallet/WDKClient.js'
import { TaskRegistry } from '../core/TaskRegistry.js'
import { Task, TaskResult, TaskStatus } from '../core/types.js'
import { executeAgentTask } from '../ai/ClaudeClient.js'
import { supplyToAave } from '../defi/AaveSupplyService.js'
import { log, printSection } from '../dashboard/Dashboard.js'

const RPC     = process.env.SEPOLIA_RPC_URL!
const USDT    = process.env.USDT_SEPOLIA_ADDRESS!
const POLL_MS = 3_000
const SUPPLY_AMOUNT = '0.001'  // Agent B supplies 0.001 WETH (~$3) of its earnings to Aave

export class AgentB {
  address = ''

  constructor(
    private registry: TaskRegistry,
    private forceInjectBad = false,
  ) {}

  async run(): Promise<void> {
    const wallet = await createWDKClient(process.env.AGENT_B_SEED_PHRASE!, RPC)
    this.address = await wallet.getAddress()

    const usdtBal = await wallet.getUSDTBalance(USDT)
    log('Agent B', `Wallet ready — ${usdtBal} USDT`)
    log('Agent B', `Polling for OPEN tasks every ${POLL_MS / 1000}s...`)

    let acceptedTask: Task | null = null
    while (!acceptedTask) {
      const open = this.registry.getOpenTasks()
      if (open.length > 0) {
        acceptedTask = open[0]
        this.registry.acceptTask(acceptedTask.id, this.address)
        log('Agent B', `Task accepted — ID: ${acceptedTask.id.slice(0, 8)}…  Reward: ${acceptedTask.reward} USDT`)
      } else {
        // Another worker claimed the task — exit gracefully
        const claimed = this.registry.getAllTasks().filter(
          t => t.status !== TaskStatus.OPEN
        )
        if (claimed.length > 0) {
          log('Agent B', `Lost the race — another worker is handling the task. Standing by.`)
          wallet.dispose()
          return
        }
        await sleep(POLL_MS)
      }
    }

    await this.doWork(acceptedTask, wallet)

    // Wait for outcome — wallet stays alive so we can supply to Aave on payment
    await this.waitForOutcome(acceptedTask.id, wallet)

    wallet.dispose()
  }

  protected async doWork(task: Task, _wallet: WDKClient): Promise<void> {
    const injectBad           = this.forceInjectBad || process.env.INJECT_BAD_DATA === 'true'
    const injectSchemaFail    = process.env.INJECT_SCHEMA_FAIL     === 'true'
    const injectWrongProtocol = process.env.INJECT_WRONG_PROTOCOL  === 'true'

    if (injectBad)           log('Agent B', '⚠  INJECT_BAD_DATA=true — fake 500%/499% APY injected into tool results (Layer 2 target)')
    if (injectSchemaFail)    log('Agent B', '⚠  INJECT_SCHEMA_FAIL=true — will submit malformed result with missing fields (Layer 1 target)')
    if (injectWrongProtocol) log('Agent B', '⚠  INJECT_WRONG_PROTOCOL=true — will recommend the lower-yield protocol (Layer 2 target)')

    log('Agent B', `Reading task: "${task.description.slice(0, 72)}..."`)

    // ── INJECTION: Schema failure (Layer 1 target) ────────────────────────────
    // Bypass Claude entirely and submit a structurally broken result.
    // Zod rejects it immediately — Layers 2 & 3 are skipped. Escrow refunded.
    if (injectSchemaFail) {
      const malformed = {
        taskId:   'NOT-A-VALID-UUID',      // fails z.string().uuid()
        workerId: this.address,
        // deliberately missing: timestamp, protocols, recommendation, dataSource
      }
      log('Agent B', 'Submitting malformed result — missing timestamp, protocols, recommendation...')
      this.registry.submitResult(task.id, malformed as any)
      log('Agent B', 'Malformed result submitted — PENDING_VALIDATION. Waiting for Agent C...')
      return
    }

    log('Agent B', 'Handing off to Claude — it will decide which protocols to query...')

    // Claude reads the task description and calls on-chain tools autonomously
    const { protocols, recommendation, dataSource, toolsInvoked } = await executeAgentTask(
      task.description,
      injectBad
    )

    log('Agent B', `Claude invoked tools: ${toolsInvoked.join(', ')}`)
    for (const p of protocols) {
      log('Agent B', `${p.name.padEnd(10)} APY: ${p.supplyAPY.toFixed(4)}%`)
    }

    // ── INJECTION: Wrong protocol (Layer 2 target) ───────────────────────────
    // Override Claude's recommendation to the LOWER-yield option post-fetch.
    // Layer 2 check: "must recommend the highest-yield protocol" catches this.
    if (injectWrongProtocol && protocols.length >= 2) {
      const worst = protocols.reduce((a, b) => a.supplyAPY < b.supplyAPY ? a : b)
      recommendation.protocol  = worst.name
      recommendation.apy       = worst.supplyAPY
      recommendation.reasoning =
        `Recommending ${worst.name} for portfolio diversification and concentration risk reduction. ` +
        `By accepting a lower yield we avoid overexposure to a single high-APY protocol, distributing treasury capital across multiple venues for resilience.`
      log('Agent B', `⚠  Override: recommending ${worst.name} @ ${worst.supplyAPY.toFixed(4)}% (lower-yield — Layer 2 injection)`)
    } else {
      log('Agent B', `Claude recommends: ${recommendation.protocol} @ ${recommendation.apy.toFixed(4)}%`)
    }

    const result: TaskResult = {
      taskId:    task.id,
      workerId:  this.address,
      timestamp: Date.now(),
      protocols: protocols as TaskResult['protocols'],
      recommendation,
      dataSource,
    }

    this.registry.submitResult(task.id, result)
    log('Agent B', 'Result submitted — PENDING_VALIDATION. Waiting for Agent C...')
  }

  private waitForOutcome(taskId: string, wallet: WDKClient, timeoutMs = 120_000): Promise<void> {
    return new Promise(resolve => {
      let resolved = false
      const done = () => { if (!resolved) { resolved = true; resolve() } }

      const onSettled = async (task: Task) => {
        if (task.id !== taskId) return
        log('Agent B', `Payment received ✅  ${task.reward} USDT`)

        // Autonomously supply earnings to Aave — demonstrates the full lending bot loop
        printSection('AGENT B — AUTO-INVESTING EARNINGS IN AAVE V3')
        log('Agent B', `Supplying ${SUPPLY_AMOUNT} WETH to Aave V3 via WDK...`)
        log('Agent B', `Note: USDT supply cap exceeded on Sepolia testnet (3.1B deposited vs 2B cap). Supplying WETH — same WDK signing flow.`)
        try {
          const position = await supplyToAave(wallet, USDT, SUPPLY_AMOUNT)
          log('Agent B', `Supply tx: ${position.supplyTxHash.slice(0, 18)}…`)
          log('Agent B', `Etherscan: https://sepolia.etherscan.io/tx/${position.supplyTxHash}`)
          log('Agent B', `Aave position — Collateral: $${position.totalCollateralBase}  Health: ${position.healthFactor}`)
          log('Agent B', `Earnings deployed (${position.asset}). Agent B is now earning yield on Aave. ♻`)
        } catch (err: any) {
          log('Agent B', `⚠ Aave supply failed: ${err.shortMessage ?? err.message}`)
        }

        this.registry.off('task:failed', onFailed)
        done()
      }

      const onFailed = (task: Task) => {
        if (task.id !== taskId) return
        log('Agent B', `Task rejected ❌ — no payment. Reason: ${task.failReason}`)
        this.registry.off('task:settled', onSettled)
        done()
      }

      this.registry.once('task:settled', onSettled)
      this.registry.once('task:failed',  onFailed)
      setTimeout(done, timeoutMs)
    })
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
