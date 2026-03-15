import React from 'react'
import { motion } from 'framer-motion'
import { AgentState } from '../types'

interface AgentCardProps {
  agent: AgentState
  cycleNum: 1 | 2 | null
}

const AGENT_CONFIG: Record<string, {
  role: string
  color: string
  dimColor: string
  cycleColor?: string
  cycleDimColor?: string
}> = {
  A: {
    role: 'Treasury Manager',
    color: '#22d3ee',
    dimColor: '#22d3ee33',
  },
  B: {
    role: 'Primary Worker',
    color: '#34d399',
    dimColor: '#34d39933',
  },
  B2: {
    role: 'Adversarial Worker',
    color: '#fbbf24',
    dimColor: '#fbbf2433',
    cycleColor: '#f87171',
    cycleDimColor: '#f8717133',
  },
  C: {
    role: 'Validator',
    color: '#a78bfa',
    dimColor: '#a78bfa33',
  },
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  WAITING: { label: 'WAITING', color: '#64748b', bg: '#64748b22' },
  READY: { label: 'READY', color: '#94a3b8', bg: '#94a3b822' },
  ACTIVE: { label: 'ACTIVE', color: '#34d399', bg: '#34d39922' },
  DONE: { label: 'DONE', color: '#22d3ee', bg: '#22d3ee22' },
  LOST: { label: 'LOST', color: '#f87171', bg: '#f8717122' },
}

function truncateAddress(addr: string): string {
  if (!addr) return '—'
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function AgentCard({ agent, cycleNum }: AgentCardProps) {
  const config = AGENT_CONFIG[agent.id] ?? {
    role: 'Agent',
    color: '#94a3b8',
    dimColor: '#94a3b833',
  }

  const isB2InCycle2 = agent.id === 'B2' && cycleNum === 2
  const accentColor = isB2InCycle2 && config.cycleColor ? config.cycleColor : config.color
  const accentDim = isB2InCycle2 && config.cycleDimColor ? config.cycleDimColor : config.dimColor

  const statusConfig = STATUS_CONFIG[agent.status] ?? STATUS_CONFIG['WAITING']
  const isActive = agent.status === 'ACTIVE'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative rounded border p-4 flex flex-col gap-3"
      style={{
        backgroundColor: '#0f172a',
        borderColor: isActive ? accentColor : '#1e293b',
        boxShadow: isActive
          ? `0 0 12px ${accentColor}33, 0 0 24px ${accentColor}15`
          : undefined,
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
    >
      {/* Active pulse ring */}
      {isActive && (
        <div
          className="absolute inset-0 rounded pointer-events-none"
          style={{
            border: `1px solid ${accentColor}`,
            animation: 'glow-cyan-anim 2s ease-in-out infinite',
          }}
        />
      )}

      {/* Header row */}
      <div className="flex items-center justify-between">
        {/* Agent letter badge */}
        <div className="relative flex-shrink-0">
          {isActive && (
            <div
              className="absolute inset-0 rounded-sm pointer-events-none"
              style={{
                border: `1px solid ${accentColor}`,
                animation: 'pulse-ring 1.5s ease-out infinite',
              }}
            />
          )}
          <div
            className="flex h-10 w-10 items-center justify-center rounded-sm text-base font-bold"
            style={{
              backgroundColor: accentDim,
              color: accentColor,
              border: `1px solid ${accentColor}44`,
            }}
          >
            {agent.id}
          </div>
        </div>

        {/* Status badge */}
        <div
          className="rounded px-2 py-1 text-xs font-bold tracking-widest"
          style={{
            color: statusConfig.color,
            backgroundColor: statusConfig.bg,
          }}
        >
          {statusConfig.label}
        </div>
      </div>

      {/* Role */}
      <div>
        <div
          className="text-sm font-semibold tracking-wide"
          style={{ color: accentColor }}
        >
          Agent {agent.id}
        </div>
        <div className="text-xs text-text-dim mt-0.5 tracking-wide">{config.role}</div>
      </div>

      {/* Address */}
      <div className="text-xs font-mono" style={{ color: '#64748b' }}>
        {agent.address ? (
          <span className="text-text-body">{truncateAddress(agent.address)}</span>
        ) : (
          <span className="opacity-40">awaiting...</span>
        )}
      </div>

      {/* Balance */}
      {agent.balance && (
        <div
          className="text-sm font-bold"
          style={{ color: accentColor }}
        >
          {agent.balance} <span className="text-text-dim text-xs font-normal">USDT</span>
        </div>
      )}

      {/* Claude indicator for Agent B */}
      {agent.id === 'B' && agent.status === 'ACTIVE' && (
        <div className="flex items-center gap-1.5 text-xs" style={{ color: '#a78bfa' }}>
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: '#a78bfa', boxShadow: '0 0 6px #a78bfa88' }}
          />
          <span>Claude AI active</span>
        </div>
      )}
    </motion.div>
  )
}
