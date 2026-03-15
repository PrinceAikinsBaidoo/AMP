import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ValidationState, ValidationLayerState } from '../types'

interface ValidationPipelineProps {
  validation: ValidationState
  claudeThinking: boolean
  claudeTools: string[]
  rates: Array<{ name: string; apy: number }>
  recommendation: { protocol: string; apy: number } | null
}

const LAYER_CONFIG = [
  {
    num: 1,
    name: 'SCHEMA',
    subtitle: 'Zod structural validation',
    icon: '{ }',
  },
  {
    num: 2,
    name: 'SANITY',
    subtitle: 'APY bounds & logic checks',
    icon: '⚖',
  },
  {
    num: 3,
    name: 'CLAUDE AI',
    subtitle: 'AI-powered review',
    icon: '◈',
  },
]

interface LayerCardProps {
  config: typeof LAYER_CONFIG[0]
  state: ValidationLayerState
  isLast: boolean
  claudeThinking?: boolean
}

function LayerCard({ config, state, isLast, claudeThinking }: LayerCardProps) {
  const isPassed = state.status === 'passed'
  const isFailed = state.status === 'failed'
  const isActive = claudeThinking && config.num === 3
  const isIdle = state.status === 'idle' && !isActive

  const color = isPassed ? '#34d399' : isFailed ? '#f87171' : isActive ? '#a78bfa' : '#64748b'
  const bgColor = isPassed
    ? '#34d39910'
    : isFailed
    ? '#f8717110'
    : isActive
    ? '#a78bfa10'
    : '#0f172a'

  return (
    <div className="flex items-center gap-2 flex-1">
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 rounded border p-4 relative overflow-hidden"
        style={{
          backgroundColor: bgColor,
          borderColor: color,
          boxShadow: !isIdle ? `0 0 12px ${color}22` : undefined,
          transition: 'border-color 0.4s, background-color 0.4s, box-shadow 0.4s',
        }}
      >
        {/* Scanline for active Claude layer */}
        {isActive && (
          <div
            className="absolute left-0 right-0 h-px"
            style={{
              backgroundColor: '#a78bfa66',
              animation: 'scan-line 1.5s linear infinite',
            }}
          />
        )}

        {/* Layer number */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-mono"
              style={{ color: `${color}88` }}
            >
              L{config.num}
            </span>
            <span
              className="text-sm"
              style={{ color }}
            >
              {config.icon}
            </span>
          </div>

          {/* Status icon */}
          <AnimatePresence mode="wait">
            {isPassed && (
              <motion.div
                key="passed"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="text-lg font-bold"
                style={{ color: '#34d399' }}
              >
                ✓
              </motion.div>
            )}
            {isFailed && (
              <motion.div
                key="failed"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="text-lg font-bold"
                style={{ color: '#f87171' }}
              >
                ✗
              </motion.div>
            )}
            {isActive && (
              <motion.div
                key="active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs"
                style={{ color: '#a78bfa' }}
              >
                <span className="animate-blink">●</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Name */}
        <div
          className="text-sm font-bold tracking-widest mb-0.5"
          style={{ color }}
        >
          {config.name}
        </div>
        <div className="text-xs text-text-dim tracking-wide">{config.subtitle}</div>

        {/* Detail text */}
        {state.detail && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 text-xs rounded px-2 py-1"
            style={{
              color: isPassed ? '#34d399bb' : '#f87171bb',
              backgroundColor: isPassed ? '#34d39908' : '#f8717108',
              borderLeft: `2px solid ${color}`,
            }}
          >
            {state.detail}
          </motion.div>
        )}

        {/* Claude thinking indicator */}
        {isActive && (
          <div className="mt-2 text-xs text-text-dim">
            Thinking
            <span className="animate-blink ml-0.5">...</span>
          </div>
        )}
      </motion.div>

      {/* Arrow connector */}
      {!isLast && (
        <div className="flex items-center flex-shrink-0">
          <div
            className="text-lg leading-none"
            style={{
              color: isPassed ? '#34d399' : '#1e293b',
              transition: 'color 0.4s',
            }}
          >
            ──►
          </div>
        </div>
      )}
    </div>
  )
}

export function ValidationPipeline({
  validation,
  claudeThinking,
  claudeTools,
  rates,
  recommendation,
}: ValidationPipelineProps) {
  const hasActivity = validation.layers.some(l => l.status !== 'idle') || claudeThinking

  return (
    <div
      className="rounded border border-border p-4"
      style={{ backgroundColor: '#0a1628' }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium tracking-widest text-text-dim">
          VALIDATION PIPELINE
        </span>
        {validation.verdict && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded px-2 py-0.5 text-xs font-bold tracking-widest"
            style={{
              color: validation.verdict === 'APPROVED' ? '#34d399' : '#f87171',
              backgroundColor:
                validation.verdict === 'APPROVED' ? '#34d39922' : '#f8717122',
              boxShadow:
                validation.verdict === 'APPROVED'
                  ? '0 0 12px #34d39944'
                  : '0 0 12px #f8717144',
            }}
          >
            {validation.verdict === 'APPROVED' ? '✓ APPROVED' : '✗ REJECTED'}
          </motion.div>
        )}
      </div>

      {/* Layer cards */}
      <div className="flex gap-2">
        {LAYER_CONFIG.map((config, idx) => (
          <LayerCard
            key={config.num}
            config={config}
            state={validation.layers[idx] ?? { status: 'idle' }}
            isLast={idx === LAYER_CONFIG.length - 1}
            claudeThinking={claudeThinking && config.num === 3}
          />
        ))}
      </div>

      {/* Verdict reason */}
      {validation.reason && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-xs rounded px-3 py-2 border-l-2"
          style={{
            color: validation.verdict === 'APPROVED' ? '#34d399bb' : '#f87171bb',
            backgroundColor:
              validation.verdict === 'APPROVED' ? '#34d39908' : '#f8717108',
            borderLeftColor:
              validation.verdict === 'APPROVED' ? '#34d399' : '#f87171',
          }}
        >
          {validation.reason}
        </motion.div>
      )}

      {/* DeFi rates & Claude recommendation */}
      {(rates.length > 0 || recommendation) && (
        <div className="mt-3 flex gap-3">
          {rates.length > 0 && (
            <div
              className="flex-1 rounded border border-border p-2"
              style={{ backgroundColor: '#0f172a' }}
            >
              <div className="text-xs text-text-dim mb-1 tracking-wider">LIVE RATES</div>
              <div className="flex gap-3 flex-wrap">
                {rates.map(r => (
                  <div key={r.name} className="flex items-center gap-1.5">
                    <span className="text-xs text-text-body">{r.name}</span>
                    <span className="text-xs font-bold" style={{ color: '#22d3ee' }}>
                      {r.apy.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recommendation && (
            <div
              className="flex-1 rounded border p-2"
              style={{
                backgroundColor: '#0f172a',
                borderColor: '#a78bfa44',
              }}
            >
              <div className="text-xs text-text-dim mb-1 tracking-wider">CLAUDE RECOMMENDS</div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-body">{recommendation.protocol}</span>
                <span className="text-xs font-bold" style={{ color: '#34d399' }}>
                  {recommendation.apy.toFixed(2)}% APY
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Claude tools used */}
      {claudeTools.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {claudeTools.map(tool => (
            <span
              key={tool}
              className="rounded px-1.5 py-0.5 text-xs"
              style={{ backgroundColor: '#a78bfa22', color: '#a78bfa' }}
            >
              {tool}()
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
