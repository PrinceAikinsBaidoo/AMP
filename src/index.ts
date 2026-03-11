/**
 * index.ts — AMP entry point
 * Full 3-agent demo: A posts + locks escrow → B works → C validates + settles/refunds.
 */

import 'dotenv/config'
import { createWDKClient } from './wallet/WDKClient.js'
import { TaskRegistry } from './core/TaskRegistry.js'
import { EscrowManager } from './core/EscrowManager.js'
import { AgentA }  from './agents/AgentA.js'
import { AgentB }  from './agents/AgentB.js'
import { AgentB2 } from './agents/AgentB2.js'
import { AgentC }  from './agents/AgentC.js'
import { printHeader, printAgents } from './dashboard/Dashboard.js'

const RPC  = process.env.SEPOLIA_RPC_URL!
const USDT = process.env.USDT_SEPOLIA_ADDRESS!

async function main() {
  const registry = new TaskRegistry()

  const escrowWallet  = await createWDKClient(process.env.ESCROW_SEED_PHRASE!, RPC)
  const escrowAddress = await escrowWallet.getAddress()
  const escrow        = new EscrowManager(escrowWallet, escrowAddress, USDT)

  const agentA  = new AgentA(registry, escrow)
  const agentB  = new AgentB(registry)
  const agentB2 = new AgentB2(registry)
  const agentC  = new AgentC(registry, escrow)

  // Pre-init wallets to get addresses for the header display
  const [wA, wB, wB2, wC] = await Promise.all([
    createWDKClient(process.env.AGENT_A_SEED_PHRASE!, RPC),
    createWDKClient(process.env.AGENT_B_SEED_PHRASE!, RPC),
    createWDKClient(process.env.AGENT_B_SEED_PHRASE!, RPC, 1),  // account index 1 = Agent B2
    createWDKClient(process.env.AGENT_C_SEED_PHRASE!, RPC),
  ])
  const [addrA, addrB, addrB2, addrC] = await Promise.all([
    wA.getAddress(), wB.getAddress(), wB2.getAddress(), wC.getAddress()
  ])
  wA.dispose(); wB.dispose(); wB2.dispose(); wC.dispose()

  printHeader()
  printAgents(addrA, addrB, addrB2, addrC, escrowAddress)

  await Promise.all([agentA.run(), agentB.run(), agentB2.run(), agentC.run()])

  escrowWallet.dispose()
  process.exit(0)
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message ?? err)
  process.exit(1)
})
