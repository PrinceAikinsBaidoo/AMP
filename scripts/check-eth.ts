import 'dotenv/config'
import { ethers } from 'ethers'

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL!)
  const addrs = {
    'Agent A': '0x655cb2c511499BAb3DeE0029B6fa884784C81564',
    'Agent B': '0xF1BE2692091486316A7f9acD22e002fdca4f3BfA',
    'Agent C': '0x550D961fd8445143a65b919C2d6C179E5636f53B',
    'Escrow':  '0x8C19969aca01C9E33C63749eDC21d4e56a416525',
  }
  for (const [name, addr] of Object.entries(addrs)) {
    const bal = await provider.getBalance(addr)
    console.log(`${name.padEnd(8)}: ${ethers.formatEther(bal)} ETH`)
  }
}
main().catch(console.error)
