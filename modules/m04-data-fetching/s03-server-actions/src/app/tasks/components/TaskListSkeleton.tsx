import styles from '../tasks.module.css'

export default function TaskListSkeleton() {
  return (
    <ul className={styles.list}>
      {[1, 2].map((i) => (
        <li key={i}>
          <div className={styles.skeletonCard} />
        </li>
      ))}
    </ul>
  )
}
