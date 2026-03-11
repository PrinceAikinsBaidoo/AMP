/**
 * generate-wallets.ts
 * One-time script to generate 4 BIP-39 seed phrases for AMP agents.
 * Run: npm run generate-wallets
 * Output: paste the result into your .env file
 */

import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'

async function getAddress(seedPhrase: string): Promise<string> {
  const wdk = new WDK(seedPhrase).registerWallet('ethereum', WalletManagerEvm, {
    provider: 'https://eth-sepolia.g.alchemy.com/v2/demo',
  })
  const account = await wdk.getAccount('ethereum', 0)
  return account.getAddress()
}

async function main() {
  // getRandomSeedPhrase() takes no arguments — generates 12 or 24 word phrase
  const seedA = WDK.getRandomSeedPhrase()
  const seedB = WDK.getRandomSeedPhrase()
  const seedC = WDK.getRandomSeedPhrase()
  const seedEscrow = WDK.getRandomSeedPhrase()

  const [addrA, addrB, addrC, addrEscrow] = await Promise.all([
    getAddress(seedA),
    getAddress(seedB),
    getAddress(seedC),
    getAddress(seedEscrow),
  ])

  console.log('\n========== AMP WALLET GENERATION ==========\n')
  console.log('Add these to your .env file:\n')
  console.log(`AGENT_A_SEED_PHRASE=${seedA}`)
  console.log(`AGENT_B_SEED_PHRASE=${seedB}`)
  console.log(`AGENT_C_SEED_PHRASE=${seedC}`)
  console.log(`ESCROW_SEED_PHRASE=${seedEscrow}`)

  console.log('\n========== WALLET ADDRESSES ==========\n')
  console.log(`Agent A:  ${addrA}`)
  console.log(`Agent B:  ${addrB}`)
  console.log(`Agent C:  ${addrC}`)
  console.log(`Escrow:   ${addrEscrow}`)

  console.log('\n========== NEXT STEPS ==========')
  console.log('1. Copy seed phrases above into your .env file')
  console.log('2. Fund each address with Sepolia ETH (for gas):')
  console.log('   https://sepoliafaucet.com  or  https://infura.io/faucet/sepolia')
  console.log('3. Fund Agent A with test USDT (50 USDT for ~10 demo runs):')
  console.log('   https://staging.aave.com/faucet/ (select Sepolia, mint USDT)')
  console.log('\nDo NOT commit your .env file!\n')
}

main().catch((err) => {
  console.error('Error generating wallets:', err)
  process.exit(1)
})
