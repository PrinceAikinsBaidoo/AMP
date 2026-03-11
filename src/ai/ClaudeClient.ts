/**
 * ClaudeClient.ts
 * Anthropic Claude integration for AMP.
 *
 * Three roles:
 *   executeAgentTask()    — Agent B: Claude reads the task description, decides which
 *                           on-chain tools to call, fetches live DeFi data, and produces
 *                           a structured recommendation. Uses Anthropic tool_use API.
 *
 *   getValidatorVerdict() — Agent C: Claude semantically validates the worker's submission.
 *
 * The tool_use agentic loop means Agent B is genuinely task-driven — it does not hardcode
 * which protocols to query. Claude reads the task description and decides.
 */

import Anthropic from '@anthropic-ai/sdk'
import { getAaveUSDTRate }    from '../defi/AaveAdapter.js'
import { getCompoundRate }    from '../defi/CompoundAdapter.js'
import { getEthPrice }        from '../defi/EthPriceAdapter.js'
import { getNetworkGasPrice } from '../defi/GasPriceAdapter.js'
import { TaskResult, RawRates } from '../core/types.js'

const MODEL = 'claude-sonnet-4-6'

let _client: Anthropic | null = null
function client(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  return _client
}

// ─── Tool Definitions ─────────────────────────────────────────────────────────
// Claude decides which tools to call based on the task description.
// Adding a new protocol = add an adapter + register a tool here.

const AGENT_TOOLS: Anthropic.Tool[] = [
  {
    name: 'get_aave_supply_rate',
    description:
      'Fetch the current USDT supply APY from Aave V3 on Ethereum Sepolia testnet. ' +
      'Returns annual percentage yield, raw contract rate, and data source.',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'get_compound_supply_rate',
    description:
      'Fetch the current USDT supply APY from Compound III (Comet) on Ethereum Sepolia testnet. ' +
      'Returns annual percentage yield, raw contract rate, and data source.',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'get_eth_price',
    description:
      'Fetch the current ETH/USD price from the Chainlink price feed on Sepolia. ' +
      'Useful for treasury context — e.g. assessing whether to swap USDT to ETH before supplying.',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'get_network_gas',
    description:
      'Fetch the current Sepolia network base fee (gwei) and estimated cost for a DeFi transaction. ' +
      'Useful for assessing whether gas costs make a yield strategy economically viable right now.',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'submit_recommendation',
    description:
      'Submit your final yield recommendation after fetching and analyzing protocol data. ' +
      'Call this once you have gathered sufficient data to make a decision.',
    input_schema: {
      type: 'object' as const,
      properties: {
        protocol: {
          type: 'string',
          enum: ['aave', 'compound'],
          description: 'The recommended protocol identifier',
        },
        apy: {
          type: 'number',
          description: 'The APY of the recommended protocol — must exactly match the fetched value',
        },
        reasoning: {
          type: 'string',
          description: 'Substantive explanation of at least 80 characters justifying the recommendation',
        },
      },
      required: ['protocol', 'apy', 'reasoning'],
    },
  },
]

// ─── Tool Executor ────────────────────────────────────────────────────────────

interface ToolResult {
  apy:     number
  rawRate: string
  source:  string
}

async function executeTool(name: string, injectBadData: boolean): Promise<object> {
  if (name === 'get_aave_supply_rate') {
    const rate = await getAaveUSDTRate()
    return { apy: injectBadData ? 500.0 : rate.apy, rawRate: rate.rawRate, source: rate.source }
  }
  if (name === 'get_compound_supply_rate') {
    const rate = await getCompoundRate()
    return { apy: injectBadData ? 499.0 : rate.apy, rawRate: rate.rawRate, source: rate.source }
  }
  if (name === 'get_eth_price') {
    const data = await getEthPrice()
    return { priceUsd: data.priceUsd, rawAnswer: data.rawAnswer, source: data.source }
  }
  if (name === 'get_network_gas') {
    const data = await getNetworkGasPrice()
    return { baseFeeGwei: data.baseFeeGwei, estimatedTxCostEth: data.estimatedTxCostEth, source: data.source }
  }
  throw new Error(`Unknown tool: ${name}`)
}

// ─── Agent B: Task-Driven Agentic Loop ───────────────────────────────────────

export interface AgentTaskResult {
  protocols:      { name: 'aave' | 'compound'; supplyAPY: number; rawRate: string }[]
  recommendation: { protocol: string; apy: number; reasoning: string }
  dataSource:     string
  toolsInvoked:   string[]   // audit trail of which tools Claude called
}

