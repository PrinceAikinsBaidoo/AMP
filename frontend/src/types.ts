export type AMPEvent =
  | { type: 'cycle_start'; cycleNum: 1 | 2; subtitle: string }
  | { type: 'agent_ready'; agent: string; address: string; balance: string }
  | { type: 'task_posted'; taskId: string; reward: string; description: string }
  | { type: 'escrow_locked'; txHash: string }
  | { type: 'task_accepted'; agent: string; taskId: string; reward: string }
  | { type: 'task_lost'; agent: string }
  | { type: 'claude_thinking' }
  | { type: 'claude_tools'; tools: string[] }
  | { type: 'rates_fetched'; protocols: Array<{ name: string; apy: number }> }
  | { type: 'claude_recommends'; protocol: string; apy: number }
  | { type: 'result_submitted'; agent: string; fraudulent: boolean }
  | { type: 'validation_layer'; layer: 1 | 2 | 3; passed: boolean; detail: string }
  | { type: 'verdict'; result: 'APPROVED' | 'REJECTED'; reason: string }
  | { type: 'escrow_released'; txHash: string; recipient: string; amount: string }
  | { type: 'escrow_refunded'; txHash: string; amount: string }
  | { type: 'payment_received'; agent: string; amount: string }
  | { type: 'aave_supply'; agent: string; txHash: string; collateral: string }
  | { type: 'cycle_complete'; cycleNum: 1 | 2 }
  | { type: 'demo_complete' }

export type AgentStatus = 'WAITING' | 'READY' | 'ACTIVE' | 'DONE' | 'LOST'

export interface AgentState {
  id: string
  status: AgentStatus
  address?: string
  balance?: string
  taskId?: string
  reward?: string
}

export type EscrowStatus = 'EMPTY' | 'LOCKED' | 'RELEASED' | 'REFUNDED'

export interface EscrowState {
  status: EscrowStatus
  amount?: string
  txHash?: string
  recipient?: string
}

export interface ValidationLayerState {
  status: 'idle' | 'passed' | 'failed'
  detail?: string
}

export interface ValidationState {
  layers: [ValidationLayerState, ValidationLayerState, ValidationLayerState]
  verdict?: 'APPROVED' | 'REJECTED'
  reason?: string
}

export interface EventEntry {
  id: string
  timestamp: number // seconds elapsed since start
  agent?: string
  message: string
  type: AMPEvent['type']
  fraudulent?: boolean
}

export interface TxEntry {
  id: string
  label: string
  txHash: string
  kind: 'escrow_lock' | 'escrow_release' | 'escrow_refund' | 'aave_supply' | 'payment'
  agent?: string
  amount?: string
}

export interface ConnectionLine {
  from: string
  to: string
  active: boolean
  fraudulent?: boolean
  animating: boolean
}

export interface DemoState {
  connected: boolean
  cycleNum: 1 | 2 | null
  cycleSubtitle: string
  cycleComplete: boolean[]
  demoComplete: boolean
  agents: Record<string, AgentState>
  escrow: EscrowState
  validation: ValidationState
  events: EventEntry[]
  transactions: TxEntry[]
  rates: Array<{ name: string; apy: number }>
  recommendation: { protocol: string; apy: number } | null
  activeLines: ConnectionLine[]
  taskDescription?: string
  taskReward?: string
  claudeThinking: boolean
  claudeTools: string[]
  resultSubmittedAgent?: string
  resultFraudulent?: boolean
}
