import { useEffect, useRef, useState, useCallback } from 'react'
import { AMPEvent, DemoState, AgentState, ValidationLayerState } from '../types'

const DEFAULT_AGENTS: Record<string, AgentState> = {
  A: { id: 'A', status: 'WAITING' },
  B: { id: 'B', status: 'WAITING' },
  B2: { id: 'B2', status: 'WAITING' },
  C: { id: 'C', status: 'WAITING' },
}

const DEFAULT_STATE: DemoState = {
  connected: false,
  cycleNum: null,
  cycleSubtitle: '',
  cycleComplete: [false, false],
  demoComplete: false,
  agents: { ...DEFAULT_AGENTS },
  escrow: { status: 'EMPTY' },
  validation: {
    layers: [
      { status: 'idle' },
      { status: 'idle' },
      { status: 'idle' },
    ],
    verdict: undefined,
    reason: undefined,
  },
  events: [],
  transactions: [],
  rates: [],
  recommendation: null,
  activeLines: [],
  claudeThinking: false,
  claudeTools: [],
}

let eventIdCounter = 0
let txIdCounter = 0

function makeEventId() {
  return `evt-${++eventIdCounter}`
}

function makeTxId() {
  return `tx-${++txIdCounter}`
}

function getAgentLabel(agent: string): string {
  const map: Record<string, string> = {
    A: 'Agent A',
    B: 'Agent B',
    B2: 'Agent B2',
    C: 'Agent C',
  }
  return map[agent] ?? agent
}

