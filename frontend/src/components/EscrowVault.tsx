import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EscrowState } from '../types'

interface EscrowVaultProps {
  escrow: EscrowState
  cycleNum: 1 | 2 | null
}

function truncateHash(hash: string): string {
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`
}

export function EscrowVault({ escrow, cycleNum }: EscrowVaultProps) {
  const isLocked = escrow.status === 'LOCKED'
  const isReleased = escrow.status === 'RELEASED'
  const isRefunded = escrow.status === 'REFUNDED'
  const isEmpty = escrow.status === 'EMPTY'

  const fillPercent = isLocked ? 100 : 0

  const statusColor = isEmpty
    ? '#64748b'
    : isLocked
    ? '#22d3ee'
    : isReleased
    ? '#34d399'
    : '#f87171' // refunded

  const statusLabel = isEmpty
    ? 'EMPTY'
    : isLocked
    ? 'LOCKED'
    : isReleased
    ? 'RELEASED'
    : 'REFUNDED'

  const glowStyle = isEmpty
    ? {}
    : isLocked
    ? { boxShadow: '0 0 20px #22d3ee22, 0 0 40px #22d3ee10' }
    : isReleased
    ? { boxShadow: '0 0 20px #34d39922, 0 0 40px #34d39910' }
    : { boxShadow: '0 0 20px #f8717122, 0 0 40px #f8717110' }

  return (
    <div
      className="rounded border p-4 flex flex-col gap-3 h-full"
      style={{
        backgroundColor: '#0f172a',
        borderColor: statusColor,
        transition: 'border-color 0.5s, box-shadow 0.5s',
        ...glowStyle,
      }}
    >
      {/* Title */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-widest text-text-dim">ESCROW VAULT</span>
        <div
          className="rounded px-2 py-1 text-xs font-bold tracking-widest"
          style={{ color: statusColor, backgroundColor: `${statusColor}22` }}
        >
          {statusLabel}
        </div>
      </div>

      {/* Amount */}
      <div className="text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={escrow.amount ?? 'empty'}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="text-3xl font-bold tracking-wider"
              style={{
                color: isEmpty ? '#64748b' : statusColor,
                textShadow: isEmpty ? undefined : `0 0 10px ${statusColor}66`,
              }}
            >
              {escrow.amount ?? '0.0'}
            </div>
            <div className="text-sm text-text-dim mt-1 tracking-widest">USDT</div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fill bar */}
      <div className="flex flex-col items-center gap-1">
        <div
          className="w-8 rounded-sm overflow-hidden relative"
          style={{ height: '80px', backgroundColor: '#0a1628', border: `1px solid ${statusColor}33` }}
        >
          <motion.div
            className="absolute bottom-0 left-0 right-0 rounded-sm"
            animate={{ height: `${fillPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            style={{
              backgroundColor: `${statusColor}44`,
              borderTop: `1px solid ${statusColor}`,
              boxShadow: fillPercent > 0 ? `0 -4px 8px ${statusColor}44` : undefined,
            }}
          />

          {/* Scan line effect */}
          {isLocked && (
            <div
              className="absolute left-0 right-0 h-px"
              style={{
                backgroundColor: `${statusColor}88`,
                animation: 'scan-line 2s linear infinite',
              }}
            />
          )}
        </div>
      </div>

      {/* Status message */}
      <div className="flex flex-col gap-1">
        {isLocked && (
          <div className="text-xs text-center" style={{ color: '#22d3ee' }}>
            Funds secured on-chain
          </div>
        )}
        {isReleased && (
          <div className="text-xs text-center" style={{ color: '#34d399' }}>
            ✓ Payment disbursed
          </div>
        )}
        {isRefunded && (
          <div className="text-xs text-center" style={{ color: '#f87171' }}>
            ↩ Refunded (fraud detected)
          </div>
        )}
        {isEmpty && (
          <div className="text-xs text-center text-text-dim opacity-50">
            Awaiting escrow lock
          </div>
        )}
      </div>

      {/* Tx hash */}
      {escrow.txHash && (
        <div className="mt-auto">
          <div className="text-xs text-text-dim mb-1">TX HASH</div>
          <a
            href={`https://sepolia.etherscan.io/tx/${escrow.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono block truncate hover:underline"
            style={{ color: statusColor }}
          >
            {truncateHash(escrow.txHash)} ↗
          </a>
        </div>
      )}

      {/* Recipient */}
      {escrow.recipient && (
        <div className="text-xs text-text-dim">
          → {escrow.recipient.slice(0, 6)}…{escrow.recipient.slice(-4)}
        </div>
      )}
    </div>
  )
}
