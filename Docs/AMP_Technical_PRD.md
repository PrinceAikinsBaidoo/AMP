# Agent Market Protocol (AMP)
## Technical Product Requirements Document — v2.0
**Hackathon:** Tether Hackathon Galáctica: WDK Edition 1  
**Submission Deadline:** March 22, 2026  
**Network:** Ethereum Sepolia Testnet  
**Stack:** TypeScript / Node.js · WDK · Claude AI · Aave V3 · Compound III  
**Builder:** Solo  
**Hours Budget:** 35 hrs (5 hrs/day × 7 days)

---

## Table of Contents

1. [Project Summary](#1-project-summary)
2. [Official Documentation Links](#2-official-documentation-links)
3. [npm Package Requirements](#3-npm-package-requirements)
4. [Contract Addresses — Sepolia Testnet](#4-contract-addresses--sepolia-testnet)
5. [Faucets & Testnet Funding](#5-faucets--testnet-funding)
6. [System Architecture](#6-system-architecture)
7. [Agent Specifications](#7-agent-specifications)
8. [WDK Integration — Real Code](#8-wdk-integration--real-code)
9. [Aave V3 Integration — Real Code](#9-aave-v3-integration--real-code)
10. [Compound III Integration](#10-compound-iii-integration)
11. [Claude AI Integration](#11-claude-ai-integration)
12. [Task Lifecycle & State Machine](#12-task-lifecycle--state-machine)
13. [Validation Engine — All 3 Layers](#13-validation-engine--all-3-layers)
14. [Escrow System](#14-escrow-system)
15. [Data Schemas](#15-data-schemas)
16. [Terminal Dashboard](#16-terminal-dashboard)
17. [Project File Structure](#17-project-file-structure)
18. [Environment Variables](#18-environment-variables)
19. [package.json](#19-packagejson)
20. [tsconfig.json](#20-tsconfigjson)
21. [Day-by-Day Build Checklist](#21-day-by-day-build-checklist)
22. [Demo Script](#22-demo-script)
23. [Hackathon Submission Checklist](#23-hackathon-submission-checklist)

---

## 1. Project Summary

**Agent Market Protocol (AMP)** is a three-agent autonomous system demonstrating agent-to-agent economic coordination using Tether's WDK.

**What happens in the demo (60 seconds, zero human input):**

```
Agent A  →  Posts yield analysis task + locks 5 USDT in escrow
Agent B  →  Discovers task → queries Aave V3 + Compound → Claude analyzes → submits result
Agent C  →  Validates output (3 layers) → releases escrow to Agent B
On-chain →  Real USDT transfer. Real txHash. Verifiable on Sepolia Etherscan.
```

**Prize tracks targeted:**
- 🤖 Agent Wallets — Primary (up to $3,000 USDT)
- 💰 Lending Bot — Secondary (up to $3,000 USDT)
- 🏆 Best Project Overall — (up to $6,000 USDT)

---

## 2. Official Documentation Links

### Tether WDK
| Resource | URL |
|---|---|
| WDK Homepage | https://wdk.tether.io |
| WDK Docs (main) | https://docs.wallet.tether.io |
| Get Started / SDK | https://docs.wallet.tether.io/sdk/get-started |
| Node.js Quickstart | https://docs.wallet.tether.io/start-building/nodejs-bare-quickstart |
| EVM Wallet Module | https://docs.wallet.tether.io/sdk/wallet-modules/wallet-evm |
| EVM Wallet Config | https://docs.wallet.tether.io/sdk/wallet-modules/wallet-evm/configuration |
| EVM Wallet API | https://docs.wallet.tether.io/sdk/wallet-modules/wallet-evm/api |
| Lending Modules | https://docs.wallet.tether.io/sdk/lending-modules |
| Aave EVM Module | https://docs.wallet.tether.io/sdk/lending-modules/lending-aave-evm |
| Aave EVM Config | https://docs.wallet.tether.io/sdk/lending-modules/lending-aave-evm/configuration |
| AI / MCP Toolkit | https://docs.wallet.tether.io/ai/mcp-toolkit |
| Agent Skills | https://docs.wallet.tether.io/ai/agent-skills |
| OpenClaw | https://docs.wallet.tether.io/ai/openclaw |
| Build with AI | https://docs.wallet.tether.io/start-building/build-with-ai |
| All Modules | https://docs.wallet.tether.io/sdk/all-modules |
| WDK GitHub (core) | https://github.com/tetherto/wdk-core |
| WDK GitHub (full) | https://github.com/tetherto/wdk |
| WDK Docs GitHub | https://github.com/tetherto/wdk-docs |
| WDK Showcase | https://docs.wallet.tether.io/resources/showcase |
| WDK Changelog | https://docs.wallet.tether.io/overview/changelog |
| WDK Discord | https://discord.gg/arYXDhHB2w |

### Aave V3
| Resource | URL |
|---|---|
| Aave Docs | https://aave.com/docs |
| Aave V3 Overview | https://aave.com/docs/aave-v3/overview |
| Deployed Contracts | https://docs.aave.com/developers/deployed-contracts/deployed-contracts |
| V3 Testnet Addresses | https://docs.aave.com/developers/deployed-contracts/v3-testnet-addresses |
| Market Operations | https://aave.com/docs/aave-v3/markets/operations |
| Aave GitHub | https://github.com/aave |
| Pool V3 Contract (Mainnet) | https://etherscan.io/address/0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2 |

### Compound III (Comet)
| Resource | URL |
|---|---|
| Compound Docs | https://docs.compound.finance |
| Compound GitHub | https://github.com/compound-finance/comet |
| Compound App | https://app.compound.finance |

### Anthropic Claude
| Resource | URL |
|---|---|
| Claude API Docs | https://docs.anthropic.com |
| Messages API | https://docs.anthropic.com/en/api/messages |
| Node.js SDK | https://github.com/anthropic-ai/sdk-python (use JS: `@anthropic-ai/sdk`) |
| Models Reference | https://docs.anthropic.com/en/docs/models-overview |

### Sepolia Testnet Tools
| Resource | URL |
|---|---|
| Sepolia Etherscan | https://sepolia.etherscan.io |
| Sepolia Faucet (Alchemy) | https://sepoliafaucet.com |
| Sepolia Faucet (Infura) | https://www.infura.io/faucet/sepolia |
| Pimlico Faucet (test USDT) | https://pimlico.io/faucet |
| Candide Faucet (test USDT) | https://candide.dev/faucet |
| Alchemy RPC | https://alchemy.com (get free Sepolia RPC) |
| Infura RPC | https://infura.io (get free Sepolia RPC) |

### Hackathon
| Resource | URL |
|---|---|
| Hackathon Page | https://dorahacks.io (search Tether Hackathon Galáctica) |
| Tether Discord | https://discord.gg/tether (find hackathon channel) |
| Submission Portal | DoraHacks — linked from hackathon page |

---

## 3. npm Package Requirements

### Install Command (all dependencies)

```bash
npm install \
  @tetherto/wdk \
  @tetherto/wdk-wallet-evm \
  @tetherto/wdk-protocol-lending-aave-evm \
  @anthropic-ai/sdk \
  ethers \
  chalk \
  dotenv \
  express \
  uuid \
  zod

npm install --save-dev \
  typescript \
  @types/node \
  @types/express \
  @types/uuid \
  ts-node \
  nodemon
```

### Package Descriptions

| Package | Version | Purpose |
|---|---|---|
| `@tetherto/wdk` | latest | WDK core orchestrator |
| `@tetherto/wdk-wallet-evm` | latest | EVM wallet management (BIP-44, Sepolia) |
| `@tetherto/wdk-protocol-lending-aave-evm` | latest | WDK's native Aave V3 lending module |
| `@anthropic-ai/sdk` | latest | Claude AI for worker analysis + validator |
| `ethers` | ^6.x | ERC-20 ABI calls, formatUnits, parseUnits |
| `chalk` | ^5.x | Terminal dashboard colors |
| `dotenv` | ^16.x | Environment variable loading |
| `express` | ^4.x | Internal REST API between agents |
| `uuid` | ^9.x | Task ID generation |
| `zod` | ^3.x | Schema validation (Layer 1) |

> **Note:** Verify exact package names against WDK docs before installing. WDK packages are under the `@tetherto` namespace on npm. Check https://www.npmjs.com/search?q=%40tetherto for the full list.

---

## 4. Contract Addresses — Sepolia Testnet

### WDK / Tether Testnet USDT
> ⚠️ These are test tokens only. Not redeemable with Tether International.

| Token | Sepolia Address | Notes |
|---|---|---|
| USDT (Aave testnet) | `0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0` | Aave-minted test USDT |
| USDT (Pimlico/Candide) | Verify at faucet links above | May differ per faucet |

### Aave V3 — Ethereum Sepolia

| Contract | Address |
|---|---|
| Pool V3 (Mainnet ref) | `0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2` |
| Pool Address Provider | `0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e` |
| USDT testnet token | `0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0` |

> **Action required Day 1:** Verify current Sepolia Aave V3 pool address at https://docs.aave.com/developers/deployed-contracts/v3-testnet-addresses — contracts may be redeployed.

### Compound III (Comet) — Sepolia

> **Action required Day 1:** Fetch Compound Sepolia addresses from https://docs.compound.finance — Comet deployments vary by market. Confirm USDT Comet address on Sepolia.

---

## 5. Faucets & Testnet Funding

Before building anything, fund all four agent wallets with:
- **Sepolia ETH** (for gas) — from https://sepoliafaucet.com or https://infura.io/faucet/sepolia
- **Test USDT** (for escrow) — from Pimlico (https://pimlico.io/faucet) or Candide (https://candide.dev/faucet)

### Funding Strategy

```
Day 1 setup:
1. Generate 4 wallet addresses (Agent A, B, C, Escrow)
2. Fund each with 0.1 Sepolia ETH (gas)
3. Fund Agent A with 50 test USDT (enough for 10 demo runs)
4. Fund Escrow wallet with 0 (it receives from Agent A at runtime)
5. Agent B and C start at 0 (they earn/receive at runtime)
```

---

## 6. System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                      AMP SYSTEM — SEPOLIA                        │
│                                                                  │
│  ┌──────────────┐   post task    ┌──────────────────────────┐   │
│  │   AGENT A    │ ─────────────► │      TASK REGISTRY       │   │
│  │              │   lock escrow  │                          │   │
│  │ Task Creator │                │  EventEmitter + Map      │   │
│  │ WDK Wallet A │ ◄──────────────│  State machine           │   │
│  │ (holds USDT) │  result+settle │  Escrow manager          │   │
│  └──────────────┘                └────────────┬─────────────┘   │
│                                               │                  │
│                                  discovers    │    submits       │
│                                  & accepts    ▼    result        │
│                                  ┌────────────────────────┐     │
│  ┌──────────────┐  validates     │       AGENT B          │     │
│  │   AGENT C    │ ◄──────────────│                        │     │
│  │              │                │  Worker Agent          │     │
│  │  Validator   │                │  WDK Wallet B          │     │
│  │ WDK Wallet C │                │                        │     │
│  └──────┬───────┘                │  → WDK Aave module     │     │
│         │                        │  → Compound API        │     │
│         │ APPROVED               │  → Claude analysis     │     │
│         │ escrow release         └────────────────────────┘     │
│         ▼                                                        │
│  Escrow Wallet → Agent B Wallet                                  │
│  txHash → Sepolia Etherscan                                      │
└──────────────────────────────────────────────────────────────────┘
```

---

## 7. Agent Specifications

### Agent A — Task Creator

**Role:** Autonomous treasury manager that needs yield analysis before capital deployment.

**Startup sequence:**
```
1. Load seed phrase from env
2. Initialize WDK with Sepolia EVM wallet
3. Get wallet address, check USDT balance
4. Construct task object with reward + deadline
5. Post task to registry
6. Lock reward in escrow wallet via WDK transfer
7. Listen for SETTLED or FAILED event
8. Log final outcome + txHash
```

---

### Agent B — Worker Agent

**Role:** Specialized DeFi analyst that earns USDT by executing yield analysis tasks.

**Startup sequence:**
```
1. Load seed phrase from env
2. Initialize WDK with Sepolia EVM wallet
3. Poll task registry every 3 seconds for OPEN tasks
4. Accept matching task → state: IN_PROGRESS
5. Initialize WDK Aave lending module
6. Fetch Aave V3 USDT supply APY on Sepolia
7. Fetch Compound III USDT supply rate on Sepolia
8. Build analysis prompt with raw rate data
9. Call Claude API → parse structured JSON response
10. Format TaskResult object
11. Submit result to registry → state: PENDING_VALIDATION
12. Listen for payment received event
13. Log received USDT + txHash
```

---

### Agent C — Validator

**Role:** Independent quality assurance agent controlling payment release.

**Startup sequence:**
```
1. Load seed phrase from env
2. Initialize WDK with Sepolia EVM wallet
3. Poll registry for PENDING_VALIDATION tasks
4. Receive task + worker result
5. Run Layer 1: Zod schema validation
6. If fail → REJECT immediately, trigger refund
7. Run Layer 2: Economic sanity checks
8. If fail → REJECT, trigger refund
9. Run Layer 3: Claude semantic validation
10. If fail → REJECT, trigger refund
11. All pass → APPROVED
12. Trigger escrow release to Agent B wallet via WDK
13. Update registry → state: SETTLED
14. Log verdict + txHash
```

---

## 8. WDK Integration — Real Code

### Initialize WDK (per agent)

```typescript
import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'

const SEPOLIA_RPC = process.env.SEPOLIA_RPC_URL!

export async function createAgentWDK(seedPhrase: string) {
  const wdk = new WDK(seedPhrase)
    .registerWallet('ethereum', WalletManagerEvm, {
      provider: SEPOLIA_RPC,
      // Sepolia chainId = 11155111
    })

  const account = await wdk.getAccount('ethereum', 0)
  const address = await account.getAddress()

  return { wdk, account, address }
}
```

### Get USDT Balance

```typescript
import { formatUnits } from 'ethers'

// USDT has 6 decimals
export async function getUSDTBalance(account: any, usdtAddress: string): Promise<string> {
  const raw = await account.getTokenBalance(usdtAddress)
  return formatUnits(raw, 6)
}
```

### Send USDT

```typescript
import { parseUnits } from 'ethers'

export async function sendUSDT(
  account: any,
  toAddress: string,
  amount: string,        // human units e.g. "5.0"
  usdtAddress: string
): Promise<string> {     // returns txHash
  const amountRaw = parseUnits(amount, 6)

  const { hash } = await account.sendTransaction({
    to: usdtAddress,
    data: buildERC20TransferData(toAddress, amountRaw),
    // WDK handles gas estimation
  })

  return hash
}

// ERC-20 transfer encoded calldata
function buildERC20TransferData(to: string, amount: bigint): string {
  const { Interface } = require('ethers')
  const erc20 = new Interface([
    'function transfer(address to, uint256 amount) returns (bool)'
  ])
  return erc20.encodeFunctionData('transfer', [to, amount])
}
```

> **Day 1 check:** Verify WDK's `sendTransaction` signature against the actual EVM wallet API at https://docs.wallet.tether.io/sdk/wallet-modules/wallet-evm/api — WDK may have a native `transfer` method that's simpler.

### Generate Seed Phrases

```typescript
import WDK from '@tetherto/wdk'

// For each agent, generate once and store in .env
const seedA = WDK.getRandomSeedPhrase(24)  // 24-word for higher security
const seedB = WDK.getRandomSeedPhrase(24)
const seedC = WDK.getRandomSeedPhrase(24)
const seedEscrow = WDK.getRandomSeedPhrase(24)
```

---

## 9. Aave V3 Integration — Real Code

WDK has a **native Aave module** (`@tetherto/wdk-protocol-lending-aave-evm`). Use this instead of calling Aave APIs directly — it's the intended WDK pattern and will impress judges.

### Setup Aave Module via WDK

```typescript
import AaveProtocolEvm from '@tetherto/wdk-protocol-lending-aave-evm'
import { WalletAccountEvm } from '@tetherto/wdk-wallet-evm'

export async function createAaveService(seedPhrase: string) {
  const account = new WalletAccountEvm(seedPhrase, "0'/0/0", {
    provider: process.env.SEPOLIA_RPC_URL!
  })

  const aave = new AaveProtocolEvm(account)
  return aave
}
```

### Get USDT Supply Rate from Aave

```typescript
export async function getAaveUSDTRate(aave: AaveProtocolEvm): Promise<number> {
  // Check WDK Aave docs for exact method name
  // Likely: aave.getReserveData(tokenAddress) or aave.getLendingRates()
  const rates = await aave.getLendingRates()
  
  const usdtMarket = rates.find(
    r => r.symbol === 'USDT' || r.address.toLowerCase() === USDT_SEPOLIA.toLowerCase()
  )

  if (!usdtMarket) throw new Error('USDT market not found on Aave Sepolia')
  
  // APY is typically returned as a ray (1e27) — convert to percentage
  return rayToPercent(usdtMarket.liquidityRate)
}

function rayToPercent(ray: bigint): number {
  return Number(ray) / 1e25  // 1 ray = 1e27, divide by 1e25 to get percentage
}
```

> **Day 1 check:** Read https://docs.wallet.tether.io/sdk/lending-modules/lending-aave-evm carefully. The exact method names for reading rates (not just supplying) need to be confirmed. The WDK Aave module is built for supply/borrow operations — for read-only rate fetching you may need to call Aave's Pool contract directly using ethers.js.

### Fallback: Direct Aave Pool Contract Call

If WDK Aave module doesn't expose a simple rate-getter, call the contract directly:

```typescript
import { ethers } from 'ethers'

const AAVE_POOL_DATA_PROVIDER_SEPOLIA = '0x3e9708d80f7B3e43118013075F7e95CE3AB31F31'
// Verify at: https://docs.aave.com/developers/deployed-contracts/v3-testnet-addresses

const DATA_PROVIDER_ABI = [
  'function getReserveData(address asset) view returns (uint256 unbacked, uint256 accruedToTreasuryScaled, uint256 totalAToken, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)'
]

export async function getAaveRateDirect(usdtAddress: string): Promise<number> {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL!)
  const dataProvider = new ethers.Contract(
    AAVE_POOL_DATA_PROVIDER_SEPOLIA,
    DATA_PROVIDER_ABI,
    provider
  )

  const data = await dataProvider.getReserveData(usdtAddress)
  const liquidityRate = data[5]  // liquidityRate is index 5

  // Convert from ray (1e27) to percentage APY
  return Number(liquidityRate) / 1e25
}
```

---

## 10. Compound III Integration

Compound III (Comet) is the current version. It does not use the same interest rate model as Compound V2.

### Get USDT Supply Rate from Compound III

```typescript
import { ethers } from 'ethers'

// Compound III Comet — USDT market on Sepolia
// Verify address at: https://docs.compound.finance
const COMPOUND_COMET_USDT_SEPOLIA = '0x...'  // ACTION REQUIRED: fill on Day 1

const COMET_ABI = [
  'function getSupplyRate(uint utilization) view returns (uint64)',
  'function getUtilization() view returns (uint)'
]

export async function getCompoundUSDTRate(): Promise<number> {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL!)
  const comet = new ethers.Contract(COMPOUND_COMET_USDT_SEPOLIA, COMET_ABI, provider)

  const utilization = await comet.getUtilization()
  const supplyRatePerSecond = await comet.getSupplyRate(utilization)

  // Convert per-second rate to APY
  const secondsPerYear = 365 * 24 * 60 * 60
  const apy = (Math.pow(1 + Number(supplyRatePerSecond) / 1e18, secondsPerYear) - 1) * 100

  return apy
}
```

> **Day 1 check:** Confirm USDT Comet address on Sepolia at https://docs.compound.finance. If Compound doesn't have a USDT Comet on Sepolia, use DAI or USDC Comet and label it clearly in your demo.

### Fallback Rates (if Sepolia data is unavailable)

```typescript
export const FALLBACK_RATES = {
  aave: 4.82,     // realistic stablecoin supply APY
  compound: 3.91
}

export async function getRatesWithFallback() {
  try {
    const [aave, compound] = await Promise.all([
      getAaveUSDTRate(),
      getCompoundUSDTRate()
    ])
    return { aave, compound, source: 'live' }
  } catch (err) {
    console.warn('⚠ Live rate fetch failed, using fallback rates')
    return { ...FALLBACK_RATES, source: 'fallback' }
  }
}
```

---

## 11. Claude AI Integration

### Setup

```typescript
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})
```

> Current recommended model: `claude-sonnet-4-20250514`  
> Docs: https://docs.anthropic.com/en/docs/models-overview

### Worker Analysis Prompt

```typescript
export const buildWorkerPrompt = (
  aaveAPY: number,
  compoundAPY: number,
  dataSource: string
): string => `
You are an autonomous DeFi yield analyst agent executing a paid task.

You have retrieved the following live USDT lending supply rates on Ethereum Sepolia testnet:
- Aave V3: ${aaveAPY.toFixed(4)}% APY
- Compound III: ${compoundAPY.toFixed(4)}% APY
- Data source: ${dataSource}
- Timestamp: ${new Date().toISOString()}

Your task: Analyze these rates and recommend the optimal protocol for a treasury agent 
seeking to maximize USDT yield with minimal risk.

Respond ONLY with valid JSON. No preamble. No backticks. No explanation outside the JSON.

{
  "recommendation": {
    "protocol": "aave" | "compound",
    "apy": <number — must exactly match the APY of the recommended protocol>,
    "reasoning": "<substantive explanation of at least 80 characters explaining the recommendation>"
  }
}
`

export async function getWorkerAnalysis(
  aaveAPY: number,
  compoundAPY: number,
  dataSource: string
): Promise<{ protocol: string; apy: number; reasoning: string }> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: buildWorkerPrompt(aaveAPY, compoundAPY, dataSource)
    }]
  })

  const text = response.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('')
    .replace(/```json|```/g, '')
    .trim()

  return JSON.parse(text)
}
```

### Validator Semantic Prompt

```typescript
export const buildValidatorPrompt = (result: TaskResult, rawRates: RawRates): string => `
You are an independent financial validator in an autonomous agent payment system.
Your verdict controls whether the worker agent receives payment.

A worker agent submitted this yield analysis:
<submission>
${JSON.stringify(result, null, 2)}
</submission>

The raw protocol data at time of submission was:
<raw_data>
Aave V3 supply APY: ${rawRates.aave}%
Compound III supply APY: ${rawRates.compound}%
</raw_data>

Evaluate on three criteria:
1. CONSISTENCY: Does the recommendation match the raw rate data?
2. SOUNDNESS: Is the reasoning logical and substantive?
3. INTEGRITY: Any signs of fabricated, inconsistent, or suspicious data?

Respond ONLY with valid JSON. No preamble. No backticks.

{
  "verdict": "APPROVED" | "REJECTED",
  "reason": "<one clear sentence explanation>",
  "flags": ["<specific issue if any>"]
}
`

export async function getValidatorVerdict(
  result: TaskResult,
  rawRates: RawRates
): Promise<{ verdict: 'APPROVED' | 'REJECTED'; reason: string; flags: string[] }> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: buildValidatorPrompt(result, rawRates)
    }]
  })

  const text = response.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('')
    .replace(/```json|```/g, '')
    .trim()

  return JSON.parse(text)
}
```

---

## 12. Task Lifecycle & State Machine

```typescript
export enum TaskStatus {
  OPEN               = 'OPEN',
  IN_PROGRESS        = 'IN_PROGRESS',
  PENDING_VALIDATION = 'PENDING_VALIDATION',
  SETTLED            = 'SETTLED',
  FAILED             = 'FAILED'
}

// Valid transitions only:
const TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.OPEN]:               [TaskStatus.IN_PROGRESS],
  [TaskStatus.IN_PROGRESS]:        [TaskStatus.PENDING_VALIDATION],
  [TaskStatus.PENDING_VALIDATION]: [TaskStatus.SETTLED, TaskStatus.FAILED],
  [TaskStatus.SETTLED]:            [],
  [TaskStatus.FAILED]:             []
}

export function validateTransition(from: TaskStatus, to: TaskStatus): void {
  if (!TRANSITIONS[from].includes(to)) {
    throw new Error(`Invalid state transition: ${from} → ${to}`)
  }
}
```

### Task Registry (EventEmitter-based)

```typescript
import { EventEmitter } from 'events'
import { v4 as uuidv4 } from 'uuid'

export class TaskRegistry extends EventEmitter {
  private tasks = new Map<string, Task>()

  postTask(input: PostTaskInput): Task {
    const task: Task = {
      id: uuidv4(),
      type: 'YIELD_ANALYSIS',
      description: input.description,
      reward: input.reward,
      deadline: input.deadline,
      status: TaskStatus.OPEN,
      postedBy: input.postedBy,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    this.tasks.set(task.id, task)
    this.emit('task:posted', task)
    return task
  }

  acceptTask(taskId: string, workerId: string): void {
    const task = this.getTask(taskId)
    validateTransition(task.status, TaskStatus.IN_PROGRESS)
    task.status = TaskStatus.IN_PROGRESS
    task.acceptedBy = workerId
    task.updatedAt = Date.now()
    this.emit('task:accepted', task)
  }

  submitResult(taskId: string, result: TaskResult): void {
    const task = this.getTask(taskId)
    validateTransition(task.status, TaskStatus.PENDING_VALIDATION)
    task.status = TaskStatus.PENDING_VALIDATION
    task.result = result
    task.updatedAt = Date.now()
    this.emit('task:submitted', task)
  }

  settleTask(taskId: string, txHash: string): void {
    const task = this.getTask(taskId)
    validateTransition(task.status, TaskStatus.SETTLED)
    task.status = TaskStatus.SETTLED
    task.settlementTxHash = txHash
    task.updatedAt = Date.now()
    this.emit('task:settled', task)
  }

  failTask(taskId: string, reason: string): void {
    const task = this.getTask(taskId)
    validateTransition(task.status, TaskStatus.FAILED)
    task.status = TaskStatus.FAILED
    task.failReason = reason
    task.updatedAt = Date.now()
    this.emit('task:failed', task)
  }

  getTask(taskId: string): Task {
    const task = this.tasks.get(taskId)
    if (!task) throw new Error(`Task not found: ${taskId}`)
    return task
  }

  getOpenTasks(): Task[] {
    return Array.from(this.tasks.values()).filter(t => t.status === TaskStatus.OPEN)
  }

  getPendingValidation(): Task[] {
    return Array.from(this.tasks.values())
      .filter(t => t.status === TaskStatus.PENDING_VALIDATION)
  }
}
```

---

## 13. Validation Engine — All 3 Layers

### Layer 1 — Zod Schema Validation

```typescript
import { z } from 'zod'

const ProtocolSchema = z.object({
  name: z.enum(['aave', 'compound']),
  supplyAPY: z.number(),
  rawRate: z.string()
})

const TaskResultSchema = z.object({
  taskId: z.string().uuid(),
  workerId: z.string(),
  timestamp: z.number(),
  protocols: z.array(ProtocolSchema).length(2),
  recommendation: z.object({
    protocol: z.string(),
    apy: z.number(),
    reasoning: z.string().min(80)
  }),
  dataSource: z.string()
})

export function validateSchema(result: unknown): {
  passed: boolean
  reason?: string
} {
  const parsed = TaskResultSchema.safeParse(result)
  if (parsed.success) return { passed: true }
  return {
    passed: false,
    reason: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
  }
}
```

### Layer 2 — Economic Sanity Checks

```typescript
const SANITY = {
  minAPY: 0,
  maxAPY: 50,          // nothing above 50% is realistic for stablecoins
  maxAgeMs: 30_000,    // data must be < 30 seconds old
  minReasoning: 80,    // reasoning must be substantive
  apyTolerance: 0.01   // recommendation APY must match protocol data within 0.01%
}

export function validateSanity(result: TaskResult): {
  passed: boolean
  reason?: string
  failedChecks: string[]
} {
  const failed: string[] = []

  // 1. APY bounds check for all protocols
  for (const p of result.protocols) {
    if (p.supplyAPY < SANITY.minAPY || p.supplyAPY > SANITY.maxAPY) {
      failed.push(`${p.name} APY ${p.supplyAPY}% is outside realistic bounds (0-50%)`)
    }
  }

  // 2. Data freshness check
  const ageMs = Date.now() - result.timestamp
  if (ageMs > SANITY.maxAgeMs) {
    failed.push(`Data is ${ageMs}ms old — exceeds 30 second freshness limit`)
  }

  // 3. Recommendation must reference a real protocol
  const protocolNames = result.protocols.map(p => p.name)
  if (!protocolNames.includes(result.recommendation.protocol as any)) {
    failed.push(`Recommended protocol '${result.recommendation.protocol}' was not queried`)
  }

  // 4. Recommendation APY must match the protocol data
  const recommended = result.protocols.find(p => p.name === result.recommendation.protocol)
  if (recommended) {
    const diff = Math.abs(recommended.supplyAPY - result.recommendation.apy)
    if (diff > SANITY.apyTolerance) {
      failed.push(`Recommendation APY (${result.recommendation.apy}%) doesn't match ${recommended.name} data (${recommended.supplyAPY}%)`)
    }
  }

  // 5. Best rate check — recommendation should pick the higher APY
  const bestProtocol = result.protocols.reduce((a, b) =>
    a.supplyAPY > b.supplyAPY ? a : b
  )
  if (bestProtocol.name !== result.recommendation.protocol) {
    failed.push(`Recommended ${result.recommendation.protocol} (${result.recommendation.apy}%) but ${bestProtocol.name} has higher APY (${bestProtocol.supplyAPY}%)`)
  }

  return {
    passed: failed.length === 0,
    reason: failed[0],
    failedChecks: failed
  }
}
```

### Layer 3 — Claude AI Semantic Validation

```typescript
export async function validateSemantic(
  result: TaskResult,
  rawRates: RawRates
): Promise<{ passed: boolean; reason: string; flags: string[] }> {
  const verdict = await getValidatorVerdict(result, rawRates)

  return {
    passed: verdict.verdict === 'APPROVED',
    reason: verdict.reason,
    flags: verdict.flags
  }
}
```

### Full Validation Orchestrator

```typescript
export async function runFullValidation(
  result: TaskResult,
  rawRates: RawRates
): Promise<ValidationVerdict> {
  const l1 = validateSchema(result)
  if (!l1.passed) {
    return {
      layer1: l1,
      layer2: { passed: false, reason: 'Skipped — Layer 1 failed' },
      layer3: { passed: false, reason: 'Skipped — Layer 1 failed', flags: [] },
      finalVerdict: 'REJECTED',
      timestamp: Date.now()
    }
  }

  const l2 = validateSanity(result)
  if (!l2.passed) {
    return {
      layer1: l1,
      layer2: l2,
      layer3: { passed: false, reason: 'Skipped — Layer 2 failed', flags: [] },
      finalVerdict: 'REJECTED',
      timestamp: Date.now()
    }
  }

  const l3 = await validateSemantic(result, rawRates)

  return {
    layer1: l1,
    layer2: l2,
    layer3: l3,
    finalVerdict: l3.passed ? 'APPROVED' : 'REJECTED',
    timestamp: Date.now()
  }
}
```

---

## 14. Escrow System

The escrow is a dedicated WDK wallet that holds funds during task execution.

```typescript
export class EscrowManager {
  private wallet: any            // WDK wallet account
  private address: string
  private taskLocks = new Map<string, string>()  // taskId → amount

  constructor(wallet: any, address: string) {
    this.wallet = wallet
    this.address = address
  }

  async lock(
    taskId: string,
    amount: string,           // e.g. "5.0"
    fromWallet: any,
    usdtAddress: string
  ): Promise<string> {         // returns txHash
    const txHash = await sendUSDT(fromWallet, this.address, amount, usdtAddress)
    this.taskLocks.set(taskId, amount)
    return txHash
  }

  async release(
    taskId: string,
    toAddress: string,
    usdtAddress: string
  ): Promise<string> {
    const amount = this.taskLocks.get(taskId)
    if (!amount) throw new Error(`No escrow found for task ${taskId}`)
    const txHash = await sendUSDT(this.wallet, toAddress, amount, usdtAddress)
    this.taskLocks.delete(taskId)
    return txHash
  }

  async refund(
    taskId: string,
    toAddress: string,
    usdtAddress: string
  ): Promise<string> {
    return this.release(taskId, toAddress, usdtAddress)
  }

  getLockedAmount(taskId: string): string | undefined {
    return this.taskLocks.get(taskId)
  }
}
```

---

## 15. Data Schemas

```typescript
export interface Task {
  id: string
  type: 'YIELD_ANALYSIS'
  description: string
  reward: string                // human-readable USDT e.g. "5.0"
  deadline: number              // seconds
  status: TaskStatus
  postedBy: string              // Agent A address
  acceptedBy?: string           // Agent B address
  escrowTxHash?: string         // tx locking funds
  result?: TaskResult
  verdict?: ValidationVerdict
  settlementTxHash?: string     // tx releasing funds
  failReason?: string
  createdAt: number             // unix ms
  updatedAt: number             // unix ms
}

export interface TaskResult {
  taskId: string
  workerId: string
  timestamp: number             // unix ms — used for freshness check
  protocols: {
    name: 'aave' | 'compound'
    supplyAPY: number           // percentage e.g. 4.82
    rawRate: string             // raw value from contract
  }[]
  recommendation: {
    protocol: string
    apy: number
    reasoning: string           // min 80 chars
  }
  dataSource: string            // 'live-sepolia' | 'fallback'
}

export interface RawRates {
  aave: number
  compound: number
  source: 'live' | 'fallback'
  timestamp: number
}

export interface ValidationVerdict {
  layer1: { passed: boolean; reason?: string }
  layer2: { passed: boolean; reason?: string; failedChecks?: string[] }
  layer3: { passed: boolean; reason?: string; flags?: string[] }
  finalVerdict: 'APPROVED' | 'REJECTED'
  timestamp: number
}

export interface PostTaskInput {
  description: string
  reward: string
  deadline: number
  postedBy: string
}
```

---

## 16. Terminal Dashboard

```typescript
import chalk from 'chalk'

const startTime = Date.now()

function elapsed(): string {
  const ms = Date.now() - startTime
  const s = Math.floor(ms / 1000)
  return `${String(s).padStart(5, '0')}s`
}

export function log(agent: string, message: string): void {
  const time = chalk.gray(`[${elapsed()}]`)
  const label = chalk.cyan(agent.padEnd(10))
  console.log(`${time}  ${label}  ${message}`)
}

export function logSuccess(message: string): void {
  console.log(chalk.green.bold(`\n  ✓ ${message}\n`))
}

export function logRejection(message: string): void {
  console.log(chalk.red.bold(`\n  ✗ ${message}\n`))
}

export function logValidation(layer: string, passed: boolean, detail?: string): void {
  const icon = passed ? chalk.green('✓') : chalk.red('✗')
  const label = chalk.yellow(layer.padEnd(25))
  const info = detail ? chalk.gray(` — ${detail}`) : ''
  console.log(`          ${icon}  ${label}${info}`)
}

export function printHeader(): void {
  console.log(chalk.bold.blue('\n╔══════════════════════════════════════════════════════════╗'))
  console.log(chalk.bold.blue('║          AGENT MARKET PROTOCOL  —  LIVE DEMO              ║'))
  console.log(chalk.bold.blue('╚══════════════════════════════════════════════════════════╝\n'))
}

export function printAgents(
  agentA: string,
  agentB: string,
  agentC: string,
  escrow: string
): void {
  console.log(` ${chalk.yellow('AGENT A')}  [Task Creator]   ${chalk.gray(agentA)}`)
  console.log(` ${chalk.cyan('AGENT B')}  [Worker]         ${chalk.gray(agentB)}`)
  console.log(` ${chalk.magenta('AGENT C')}  [Validator]      ${chalk.gray(agentC)}`)
  console.log(` ${chalk.white('ESCROW')}             ${chalk.gray(escrow)}\n`)
  console.log(chalk.gray('─'.repeat(65)))
}

export function printSettlement(txHash: string, amount: string): void {
  console.log('\n' + chalk.green.bold('  ╔═══════════════════════════════════════════════════╗'))
  console.log(chalk.green.bold(`  ║  SETTLED  ${amount} USDT transferred to Agent B  ║`))
  console.log(chalk.green.bold('  ╚═══════════════════════════════════════════════════╝'))
  console.log(chalk.gray(`\n  View on Etherscan: https://sepolia.etherscan.io/tx/${txHash}\n`))
}
```

---

## 17. Project File Structure

```
amp/
├── src/
│   ├── agents/
│   │   ├── AgentA.ts               # Task Creator
│   │   ├── AgentB.ts               # Worker Agent
│   │   └── AgentC.ts               # Validator Agent
│   │
│   ├── core/
│   │   ├── TaskRegistry.ts         # Task store + state machine + EventEmitter
│   │   ├── EscrowManager.ts        # WDK-based fund locking and release
│   │   └── types.ts                # All shared TypeScript interfaces + enums
│   │
│   ├── validation/
│   │   ├── SchemaValidator.ts      # Layer 1 — Zod schema
│   │   ├── SanityValidator.ts      # Layer 2 — economic checks
│   │   ├── AIValidator.ts          # Layer 3 — Claude semantic review
│   │   └── ValidationOrchestrator.ts  # Runs all 3 layers
│   │
│   ├── defi/
│   │   ├── AaveAdapter.ts          # WDK Aave module + fallback
│   │   └── CompoundAdapter.ts      # Compound III direct call + fallback
│   │
│   ├── ai/
│   │   └── ClaudeClient.ts         # Anthropic SDK + prompts
│   │
│   ├── wallet/
│   │   └── WDKClient.ts            # WDK init, USDT transfer, balance helpers
│   │
│   ├── dashboard/
│   │   └── Dashboard.ts            # Terminal display
│   │
│   └── index.ts                    # Entry — boots all agents, wires events
│
├── scripts/
│   └── generate-wallets.ts         # One-time script to generate seed phrases
│
├── .env                            # Never commit — local secrets
├── .env.example                    # Commit this — template only
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 18. Environment Variables

### .env.example

```bash
# ──────────────────────────────────────────────
# AMP — Agent Market Protocol
# Environment Variables Template
# Copy to .env and fill in your values
# NEVER commit .env to git
# ──────────────────────────────────────────────

# Sepolia RPC (get free key from Alchemy or Infura)
# Alchemy: https://alchemy.com
# Infura: https://infura.io
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY_HERE

# Anthropic Claude API
# Get key at: https://console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE

# Agent Wallet Seed Phrases (24-word BIP-39)
# Generate with: npx ts-node scripts/generate-wallets.ts
# Store securely — these control real (test) funds
AGENT_A_SEED_PHRASE=word1 word2 word3 ... word24
AGENT_B_SEED_PHRASE=word1 word2 word3 ... word24
AGENT_C_SEED_PHRASE=word1 word2 word3 ... word24
ESCROW_SEED_PHRASE=word1 word2 word3 ... word24

# Token Addresses — Sepolia Testnet
# USDT test token (Aave-minted): verify at https://docs.aave.com/developers/deployed-contracts/v3-testnet-addresses
USDT_SEPOLIA_ADDRESS=0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0

# Aave V3 — Sepolia
# Pool address provider: verify at https://docs.aave.com/developers/deployed-contracts/v3-testnet-addresses
AAVE_POOL_ADDRESS_PROVIDER_SEPOLIA=0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A
AAVE_DATA_PROVIDER_SEPOLIA=0x3e9708d80f7B3e43118013075F7e95CE3AB31F31

# Compound III (Comet) — Sepolia
# Get from: https://docs.compound.finance
COMPOUND_COMET_USDT_SEPOLIA=0x_VERIFY_FROM_COMPOUND_DOCS

# Task Configuration
TASK_REWARD_USDT=5.0
TASK_DEADLINE_SECONDS=60

# Demo Mode
USE_FALLBACK_RATES=false
LOG_LEVEL=info
```

### .gitignore additions

```
.env
*.seed
node_modules/
dist/
```

---

## 19. package.json

```json
{
  "name": "agent-market-protocol",
  "version": "1.0.0",
  "description": "Autonomous AI agent economic coordination layer — Tether Hackathon Galáctica WDK Edition 1",
  "main": "dist/index.js",
  "scripts": {
    "start": "ts-node src/index.ts",
    "demo:reject": "INJECT_BAD_DATA=true ts-node src/index.ts",
    "build": "tsc",
    "generate-wallets": "ts-node scripts/generate-wallets.ts",
    "dev": "nodemon --exec ts-node src/index.ts"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.39.0",
    "@tetherto/wdk": "latest",
    "@tetherto/wdk-protocol-lending-aave-evm": "latest",
    "@tetherto/wdk-wallet-evm": "latest",
    "chalk": "^5.3.0",
    "dotenv": "^16.4.5",
    "ethers": "^6.13.0",
    "express": "^4.21.0",
    "uuid": "^9.0.1",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^22.0.0",
    "@types/uuid": "^9.0.8",
    "nodemon": "^3.1.0",
    "ts-node": "^10.9.2",
    "typescript": "^5.5.4"
  }
}
```

---

## 20. tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*", "scripts/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 21. Day-by-Day Build Checklist

### Day 1 — Foundation (5 hrs)
**Goal: Know your tools before writing product code**

- [ ] Read WDK Node.js Quickstart — https://docs.wallet.tether.io/start-building/nodejs-bare-quickstart
- [ ] Read WDK EVM Wallet API — https://docs.wallet.tether.io/sdk/wallet-modules/wallet-evm/api
- [ ] Read WDK Aave lending module — https://docs.wallet.tether.io/sdk/lending-modules/lending-aave-evm
- [ ] Verify Aave V3 Sepolia testnet addresses — https://docs.aave.com/developers/deployed-contracts/v3-testnet-addresses
- [ ] Verify Compound III Comet address on Sepolia — https://docs.compound.finance
- [ ] Run `npx ts-node scripts/generate-wallets.ts` → save all 4 seed phrases to .env
- [ ] Fund wallets: Sepolia ETH from faucet, test USDT from Pimlico/Candide
- [ ] Install all packages (`npm install`)
- [ ] Write `WDKClient.ts` — init WDK, get address, check balance
- [ ] Test: create wallet → check USDT balance → send 1 USDT to another wallet
- [ ] Confirm txHash on https://sepolia.etherscan.io
- [ ] **Checkpoint:** Real USDT transfer confirmed on Sepolia. TxHash in hand.

---

### Day 2 — Registry + Agent Shells (5 hrs)
**Goal: Two agents exist, registry works, tasks flow**

- [ ] Write `types.ts` — all interfaces from Section 15
- [ ] Write `TaskRegistry.ts` — EventEmitter + state machine from Section 12
- [ ] Write `AgentA.ts` shell — init wallet, post task (no escrow yet)
- [ ] Write `AgentB.ts` shell — init wallet, poll registry, accept task
- [ ] Test: Agent A posts → Agent B accepts → states transition correctly
- [ ] Write `EscrowManager.ts` — lock funds on task post
- [ ] Wire escrow lock into Agent A's `postTask` flow
- [ ] Test: escrow wallet receives USDT when task is posted
- [ ] **Checkpoint:** Task lifecycle OPEN → IN_PROGRESS working. Escrow funded on Sepolia.

---

### Day 3 — DeFi Data + Worker Output (5 hrs)
**Goal: Agent B produces a complete, valid result**

- [ ] Write `AaveAdapter.ts` — use WDK Aave module to get supply rate
- [ ] Write `CompoundAdapter.ts` — direct contract call for supply rate
- [ ] Test both adapters independently — confirm they return numbers
- [ ] Implement fallback rates in both adapters
- [ ] Write `ClaudeClient.ts` — worker prompt + response parser
- [ ] Wire Agent B: fetch rates → Claude → format TaskResult → submit to registry
- [ ] Test: Agent B runs full flow and produces a valid TaskResult JSON
- [ ] Print TaskResult to terminal and verify all fields are correct
- [ ] **Checkpoint:** Agent B produces a complete TaskResult. Ready for validation.

---

### Day 4 — Validation + Full Settlement (5 hrs)
**Goal: Real USDT moves end-to-end. TxHash on Sepolia.**

- [ ] Write `SchemaValidator.ts` — Zod Layer 1 from Section 13
- [ ] Write `SanityValidator.ts` — Layer 2 economic checks from Section 13
- [ ] Write `AIValidator.ts` — Layer 3 Claude validation from Section 13
- [ ] Write `ValidationOrchestrator.ts` — runs all 3 layers
- [ ] Write `AgentC.ts` — poll registry, run validation, emit verdict
- [ ] Wire escrow release on APPROVED → WDK transfer to Agent B
- [ ] Wire escrow refund on REJECTED → WDK transfer back to Agent A
- [ ] Full end-to-end test: post → accept → work → validate → settle
- [ ] Confirm settlement txHash on Sepolia Etherscan
- [ ] **Checkpoint:** USDT moves from escrow to Agent B wallet. TxHash confirmed. 🎉**

---

### Day 5 — Rejection Demo + Dashboard (5 hrs)
**Goal: Both APPROVED and REJECTED flows work. Demo looks great.**

- [ ] Write `Dashboard.ts` — terminal display from Section 16
- [ ] Wire dashboard into all agents
- [ ] Add `INJECT_BAD_DATA=true` flag to Agent B for demo:reject
- [ ] When flag is set: inject APY of 500% into result to trigger Layer 2 rejection
- [ ] Test rejection flow: confirm Layer 2 catches it, payment not released
- [ ] Test full APPROVED flow with dashboard running — confirm it looks clean
- [ ] Wire up `index.ts` — single `npm start` boots all 3 agents
- [ ] Full clean run from `npm start` — no errors, dashboard is readable
- [ ] **Checkpoint:** Both flows work. Demo is ready to record.

---

### Day 6 — Record Demo + Write README (5 hrs)
**Goal: Video done. README done. Repo is professional.**

- [ ] Record demo video — APPROVED flow (show txHash on Etherscan)
- [ ] Record rejection sequence — show Layer 2 catching bad data
- [ ] Video should be under 3 minutes (use demo script from Section 22)
- [ ] Write README.md using the Project Overview document
- [ ] Add: architecture diagram, demo video embed, transaction hashes as proof
- [ ] Add: setup instructions (clone → npm install → fill .env → npm start)
- [ ] Final repo cleanup: no debug logs, no hardcoded keys, clean TypeScript
- [ ] Run `npm run build` — confirm zero TypeScript errors
- [ ] **Checkpoint:** Video done. README done. Zero build errors.

---

### Day 7 — Submit (5 hrs)
**Goal: Submit a polished, complete entry.**

- [ ] Final full `npm start` test — everything works cleanly
- [ ] Push to GitHub — public repo
- [ ] Submit on DoraHacks: project name, description, GitHub link, demo video
- [ ] Paste at least one Sepolia txHash as proof of real on-chain activity
- [ ] Select primary track: Agent Wallets
- [ ] Select secondary track where applicable: Lending Bot
- [ ] Buffer time for any last-minute fixes
- [ ] **Done. Submit before March 22, 23:59 UTC.**

---

## 22. Demo Script

**Target length: under 3 minutes. Record in one take.**

---

**[0:00–0:20] The problem**

> "AI agents can reason and execute — but they have no way to hire each other, pay each other, or trust each other's work. Agent Market Protocol solves this with trustless, autonomous economic coordination powered by Tether's WDK."

---

**[0:20–0:40] Show the system**

Point to each agent in the terminal dashboard.

> "Three agents. Agent A is a treasury manager. Agent B is a DeFi analyst. Agent C is an independent validator. Each holds its own self-custodial WDK wallet on Ethereum Sepolia. They coordinate through a task marketplace. No human is involved after startup."

---

**[0:40–1:40] Run the APPROVED flow**

Run `npm start`. Narrate each log line as it appears:

> "Agent A posts a yield analysis task and locks 5 USDT in escrow..."  
> "Agent B discovers the task, queries Aave V3 and Compound III for live USDT rates..."  
> "Claude analyzes the data and recommends the higher-yield protocol..."  
> "Agent C runs three validation layers — schema, economic sanity, and AI semantic review — all pass..."  
> "Escrow releases. Agent B receives 5 USDT. Here's the transaction hash..."

Open `https://sepolia.etherscan.io/tx/0x...` in browser. Show the confirmed transfer.

> "Real USDT. Real chain. Total human input after startup: zero."

---

**[1:40–2:10] Show the rejection**

Run `npm run demo:reject`.

> "Now I'll inject bad data — a fake 500% APY. Watch what happens."

Show Layer 2 catching it. Show payment NOT releasing.

> "Layer 2 caught it. APY outside realistic bounds. Payment held. Worker gets nothing. This is trustless economic verification — payment only releases on proof, not trust."

---

**[2:10–2:40] Close with the vision**

> "This is the minimal viable implementation of infrastructure the agentic economy actually needs. Any agent can post a task. Any specialized agent can provide a service. Value settles onchain automatically. That's what agents as economic infrastructure looks like."

---

## 23. Hackathon Submission Checklist

Before submitting on DoraHacks, confirm:

- [ ] GitHub repo is public
- [ ] README has: project description, architecture diagram, setup instructions
- [ ] Demo video is uploaded and linked (YouTube or Loom recommended)
- [ ] At least one real Sepolia transaction hash included as proof
- [ ] Submission clearly states primary track: **Agent Wallets**
- [ ] Code uses `@tetherto/wdk` and `@tetherto/wdk-wallet-evm` (required for track)
- [ ] Code uses `@tetherto/wdk-protocol-lending-aave-evm` (strengthens Lending Bot eligibility)
- [ ] No hardcoded private keys or seed phrases in any committed file
- [ ] `.env` is in `.gitignore`
- [ ] `npm install && npm start` works from a clean clone
- [ ] Submitted before **March 22, 2026 23:59 UTC**

---

*AMP Technical PRD v2.0 — Last updated March 2026*  
*Hackathon: Tether Hackathon Galáctica: WDK Edition 1*  
*All links verified at time of writing. Verify contract addresses from official docs on Day 1.*
