import 'dotenv/config'
import { ethers } from 'ethers'

const AAVE_DATA_PROVIDER = '0x3e9708d80f7B3e43118013075F7e95CE3AB31F31'
const USDT = process.env.USDT_SEPOLIA_ADDRESS!

const DATA_PROVIDER_ABI = [
  'function getReserveConfigurationData(address asset) view returns (uint256 decimals, uint256 ltv, uint256 liquidationThreshold, uint256 liquidationBonus, uint256 reserveFactor, bool usageAsCollateralEnabled, bool borrowingEnabled, bool stableBorrowRateEnabled, bool isActive, bool isFrozen)',
  'function getReserveCaps(address asset) view returns (uint256 borrowCap, uint256 supplyCap)',
  'function getATokenTotalSupply(address asset) view returns (uint256)',
  'function getAllReservesTokens() view returns (tuple(string symbol, address tokenAddress)[])',
]

async function checkCap(dp: ethers.Contract, label: string, addr: string) {
  try {
    const caps = await dp.getReserveCaps(addr)
    const totalSupply = await dp.getATokenTotalSupply(addr)
    const cfg = await dp.getReserveConfigurationData(addr)
    const dec = Number(cfg.decimals)
    const supplyCapHuman = ethers.formatUnits(caps.supplyCap * BigInt(10 ** dec), dec)
    const currentHuman   = ethers.formatUnits(totalSupply, dec)
    console.log(`${label}: supplyCap=${supplyCapHuman}  current=${currentHuman}  frozen=${cfg.isFrozen}  active=${cfg.isActive}`)
  } catch(e: any) {
    console.log(`${label}: error — ${e.message.slice(0,80)}`)
  }
}

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL!)
  const dp = new ethers.Contract(AAVE_DATA_PROVIDER, DATA_PROVIDER_ABI, provider)

  const tokens: any[] = await dp.getAllReservesTokens()
  for (const t of tokens) {
    await checkCap(dp, t.symbol.padEnd(6), t.tokenAddress)
  }
}

main().catch(console.error)
