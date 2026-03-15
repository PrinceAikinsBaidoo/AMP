import React, { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EventEntry } from '../types'

interface EventFeedProps {
  events: EventEntry[]
  connected: boolean
}

const AGENT_COLORS: Record<string, string> = {
  A: '#22d3ee',
  B: '#34d399',
  B2: '#fbbf24',
  C: '#a78bfa',
}

function getEventColor(event: EventEntry): string {
  if (event.fraudulent) return '#f87171'
  if (event.agent && AGENT_COLORS[event.agent]) return AGENT_COLORS[event.agent]
  if (event.type === 'cycle_start' || event.type === 'cycle_complete') return '#22d3ee'
  if (event.type === 'demo_complete') return '#34d399'
  return '#64748b'
}

function getEventPrefix(event: EventEntry): string {
  if (event.type === 'cycle_start') return '════'
  if (event.type === 'cycle_complete') return '════'
  if (event.type === 'demo_complete') return '════'
  if (event.agent) return `[${event.agent.padEnd(2)}]`
  return '    '
}

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `+${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function EventFeed({ events, connected }: EventFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [events.length])

  return (
    <div
      className="rounded border border-border flex flex-col h-full"
      style={{ backgroundColor: '#060d1a' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-border flex-shrink-0"
        style={{ backgroundColor: '#0a1628' }}
      >
        <span className="text-xs font-bold tracking-widest text-text-dim">
          LIVE EVENT FEED
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-dim">{events.length} events</span>
          <div
            className="h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: connected ? '#34d399' : '#f87171',
              boxShadow: connected ? '0 0 4px #34d39988' : '0 0 4px #f8717188',
            }}
          />
        </div>
      </div>

      {/* Events */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-3 font-mono"
        style={{ minHeight: 0 }}
      >
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-text-dim">
            <div className="text-xs opacity-50 text-center">
              {connected ? (
                <>
                  <div className="mb-1">Waiting for events</div>
                  <div className="animate-blink">▋</div>
                </>
              ) : (
                <>
                  <div className="mb-1">Disconnected from backend</div>
                  <div className="text-xs opacity-40 mt-1">Run `npm start` in the project directory</div>
                  <div className="text-xs opacity-40">Reconnecting every 3s...</div>
                </>
              )}
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {events.map(event => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex gap-3 py-1 text-xs leading-relaxed hover:bg-white hover:bg-opacity-5 rounded px-2 transition-colors"
              >
                {/* Timestamp */}
                <span className="text-text-dim flex-shrink-0 opacity-60" style={{ minWidth: '56px' }}>
                  {formatTimestamp(event.timestamp)}
                </span>

                {/* Prefix */}
                <span
                  className="flex-shrink-0 font-bold"
                  style={{ color: getEventColor(event), minWidth: '40px' }}
                >
                  {getEventPrefix(event)}
                </span>

                {/* Message */}
                <span
                  className="break-all"
                  style={{
                    color: event.fraudulent
                      ? '#f87171'
                      : event.type === 'cycle_start' || event.type === 'cycle_complete' || event.type === 'demo_complete'
                      ? getEventColor(event)
                      : '#94a3b8',
                    fontWeight:
                      event.type === 'cycle_start' ||
                      event.type === 'cycle_complete' ||
                      event.type === 'demo_complete'
                        ? '700'
                        : '400',
                  }}
                >
                  {event.message}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Terminal cursor at bottom */}
      {connected && events.length > 0 && (
        <div className="px-3 py-1.5 border-t border-border flex-shrink-0">
          <span className="text-xs text-text-dim opacity-50">
            $<span className="animate-blink ml-1 text-cyan">▋</span>
          </span>
        </div>
      )}
    </div>
  )
}
