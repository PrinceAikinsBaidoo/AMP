/**
 * TaskRegistry.ts
 * In-memory task store with EventEmitter-based pub/sub and strict state machine transitions.
 */

import { EventEmitter } from 'events'
import { v4 as uuidv4 } from 'uuid'
import {
  Task,
  TaskStatus,
  TaskResult,
  PostTaskInput,
  ValidationVerdict,
  validateTransition,
} from './types.js'

export class TaskRegistry extends EventEmitter {
  private tasks = new Map<string, Task>()

  // ── Write Operations ───────────────────────────────────────────────────────

  postTask(input: PostTaskInput): Task {
    const task: Task = {
      id: uuidv4(),
      type: input.type ?? 'YIELD_ANALYSIS',
      description: input.description,
      reward: input.reward,
      deadline: input.deadline,
      status: TaskStatus.OPEN,
      postedBy: input.postedBy,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    this.tasks.set(task.id, task)
    this.emit('task:posted', task)
    return task
  }

  acceptTask(taskId: string, workerId: string): void {
    const task = this.getTask(taskId)
    validateTransition(task.status, TaskStatus.IN_PROGRESS)
    task.status = TaskStatus.IN_PROGRESS
    task.acceptedBy = workerId
    task.updatedAt = Date.now()
    this.emit('task:accepted', task)
  }

  submitResult(taskId: string, result: TaskResult): void {
    const task = this.getTask(taskId)
    validateTransition(task.status, TaskStatus.PENDING_VALIDATION)
    task.status = TaskStatus.PENDING_VALIDATION
    task.result = result
    task.updatedAt = Date.now()
    this.emit('task:submitted', task)
  }

  settleTask(taskId: string, txHash: string, verdict?: ValidationVerdict): void {
    const task = this.getTask(taskId)
    validateTransition(task.status, TaskStatus.SETTLED)
    task.status = TaskStatus.SETTLED
    task.settlementTxHash = txHash
    if (verdict) task.verdict = verdict
    task.updatedAt = Date.now()
    this.emit('task:settled', task)
  }

  failTask(taskId: string, reason: string, verdict?: ValidationVerdict): void {
    const task = this.getTask(taskId)
    validateTransition(task.status, TaskStatus.FAILED)
    task.status = TaskStatus.FAILED
    task.failReason = reason
    if (verdict) task.verdict = verdict
    task.updatedAt = Date.now()
    this.emit('task:failed', task)
  }

  setEscrowTxHash(taskId: string, txHash: string): void {
    const task = this.getTask(taskId)
    task.escrowTxHash = txHash
    task.updatedAt = Date.now()
  }

  // ── Read Operations ────────────────────────────────────────────────────────

  getTask(taskId: string): Task {
    const task = this.tasks.get(taskId)
    if (!task) throw new Error(`Task not found: ${taskId}`)
    return task
  }

  getOpenTasks(): Task[] {
    return Array.from(this.tasks.values()).filter(t => t.status === TaskStatus.OPEN)
  }

  getPendingValidation(): Task[] {
    return Array.from(this.tasks.values()).filter(
      t => t.status === TaskStatus.PENDING_VALIDATION
    )
  }

  getAllTasks(): Task[] {
    return Array.from(this.tasks.values())
  }
}
