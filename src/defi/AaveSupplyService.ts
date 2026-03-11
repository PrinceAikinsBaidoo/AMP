/**
 * AaveSupplyService.ts
 * Supplies WETH to Aave V3 on Sepolia.
 *
 * Why WETH instead of USDT?
 *   The USDT, DAI, and USDC supply caps on the Sepolia Aave V3 pool were hit by
 *   historical test deposits (cap=2B, current≈3.1–3.7B). Aave error 51 =
 *   SUPPLY_CAP_EXCEEDED. WETH has no supply cap (supplyCap=0 = unlimited).
 *
 *   We wrap a small amount of Sepolia ETH → WETH, then supply to Aave.
 *   All txs still go through WDK — the lending-bot loop is identical.
 *
 * Flow:
 *   1. assertReserveSupplyable() — read Data Provider, gate on isActive/isFrozen/supplyCap
 *   2. WETH.deposit{ value: amountWei }() — wrap ETH → WETH via WDK sendTransaction
 *   3. WETH.approve(AavePool, amount) — via WDK native approve
 *   4. Pool.supply(WETH, amount, onBehalfOf, 0) — via WDK sendTransaction
 *   5. Pool.getUserAccountData(user) — read back position
 *
 * Aave V3 Pool (Sepolia):          0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951
 * Aave V3 Data Provider (Sepolia): 0x3e9708d80f7B3e43118013075F7e95CE3AB31F31
 * WETH (Sepolia):                  0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c
 */

import { ethers } from 'ethers'
import { WDKClient } from '../wallet/WDKClient.js'

const AAVE_POOL_SEPOLIA          = '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951'
const AAVE_DATA_PROVIDER_SEPOLIA = '0x3e9708d80f7B3e43118013075F7e95CE3AB31F31'
export const WETH_SEPOLIA        = '0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c'

const POOL_ABI = [
  'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)',
  'function getUserAccountData(address user) view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)',
]

const DATA_PROVIDER_ABI = [
  'function getReserveConfigurationData(address asset) view returns (uint256 decimals, uint256 ltv, uint256 liquidationThreshold, uint256 liquidationBonus, uint256 reserveFactor, bool usageAsCollateralEnabled, bool borrowingEnabled, bool stableBorrowRateEnabled, bool isActive, bool isFrozen)',
  'function getReserveCaps(address asset) view returns (uint256 borrowCap, uint256 supplyCap)',
  'function getATokenTotalSupply(address asset) view returns (uint256)',
]

const WETH_ABI = [
  'function deposit() payable',
  'function allowance(address owner, address spender) view returns (uint256)',
]

// Aave V3.1 supply error code mapping
const AAVE_ERRORS: Record<string, string> = {
  '27': 'Reserve is not active',
  '28': 'Reserve is frozen',
  '29': 'Reserve is paused',
  '51': 'Supply cap exceeded — testnet pool full for this asset',
}

const MAX_HF = BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639935')

export interface AavePosition {
  asset:               string   // token symbol supplied
  totalCollateralBase: string
  availableBorrows:    string
  healthFactor:        string
  supplyTxHash:        string
}

/** Wait for a submitted tx to be mined (polls every 3 s, 90 s timeout). */
async function waitForConfirmation(provider: ethers.JsonRpcProvider, hash: string): Promise<void> {
  const deadline = Date.now() + 90_000
  while (Date.now() < deadline) {
    const receipt = await provider.getTransactionReceipt(hash)
    if (receipt && receipt.status === 1) return
    if (receipt && receipt.status === 0) throw new Error(`Tx reverted on-chain: ${hash}`)
    await new Promise(r => setTimeout(r, 3_000))
  }
  throw new Error(`Tx not mined within 90s: ${hash}`)
}

