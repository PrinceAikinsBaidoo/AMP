/**
 * AgentB2.ts — Competing Worker Agent
 *
 * A second independent worker that monitors the task market and races Agent B
 * for available tasks. Demonstrates real market competition — multiple workers,
 * one winner, one who loses the race.
 *
 * Cycle 1: B2 loses on purpose (startup delay lets B win) — shows B2 monitoring.
 * Cycle 2: B2 wins the race and submits fraudulent data, demonstrating that the
 *           3-layer validation system catches bad actors regardless of who wins.
 *
 * Uses account index 1 of Agent B's seed phrase so it has a distinct on-chain
 * address without requiring a separate seed phrase.
 */

import 'dotenv/config'
import { createWDKClient } from '../wallet/WDKClient.js'
import { TaskRegistry } from '../core/TaskRegistry.js'
import { Task, TaskResult, TaskStatus } from '../core/types.js'
import { log } from '../dashboard/Dashboard.js'
import { broadcast } from '../ws/EventBroadcaster.js'

const RPC     = process.env.SEPOLIA_RPC_URL!
const POLL_MS = 2_500   // slightly faster poll than Agent B (3s) — genuine race

export class AgentB2 {
  address = ''

  constructor(
    private registry: TaskRegistry,
    private delayMs  = 13_000,   // startup delay — set to 0 for cycle 2 so B2 wins
    private cycleNum = 1,
  ) {}

  async run(): Promise<void> {
    const wallet = await createWDKClient(process.env.AGENT_B_SEED_PHRASE!, RPC, 1)
    this.address = await wallet.getAddress()
    wallet.dispose()  // B2 only needs the address — winner is determined by the race

    log('Agent B2', `Wallet ready — entering task market as a competing worker`)
    broadcast({ type: 'agent_ready', agent: 'B2', address: this.address, balance: '' })
    log('Agent B2', `Scanning for OPEN tasks every ${POLL_MS / 1000}s...`)

    if (this.delayMs > 0) {
      await sleep(this.delayMs)
    }

    let raceLostLogged  = false
    let settledLogged   = false

    while (true) {
      const open = this.registry.getOpenTasks()

      if (open.length > 0) {
        const task = open[0]
        try {
          this.registry.acceptTask(task.id, this.address)
          log('Agent B2', `Task ${task.id.slice(0, 8)}… CLAIMED — starting analysis...`)
          broadcast({ type: 'task_accepted', agent: 'B2', taskId: task.id, reward: task.reward })

          if (this.cycleNum === 2) {
            // Adversarial path: submit fraudulent inflated APY data
            await this.submitFraudulentResult(task)
          } else {
            // Cycle 1 win (unexpected) — log and exit without doing work
            log('Agent B2', `(Agent B was slower this round — market is competitive)`)
          }
          return
        } catch {
          // Another worker accepted between our check and claim
          if (!raceLostLogged) {
            log('Agent B2', `Task ${task.id.slice(0, 8)}… — race lost by a thread. Agent B was faster.`)
            log('Agent B2', `Resuming market scan for next opportunity...`)
            raceLostLogged = true
          }
        }
      } else {
        const all = this.registry.getAllTasks()

        const inProgress = all.filter((t: Task) => t.status === TaskStatus.IN_PROGRESS)
        if (inProgress.length > 0 && !raceLostLogged) {
          log('Agent B2', `Task ${inProgress[0].id.slice(0, 8)}… is IN_PROGRESS — claimed by Agent B. Monitoring...`)
          raceLostLogged = true
        }

        const terminal = all.filter(
          (t: Task) => t.status === TaskStatus.SETTLED || t.status === TaskStatus.FAILED
        )
        if (terminal.length > 0 && !settledLogged) {
          const t = terminal[0]
          if (t.status === TaskStatus.SETTLED) {
            log('Agent B2', `Market cycle complete — task SETTLED. Winner earned ${t.reward} USDT.`)
          } else {
            log('Agent B2', `Market cycle complete — task FAILED/REJECTED. Escrow refunded.`)
          }
          settledLogged = true
          return   // cycle is done — exit cleanly
        }
      }

      await sleep(POLL_MS)
    }
  }

  private async submitFraudulentResult(task: Task): Promise<void> {
    log('Agent B2', `⚠  ADVERSARIAL MODE — injecting fraudulent 500% APY data to try to steal reward`)

    // Fabricated result with unrealistic APY — Layer 2 sanity check will catch this
    const fakeResult: TaskResult = {
      taskId:    task.id,
      workerId:  this.address,
      timestamp: Date.now(),
      protocols: [
        { name: 'aave',     supplyAPY: 500.00, rawRate: '5000000000000000000000000000' },
        { name: 'compound', supplyAPY: 499.00, rawRate: '158443823'                    },
      ],
      recommendation: {
        protocol:  'aave',
        apy:       500.00,
        reasoning: `Aave V3 offers exceptional 500% APY with deep liquidity and robust liquidation mechanisms. Risk-adjusted returns are superior given protocol maturity, $2B+ TVL, and battle-tested smart contracts. Recommend full allocation to maximize yield capture.`,
      },
      dataSource: 'live-sepolia',
    }

    this.registry.submitResult(task.id, fakeResult)
    log('Agent B2', `Fraudulent result submitted — PENDING_VALIDATION. Waiting for Agent C...`)
    broadcast({ type: 'result_submitted', agent: 'B2', fraudulent: true })
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
