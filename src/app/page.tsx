import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.title}>Landscaping CRM</h1>
          <p className={styles.subtitle}>
            Manage your clients, track jobs, and scale your landscaping business with ease.
          </p>
          <Link href="/dashboard" className={styles.button}>
            Go to Dashboard
          </Link>
        </section>

        <section className={styles.cards}>
          <div className={`${styles.card} glass-surface`}>
            <h2 className={styles.cardTitle}>Client Management</h2>
            <p className={styles.cardText}>
              Keep track of all your client details, addresses, and service histories in one place.
            </p>
          </div>
          <div className={`${styles.card} glass-surface`}>
            <h2 className={styles.cardTitle}>Job Tracking</h2>
            <p className={styles.cardText}>
              From lead to completion. Never lose track of an estimate or a scheduled job again.
            </p>
          </div>
          <div className={`${styles.card} glass-surface`}>
            <h2 className={styles.cardTitle}>AWS Powered</h2>
            <p className={styles.cardText}>
              Built on highly scalable and secure AWS infrastructure.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
