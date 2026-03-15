import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CycleBannerProps {
  cycleNum: 1 | 2 | null
  subtitle: string
  demoComplete: boolean
}

export function CycleBanner({ cycleNum, subtitle, demoComplete }: CycleBannerProps) {
  if (demoComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-5 mt-4 rounded border px-6 py-4 flex items-center justify-between"
        style={{
          borderColor: '#34d399',
          backgroundColor: '#34d39910',
          boxShadow: '0 0 30px #34d39922',
        }}
      >
        <div className="flex items-center gap-4">
          <span className="text-green font-bold text-base tracking-widest">✓ DEMO COMPLETE</span>
          <span className="text-text-dim text-sm">Both market cycles executed · Fraud detected & blocked</span>
        </div>
        <span className="text-sm font-bold tracking-widest" style={{ color: '#34d399' }}>AMP PROTOCOL DEMONSTRATED</span>
      </motion.div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      {cycleNum === null ? (
        <motion.div
          key="waiting"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="mx-5 mt-4 rounded border border-border px-6 py-4 flex items-center justify-between"
          style={{ backgroundColor: '#0f172a' }}
        >
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-text-dim animate-pulse" />
            <span className="text-text-dim text-sm tracking-widest">WAITING FOR DEMO TO START</span>
          </div>
          <span className="text-text-dim text-sm">Run `npm start` in the project directory</span>
        </motion.div>
      ) : cycleNum === 1 ? (
        <motion.div
          key="cycle1"
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.4 }}
          className="mx-5 mt-4 rounded border px-6 py-4 flex items-center justify-between"
          style={{
            borderColor: '#22d3ee',
            backgroundColor: '#22d3ee0a',
            boxShadow: '0 0 20px #22d3ee18',
          }}
        >
          <div className="flex items-center gap-5">
            <div
              className="rounded px-3 py-1.5 text-sm font-bold tracking-widest"
              style={{ backgroundColor: '#22d3ee22', color: '#22d3ee', border: '1px solid #22d3ee44' }}
            >
              CYCLE 1 / 2
            </div>
            <span
              className="text-base font-bold tracking-widest"
              style={{ color: '#22d3ee', textShadow: '0 0 12px #22d3ee55' }}
            >
              HAPPY PATH
            </span>
            <span className="text-text-body text-sm">B wins race · Claude tool_use · Aave V3 supply</span>
          </div>
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: '#22d3ee', boxShadow: '0 0 8px #22d3ee88', animation: 'glow-cyan-anim 2s ease-in-out infinite' }}
          />
        </motion.div>
      ) : (
        <motion.div
          key="cycle2"
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.4 }}
          className="mx-5 mt-4 rounded border-2 px-6 py-4 flex items-center justify-between"
          style={{
            borderColor: '#f87171',
            backgroundColor: '#f8717110',
            boxShadow: '0 0 30px #f8717130, 0 0 60px #f8717115',
            animation: 'glow-red-anim 3s ease-in-out infinite',
          }}
        >
          <div className="flex items-center gap-5">
            <div
              className="rounded px-3 py-1.5 text-sm font-bold tracking-widest"
              style={{ backgroundColor: '#f8717122', color: '#f87171', border: '1px solid #f8717155' }}
            >
              CYCLE 2 / 2
            </div>
            <span
              className="text-base font-bold tracking-widest"
              style={{ color: '#f87171', textShadow: '0 0 12px #f8717199' }}
            >
              ⚠ ADVERSARIAL MODE
            </span>
            <span className="text-text-body text-sm">B2 wins race · Submits fraudulent 500% APY · Sanity check rejects</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium" style={{ color: '#fbbf24' }}>
              FRAUD ATTEMPT IN PROGRESS
            </span>
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: '#f87171', boxShadow: '0 0 10px #f8717199', animation: 'glow-red-anim 0.8s ease-in-out infinite' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
