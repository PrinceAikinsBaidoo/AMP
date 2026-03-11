/**
 * ValidationOrchestrator.ts
 * Runs all 3 validation layers in sequence.
 * Stops at the first failure — no wasted Claude calls.
 *
 * ── Extensibility ─────────────────────────────────────────────────────────────
 * The validation pipeline is intentionally layered for easy extension:
 *
 *  Layer 1 — SchemaValidator.ts
 *    Zod schema enforcement. Extend TaskResultSchema to add new required fields
 *    as the protocol evolves (e.g. new data points, multi-protocol arrays).
 *
 *  Layer 2 — SanityValidator.ts
 *    Rule-based economic checks. Add new rules by pushing to `failed[]`.
 *    Candidates: historical rate deviation, cross-chain consistency, latency checks.
 *
 *  Layer 3 — AIValidator.ts (Claude)
 *    Semantic review. Swap the model, update the prompt, or extend rawRates with
 *    external benchmark data (e.g. DeFiLlama rates) for richer cross-validation.
 *
 *  Future Layer 4 — On-chain attestation
 *    Submit a Merkle proof of the validated result to a verifier contract.
 *    Allows any third party to trustlessly verify that Agent C approved a result
 *    without replaying the validation off-chain.
 *
 * To add a new protocol (e.g. Morpho, Spark, Euler):
 *   1. Add adapter in src/defi/
 *   2. Register a tool in ClaudeClient.ts AGENT_TOOLS array
 *   3. No changes needed here — the orchestrator is protocol-agnostic
 */

import { TaskResult, RawRates, ValidationVerdict } from '../core/types.js'
import { validateSchema }   from './SchemaValidator.js'
import { validateSanity }   from './SanityValidator.js'
import { validateSemantic } from './AIValidator.js'

const SKIP = (reason: string) => ({ passed: false, reason, flags: [] as string[] })

export async function runFullValidation(
  result: TaskResult,
  rawRates: RawRates
): Promise<ValidationVerdict> {
  // Layer 1 — Zod schema
  const l1 = validateSchema(result)
  if (!l1.passed) {
    return {
      layer1:       l1,
      layer2:       { passed: false, reason: 'Skipped — Layer 1 failed' },
      layer3:       SKIP('Skipped — Layer 1 failed'),
      finalVerdict: 'REJECTED',
      timestamp:    Date.now(),
    }
  }

  // Layer 2 — Economic sanity
  const l2 = validateSanity(result)
  if (!l2.passed) {
    return {
      layer1:       l1,
      layer2:       l2,
      layer3:       SKIP('Skipped — Layer 2 failed'),
      finalVerdict: 'REJECTED',
      timestamp:    Date.now(),
    }
  }

  // Layer 3 — Claude semantic review
  const l3 = await validateSemantic(result, rawRates)

  return {
    layer1:       l1,
    layer2:       l2,
    layer3:       l3,
    finalVerdict: l3.passed ? 'APPROVED' : 'REJECTED',
    timestamp:    Date.now(),
  }
}
