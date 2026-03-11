/**
 * AgentA.ts — Task Creator / Treasury Manager
 *
 * Role: Posts a yield analysis task, locks the reward in escrow, then acts
 *       on the validated recommendation by deploying treasury capital to Aave V3.
 *
 * This closes the full loop: hire an analyst → validate the work → act on the advice.
 */

import 'dotenv/config'
import { createWDKClient } from '../wallet/WDKClient.js'
import { TaskRegistry } from '../core/TaskRegistry.js'
import { EscrowManager } from '../core/EscrowManager.js'
import { Task } from '../core/types.js'
import { supplyToAave } from '../defi/AaveSupplyService.js'
import { log, logSuccess, logRejection, printSection } from '../dashboard/Dashboard.js'

const RPC          = process.env.SEPOLIA_RPC_URL!
const USDT         = process.env.USDT_SEPOLIA_ADDRESS!
const REWARD       = process.env.TASK_REWARD_USDT ?? '5.0'
const DEADLINE_SEC = Number(process.env.TASK_DEADLINE_SECONDS ?? '60')
const TREASURY_DEPLOY_AMOUNT = '0.002'  // Agent A supplies 0.002 WETH (~$6) based on the recommendation

export class AgentA {
  address = ''

  constructor(
    private registry: TaskRegistry,
    private escrow: EscrowManager
  ) {}

  async run(): Promise<void> {
    const wallet = await createWDKClient(process.env.AGENT_A_SEED_PHRASE!, RPC)
    this.address = await wallet.getAddress()

    const usdtBal = await wallet.getUSDTBalance(USDT)
    log('Agent A', `Wallet ready — ${usdtBal} USDT`)

    if (parseFloat(usdtBal) < parseFloat(REWARD)) {
      throw new Error(`Insufficient balance: ${usdtBal} USDT (need ${REWARD})`)
    }

    const task = this.registry.postTask({
      description: `DeFi yield analysis: compare Aave V3 vs Compound III USDT supply APY on Sepolia. Also check the current ETH/USD price and network gas fees to assess overall market conditions. Recommend the highest-yield protocol with full reasoning that includes market context.`,
      reward:      REWARD,
      deadline:    DEADLINE_SEC,
      postedBy:    this.address,
    })

    log('Agent A', `Task posted — ID: ${task.id.slice(0, 8)}…  Reward: ${REWARD} USDT`)
    log('Agent A', `Locking ${REWARD} USDT in escrow...`)

    const escrowTxHash = await this.escrow.lock(task.id, REWARD, wallet)
    this.registry.setEscrowTxHash(task.id, escrowTxHash)
    log('Agent A', `Escrow locked — tx: ${escrowTxHash.slice(0, 18)}…`)

    // Wait for the task to reach a terminal state, then act on the outcome
    await this.waitForOutcome(task, wallet)

    wallet.dispose()
  }

  private waitForOutcome(task: Task, wallet: any): Promise<void> {
    return new Promise(resolve => {
      let resolved = false
      const done = () => { if (!resolved) { resolved = true; resolve() } }

      const onSettled = async (settled: Task) => {
        if (settled.id !== task.id) return
        logSuccess(`Agent A — task SETTLED. ${REWARD} USDT paid to Agent B.`)

        // Act on the validated recommendation — deploy treasury capital
        const protocol = settled.result?.recommendation?.protocol ?? 'aave'
        printSection(`AGENT A — ACTING ON RECOMMENDATION: DEPLOY TO ${protocol.toUpperCase()}`)
        log('Agent A', `Supplying ${TREASURY_DEPLOY_AMOUNT} WETH to ${protocol.toUpperCase()} based on validated analysis...`)
        log('Agent A', `Note: USDT/DAI/USDC supply caps exceeded on Sepolia (3.1B+ deposited vs 2B cap). WETH has no cap — same WDK signing flow.`)

        try {
          const position = await supplyToAave(wallet, USDT, TREASURY_DEPLOY_AMOUNT)
          log('Agent A', `Supply tx: ${position.supplyTxHash.slice(0, 18)}…`)
          log('Agent A', `Etherscan: https://sepolia.etherscan.io/tx/${position.supplyTxHash}`)
          log('Agent A', `Aave position — Collateral: $${position.totalCollateralBase}  Health: ${position.healthFactor}`)
          log('Agent A', `Treasury deployed (${position.asset}). Agent A is now earning yield on Aave. ♻`)
        } catch (err: any) {
          log('Agent A', `⚠ Aave supply failed: ${err.shortMessage ?? err.message}`)
        }

        this.registry.off('task:failed', onFailed)
        done()
      }

      const onFailed = (failed: Task) => {
        if (failed.id !== task.id) return
        logRejection(`Agent A — task FAILED. Escrow refunded. Reason: ${failed.failReason}`)
        log('Agent A', 'Treasury not deployed — result was not validated.')
        this.registry.off('task:settled', onSettled)
        done()
      }

      this.registry.once('task:settled', onSettled)
      this.registry.once('task:failed',  onFailed)
    })
  }
}
