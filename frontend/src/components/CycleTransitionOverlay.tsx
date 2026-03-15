import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CycleTransitionOverlayProps {
  cycleNum: 1 | 2 | null
}

export function CycleTransitionOverlay({ cycleNum }: CycleTransitionOverlayProps) {
  const [show, setShow] = useState(false)
  const prevCycleRef = React.useRef<1 | 2 | null>(null)

  useEffect(() => {
    if (cycleNum === 2 && prevCycleRef.current === 1) {
      setShow(true)
      const t = setTimeout(() => setShow(false), 3200)
      prevCycleRef.current = cycleNum
      return () => clearTimeout(t)
    }
    prevCycleRef.current = cycleNum
  }, [cycleNum])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="adversarial-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
          style={{ backgroundColor: 'rgba(2, 8, 23, 0.92)' }}
        >
          {/* Red border flash */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.4, 1, 0.4, 1, 0] }}
            transition={{ duration: 1.6, times: [0, 0.1, 0.25, 0.4, 0.55, 0.7, 1] }}
            style={{
              border: '2px solid #f87171',
              boxShadow: 'inset 0 0 80px #f8717130, 0 0 60px #f8717140',
            }}
          />

          {/* Corner scanlines */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{ backgroundColor: '#f87171', opacity: 0.6 }} />
          <div className="absolute bottom-0 left-0 right-0 h-px" style={{ backgroundColor: '#f87171', opacity: 0.6 }} />

          {/* Main content */}
          <motion.div
            className="flex flex-col items-center gap-6 text-center"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.05, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {/* Warning icon */}
            <motion.div
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 0.7, repeat: 3, ease: 'easeInOut' }}
              style={{
                fontSize: '56px',
                lineHeight: 1,
                filter: 'drop-shadow(0 0 20px #f87171)',
              }}
            >
              ⚠
            </motion.div>

            {/* Headline */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="text-4xl font-bold tracking-widest"
                style={{
                  color: '#f87171',
                  textShadow: '0 0 20px #f8717199, 0 0 40px #f8717155',
                }}
              >
                ADVERSARIAL CYCLE
              </div>
              <div
                className="text-base font-medium tracking-widest"
                style={{ color: '#fbbf24', textShadow: '0 0 10px #fbbf2466' }}
              >
                CYCLE 2 / 2 — FRAUD ATTEMPT INITIATED
              </div>
            </div>

            {/* Separator */}
            <div className="w-64 h-px" style={{ backgroundColor: '#f8717144' }} />

            {/* Detail */}
            <div className="flex flex-col items-center gap-1.5 text-sm" style={{ color: '#94a3b8' }}>
              <span>Agent B2 enters market with adversarial intent</span>
              <span>Submitting fraudulent 500% APY data to steal escrow</span>
              <span style={{ color: '#34d399' }}>Agent C validation pipeline standing by</span>
            </div>

            {/* Blinking status */}
            <motion.div
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="text-xs tracking-widest font-bold"
              style={{ color: '#f87171' }}
            >
              ● THREAT DETECTED
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
