/**
 * AaveAdapter.ts
 * Fetches the USDT supply APY from Aave V3 on Sepolia via direct contract call.
 *
 * Note: The WDK Aave module (@tetherto/wdk-protocol-lending-aave-evm) only exposes
 * transactional operations (supply/borrow/repay). Rate reading requires calling
 * the Aave ProtocolDataProvider contract directly via ethers.
 *
 * Contract: Aave V3 ProtocolDataProvider
 * Address:  process.env.AAVE_DATA_PROVIDER_SEPOLIA (0x3e9708d80f7B3e43118013075F7e95CE3AB31F31)
 * Method:   getReserveData(address asset) → tuple (index 5 = liquidityRate in ray format)
 * Ray:      1e27 units → divide by 1e25 to get percentage APY
 */

import { ethers } from 'ethers'

const DATA_PROVIDER_ABI = [
  'function getReserveData(address asset) view returns (uint256 unbacked, uint256 accruedToTreasuryScaled, uint256 totalAToken, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)'
]

// Realistic fallback APY for Aave V3 USDT supply (used if live call fails)
const FALLBACK_APY = 4.82

export async function getAaveUSDTRate(): Promise<{ apy: number; rawRate: string; source: 'live' | 'fallback' }> {
  const rpc            = process.env.SEPOLIA_RPC_URL!
  const dataProvider   = process.env.AAVE_DATA_PROVIDER_SEPOLIA!
  const usdtAddress    = process.env.USDT_SEPOLIA_ADDRESS!

  try {
    const provider = new ethers.JsonRpcProvider(rpc)
    const contract = new ethers.Contract(dataProvider, DATA_PROVIDER_ABI, provider)
    const data = await contract.getReserveData(usdtAddress)

    // liquidityRate is at index 5, in ray units (1e27)
    const liquidityRate: bigint = data[5]
    const rawRate = liquidityRate.toString()

    // ray → percentage: divide by 1e25
    const apy = Number(liquidityRate) / 1e25

    return { apy, rawRate, source: 'live' }
  } catch (err: any) {
    console.warn(`[AaveAdapter] Live rate fetch failed: ${err.shortMessage ?? err.message}`)
    return { apy: FALLBACK_APY, rawRate: 'fallback', source: 'fallback' }
  }
}