/**
 * Claude reads the task description, decides which protocols to query,
 * calls the on-chain adapters as tools, then submits a structured recommendation.
 *
 * injectBadData: replaces real rates with fake 500%/499% APY for the rejection demo.
 */
export async function executeAgentTask(
  taskDescription: string,
  injectBadData = false
): Promise<AgentTaskResult> {
  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content:
        `You are an autonomous DeFi yield analyst agent. You have been hired to complete the following task:\n\n` +
        `<task>\n${taskDescription}\n</task>\n\n` +
        `Use the available tools to fetch the data you need, then call submit_recommendation ` +
        `with your final answer. Be thorough — fetch all protocols relevant to the task before deciding.`,
    },
  ]

  const fetched: Record<string, ToolResult> = {}
  const toolsInvoked: string[] = []

  // Agentic loop — continue until Claude calls submit_recommendation
  while (true) {
    const response = await client().messages.create({
      model:      MODEL,
      max_tokens: 1024,
      tools:      AGENT_TOOLS,
      messages,
    })

    // Collect tool_use requests from this turn
    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
    )

    // Check for final submission
    const submission = toolUseBlocks.find(b => b.name === 'submit_recommendation')
    if (submission) {
      const rec = submission.input as { protocol: string; apy: number; reasoning: string }

      // Build the protocols array from whatever tools were called
      const protocols = Object.entries(fetched).map(([name, data]) => ({
        name:      name as 'aave' | 'compound',
        supplyAPY: data.apy,
        rawRate:   data.rawRate,
      }))

      const allLive = Object.values(fetched).every(d => d.source === 'live')
      const dataSource = allLive ? 'live-sepolia' : 'fallback'

      return { protocols, recommendation: rec, dataSource, toolsInvoked }
    }

    // Execute data-fetching tools and build tool_result content
    const toolResults: Anthropic.ToolResultBlockParam[] = []

    for (const block of toolUseBlocks) {
      if (block.name === 'submit_recommendation') continue

      toolsInvoked.push(block.name)
      let resultContent: string

      try {
        const result = await executeTool(block.name, injectBadData)
        // Only store protocol rate tools in `fetched` — used to build the protocols array
        if (block.name === 'get_aave_supply_rate') {
          fetched['aave'] = result as ToolResult
        } else if (block.name === 'get_compound_supply_rate') {
          fetched['compound'] = result as ToolResult
        }
        // ETH price and gas results are returned to Claude for reasoning context only
        resultContent = JSON.stringify(result)
      } catch (err: any) {
        resultContent = JSON.stringify({ error: err.message })
      }

      toolResults.push({
        type:        'tool_result',
        tool_use_id: block.id,
        content:     resultContent,
      })
    }

    // Append assistant turn + tool results and continue loop
    messages.push({ role: 'assistant', content: response.content })
    messages.push({ role: 'user',      content: toolResults })
  }
}

// ─── Agent C: Semantic Validator ─────────────────────────────────────────────

function buildValidatorPrompt(result: TaskResult, rawRates: RawRates): string {
  return `You are an independent financial validator in an autonomous agent payment system.
Your verdict controls whether the worker agent receives payment.

A worker agent submitted this yield analysis:
<submission>
${JSON.stringify(result, null, 2)}
</submission>

The raw protocol data at time of submission was:
<raw_data>
Aave V3 supply APY: ${rawRates.aave}%
Compound III supply APY: ${rawRates.compound}%
</raw_data>

Evaluate on three criteria:
1. CONSISTENCY: Does the recommendation match the raw rate data?
2. SOUNDNESS: Is the reasoning logical and substantive?
3. INTEGRITY: Any signs of fabricated, inconsistent, or suspicious data?

Respond ONLY with valid JSON. No preamble. No backticks.

{
  "verdict": "APPROVED" | "REJECTED",
  "reason": "<one clear sentence explanation>",
  "flags": ["<specific issue if any>"]
}`
}

export async function getValidatorVerdict(
  result: TaskResult,
  rawRates: RawRates
): Promise<{ verdict: 'APPROVED' | 'REJECTED'; reason: string; flags: string[] }> {
  const response = await client().messages.create({
    model:     MODEL,
    max_tokens: 300,
    messages: [{ role: 'user', content: buildValidatorPrompt(result, rawRates) }],
  })

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('')
    .replace(/```json|```/g, '')
    .trim()

  return JSON.parse(text)
}
