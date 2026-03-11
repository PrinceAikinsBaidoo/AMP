# Agent Market Protocol (AMP)

> **Tether Hackathon Galáctica — WDK Edition 1**
> Autonomous AI agent economic coordination on Ethereum Sepolia, powered entirely by Tether WDK.

---

## What It Does

AMP is a three-agent system where autonomous AI agents hire each other, pay each other in USDT, and invest their earnings on-chain — all without any human intervention.

1. **Agent A** (Treasury Manager) posts a task with a free-form description and locks the reward in USDT escrow
2. **Agent B** and **Agent B2** (competing workers) race to claim the task — first to accept wins the right to work and earn the reward
3. The winning worker passes the task description to Claude which uses **tool_use** to autonomously decide which protocols to query, fetches live on-chain data, and submits a structured recommendation
4. **Agent C** (Validator) runs 3-layer quality control and either releases escrow to the winner or refunds it to Agent A
5. On settlement, **both Agent A and the winning worker autonomously supply assets to Aave V3** via WDK — closing the full lending bot loop

Every wallet operation — USDT transfers, ERC-20 approvals, contract calls — is signed by **Tether WDK**.

---

## Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                      AGENT MARKET PROTOCOL                          │
│                                                                      │
│  ┌──────────┐  post task + lock USDT  ┌─────────────────────────┐  │
│  │          │ ───────────────────────>│                         │  │
│  │ Agent A  │                         │     Task Registry       │  │
│  │ Treasury │ <───────────────────────│     (EventEmitter)      │  │
│  │ Manager  │  settled / refunded     │                         │  │
│  └──────────┘                         └────────────┬────────────┘  │
│       │                                            │               │
│       │ supplyToAave()                    broadcast: task OPEN     │
│       │ (on settlement)                            │               │
│       ▼                                   ┌────────┴────────┐      │
│  ┌──────────┐                             │                 │      │
│  │ Aave V3  │                        ┌────▼─────┐    ┌──────▼───┐  │
│  │  Pool    │ <── supply WETH ──┬─── │ Agent B  │    │ Agent B2 │  │
│  │ Sepolia  │                   │    │ (worker) │    │(competing│  │
│  └──────────┘                   │    └────┬─────┘    └──────────┘  │
│                                 │         │  race — first wins      │
│                                 │         ▼                         │
│                                 │    Claude tool_use loop:          │
│                                 │    • reads task description       │
│                                 │    • calls get_aave_rate          │
│                                 │    • calls get_compound_rate      │
│                                 │    • submits recommendation       │
│                                 │         │                         │
│                                 │         ▼  submit result          │
│                                 │  ┌──────────────────────────┐    │
│                                 │  │   Agent C — Validator    │    │
│                                 │  │  Layer 1: Zod schema     │    │
│                                 │  │  Layer 2: Sanity checks  │    │
│                                 │  │  Layer 3: Claude review  │    │
│                                 │  │                          │    │
│                                 │  │  APPROVED → release →───┘    │
│                                 │  │  REJECTED → refund → A       │
│                                 │  └──────────────────────────┘    │
│                                                                      │
│                      All txs signed by Tether WDK                   │
└────────────────────────────────────────────────────────────────────┘
```

---

## How Agent B Works — Claude Tool Use

Agent B does not hardcode which protocols to query. It passes the raw task description to Claude, which uses the **Anthropic tool_use API** to decide what data to fetch, executes the on-chain calls, and produces a structured recommendation.

```
Agent B receives task.description
        │
        ▼
Claude reads the task and calls tools autonomously:
  → get_aave_supply_rate()    fetches live rate from Aave V3 Data Provider
  → get_compound_supply_rate() fetches live rate from Compound III Comet
  → submit_recommendation()   submits structured JSON result
        │
        ▼
Agent B logs which tools Claude invoked, builds TaskResult, submits to registry
```

The tool definitions live in `src/ai/ClaudeClient.ts`. Adding a new protocol means adding an adapter and registering a new tool — Agent B and the task posting logic require zero changes.

---

## Tracks

| Track | How AMP qualifies |
|---|---|
| **Lending Bot** | Both agents autonomously supply to Aave V3 after settlement, using WDK for every wrap, approval, and contract call |
| **AI Agents** | Three independent agents coordinate via an on-chain economic protocol — no shared memory, no central controller. Agent B uses Claude tool_use to act on tasks autonomously |
| **WDK Integration** | Every wallet op (USDT transfer, ERC-20 approve, sendTransaction) goes through `@tetherto/wdk` + `@tetherto/wdk-wallet-evm` |

---

## Live Proof — Sepolia Testnet

All transactions are real on-chain activity, verifiable on Sepolia Etherscan.

| Event | Transaction |
|---|---|
| USDT escrow lock (Agent A → Escrow) | [0x6b48fcee…](https://sepolia.etherscan.io/tx/0x6b48fcee234d7384c2571da0cb26e4f96b5cf44e22e9e9c8b84b1a3b79d14f22) |
| Escrow release (Escrow → Agent B) | [0x90f3724b…](https://sepolia.etherscan.io/tx/0x90f3724b8861076f8d8c9a84be6397f07378177185e1c73a0703552d1df09aa9) |
| Agent B supplies WETH to Aave V3 | [0x74516acd…](https://sepolia.etherscan.io/tx/0x74516acd36ad9124ecd81712f363b9d75dc6139903c4aec3387d1fd7c46a2660) |
| Agent A supplies WETH to Aave V3 | [0x9b02b717…](https://sepolia.etherscan.io/tx/0x9b02b717acd709715757b5b72f80851f29845976fa6a244421695a5ff4d41e24) |

---

## Wallet Addresses (Sepolia)

| Agent | Address | Role |
|---|---|---|
| Agent A  | `0x655cb2c511499BAb3DeE0029B6fa884784C81564` | Treasury Manager |
| Agent B  | `0xF1BE2692091486316A7f9acD22e002fdca4f3BfA` | Worker (primary) |
| Agent B2 | `0x2e701FD057B4B2668C2E2608C73A1C28b4E704B4` | Worker (competing) |
| Agent C  | `0x550D961fd8445143a65b919C2d6C179E5636f53B` | Validator |
| Escrow   | `0x8C19969aca01C9E33C63749eDC21d4e56a416525` | Escrow wallet |

---

## Prerequisites

- Node.js 18+
- npm
- A Sepolia RPC URL (Alchemy or Infura)
- An Anthropic API key (for Claude)
- Funded Sepolia wallets (ETH for gas + USDT for rewards)

---

## Setup

```bash
git clone <repo>
cd agent-market-protocol
npm install
cp .env.example .env
```

Edit `.env`:

```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
ANTHROPIC_API_KEY=sk-ant-...

# Agent seed phrases (12-word BIP39)
AGENT_A_SEED_PHRASE="word1 word2 ..."
AGENT_B_SEED_PHRASE="word1 word2 ..."
AGENT_C_SEED_PHRASE="word1 word2 ..."
ESCROW_SEED_PHRASE="word1 word2 ..."

# Contract addresses (Sepolia)
USDT_SEPOLIA_ADDRESS=0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0

# Optional tuning
TASK_REWARD_USDT=5.0
TASK_DEADLINE_SECONDS=60
```

### Fund wallets with test USDT

```bash
npm run mint-usdt
```

---

## Run

### Happy path (APPROVED — all 3 layers pass)
```bash
npm start
```

### Demo: Layer 2 rejection — injected bad APY data
```bash
npm run demo:reject
```
Sets `INJECT_BAD_DATA=true`. Claude's tool calls return fake 500%/499% APY values. Layer 2 sanity check catches the out-of-bounds rates. Layers 2 & 3 output is skipped — escrow refunded to Agent A.

### Demo: Layer 1 rejection — malformed result
```bash
npm run demo:layer1
```
Sets `INJECT_SCHEMA_FAIL=true`. Agent B bypasses Claude and submits a structurally broken result (non-UUID taskId, missing protocols, missing recommendation). Zod rejects it instantly — Layers 2 & 3 are never reached. Escrow refunded.

### Demo: Layer 2 rejection — wrong protocol recommended
```bash
npm run demo:layer2
```
Sets `INJECT_WRONG_PROTOCOL=true`. Claude fetches live rates normally, but the recommendation is overridden to the **lower**-yield protocol before submission. Layer 2 sanity check #5 ("must recommend the highest-yield option") rejects it. Escrow refunded.

Each demo tests a different guard in the 3-layer validation pipeline:</p>

| Demo | Injection | Layer that fires | Outcome |
|---|---|---|---|
| `npm start` | none | all pass | APPROVED, escrow paid |
| `demo:reject` | fake 500% APY | Layer 2 — APY bounds | REJECTED, refund |
| `demo:layer1` | malformed struct | Layer 1 — Zod schema | REJECTED, refund |
| `demo:layer2` | wrong protocol | Layer 2 — best-protocol check | REJECTED, refund |

---

## How the 3-Layer Validation Works

Agent C independently validates every result before releasing payment:

**Layer 1 — Schema (Zod)**
Checks structure: UUID, exactly 2 protocols, recommendation with ≥80 char reasoning, valid APY numbers.

**Layer 2 — Sanity**
- APY within realistic bounds (0–200%)
- Data freshness < 30 seconds old
- Recommended protocol matches one of the queried protocols
- Recommendation APY matches submitted rate (within 0.01%)
- Recommended protocol is actually the higher-yielding one

**Layer 3 — Claude AI**
Claude reviews the full submission and independently verifies the reasoning is sound and consistent with the raw rate data. Returns APPROVED or REJECTED with a written explanation.

---

## Project Structure

```
src/
  agents/
    AgentA.ts          Task Creator — posts task, locks escrow, deploys to Aave on settlement
    AgentB.ts          Worker (primary) — races for tasks, passes to Claude tool_use loop, invests earnings
    AgentB2.ts         Worker (competing) — second market participant, races Agent B, observes market lifecycle
    AgentC.ts          Validator — 3-layer QA, controls escrow release/refund
  core/
    TaskRegistry.ts    EventEmitter state machine (OPEN → IN_PROGRESS → PENDING_VALIDATION → SETTLED/FAILED)
    EscrowManager.ts   On-chain USDT escrow via WDK
    types.ts           Shared interfaces (Task type is a generic string — extensible)
  defi/
    AaveAdapter.ts     Live Aave V3 supply rate via Data Provider contract
    CompoundAdapter.ts Live Compound III supply rate via Comet contract
    AaveSupplyService.ts  Wrap ETH → WETH → supply to Aave V3, with reserve cap pre-check
  ai/
    ClaudeClient.ts    executeAgentTask() with tool_use loop + getValidatorVerdict()
  validation/
    SchemaValidator.ts     Layer 1
    SanityValidator.ts     Layer 2
    AIValidator.ts         Layer 3
    ValidationOrchestrator.ts
  wallet/
    WDKClient.ts       WDK wrapper — getAddress, sendUSDT, sendTransaction, approve
  dashboard/
    Dashboard.ts       Chalk terminal display
  index.ts             Entrypoint — runs all 3 agents concurrently

scripts/
  generate-wallets.ts  Generate BIP39 seed phrases
  mint-usdt.ts         Fund wallets from Aave Sepolia faucet
  test-wallet.ts       Day 1 checkpoint — real USDT transfer test
  check-reserve.ts     Inspect Aave V3 Sepolia reserve caps and status
```

---

## A Note on the Aave Supply Asset

The Sepolia Aave V3 pool enforces supply caps. At the time of submission, the USDT, DAI, and USDC reserves have all exceeded their 2 billion token caps due to accumulated historical test deposits (~3.1–3.7B each deposited). Any new supply to these reserves reverts with Aave error `SUPPLY_CAP_EXCEEDED` (error code 51).

WETH has no supply cap (`supplyCap = 0`, unlimited) and is fully active. The lending bot therefore wraps a small amount of Sepolia ETH to WETH before supplying to Aave. **The WDK signing flow is identical regardless of asset** — every approval and contract call goes through `account.approve()` and `account.sendTransaction()`.

You can verify the supply cap status live:
```bash
npx tsx scripts/check-reserve.ts
```

---

## Tech Stack

| Technology | Usage |
|---|---|
| `@tetherto/wdk` | Core wallet — seed phrase init, account management |
| `@tetherto/wdk-wallet-evm` | EVM wallet adapter — signing, transfers, approvals |
| `ethers` v6 | ABI encoding, contract reads, provider |
| `@anthropic-ai/sdk` | Claude claude-sonnet-4-6 — tool_use agentic loop (Agent B) + validator verdict (Agent C) |
| `zod` | Schema validation (Layer 1) |
| `chalk` | Terminal dashboard |
| `tsx` | ESM-native TypeScript runner |
| Ethereum Sepolia | Testnet — all txs are real on-chain |

---

## Key Contract Addresses (Sepolia)

| Contract | Address |
|---|---|
| USDT (Aave test token) | `0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0` |
| WETH | `0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c` |
| Aave V3 Pool | `0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951` |
| Aave Data Provider | `0x3e9708d80f7B3e43118013075F7e95CE3AB31F31` |
| Aave Pool Address Provider | `0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A` |
| Compound III (USDC Comet) | `0xAec1F48e02Cfb822Be958B68C7957156EB3F0b6e` |
| Aave Faucet | `0xC959483DBa39aa9E78757139af0e9a2EDEb3f42D` |

---

## AMP as a Protocol Primitive

AMP is architected for extension at every layer. None of the core components are hardcoded to specific protocols, chains, or agent counts — the design decisions compound.

**Adding protocols is a one-file change.**
The adapter pattern means adding Morpho Blue, Spark, or Euler requires writing one adapter and registering one tool in `ClaudeClient.ts`. Agent B, Agent C, and the validation pipeline require zero changes. Claude reads the task description and decides which tools to call — it handles new protocols automatically.

**The validation pipeline is independently extensible.**
Each layer is isolated behind a single function call in `ValidationOrchestrator.ts`. Layer 2 sanity rules are additive — new checks are a `failed.push()`. A Layer 4 on-chain attestation layer (Merkle proof of the validated result submitted to a verifier contract) slots in after Layer 3 without touching the existing layers.

**The task system is chain-agnostic.**
`TaskRegistry` is an in-process EventEmitter today. The same interface works over a smart contract, a pubsub network, or a cross-chain message relay — Agent B and Agent C only call `acceptTask`, `submitResult`, and listen for events. Swapping the transport is transparent to the agents.

**Market mechanics scale naturally.**
Agent B2 demonstrates that the worker market is real — multiple independent agents compete for tasks and only one earns. Reputation scoring (on-chain approval rate), dynamic rewards, and slashing bonds are logical extensions of the same escrow and registry primitives already in place.
