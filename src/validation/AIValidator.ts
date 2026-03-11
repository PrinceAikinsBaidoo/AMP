/**
 * AIValidator.ts — Layer 3
 * Claude semantic validation of the worker's TaskResult.
 * Checks consistency, soundness, and integrity beyond what rules can catch.
 */

import { TaskResult, RawRates } from '../core/types.js'
import { getValidatorVerdict } from '../ai/ClaudeClient.js'

export async function validateSemantic(
  result: TaskResult,
  rawRates: RawRates
): Promise<{ passed: boolean; reason: string; flags: string[] }> {
  const verdict = await getValidatorVerdict(result, rawRates)
  return {
    passed: verdict.verdict === 'APPROVED',
    reason: verdict.reason,
    flags:  verdict.flags,
  }
}
