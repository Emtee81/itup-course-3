'use client'

import { useState } from 'react'
import { useActionState, useTransition } from 'react'
import { updateTask, deleteTask, toggleTaskComplete, uploadTaskAttachment } from '../actions'
import type { Task, ActionState } from '@/types'
import TaskFields from './TaskFields'
import styles from '../tasks.module.css'

interface TaskCardProps {
  task: Task
}

const priorityColors = {
  LOW: '#4CAF50',
  MEDIUM: '#FFC107',
  HIGH: '#F44336',
}

export default function TaskCard({ task }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  const updateThisTask = updateTask.bind(null, task.id)
  const [editState, editAction, isSaving] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const result = await updateThisTask(prevState, formData)
      if (result.success) setIsEditing(false)
      return result
    },
    {}
  )

  const uploadThisTask = uploadTaskAttachment.bind(null, task.id)
  const [uploadState, uploadAction] = useActionState(uploadThisTask, {})

  function handleToggleComplete() {
    startTransition(async () => {
      const result = await toggleTaskComplete(task.id)
      setMessage(result.message ?? '')
    })
  }

  function handleDelete() {
    if (!confirm(`Delete "${task.title}"?`)) return
    startTransition(async () => {
      const result = await deleteTask(task.id)
      setMessage(result.message ?? '')
    })
  }

  if (isEditing) {
    return (
      <div className={styles.card}>
        <form action={editAction}>
          <TaskFields task={task} state={editState} />
          <div className={styles.editActions}>
            <button type="submit" className={styles.button} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" className={styles.secondaryButton} onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className={`${styles.card} ${task.completed ? styles.completed : ''}`}>
      <div className={styles.cardHeader}>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggleComplete}
          disabled={isPending}
          className={styles.checkbox}
        />
        <div className={styles.cardTitle}>
          <h3 className={task.completed ? styles.strikethrough : ''}>{task.title}</h3>
          <p>{task.description}</p>
        </div>
        <div
          className={styles.priorityBadge}
          style={{ backgroundColor: priorityColors[task.priority] }}
        >
          {task.priority}
        </div>
      </div>

      {task.attachment && <p className={styles.attachment}>📎 {task.attachment}</p>}

      <div className={styles.fileUpload}>
        <form action={uploadAction} className={styles.uploadForm}>
          <input type="file" name="attachment" className={styles.fileInput} />
          <button type="submit" className={styles.smallButton} disabled={isSaving || isPending}>
            Attach
          </button>
        </form>
      </div>

      <div className={styles.cardActions}>
        <button
          onClick={() => setIsEditing(true)}
          className={styles.secondaryButton}
          disabled={isPending}
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className={styles.deleteButton}
          disabled={isPending}
        >
          Delete
        </button>
      </div>

      {message && <p className={styles.message}>{message}</p>}
    </div>
  )
}
