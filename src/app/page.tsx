import styles from './page.module.css'

export default function HomePage() {
  return (
    <main className={styles.main}>
      <p className={styles.greeting}>✦ my cats ✦</p>
      <h1 className={styles.title}>うちの子の健康を<br />一緒に守ろう🐾</h1>
      <p className={styles.description}>毎日の記録が、大切なにゃんこを守る第一歩。</p>

      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>🐱</div>
          <h2 className={styles.cardTitle}>猫を登録する</h2>
          <p className={styles.cardDescription}>
            飼っている猫のプロフィールを登録しましょう。
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>📋</div>
          <h2 className={styles.cardTitle}>健康記録</h2>
          <p className={styles.cardDescription}>
            体重・食欲・排泄など日々の状態を記録できます。
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>💉</div>
          <h2 className={styles.cardTitle}>ワクチン・通院</h2>
          <p className={styles.cardDescription}>
            ワクチン接種日や通院履歴を管理できます。
          </p>
        </div>
      </div>
    </main>
  )
}
