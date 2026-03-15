/**
 * index.ts — AMP entry point
 *
 * Runs two market cycles back-to-back to demonstrate the full AMP lifecycle:
 *
 *  Cycle 1 — Happy Path
 *    Agent B wins the race → Claude tool_use fetches live DeFi rates →
 *    Agent C validates (3 layers, APPROVED) → escrow released → both agents
 *    auto-supply earnings to Aave V3.
 *
 *  Cycle 2 — Adversarial Path
 *    Agent B2 wins the race → submits fraudulent 500% APY data →
 *    Agent C's Layer 2 sanity check catches it (REJECTED) → escrow refunded.
 */

import 'dotenv/config'
import { createWDKClient } from './wallet/WDKClient.js'
import { TaskRegistry }    from './core/TaskRegistry.js'
import { EscrowManager }   from './core/EscrowManager.js'
import { AgentA }          from './agents/AgentA.js'
import { AgentB }          from './agents/AgentB.js'
import { AgentB2 }         from './agents/AgentB2.js'
import { AgentC }          from './agents/AgentC.js'
import { printHeader, printAgents, printCycleHeader, log } from './dashboard/Dashboard.js'
import { startWSSServer, stopWSSServer, broadcast } from './ws/EventBroadcaster.js'

const RPC  = process.env.SEPOLIA_RPC_URL!
const USDT = process.env.USDT_SEPOLIA_ADDRESS!

interface CycleConfig {
  cycleNum:        1 | 2
  subtitle:        string
  taskDescription: string
  b2DelayMs:       number   // 0 = B2 wins the race; 13000 = B wins
  bDelayMs:        number   // 0 = B starts immediately; >0 = B2 wins reliably
  injectBad:       boolean  // force Agent B to inject bad data (unused in cycle 2)
}

const CYCLE_1: CycleConfig = {
  cycleNum:        1,
  subtitle:        'HAPPY PATH — B WINS, VALID RESULT, ESCROW SETTLED',
  taskDescription: `DeFi yield analysis: compare Aave V3 vs Compound III USDT supply APY on Sepolia. Also check the current ETH/USD price and network gas fees to assess overall market conditions. Recommend the highest-yield protocol with full reasoning that includes market context.`,
  b2DelayMs:       13_000,  // B2 starts late → B wins the race
  bDelayMs:        0,
  injectBad:       false,
}

const CYCLE_2: CycleConfig = {
  cycleNum:        2,
  subtitle:        'ADVERSARIAL PATH — B2 WINS, FRAUDULENT DATA, ESCROW REFUNDED',
  taskDescription: `Cross-protocol risk assessment: evaluate the risk-adjusted yield profile for stablecoin deposits on Aave V3 versus Compound III on Sepolia. Include current supply rates, protocol utilization, and ETH price context. Provide a risk-adjusted recommendation with quantitative reasoning.`,
  b2DelayMs:       0,       // B2 starts immediately → B2 wins the race
  bDelayMs:        8_000,   // B starts late → B2 wins reliably
  injectBad:       false,
}

async function runCycle(escrow: EscrowManager, cfg: CycleConfig): Promise<void> {
  printCycleHeader(cfg.cycleNum, cfg.subtitle)
  broadcast({ type: 'cycle_start', cycleNum: cfg.cycleNum, subtitle: cfg.subtitle })

  const registry = new TaskRegistry()
  const agentA   = new AgentA (registry, escrow, cfg.taskDescription)
  const agentB   = new AgentB (registry, cfg.injectBad, cfg.bDelayMs)
  const agentB2  = new AgentB2(registry, cfg.b2DelayMs, cfg.cycleNum)
  const agentC   = new AgentC (registry, escrow)

  await Promise.all([agentA.run(), agentB.run(), agentB2.run(), agentC.run()])
  broadcast({ type: 'cycle_complete', cycleNum: cfg.cycleNum })
}

async function main() {
  // Pre-init wallets just to show addresses in the header
  const escrowWallet  = await createWDKClient(process.env.ESCROW_SEED_PHRASE!, RPC)
  const escrowAddress = await escrowWallet.getAddress()
  const escrow        = new EscrowManager(escrowWallet, escrowAddress, USDT)

  const [wA, wB, wB2, wC] = await Promise.all([
    createWDKClient(process.env.AGENT_A_SEED_PHRASE!, RPC),
    createWDKClient(process.env.AGENT_B_SEED_PHRASE!, RPC),
    createWDKClient(process.env.AGENT_B_SEED_PHRASE!, RPC, 1),
    createWDKClient(process.env.AGENT_C_SEED_PHRASE!, RPC),
  ])
  const [addrA, addrB, addrB2, addrC] = await Promise.all([
    wA.getAddress(), wB.getAddress(), wB2.getAddress(), wC.getAddress()
  ])
  wA.dispose(); wB.dispose(); wB2.dispose(); wC.dispose()

  startWSSServer(3001)
  printHeader()
  printAgents(addrA, addrB, addrB2, addrC, escrowAddress)

  // ── Cycle 1: B wins, real data, approved, escrow settled ─────────────────
  await runCycle(escrow, CYCLE_1)

  // Pause between cycles — gives the dashboard a clear visual break
  await sleep(5_000)

  // ── Cycle 2: B2 wins, fraudulent data, rejected, escrow refunded ─────────
  await runCycle(escrow, CYCLE_2)

  log('System', 'Both market cycles complete. AMP demo finished.')
  broadcast({ type: 'demo_complete' })
  await sleep(2_000)  // give WS clients time to receive the final event
  stopWSSServer()
  escrowWallet.dispose()
  process.exit(0)
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message ?? err)
  process.exit(1)
})
