import { useWebSocket } from './hooks/useWebSocket'
import { Header } from './components/Header'
import { CycleBanner } from './components/CycleBanner'
import { AgentCard } from './components/AgentCard'
import { AgentNetwork } from './components/AgentNetwork'
import { EscrowVault } from './components/EscrowVault'
import { ValidationPipeline } from './components/ValidationPipeline'
import { EventFeed } from './components/EventFeed'
import { TransactionList } from './components/TransactionCard'
import { CycleTransitionOverlay } from './components/CycleTransitionOverlay'

export default function App() {
  const { connected, state } = useWebSocket()

  const {
    cycleNum,
    cycleSubtitle,
    cycleComplete,
    demoComplete,
    agents,
    escrow,
    validation,
    events,
    transactions,
    rates,
    recommendation,
    activeLines,
    claudeThinking,
    claudeTools,
  } = state

  const isAdversarial = cycleNum === 2

  return (
    <div
      className="flex flex-col h-full overflow-hidden scanline-overlay"
      style={{ backgroundColor: '#020817' }}
    >
      {/* Header + progress bar */}
      <Header
        connected={connected}
        cycleNum={cycleNum}
        cycleComplete={cycleComplete}
        demoComplete={demoComplete}
      />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Cycle banner */}
        <CycleBanner
          cycleNum={cycleNum}
          subtitle={cycleSubtitle}
          demoComplete={demoComplete}
        />

        {/* Waiting state — shown before demo starts */}
        {!cycleNum && !demoComplete && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div
              className="text-4xl font-bold tracking-widest text-glow-cyan"
              style={{ color: '#22d3ee' }}
            >
              ◆ AMP
            </div>
            <div className="text-text-dim text-sm tracking-widest">AGENT MARKET PROTOCOL</div>
            <div className="mt-6 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-sm">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: connected ? '#34d399' : '#f87171',
                    boxShadow: connected ? '0 0 8px #34d39988' : '0 0 8px #f8717188',
                    animation: connected ? 'glow-green-anim 2s ease-in-out infinite' : undefined,
                  }}
                />
                <span style={{ color: connected ? '#34d399' : '#f87171' }}>
                  {connected ? 'WebSocket connected — waiting for demo...' : 'Connecting to ws://localhost:3001...'}
                </span>
              </div>
              <div
                className="mt-4 rounded border border-border px-6 py-4 text-center"
                style={{ backgroundColor: '#0f172a', maxWidth: '420px' }}
              >
                <div className="text-text-dim text-xs mb-2 tracking-wider">TO START THE DEMO</div>
                <div
                  className="font-mono text-sm px-3 py-2 rounded"
                  style={{ backgroundColor: '#020817', color: '#22d3ee', border: '1px solid #1e293b' }}
                >
                  npm start
                </div>
                <div className="text-text-dim text-xs mt-2 opacity-60">
                  Run in the project root directory
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main content grid — shown once demo starts */}
        {(cycleNum || demoComplete) && (
          <div className="px-5 py-4 flex flex-col gap-4">
            {/* Top row: agents | network | escrow */}
            <div className="grid gap-4" style={{ gridTemplateColumns: '260px 1fr 200px', minHeight: '340px' }}>
              {/* Agent cards */}
              <div className="flex flex-col gap-2.5">
                <div className="text-xs font-medium tracking-widest text-text-dim mb-1">AGENTS</div>
                {['A', 'B', 'B2', 'C'].map(id => (
                  <AgentCard
                    key={id}
                    agent={agents[id] ?? { id, status: 'WAITING' }}
                    cycleNum={cycleNum}
                  />
                ))}
              </div>

              {/* Network graph */}
              <AgentNetwork
                agents={agents}
                activeLines={activeLines}
                cycleNum={cycleNum}
              />

              {/* Escrow vault */}
              <EscrowVault
                escrow={escrow}
                cycleNum={cycleNum}
              />
            </div>

            {/* Validation pipeline */}
            <ValidationPipeline
              validation={validation}
              claudeThinking={claudeThinking}
              claudeTools={claudeTools}
              rates={rates}
              recommendation={recommendation}
            />

            {/* Bottom row: event feed | transactions */}
            <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 380px' }}>
              <EventFeed
                events={events}
                connected={connected}
              />
              <TransactionList
                transactions={transactions}
              />
            </div>
          </div>
        )}
      </div>

      {/* Cycle 2 takeover overlay */}
      <CycleTransitionOverlay cycleNum={cycleNum} />

      {/* Footer */}
      <div
        className="flex items-center justify-between px-6 py-1.5 border-t border-border"
        style={{ backgroundColor: '#0a1628' }}
      >
        <div className="text-xs text-text-dim opacity-50">
          AMP — Agent Market Protocol · Tether Hackathon Galáctica WDK Edition 1
        </div>
        <div className="flex items-center gap-3 text-xs text-text-dim opacity-50">
          <span>Ethereum Sepolia</span>
          <span>·</span>
          <span>WDK + Claude AI</span>
          {isAdversarial && (
            <>
              <span>·</span>
              <span style={{ color: '#f87171' }}>⚠ ADVERSARIAL CYCLE</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
