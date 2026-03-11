/**
 * test-wallet.ts
 * Day 1 checkpoint: verify WDK wallet init, balance checks, USDT transfer.
 * Run: tsx scripts/test-wallet.ts
 *
 * Prerequisites:
 *   1. SEPOLIA_RPC_URL set in .env
 *   2. Agent A funded with Sepolia ETH + test USDT
 *   3. Agent B funded with Sepolia ETH (gas only)
 */

import 'dotenv/config'
import { createWDKClient } from '../src/wallet/WDKClient.js'

const RPC = process.env.SEPOLIA_RPC_URL!
const USDT = process.env.USDT_SEPOLIA_ADDRESS!
const SEED_A = process.env.AGENT_A_SEED_PHRASE!
const SEED_B = process.env.AGENT_B_SEED_PHRASE!

async function main() {
  if (!RPC || RPC.includes('YOUR_KEY')) {
    console.error('❌ Set SEPOLIA_RPC_URL in .env first')
    process.exit(1)
  }

  console.log('\n🔑 Initializing Agent A wallet...')
  const agentA = await createWDKClient(SEED_A, RPC)
  const addrA = await agentA.getAddress()
  console.log(`   Address: ${addrA}`)

  console.log('\n🔑 Initializing Agent B wallet...')
  const agentB = await createWDKClient(SEED_B, RPC)
  const addrB = await agentB.getAddress()
  console.log(`   Address: ${addrB}`)

  console.log('\n💰 Checking balances...')
  const ethA = await agentA.getEthBalance()
  const usdtA = await agentA.getUSDTBalance(USDT)
  const ethB = await agentB.getEthBalance()
  const usdtB = await agentB.getUSDTBalance(USDT)

  console.log(`   Agent A — ETH: ${ethA} | USDT: ${usdtA}`)
  console.log(`   Agent B — ETH: ${ethB} | USDT: ${usdtB}`)

  const usdtANum = parseFloat(usdtA)
  const ethANum = parseFloat(ethA)

  if (usdtANum < 1) {
    console.warn('\n⚠️  Agent A has < 1 USDT. Fund it first:')
    console.warn('   https://staging.aave.com/faucet/ (Sepolia, mint USDT)')
    return
  }

  if (ethANum < 0.001) {
    console.warn('\n⚠️  Agent A has < 0.001 ETH (gas). Fund it first:')
    console.warn('   https://sepoliafaucet.com')
    return
  }

  console.log('\n📤 Sending 1 USDT from Agent A → Agent B...')
  const hash = await agentA.sendUSDT(addrB, '1.0', USDT)
  console.log(`   TxHash: ${hash}`)
  console.log(`   Etherscan: https://sepolia.etherscan.io/tx/${hash}`)

  console.log('\n⏳ Waiting for confirmation...')
  // Poll for receipt (WDK getTransactionReceipt may return null until mined)
  let receipt = null
  let attempts = 0
  while (!receipt && attempts < 30) {
    await new Promise((r) => setTimeout(r, 4000))
    receipt = await agentA.waitForTx(hash)
    attempts++
    process.stdout.write('.')
  }
  console.log('')

  if (receipt) {
    console.log(`\n✅ CONFIRMED in block ${receipt.blockNumber}`)
    const usdtAAfter = await agentA.getUSDTBalance(USDT)
    const usdtBAfter = await agentB.getUSDTBalance(USDT)
    console.log(`   Agent A USDT: ${usdtA} → ${usdtAAfter}`)
    console.log(`   Agent B USDT: ${usdtB} → ${usdtBAfter}`)
    console.log('\n🎉 Day 1 checkpoint PASSED. Real USDT transfer on Sepolia confirmed!')
    console.log(`   TxHash: ${hash}`)
  } else {
    console.log('\n⏰ Timed out waiting for receipt. Check Etherscan:')
    console.log(`   https://sepolia.etherscan.io/tx/${hash}`)
  }

  agentA.dispose()
  agentB.dispose()
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
