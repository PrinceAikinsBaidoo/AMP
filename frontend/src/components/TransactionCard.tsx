import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TxEntry } from '../types'

interface TransactionListProps {
  transactions: TxEntry[]
}

const KIND_CONFIG: Record<TxEntry['kind'], {
  label: string
  icon: string
  color: string
  border: string
}> = {
  escrow_lock: {
    label: 'Escrow Locked',
    icon: '🔒',
    color: '#22d3ee',
    border: '#22d3ee33',
  },
  escrow_release: {
    label: 'Escrow Released',
    icon: '✓',
    color: '#34d399',
    border: '#34d39933',
  },
  escrow_refund: {
    label: 'Escrow Refunded',
    icon: '↩',
    color: '#f87171',
    border: '#f8717133',
  },
  aave_supply: {
    label: 'Aave V3 Supply',
    icon: '↑',
    color: '#a78bfa',
    border: '#a78bfa33',
  },
  payment: {
    label: 'Payment',
    icon: '→',
    color: '#34d399',
    border: '#34d39933',
  },
}

function truncateHash(hash: string): string {
  if (hash.length < 16) return hash
  return `${hash.slice(0, 10)}…${hash.slice(-8)}`
}

interface TxCardProps {
  tx: TxEntry
}

function TxCard({ tx }: TxCardProps) {
  const config = KIND_CONFIG[tx.kind]
  const label = tx.label || config.label

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded border p-2.5 flex gap-2"
      style={{
        backgroundColor: '#0f172a',
        borderColor: config.border,
        boxShadow: `0 0 8px ${config.color}15`,
      }}
    >
      {/* Icon */}
      <div
        className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded text-sm font-bold"
        style={{
          backgroundColor: `${config.color}18`,
          color: config.color,
          border: `1px solid ${config.border}`,
        }}
      >
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span
            className="text-xs font-medium truncate"
            style={{ color: config.color }}
          >
            {label}
          </span>
          {tx.amount && (
            <span className="text-xs text-text-dim flex-shrink-0">{tx.amount}</span>
          )}
        </div>

        <a
          href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-text-dim hover:text-text-body transition-colors flex items-center gap-1 group"
        >
          <span className="truncate">{truncateHash(tx.txHash)}</span>
          <span className="flex-shrink-0 group-hover:text-text-bright transition-colors">↗</span>
        </a>
      </div>
    </motion.div>
  )
}

export function TransactionList({ transactions }: TransactionListProps) {
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
        <span className="text-xs font-medium tracking-widest text-text-dim">
          ON-CHAIN TRANSACTIONS
        </span>
        <span className="text-xs text-text-dim">{transactions.length} txs</span>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2" style={{ minHeight: 0 }}>
        {transactions.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-text-dim opacity-40">
            No transactions yet
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {transactions.map(tx => (
              <TxCard key={tx.id} tx={tx} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
