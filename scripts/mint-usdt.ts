/**
 * mint-usdt.ts
 * Mints test USDT via the Aave faucet contract on Sepolia.
 *
 * Faucet: 0xC959483DBa39aa9E78757139af0e9a2EDEb3f42D
 * Function: mint(address token, address to, uint256 amount)
 * Selector: 0xc6c3bbe6
 *
 * Run: npm run mint-usdt
 */

import 'dotenv/config'
import { createWDKClient } from '../src/wallet/WDKClient.js'
import { ethers, Interface, parseUnits, formatUnits } from 'ethers'

const RPC    = process.env.SEPOLIA_RPC_URL!
const USDT   = process.env.USDT_SEPOLIA_ADDRESS!
const FAUCET = '0xC959483DBa39aa9E78757139af0e9a2EDEb3f42D'

const MINT_TARGETS = [
  { name: 'Agent A', seedEnv: 'AGENT_A_SEED_PHRASE', amount: '10000' },
  { name: 'Agent B', seedEnv: 'AGENT_B_SEED_PHRASE', amount: '500' },
  { name: 'Agent C', seedEnv: 'AGENT_C_SEED_PHRASE', amount: '500' },
  { name: 'Escrow',  seedEnv: 'ESCROW_SEED_PHRASE',  amount: '500' },
]

const iface = new Interface(['function mint(address token, address to, uint256 amount)'])

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC)
  const erc20 = new ethers.Contract(USDT, ['function balanceOf(address) view returns (uint256)'], provider)

  console.log('\n🪙 Minting test USDT on Sepolia...\n')

  for (const { name, seedEnv, amount } of MINT_TARGETS) {
    const seed = process.env[seedEnv]!
    const client = await createWDKClient(seed, RPC)
    const addr = await client.getAddress()
    const before = formatUnits(await erc20.balanceOf(addr), 6)

    if (parseFloat(before) >= parseFloat(amount)) {
      console.log(`${name} (${addr}): already has ${before} USDT — skipping`)
      client.dispose()
      continue
    }

    const data = iface.encodeFunctionData('mint', [USDT, addr, parseUnits(amount, 6)])
    process.stdout.write(`${name}: minting ${amount} USDT... `)

    let hash: string
    try {
      hash = await client.sendTransaction(FAUCET, data)
    } catch (err: any) {
      console.log(`❌ failed: ${err.shortMessage || err.message}`)
      client.dispose()
      continue
    }

    let receipt = null
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 4000))
      receipt = await provider.getTransactionReceipt(hash)
      if (receipt) break
      process.stdout.write('.')
    }

    const after = formatUnits(await erc20.balanceOf(addr), 6)
    if (receipt?.status === 1) {
      console.log(`✅ ${before} → ${after} USDT`)
    } else {
      console.log(`❌ reverted | tx: https://sepolia.etherscan.io/tx/${hash}`)
    }

    client.dispose()
  }

  console.log('\nDone.')
}

main().catch(err => { console.error(err); process.exit(1) })
