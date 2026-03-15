import React, { useRef, useEffect } from 'react'
import { AgentState, ConnectionLine } from '../types'

interface AgentNetworkProps {
  agents: Record<string, AgentState>
  activeLines: ConnectionLine[]
  cycleNum: 1 | 2 | null
}

// Layout positions (relative to 300x220 viewBox)
const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  A: { x: 60, y: 55 },
  B: { x: 60, y: 165 },
  B2: { x: 145, y: 165 },
  C: { x: 240, y: 55 },
  ESCROW: { x: 240, y: 165 },
}

const AGENT_COLORS: Record<string, string> = {
  A: '#22d3ee',
  B: '#34d399',
  B2: '#fbbf24',
  C: '#a78bfa',
  ESCROW: '#22d3ee',
}

const AGENT_COLORS_CYCLE2: Record<string, string> = {
  A: '#22d3ee',
  B: '#34d399',
  B2: '#f87171',
  C: '#a78bfa',
  ESCROW: '#22d3ee',
}

function getColor(agentId: string, cycleNum: 1 | 2 | null): string {
  const map = cycleNum === 2 ? AGENT_COLORS_CYCLE2 : AGENT_COLORS
  return map[agentId] ?? '#64748b'
}

interface NodeProps {
  id: string
  x: number
  y: number
  color: string
  isActive: boolean
  isEscrow?: boolean
  label?: string
}

function Node({ id, x, y, color, isActive, isEscrow, label }: NodeProps) {
  const displayLabel = isEscrow ? 'ESC' : id
  const r = isEscrow ? 14 : 16

  return (
    <g>
      {/* Glow ring when active */}
      {isActive && (
        <circle
          cx={x}
          cy={y}
          r={r + 6}
          fill="none"
          stroke={color}
          strokeWidth="1"
          opacity="0.3"
          style={{ animation: 'pulse-ring 1.5s ease-out infinite' }}
        />
      )}

      {/* Outer ring */}
      <circle
        cx={x}
        cy={y}
        r={r}
        fill={`${color}18`}
        stroke={color}
        strokeWidth={isActive ? 1.5 : 1}
        opacity={isActive ? 1 : 0.5}
        style={{ transition: 'opacity 0.3s, stroke-width 0.3s' }}
      />

      {/* Inner fill */}
      <circle
        cx={x}
        cy={y}
        r={r - 4}
        fill={`${color}30`}
        stroke="none"
      />

      {/* Label */}
      <text
        x={x}
        y={y + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={isActive ? color : `${color}99`}
        fontSize={isEscrow ? 7 : 8}
        fontWeight="700"
        fontFamily="JetBrains Mono, monospace"
        style={{ transition: 'fill 0.3s' }}
      >
        {displayLabel}
      </text>

      {/* Role text below */}
      {label && (
        <text
          x={x}
          y={y + r + 10}
          textAnchor="middle"
          fill={isActive ? color : '#64748b'}
          fontSize="5.5"
          fontFamily="JetBrains Mono, monospace"
          style={{ transition: 'fill 0.3s' }}
        >
          {label}
        </text>
      )}
    </g>
  )
}

interface EdgeProps {
  from: { x: number; y: number }
  to: { x: number; y: number }
  color: string
  animating: boolean
  dashed?: boolean
}

function Edge({ from, to, color, animating, dashed }: EdgeProps) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.sqrt(dx * dx + dy * dy)

  // Shorten the line to not overlap nodes
  const radius = 16
  const ratio = radius / len
  const x1 = from.x + dx * ratio
  const y1 = from.y + dy * ratio
  const x2 = to.x - dx * ratio
  const y2 = to.y - dy * ratio

  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2

  // Arrow direction
  const ux = (x2 - x1) / (len - 2 * radius)
  const uy = (y2 - y1) / (len - 2 * radius)

  return (
    <g>
      {/* Base dim line */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color}
        strokeWidth="0.5"
        opacity="0.2"
        strokeDasharray={dashed ? '4 3' : undefined}
      />

      {/* Animated flow line */}
      {animating && (
        <line
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={color}
          strokeWidth="1.5"
          opacity="0.8"
          strokeDasharray="8 4"
          className="svg-line-flow"
        />
      )}

      {/* Arrowhead */}
      {animating && (
        <polygon
          points={`
            ${x2},${y2}
            ${x2 - ux * 6 - uy * 3},${y2 - uy * 6 + ux * 3}
            ${x2 - ux * 6 + uy * 3},${y2 - uy * 6 - ux * 3}
          `}
          fill={color}
          opacity="0.9"
        />
      )}

      {/* Traveling dot */}
      {animating && (
        <circle r="2" fill={color} opacity="0.9">
          <animateMotion
            dur="1.5s"
            repeatCount="indefinite"
            path={`M${x1},${y1} L${x2},${y2}`}
          />
        </circle>
      )}
    </g>
  )
}

