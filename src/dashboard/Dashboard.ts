/**
 * Dashboard.ts
 * Terminal display utilities for the AMP demo.
 * Uses chalk for color. All output is structured and readable in a recording.
 */

import chalk, { type ChalkInstance } from 'chalk'

const startTime = Date.now()

function elapsed(): string {
  const s = Math.floor((Date.now() - startTime) / 1000)
  return chalk.gray(`[${String(s).padStart(4, '0')}s]`)
}

const LABELS: Record<string, ChalkInstance> = {
  'Agent A':  chalk.yellow,
  'Agent B':  chalk.cyan,
  'Agent B2': chalk.green,
  'Agent C':  chalk.magenta,
  'Escrow':   chalk.white,
  'System':   chalk.gray,
}

export function log(agent: string, message: string): void {
  const label = (LABELS[agent] ?? chalk.white)(agent.padEnd(8))
  console.log(`${elapsed()}  ${label}  ${message}`)
}

export function logSuccess(message: string): void {
  console.log('\n' + chalk.green.bold(`  ✓  ${message}`) + '\n')
}

export function logRejection(message: string): void {
  console.log('\n' + chalk.red.bold(`  ✗  ${message}`) + '\n')
}

export function logValidation(layer: string, passed: boolean, detail?: string): void {
  const icon  = passed ? chalk.green('✓') : chalk.red('✗')
  const label = chalk.yellow(layer.padEnd(22))
  const info  = detail ? chalk.gray(`  ${detail}`) : ''
  console.log(`           ${icon}  ${label}${info}`)
}

export function printHeader(): void {
  console.log(chalk.bold.blue('\n╔══════════════════════════════════════════════════════════╗'))
  console.log(chalk.bold.blue('║          AGENT MARKET PROTOCOL  —  LIVE DEMO              ║'))
  console.log(chalk.bold.blue('╚══════════════════════════════════════════════════════════╝\n'))
}

export function printAgents(
  agentA: string,
  agentB: string,
  agentB2: string,
  agentC: string,
  escrow: string
): void {
  console.log(` ${chalk.yellow.bold('Agent A ')}  [Treasury Manager]   ${chalk.gray(agentA)}`)
  console.log(` ${chalk.cyan.bold('Agent B ')}  [Worker — primary]   ${chalk.gray(agentB)}`)
  console.log(` ${chalk.green.bold('Agent B2')}  [Worker — competing] ${chalk.gray(agentB2)}`)
  console.log(` ${chalk.magenta.bold('Agent C ')}  [Validator]          ${chalk.gray(agentC)}`)
  console.log(` ${chalk.white.bold('Escrow  ')}                       ${chalk.gray(escrow)}\n`)
  console.log(chalk.gray('─'.repeat(65)) + '\n')
}

export function printSettlement(txHash: string, amount: string, worker = 'winning worker'): void {
  const body = `SETTLED — ${amount} USDT paid to ${worker}`
  const pad  = Math.max(0, 50 - body.length)
  console.log('\n' + chalk.green.bold('  ╔════════════════════════════════════════════════════╗'))
  console.log(chalk.green.bold(`  ║  ${body}${' '.repeat(pad)}║`))
  console.log(chalk.green.bold('  ╚════════════════════════════════════════════════════╝'))
  console.log(chalk.gray(`\n  Etherscan: https://sepolia.etherscan.io/tx/${txHash}\n`))
}

export function printRefund(txHash: string, amount: string): void {
  console.log('\n' + chalk.red.bold('  ╔════════════════════════════════════════════════════╗'))
  console.log(chalk.red.bold(`  ║  REJECTED — ${amount} USDT refunded to Agent A          ║`))
  console.log(chalk.red.bold('  ╚════════════════════════════════════════════════════╝'))
  console.log(chalk.gray(`\n  Etherscan: https://sepolia.etherscan.io/tx/${txHash}\n`))
}

export function printSection(title: string): void {
  console.log('\n' + chalk.gray('─'.repeat(65)))
  console.log(chalk.bold(` ${title}`))
  console.log(chalk.gray('─'.repeat(65)))
}
