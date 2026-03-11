/**
 * EthPriceAdapter.ts
 * Fetches the live ETH/USD price from the Chainlink price feed on Sepolia.
 *
 * Chainlink ETH/USD Aggregator (Sepolia): 0x694AA1769357215DE4FAC081bf1f309aDC325306
 * Answer decimals: 8
 */

import { ethers } from 'ethers'

const CHAINLINK_ETH_USD_SEPOLIA = '0x694AA1769357215DE4FAC081bf1f309aDC325306'

const AGGREGATOR_ABI = [
  'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
  'function decimals() view returns (uint8)',
]

export interface EthPriceData {
  priceUsd:  number   // e.g. 3241.57
  rawAnswer: string   // raw int256 as string
  source:    string
}

export async function getEthPrice(): Promise<EthPriceData> {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL!)
    const feed     = new ethers.Contract(CHAINLINK_ETH_USD_SEPOLIA, AGGREGATOR_ABI, provider)

    const [, answer] = await feed.latestRoundData()
    const decimals   = await feed.decimals()

    const priceUsd = Number(ethers.formatUnits(answer, decimals))

    return { priceUsd, rawAnswer: answer.toString(), source: 'live' }
  } catch {
    // Fallback: approximate market price if RPC fails
    return { priceUsd: 3200.0, rawAnswer: '320000000000', source: 'fallback' }
  }
}
