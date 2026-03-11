/**
 * ValidationOrchestrator.ts
 * Runs all 3 validation layers in sequence.
 * Stops at the first failure — no wasted Claude calls.
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
