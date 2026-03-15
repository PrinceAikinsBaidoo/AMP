import React from 'react'

interface HeaderProps {
  connected: boolean
  cycleNum: 1 | 2 | null
  cycleComplete: boolean[]
  demoComplete: boolean
}

export function Header({ connected, cycleNum, cycleComplete, demoComplete }: HeaderProps) {
  const isAdversarial = cycleNum === 2
  const accentColor = isAdversarial ? '#fbbf24' : '#22d3ee'

  const progress = demoComplete
    ? 100
    : cycleComplete[0]
    ? 50
    : 0

  const progressColor = cycleComplete[0] && !cycleComplete[1]
    ? '#fbbf24'
    : cycleComplete[1] || demoComplete
    ? '#34d399'
    : '#22d3ee'

  return (
    <header className="border-b border-border bg-surface">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3">
            <img
              src="/amp-logo.png"
              alt="AMP"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: `1.5px solid ${accentColor}55`,
                boxShadow: `0 0 14px ${accentColor}66, 0 0 28px ${accentColor}22`,
                transition: 'box-shadow 0.5s, border-color 0.5s',
              }}
            />
            <div className="h-6 w-px bg-border" />
            <div className="flex flex-col">
              <span
                className="text-base font-bold tracking-widest leading-none"
                style={{
                  color: accentColor,
                  textShadow: `0 0 10px ${accentColor}88`,
                  transition: 'color 0.5s, text-shadow 0.5s',
                }}
              >
                AMP
              </span>
              <span className="text-xs text-text-dim tracking-widest mt-0.5">
                AGENT MARKET PROTOCOL
              </span>
            </div>
          </div>

          {/* Cycle info */}
          {cycleNum && (
            <div
              className="flex items-center gap-2 rounded px-3 py-1 text-xs font-bold tracking-widest border"
              style={{
                borderColor: accentColor,
                color: accentColor,
                backgroundColor: `${accentColor}11`,
              }}
            >
              <span>CYCLE {cycleNum} / 2</span>
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* WebSocket status */}
          <div className="flex items-center gap-1.5 text-xs text-text-dim">
            <span className={connected ? 'text-text-dim' : 'text-red'}>
              WS
            </span>
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: connected ? '#34d399' : '#f87171',
                boxShadow: connected
                  ? '0 0 6px #34d39988'
                  : '0 0 6px #f8717188',
              }}
            />
          </div>

          {/* Live badge */}
          <div className="flex items-center gap-2 rounded border border-border bg-surface-2 px-3 py-1">
            <div
              className="h-2 w-2 rounded-full bg-green"
              style={{
                animation: 'glow-green-anim 2s ease-in-out infinite',
                boxShadow: '0 0 6px #34d39988',
              }}
            />
            <span className="text-xs font-medium tracking-widest text-text-body">
              LIVE · SEPOLIA
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 w-full bg-border relative overflow-hidden">
        <div
          className="h-full transition-all duration-1000 ease-out"
          style={{
            width: `${progress}%`,
            backgroundColor: progressColor,
            boxShadow: `0 0 8px ${progressColor}88`,
          }}
        />
        {progress > 0 && progress < 100 && (
          <div
            className="absolute top-0 h-full w-8"
            style={{
              left: `${progress}%`,
              transform: 'translateX(-100%)',
              background: `linear-gradient(to right, transparent, ${progressColor}44)`,
            }}
          />
        )}
      </div>
    </header>
  )
}
