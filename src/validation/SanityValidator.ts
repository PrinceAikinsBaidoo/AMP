/**
 * SanityValidator.ts — Layer 2
 * Economic sanity checks on the TaskResult.
 * Catches fabricated, impossible, or stale data without needing AI.
 */

import { TaskResult } from '../core/types.js'

const SANITY = {
  minAPY:       0,
  maxAPY:       200,      // testnet rates can be artificially high; 200% still catches injected fakes (500%)
  maxAgeMs:     30_000,   // data must be < 30 seconds old
  apyTolerance: 0.01,     // recommendation APY must match protocol data within 0.01%
}

export function validateSanity(result: TaskResult): {
  passed: boolean
  reason?: string
  failedChecks: string[]
} {
  const failed: string[] = []

  // 1. APY bounds for all protocols
  for (const p of result.protocols) {
    if (p.supplyAPY < SANITY.minAPY || p.supplyAPY > SANITY.maxAPY) {
      failed.push(`${p.name} APY ${p.supplyAPY.toFixed(4)}% is outside realistic bounds (0–200%)`)
    }
  }

  // 2. Data freshness
  const ageMs = Date.now() - result.timestamp
  if (ageMs > SANITY.maxAgeMs) {
    failed.push(`Data is ${ageMs}ms old — exceeds 30s freshness limit`)
  }

  // 3. Recommended protocol must be one that was actually queried
  const protocolNames = result.protocols.map(p => p.name)
  if (!protocolNames.includes(result.recommendation.protocol as 'aave' | 'compound')) {
    failed.push(`Recommended protocol '${result.recommendation.protocol}' was not in the queried set`)
  }

  // 4. Recommendation APY must match the protocol's own reported APY
  const recommended = result.protocols.find(p => p.name === result.recommendation.protocol)
  if (recommended) {
    const diff = Math.abs(recommended.supplyAPY - result.recommendation.apy)
    if (diff > SANITY.apyTolerance) {
      failed.push(
        `Recommendation APY (${result.recommendation.apy}%) doesn't match ` +
        `${recommended.name} data (${recommended.supplyAPY}%) — diff: ${diff.toFixed(4)}%`
      )
    }
  }

  // 5. Should recommend the higher-yield protocol
  const best = result.protocols.reduce((a, b) => a.supplyAPY > b.supplyAPY ? a : b)
  if (best.name !== result.recommendation.protocol) {
    failed.push(
      `Recommended ${result.recommendation.protocol} (${result.recommendation.apy}%) ` +
      `but ${best.name} has higher APY (${best.supplyAPY.toFixed(4)}%)`
    )
  }

  const successReason = failed.length === 0
    ? result.protocols.map(p => `${p.name} ${p.supplyAPY.toFixed(4)}%`).join(' | ') +
      ` → rec: ${result.recommendation.protocol} @ ${result.recommendation.apy.toFixed(4)}%` +
      ` (best-protocol ✓, age ${ageMs}ms ✓)`
    : undefined

  return {
    passed:       failed.length === 0,
    reason:       failed.length === 0 ? successReason : failed[0],
    failedChecks: failed,
  }
}