export function useWebSocket() {
  const [state, setState] = useState<DemoState>(DEFAULT_STATE)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const mountedRef = useRef(true)

  const getElapsed = useCallback((): number => {
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now()
    }
    return Math.floor((Date.now() - startTimeRef.current) / 1000)
  }, [])

  const processEvent = useCallback((event: AMPEvent) => {
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now()
    }
    const elapsed = getElapsed()

    setState(prev => {
      const next = structuredClone(prev) as DemoState

      switch (event.type) {
        case 'cycle_start': {
          next.cycleNum = event.cycleNum
          next.cycleSubtitle = event.subtitle
          // Reset per-cycle state
          next.escrow = { status: 'EMPTY' }
          next.validation = {
            layers: [{ status: 'idle' }, { status: 'idle' }, { status: 'idle' }],
          }
          next.rates = []
          next.recommendation = null
          next.activeLines = []
          next.claudeThinking = false
          next.claudeTools = []
          next.resultSubmittedAgent = undefined
          next.resultFraudulent = undefined
          // Reset agent statuses but keep addresses/balances
          for (const key of Object.keys(next.agents)) {
            next.agents[key].status = 'WAITING'
            next.agents[key].taskId = undefined
            next.agents[key].reward = undefined
          }
          next.events.push({
            id: makeEventId(),
            timestamp: elapsed,
            message: `=== CYCLE ${event.cycleNum} START: ${event.subtitle} ===`,
            type: 'cycle_start',
          })
          break
        }

        case 'agent_ready': {
          const agentId = event.agent
          if (!next.agents[agentId]) {
            next.agents[agentId] = { id: agentId, status: 'WAITING' }
          }
          next.agents[agentId].status = 'READY'
          next.agents[agentId].address = event.address
          next.agents[agentId].balance = event.balance
          next.events.push({
            id: makeEventId(),
            timestamp: elapsed,
            agent: agentId,
            message: `${getAgentLabel(agentId)} ready — ${event.balance} USDT`,
            type: 'agent_ready',
          })
          break
        }

        case 'task_posted': {
          next.taskDescription = event.description
          next.taskReward = event.reward
          next.agents['A'].status = 'ACTIVE'
          next.events.push({
            id: makeEventId(),
            timestamp: elapsed,
            agent: 'A',
            message: `Task posted: "${event.description}" — reward ${event.reward} USDT`,
            type: 'task_posted',
          })
          break
        }

        case 'escrow_locked': {
          next.escrow = { status: 'LOCKED', amount: next.taskReward, txHash: event.txHash }
          // Add line A → escrow
          next.activeLines.push({
            from: 'A',
            to: 'ESCROW',
            active: true,
            animating: true,
            fraudulent: false,
          })
          next.events.push({
            id: makeEventId(),
            timestamp: elapsed,
            agent: 'A',
            message: `Escrow locked — ${next.taskReward ?? '?'} USDT`,
            type: 'escrow_locked',
          })
          next.transactions.push({
            id: makeTxId(),
            label: 'Escrow Locked',
            txHash: event.txHash,
            kind: 'escrow_lock',
            amount: next.taskReward,
          })
          break
        }

        case 'task_accepted': {
          const agentId = event.agent
          if (next.agents[agentId]) {
            next.agents[agentId].status = 'ACTIVE'
            next.agents[agentId].taskId = event.taskId
            next.agents[agentId].reward = event.reward
          }
          next.events.push({
            id: makeEventId(),
            timestamp: elapsed,
            agent: agentId,
            message: `${getAgentLabel(agentId)} accepted task — reward ${event.reward} USDT`,
            type: 'task_accepted',
          })
          break
        }

        case 'task_lost': {
          const agentId = event.agent
          if (next.agents[agentId]) {
            next.agents[agentId].status = 'LOST'
          }
          next.events.push({
            id: makeEventId(),
            timestamp: elapsed,
            agent: agentId,
            message: `${getAgentLabel(agentId)} lost the race — another worker claimed the task`,
            type: 'task_lost',
          })
          break
        }

        case 'claude_thinking': {
          next.claudeThinking = true
          next.claudeTools = []
          next.events.push({
            id: makeEventId(),
            timestamp: elapsed,
            agent: 'B',
            message: 'Claude is thinking — agentic tool loop starting...',
            type: 'claude_thinking',
          })
          break
        }

        case 'claude_tools': {
          next.claudeThinking = false
          next.claudeTools = event.tools
          next.events.push({
            id: makeEventId(),
            timestamp: elapsed,
            agent: 'B',
            message: `Claude called tools: ${event.tools.join(', ')}`,
            type: 'claude_tools',
          })
          break
        }

        case 'rates_fetched': {
          next.rates = event.protocols
          next.events.push({
            id: makeEventId(),
            timestamp: elapsed,
            agent: 'B',
            message: `Rates fetched: ${event.protocols.map(p => `${p.name} ${p.apy.toFixed(2)}%`).join(', ')}`,
            type: 'rates_fetched',
          })
          break
        }

        case 'claude_recommends': {
          next.recommendation = { protocol: event.protocol, apy: event.apy }
          next.events.push({
            id: makeEventId(),
            timestamp: elapsed,
            agent: 'B',
            message: `Claude recommends: ${event.protocol} @ ${event.apy.toFixed(2)}% APY`,
            type: 'claude_recommends',
          })
          break
        }

        case 'result_submitted': {
          next.resultSubmittedAgent = event.agent
          next.resultFraudulent = event.fraudulent
          if (next.agents[event.agent]) {
            next.agents[event.agent].status = 'ACTIVE'
          }
          // Add line agent → C
          next.activeLines = next.activeLines.filter(l => !(l.to === 'C'))
          next.activeLines.push({
            from: event.agent,
            to: 'C',
            active: true,
            animating: true,
            fraudulent: event.fraudulent,
          })
          next.agents['C'].status = 'ACTIVE'
          next.events.push({
            id: makeEventId(),
            timestamp: elapsed,
            agent: event.agent,
            message: event.fraudulent
              ? `FRAUDULENT result submitted by ${getAgentLabel(event.agent)} — 500% APY`
              : `${getAgentLabel(event.agent)} submitted result for validation`,
            type: 'result_submitted',
            fraudulent: event.fraudulent,
          })
          break
        }

        case 'validation_layer': {
          const idx = event.layer - 1
          const layers = next.validation.layers as ValidationLayerState[]
          layers[idx] = {
            status: event.passed ? 'passed' : 'failed',
            detail: event.detail,
          }
          next.events.push({
            id: makeEventId(),
            timestamp: elapsed,
            agent: 'C',
            message: `Layer ${event.layer} ${event.passed ? 'PASSED' : 'FAILED'}: ${event.detail}`,
            type: 'validation_layer',
          })
          break
        }

        case 'verdict': {
          next.validation.verdict = event.result
          next.validation.reason = event.reason
          next.events.push({
            id: makeEventId(),
            timestamp: elapsed,
            agent: 'C',
            message: `Verdict: ${event.result} — ${event.reason}`,
            type: 'verdict',
          })
          break
        }

        case 'escrow_released': {
          next.escrow = {
            status: 'RELEASED',
            txHash: event.txHash,
            recipient: event.recipient,
            amount: event.amount,
          }
          // Add line C → B
          next.activeLines.push({
            from: 'C',
            to: 'B',
            active: true,
            animating: true,
            fraudulent: false,
          })
          next.events.push({
            id: makeEventId(),
            timestamp: elapsed,
            agent: 'C',
            message: `Escrow released — ${event.amount} USDT → ${event.recipient.slice(0, 6)}...${event.recipient.slice(-4)}`,
            type: 'escrow_released',
          })
          next.transactions.push({
            id: makeTxId(),
            label: 'Escrow Released',
            txHash: event.txHash,
            kind: 'escrow_release',
            amount: event.amount,
          })
          break
        }

        case 'escrow_refunded': {
          next.escrow = {
            status: 'REFUNDED',
            txHash: event.txHash,
            amount: event.amount,
          }
          // Add line C → A
          next.activeLines.push({
            from: 'C',
            to: 'A',
            active: true,
            animating: true,
            fraudulent: false,
          })
          next.events.push({
            id: makeEventId(),
            timestamp: elapsed,
            agent: 'C',
            message: `Escrow refunded — ${event.amount} USDT returned to Agent A`,
            type: 'escrow_refunded',
          })
          next.transactions.push({
            id: makeTxId(),
            label: 'Escrow Refunded',
            txHash: event.txHash,
            kind: 'escrow_refund',
            amount: event.amount,
          })
          break
        }

        case 'payment_received': {
          if (next.agents[event.agent]) {
            next.agents[event.agent].balance = event.amount
          }
          next.events.push({
            id: makeEventId(),
            timestamp: elapsed,
            agent: event.agent,
            message: `${getAgentLabel(event.agent)} received payment: ${event.amount} USDT`,
            type: 'payment_received',
          })
          break
        }

        case 'aave_supply': {
          next.events.push({
            id: makeEventId(),
            timestamp: elapsed,
            agent: event.agent,
            message: `${getAgentLabel(event.agent)} supplied ${event.collateral} to Aave V3`,
            type: 'aave_supply',
          })
          next.transactions.push({
            id: makeTxId(),
            label: `${getAgentLabel(event.agent)} → Aave V3`,
            txHash: event.txHash,
            kind: 'aave_supply',
            agent: event.agent,
            amount: event.collateral,
          })
          break
        }

        case 'cycle_complete': {
          const idx = event.cycleNum - 1
          next.cycleComplete[idx] = true
          // Mark active agents as DONE
          for (const key of Object.keys(next.agents)) {
            if (next.agents[key].status === 'ACTIVE' || next.agents[key].status === 'READY') {
              next.agents[key].status = 'DONE'
            }
          }
          next.agents['A'].status = 'DONE'
          next.events.push({
            id: makeEventId(),
            timestamp: elapsed,
            message: `=== CYCLE ${event.cycleNum} COMPLETE ===`,
            type: 'cycle_complete',
          })
          break
        }

        case 'demo_complete': {
          next.demoComplete = true
          next.cycleComplete = [true, true]
          next.events.push({
            id: makeEventId(),
            timestamp: elapsed,
            message: '=== DEMO COMPLETE — AMP PROTOCOL DEMONSTRATED ===',
            type: 'demo_complete',
          })
          break
        }
      }

      return next
    })
  }, [getElapsed])

  const connect = useCallback(() => {
    if (!mountedRef.current) return

    try {
      const ws = new WebSocket('ws://localhost:3001')
      wsRef.current = ws

      ws.onopen = () => {
        if (!mountedRef.current) return
        setState(prev => ({ ...prev, connected: true }))
      }

      ws.onmessage = (msg) => {
        if (!mountedRef.current) return
        try {
          const event = JSON.parse(msg.data) as AMPEvent
          processEvent(event)
        } catch {
          // ignore malformed messages
        }
      }

      ws.onclose = () => {
        if (!mountedRef.current) return
        setState(prev => ({ ...prev, connected: false }))
        wsRef.current = null
        reconnectTimerRef.current = setTimeout(() => {
          if (mountedRef.current) connect()
        }, 3000)
      }

      ws.onerror = () => {
        ws.close()
      }
    } catch {
      reconnectTimerRef.current = setTimeout(() => {
        if (mountedRef.current) connect()
      }, 3000)
    }
  }, [processEvent])

  useEffect(() => {
    mountedRef.current = true
    connect()
    return () => {
      mountedRef.current = false
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
      if (wsRef.current) {
        wsRef.current.onclose = null
        wsRef.current.close()
      }
    }
  }, [connect])

  return { connected: state.connected, state }
}
