/**
 * AgentB2.ts — Competing Worker Agent
 *
 * A second independent worker that monitors the task market and races Agent B
 * for available tasks. Demonstrates real market competition — multiple workers,
 * one winner, one who loses the race and keeps scanning.
 *
 * Uses account index 1 of Agent B's seed phrase so it has a distinct on-chain
 * address without requiring a separate seed phrase to be configured.
 */

import 'dotenv/config'
import { createWDKClient } from '../wallet/WDKClient.js'
import { TaskRegistry } from '../core/TaskRegistry.js'
import { Task, TaskStatus } from '../core/types.js'
import { log } from '../dashboard/Dashboard.js'

const RPC     = process.env.SEPOLIA_RPC_URL!
const POLL_MS = 2_500   // slightly faster poll than Agent B (3s) — genuine race

export class AgentB2 {
  address = ''

  constructor(private registry: TaskRegistry) {}

  async run(): Promise<void> {
    // Derive a distinct address via account index 1 of Agent B's seed phrase
    const wallet = await createWDKClient(process.env.AGENT_B_SEED_PHRASE!, RPC, 1)
    this.address = await wallet.getAddress()
    wallet.dispose()  // B2 only needs the address — winner is determined by the race

    log('Agent B2', `Wallet ready — entering task market as a competing worker`)
    log('Agent B2', `Scanning for OPEN tasks every ${POLL_MS / 1000}s...`)

    // Slight startup delay so Agent B (the primary worker) has time to claim
    // the first task. B2 is a competing worker — it should occasionally lose.
    await sleep(13_000)

    let raceLostLogged  = false
    let settledLogged   = false

    while (true) {
      const open = this.registry.getOpenTasks()

      if (open.length > 0) {
        const task = open[0]
        // Attempt to claim the task — may lose to Agent B if it polls first
        try {
          this.registry.acceptTask(task.id, this.address)
          // Won the race (unexpected in demo flow — Agent B polls faster at startup)
          log('Agent B2', `Task ${task.id.slice(0, 8)}… CLAIMED — starting analysis...`)
          log('Agent B2', `(Agent B was slower this round — market is competitive)`)
          break
        } catch {
          // Agent B accepted it between our getOpenTasks() check and acceptTask() call
          if (!raceLostLogged) {
            log('Agent B2', `Task ${task.id.slice(0, 8)}… — race lost by a thread. Agent B was faster.`)
            log('Agent B2', `Resuming market scan for next opportunity...`)
            raceLostLogged = true
          }
        }
      } else {
        // No open tasks — inspect market state and log once per state change
        const all = this.registry.getAllTasks()

        const inProgress = all.filter((t: Task) => t.status === TaskStatus.IN_PROGRESS)
        if (inProgress.length > 0 && !raceLostLogged) {
          log('Agent B2', `Task ${inProgress[0].id.slice(0, 8)}… is IN_PROGRESS — claimed by another worker. Monitoring...`)
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
            log('Agent B2', `Market cycle complete — task FAILED. Escrow refunded to poster.`)
          }
          log('Agent B2', `Standing by for next task posting...`)
          settledLogged = true
        }
      }

      await sleep(POLL_MS)
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
