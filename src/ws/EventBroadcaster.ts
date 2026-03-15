/**
 * EventBroadcaster.ts — WebSocket event bus for the live dashboard
 *
 * Singleton server on port 3001. Agents call broadcast() with typed events.
 * The React frontend connects and animates each event as it happens.
 */

import { WebSocketServer, WebSocket } from 'ws'

// ── Event type catalogue ──────────────────────────────────────────────────────

export type AMPEvent =
  | { type: 'cycle_start';      cycleNum: 1|2; subtitle: string }
  | { type: 'agent_ready';      agent: string; address: string; balance: string }
  | { type: 'task_posted';      taskId: string; reward: string; description: string }
  | { type: 'escrow_locked';    txHash: string }
  | { type: 'task_accepted';    agent: string; taskId: string; reward: string }
  | { type: 'task_lost';        agent: string }
  | { type: 'claude_thinking' }
  | { type: 'claude_tools';     tools: string[] }
  | { type: 'rates_fetched';    protocols: Array<{ name: string; apy: number }> }
  | { type: 'claude_recommends'; protocol: string; apy: number }
  | { type: 'result_submitted'; agent: string; fraudulent: boolean }
  | { type: 'validation_layer'; layer: 1|2|3; passed: boolean; detail: string }
  | { type: 'verdict';          result: 'APPROVED'|'REJECTED'; reason: string }
  | { type: 'escrow_released';  txHash: string; recipient: string; amount: string }
  | { type: 'escrow_refunded';  txHash: string; amount: string }
  | { type: 'payment_received'; agent: string; amount: string }
  | { type: 'aave_supply';      agent: string; txHash: string; collateral: string }
  | { type: 'cycle_complete';   cycleNum: 1|2 }
  | { type: 'demo_complete' }

// ── Singleton ─────────────────────────────────────────────────────────────────

let wss: WebSocketServer | null = null
const eventBuffer: AMPEvent[] = []  // replay buffer — sent to any late-joining client

export function startWSSServer(port = 3001): void {
  wss = new WebSocketServer({ port })

  // Replay all past events to any client that connects mid-demo
  wss.on('connection', (client) => {
    if (eventBuffer.length > 0) {
      for (const evt of eventBuffer) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(evt))
        }
      }
    }
  })

  console.log(`[WS] Dashboard: http://localhost:5173  (late connections get full replay)`)
}

export function stopWSSServer(): void {
  wss?.close()
  wss = null
  eventBuffer.length = 0
}

export function broadcast(event: AMPEvent): void {
  eventBuffer.push(event)
  if (!wss) return
  const msg = JSON.stringify(event)
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg)
    }
  }
}
