import styles from "./page.module.css";
import globalStyles from "../../page.module.css";

const MOCK_JOBS = [
  { id: "J-101", title: "New Sod Installation", client: "Johnson Residence", date: "May 10th", status: "Lead" },
  { id: "J-102", title: "Spring Cleanup", client: "The Smiths", date: "May 8th", status: "Scheduled" },
  { id: "J-103", title: "Weekly Mowing", client: "Oakhaven Estates", date: "May 7th", status: "Completed" },
  { id: "J-104", title: "Patio Repair Estimate", client: "Doe Residence", date: "May 12th", status: "Lead" },
];

export default function JobsPage() {
  const leads = MOCK_JOBS.filter(j => j.status === "Lead");
  const scheduled = MOCK_JOBS.filter(j => j.status === "Scheduled");
  const completed = MOCK_JOBS.filter(j => j.status === "Completed");

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Job Tracker</h1>
        <button className={globalStyles.button}>
          + Create Job
        </button>
      </div>

      <div className={styles.kanbanBoard}>
        {/* Leads Column */}
        <div className={styles.column}>
          <h2 className={styles.columnTitle}>
            Leads <span style={{ color: "var(--color-text-tertiary)" }}>{leads.length}</span>
          </h2>
          {leads.map(job => (
            <div key={job.id} className={styles.jobCard}>
              <div className={styles.jobTitle}>{job.title}</div>
              <div className={styles.jobClient}>{job.client}</div>
              <div className={styles.jobDate}>
                <span>{job.id}</span>
                <span>{job.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Scheduled Column */}
        <div className={styles.column}>
          <h2 className={styles.columnTitle}>
            Scheduled <span style={{ color: "var(--color-primary)" }}>{scheduled.length}</span>
          </h2>
          {scheduled.map(job => (
            <div key={job.id} className={styles.jobCard}>
              <div className={styles.jobTitle}>{job.title}</div>
              <div className={styles.jobClient}>{job.client}</div>
              <div className={styles.jobDate}>
                <span>{job.id}</span>
                <span style={{ color: "var(--color-primary)" }}>{job.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Completed Column */}
        <div className={styles.column}>
          <h2 className={styles.columnTitle}>
            Completed <span style={{ color: "var(--color-success)" }}>{completed.length}</span>
          </h2>
          {completed.map(job => (
            <div key={job.id} className={styles.jobCard}>
              <div className={styles.jobTitle}>{job.title}</div>
              <div className={styles.jobClient}>{job.client}</div>
              <div className={styles.jobDate}>
                <span>{job.id}</span>
                <span style={{ color: "var(--color-success)" }}>{job.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
