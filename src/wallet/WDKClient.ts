/**
 * WDKClient.ts
 * Wrapper around Tether WDK for agent wallet operations.
 * Handles: init, get address, check USDT balance, send USDT.
 *
 * WDK API (from source):
 *   account.getAddress() → Promise<string>
 *   account.transfer({ token, recipient, amount }) → Promise<{ hash, fee }>
 *   account.sendTransaction({ to, value, data }) → Promise<{ hash, fee }>
 *   account.getTransactionReceipt(hash) → Promise<TransactionReceipt | null>
 */

import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import { ethers, formatUnits, parseUnits } from 'ethers'

const ERC20_ABI = ['function balanceOf(address owner) view returns (uint256)']

export class WDKClient {
  private wdk: WDK
  private account: any
  private provider: ethers.JsonRpcProvider

  constructor(
    private seedPhrase: string,
    private rpcUrl: string
  ) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl)
    this.wdk = new WDK(seedPhrase).registerWallet('ethereum', WalletManagerEvm, {
      provider: rpcUrl,
    })
  }

  async init(accountIndex = 0): Promise<void> {
    this.account = await this.wdk.getAccount('ethereum', accountIndex)
  }

  async getAddress(): Promise<string> {
    return this.account.getAddress()
  }

  /**
   * Get USDT balance in human-readable units (USDT has 6 decimals).
   */
  async getUSDTBalance(usdtAddress: string): Promise<string> {
    const address = await this.getAddress()
    const usdt = new ethers.Contract(usdtAddress, ERC20_ABI, this.provider)
    const raw: bigint = await usdt.balanceOf(address)
    return formatUnits(raw, 6)
  }

  /**
   * Send USDT using WDK's native transfer method.
   * amount: human-readable string e.g. "5.0"
   * Returns transaction hash.
   */
  async sendUSDT(toAddress: string, amount: string, usdtAddress: string): Promise<string> {
    const amountRaw = parseUnits(amount, 6)

    // WDK native transfer: handles ERC-20 calldata encoding internally
    const { hash } = await this.account.transfer({
      token: usdtAddress,
      recipient: toAddress,
      amount: amountRaw,
    })

    return hash
  }

  /**
   * Get native Sepolia ETH balance (to verify gas availability).
   */
  async getEthBalance(): Promise<string> {
    const address = await this.getAddress()
    const raw = await this.provider.getBalance(address)
    return formatUnits(raw, 18)
  }

  /**
   * Send a raw contract call (arbitrary calldata).
   * Used for contract interactions beyond simple USDT transfers (e.g. minting, Aave ops).
   */
  async sendTransaction(to: string, data: string, value = 0n): Promise<string> {
    const { hash } = await this.account.sendTransaction({ to, data, value })
    return hash
  }

  /**
   * Approve a spender to spend tokens — uses WDK's native approve.
   * USDT requires resetting allowance to 0 before setting a new amount.
   * Call approve(spender, token, 0n) first, then approve(spender, token, amount).
   */
  async approve(spender: string, token: string, amount: bigint): Promise<string> {
    const { hash } = await this.account.approve({ token, spender, amount })
    return hash
  }

  /**
   * Expose the raw WalletAccountEvm for WDK protocol modules (e.g. AaveProtocolEvm).
   */
  getRawAccount(): any {
    return this.account
  }

  /**
   * Wait for a transaction to be mined and return the receipt.
   */
  async waitForTx(hash: string) {
    return this.account.getTransactionReceipt(hash)
  }

  dispose(): void {
    this.wdk.dispose()
  }
}

/**
 * Factory — creates and initializes a WDKClient for a given agent.
 */
export async function createWDKClient(
  seedPhrase: string,
  rpcUrl: string,
  accountIndex = 0
): Promise<WDKClient> {
  const client = new WDKClient(seedPhrase, rpcUrl)
  await client.init(accountIndex)
  return client
}
