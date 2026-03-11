/**
 * types.ts
 * Shared TypeScript interfaces and enums for the Agent Market Protocol.
 */

// ─── Task State Machine ─────────────────────────────────────────────────────

export enum TaskStatus {
  OPEN               = 'OPEN',
  IN_PROGRESS        = 'IN_PROGRESS',
  PENDING_VALIDATION = 'PENDING_VALIDATION',
  SETTLED            = 'SETTLED',
  FAILED             = 'FAILED',
}

const TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.OPEN]:               [TaskStatus.IN_PROGRESS],
  [TaskStatus.IN_PROGRESS]:        [TaskStatus.PENDING_VALIDATION],
  [TaskStatus.PENDING_VALIDATION]: [TaskStatus.SETTLED, TaskStatus.FAILED],
  [TaskStatus.SETTLED]:            [],
  [TaskStatus.FAILED]:             [],
}

export function validateTransition(from: TaskStatus, to: TaskStatus): void {
  if (!TRANSITIONS[from].includes(to)) {
    throw new Error(`Invalid state transition: ${from} → ${to}`)
  }
}

// ─── Core Entities ──────────────────────────────────────────────────────────

export interface Task {
  id: string
  type: string           // task type string — e.g. 'YIELD_ANALYSIS', extensible by task posters
  description: string
  reward: string              // human-readable USDT e.g. "5.0"
  deadline: number            // seconds
  status: TaskStatus
  postedBy: string            // Agent A address
  acceptedBy?: string         // Agent B address
  escrowTxHash?: string       // tx locking funds in escrow
  result?: TaskResult
  verdict?: ValidationVerdict
  settlementTxHash?: string   // tx releasing funds to worker
  failReason?: string
  createdAt: number           // unix ms
  updatedAt: number           // unix ms
}

export interface PostTaskInput {
  type?:       string   // optional — defaults to 'YIELD_ANALYSIS' if omitted
  description: string
  reward:      string
  deadline:    number
  postedBy:    string
}

// ─── DeFi Data ──────────────────────────────────────────────────────────────

export interface RawRates {
  aave: number
  compound: number
  source: 'live' | 'fallback'
  timestamp: number
}

// ─── Task Result (submitted by Agent B) ─────────────────────────────────────

export interface TaskResult {
  taskId: string
  workerId: string
  timestamp: number           // unix ms — used for freshness check
  protocols: {
    name: 'aave' | 'compound'
    supplyAPY: number         // percentage e.g. 4.82
    rawRate: string           // raw value from contract
  }[]
  recommendation: {
    protocol: string
    apy: number
    reasoning: string         // min 80 chars
  }
  dataSource: string          // 'live-sepolia' | 'fallback'
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface ValidationVerdict {
  layer1: { passed: boolean; reason?: string }
  layer2: { passed: boolean; reason?: string; failedChecks?: string[] }
  layer3: { passed: boolean; reason?: string; flags?: string[] }
  finalVerdict: 'APPROVED' | 'REJECTED'
  timestamp: number
}
