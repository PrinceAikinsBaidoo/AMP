/**
 * EscrowManager.ts
 * Manages USDT escrow for task payments using a dedicated WDK wallet.
 *
 * Flow:
 *   lock()    — Agent A sends reward USDT → escrow wallet (on task post)
 *   release() — Escrow wallet sends USDT → Agent B wallet (on APPROVED)
 *   refund()  — Escrow wallet sends USDT → Agent A wallet (on REJECTED)
 */

import { WDKClient } from '../wallet/WDKClient.js'

export class EscrowManager {
  private taskLocks = new Map<string, string>()  // taskId → amount

  constructor(
    private wallet: WDKClient,
    private address: string,
    private usdtAddress: string
  ) {}

  /**
   * Lock funds: transfer reward from Agent A's wallet into escrow.
   * Returns the on-chain txHash.
   */
  async lock(
    taskId: string,
    amount: string,
    fromWallet: WDKClient
  ): Promise<string> {
    const txHash = await fromWallet.sendUSDT(this.address, amount, this.usdtAddress)
    this.taskLocks.set(taskId, amount)
    return txHash
  }

  /**
   * Release funds to a recipient (worker on APPROVED).
   * Returns the on-chain txHash.
   */
  async release(taskId: string, toAddress: string): Promise<string> {
    const amount = this.taskLocks.get(taskId)
    if (!amount) throw new Error(`No escrow locked for task ${taskId}`)
    const txHash = await this.wallet.sendUSDT(toAddress, amount, this.usdtAddress)
    this.taskLocks.delete(taskId)
    return txHash
  }

  /**
   * Refund funds back to the poster (on REJECTED / timeout).
   * Returns the on-chain txHash.
   */
  async refund(taskId: string, toAddress: string): Promise<string> {
    return this.release(taskId, toAddress)
  }

  getLockedAmount(taskId: string): string | undefined {
    return this.taskLocks.get(taskId)
  }

  getAddress(): string {
    return this.address
  }
}
