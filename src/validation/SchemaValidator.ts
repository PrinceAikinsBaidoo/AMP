/**
 * SchemaValidator.ts — Layer 1
 * Zod schema validation of the TaskResult structure.
 * Fails fast on missing fields, wrong types, or violated constraints.
 */

import { z } from 'zod'

const ProtocolSchema = z.object({
  name:      z.enum(['aave', 'compound']),
  supplyAPY: z.number(),
  rawRate:   z.string(),
})

const TaskResultSchema = z.object({
  taskId:    z.string().uuid(),
  workerId:  z.string(),
  timestamp: z.number(),
  protocols: z.array(ProtocolSchema).length(2),
  recommendation: z.object({
    protocol:  z.string(),
    apy:       z.number(),
    reasoning: z.string().min(80),
  }),
  dataSource: z.string(),
})

export function validateSchema(result: unknown): { passed: boolean; reason?: string } {
  const parsed = TaskResultSchema.safeParse(result)
  if (parsed.success) return { passed: true }
  return {
    passed: false,
    reason: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', '),
  }
}
