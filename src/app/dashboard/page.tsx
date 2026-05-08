import styles from "./page.module.css";

export default function Dashboard() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Dashboard Overview</h1>
        <button className="button" style={{
          padding: "0.5rem 1rem",
          backgroundColor: "var(--color-primary)",
          color: "white",
          border: "none",
          borderRadius: "var(--radius-md)",
          fontWeight: 600,
          cursor: "pointer"
        }}>
          + New Job
        </button>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Active Clients</span>
          <span className={styles.statValue}>124</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Jobs Pending</span>
          <span className={styles.statValue}>12</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Completed This Month</span>
          <span className={styles.statValue}>45</span>
        </div>
      </div>

      <div className={styles.recentSection}>
        <h2 className={styles.recentTitle}>Recent Jobs</h2>
        <ul className={styles.list}>
          <li className={styles.listItem}>
            <div>
              <div className={styles.itemName}>Spring Cleanup - The Smiths</div>
              <div style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>May 8th, 2026</div>
            </div>
            <div>
              <span className={`${styles.itemStatus} ${styles.itemStatusPending}`}>Pending</span>
            </div>
          </li>
          <li className={styles.listItem}>
            <div>
              <div className={styles.itemName}>Weekly Mowing - Oakhaven Estates</div>
              <div style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>May 7th, 2026</div>
            </div>
            <div>
              <span className={styles.itemStatus}>Completed</span>
            </div>
          </li>
          <li className={styles.listItem}>
            <div>
              <div className={styles.itemName}>Patio Installation - Johnson Res.</div>
              <div style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>May 5th, 2026</div>
            </div>
            <div>
              <span className={styles.itemStatus}>Completed</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
