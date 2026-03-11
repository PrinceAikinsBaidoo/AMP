/**
 * GasPriceAdapter.ts
 * Fetches current Sepolia network gas conditions via ethers provider.
 * Reports base fee (EIP-1559) and estimates cost for a standard DeFi tx (~200k gas).
 */

import { ethers } from 'ethers'

const GAS_UNITS_DEFI_TX = 200_000   // typical Aave supply gas usage

export interface GasPriceData {
  baseFeeGwei:        number   // current base fee in gwei
  estimatedTxCostEth: number   // estimated cost for a 200k gas DeFi tx in ETH
  source:             string
}

export async function getNetworkGasPrice(): Promise<GasPriceData> {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL!)
    const feeData  = await provider.getFeeData()

    const baseFeeWei  = feeData.gasPrice ?? feeData.maxFeePerGas ?? 1_000_000_000n
    const baseFeeGwei = Number(ethers.formatUnits(baseFeeWei, 'gwei'))

    const txCostWei = baseFeeWei * BigInt(GAS_UNITS_DEFI_TX)
    const estimatedTxCostEth = Number(ethers.formatEther(txCostWei))

    return { baseFeeGwei, estimatedTxCostEth, source: 'live' }
  } catch {
    return { baseFeeGwei: 5.0, estimatedTxCostEth: 0.001, source: 'fallback' }
  }
}