/** Gate on reserve health: active, not frozen, and supply cap not maxed out. */
async function assertReserveSupplyable(
  provider: ethers.JsonRpcProvider,
  asset: string,
  amountWei: bigint,
  decimals: number
): Promise<void> {
  const dp = new ethers.Contract(AAVE_DATA_PROVIDER_SEPOLIA, DATA_PROVIDER_ABI, provider)
  const cfg  = await dp.getReserveConfigurationData(asset)
  if (!cfg.isActive) throw new Error('Aave reserve is not active for this asset')
  if (cfg.isFrozen)  throw new Error('Aave reserve is frozen — no new supply allowed')

  // supplyCap=0 means unlimited; otherwise check if headroom exists
  const caps = await dp.getReserveCaps(asset)
  if (caps.supplyCap > 0n) {
    const capWei     = caps.supplyCap * BigInt(10 ** decimals)
    const currentWei = await dp.getATokenTotalSupply(asset)
    if (currentWei + amountWei > capWei) {
      const capHuman     = ethers.formatUnits(capWei,     decimals)
      const currentHuman = ethers.formatUnits(currentWei, decimals)
      throw new Error(
        `Supply cap exceeded: cap=${capHuman}, current=${currentHuman}. ` +
        `Try a different asset (WETH has no cap on this deployment).`
      )
    }
  }
}

/**
 * Wraps ETH → WETH then supplies to Aave V3.
 * amountEth: human string e.g. "0.001" (18 decimals)
 */
export async function supplyToAave(
  client: WDKClient,
  _usdtAddress: string,   // kept for API compat; we supply WETH instead
  amountEth: string       // amount in ETH units, e.g. "0.001"
): Promise<AavePosition> {
  const amountWei  = ethers.parseEther(amountEth)
  const walletAddr = await client.getAddress()
  const provider   = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL!)
  const poolIface  = new ethers.Interface(POOL_ABI)
  const wethIface  = new ethers.Interface(WETH_ABI)

  // Step 0: Verify supply cap before spending gas
  await assertReserveSupplyable(provider, WETH_SEPOLIA, amountWei, 18)

  // Step 1: Wrap ETH → WETH  (WETH.deposit{ value: amountWei }())
  const wrapData = wethIface.encodeFunctionData('deposit', [])
  const wrapHash = await client.sendTransaction(WETH_SEPOLIA, wrapData, amountWei)
  await waitForConfirmation(provider, wrapHash)

  // Step 2: Approve Aave Pool to spend WETH — with WETH there's no need to reset first
  const weth             = new ethers.Contract(WETH_SEPOLIA, WETH_ABI, provider)
  const currentAllowance = await weth.allowance(walletAddr, AAVE_POOL_SEPOLIA)
  if (currentAllowance < amountWei) {
    const approveHash = await client.approve(AAVE_POOL_SEPOLIA, WETH_SEPOLIA, amountWei)
    await waitForConfirmation(provider, approveHash)
  }

  // Step 3: Supply WETH to Aave V3 Pool
  let supplyTxHash: string
  try {
    const supplyData = poolIface.encodeFunctionData('supply', [WETH_SEPOLIA, amountWei, walletAddr, 0])
    supplyTxHash = await client.sendTransaction(AAVE_POOL_SEPOLIA, supplyData)
    await waitForConfirmation(provider, supplyTxHash)
  } catch (err: any) {
    const match = (err.message ?? '').match(/"(\d+)"/)
    if (match) throw new Error(AAVE_ERRORS[match[1]] ?? `Aave error ${match[1]}`)
    throw err
  }

  // Step 4: Read back account position
  const pool = new ethers.Contract(AAVE_POOL_SEPOLIA, POOL_ABI, provider)
  const data = await pool.getUserAccountData(walletAddr)

  return {
    asset:               'WETH',
    totalCollateralBase: ethers.formatUnits(data[0], 8),
    availableBorrows:    ethers.formatUnits(data[2], 8),
    healthFactor:        data[5] === MAX_HF ? '∞' : ethers.formatUnits(data[5], 18),
    supplyTxHash,
  }
}