export function AgentNetwork({ agents, activeLines, cycleNum }: AgentNetworkProps) {
  const agentIds = ['A', 'B', 'B2', 'C']
  const nodeLabels: Record<string, string> = {
    A: 'TREASURY',
    B: 'WORKER',
    B2: 'ADVERSARY',
    C: 'VALIDATOR',
    ESCROW: 'ESCROW',
  }

  return (
    <div
      className="rounded border border-border p-3 flex flex-col h-full"
      style={{ backgroundColor: '#0a1628' }}
    >
      <div className="text-xs font-medium tracking-widest text-text-dim mb-2">
        NETWORK GRAPH
      </div>

      <div className="flex-1 flex items-center justify-center min-h-0">
        <svg
          viewBox="0 0 300 220"
          className="w-full h-full"
          style={{ minHeight: '260px' }}
        >
          <defs>
            <filter id="glow-svg">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Connection lines */}
          {activeLines.map((line, idx) => {
            const fromPos = NODE_POSITIONS[line.from]
            const toPos = NODE_POSITIONS[line.to]
            if (!fromPos || !toPos) return null

            const lineColor = line.fraudulent
              ? '#f87171'
              : line.from === 'C' && line.to === 'A'
              ? '#f87171'
              : line.from === 'C' && line.to === 'B'
              ? '#34d399'
              : getColor(line.from, cycleNum)

            return (
              <Edge
                key={`${line.from}-${line.to}-${idx}`}
                from={fromPos}
                to={toPos}
                color={lineColor}
                animating={line.animating}
                dashed={line.fraudulent}
              />
            )
          })}

          {/* Static dim guide lines */}
          {activeLines.length === 0 && (
            <>
              <line x1="60" y1="71" x2="60" y2="149" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
              <line x1="76" y1="55" x2="224" y2="55" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
              <line x1="76" y1="165" x2="224" y2="149" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
            </>
          )}

          {/* Agent nodes */}
          {agentIds.map(id => {
            const pos = NODE_POSITIONS[id]
            const color = getColor(id, cycleNum)
            const agentState = agents[id]
            const isActive = agentState?.status === 'ACTIVE'
            return (
              <Node
                key={id}
                id={id}
                x={pos.x}
                y={pos.y}
                color={color}
                isActive={isActive}
                label={nodeLabels[id]}
              />
            )
          })}

          {/* Escrow node */}
          <Node
            id="ESCROW"
            x={NODE_POSITIONS.ESCROW.x}
            y={NODE_POSITIONS.ESCROW.y}
            color="#22d3ee"
            isActive={activeLines.some(l => l.to === 'ESCROW' || l.from === 'ESCROW')}
            isEscrow
            label={nodeLabels['ESCROW']}
          />
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
        {agentIds.map(id => (
          <div key={id} className="flex items-center gap-1">
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: getColor(id, cycleNum) }}
            />
            <span className="text-xs text-text-dim">{id}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
