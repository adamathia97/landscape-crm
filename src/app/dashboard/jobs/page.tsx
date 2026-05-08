"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import globalStyles from "../../page.module.css";

type Job = {
  id: string;
  title: string;
  client: string;
  date: string;
  status: string;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (data.jobs) setJobs(data.jobs);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddJob = async () => {
    if (!inputValue) return;

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: inputValue,
          client: "New Client",
          status: "Lead"
        }),
      });
      const data = await res.json();
      if (data.job) {
        setJobs([...jobs, data.job]);
      }
      setIsModalOpen(false);
      setInputValue("");
    } catch (err) {
      console.error("Failed to add job", err);
    }
  };

  const moveJob = async (jobId: string, newStatus: string) => {
    // Optimistic UI update
    setJobs(jobs.map(job => job.id === jobId ? { ...job, status: newStatus } : job));

    try {
      await fetch("/api/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: jobId, status: newStatus }),
      });
    } catch (err) {
      console.error("Failed to move job", err);
      // Revert on error could be added here
    }
  };

  const leads = jobs.filter(j => j.status === "Lead");
  const scheduled = jobs.filter(j => j.status === "Scheduled");
  const completed = jobs.filter(j => j.status === "Completed");

  return (
    <div>
      {isModalOpen && (
        <div className={globalStyles.modalOverlay}>
          <div className={globalStyles.modalContent}>
            <h2 className={globalStyles.modalTitle}>Create New Job</h2>
            <input 
              type="text" 
              className={globalStyles.modalInput}
              placeholder="Enter job title..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
            />
            <div className={globalStyles.modalActions}>
              <button className={globalStyles.modalBtnCancel} onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className={globalStyles.button} style={{padding: "var(--spacing-sm) var(--spacing-md)"}} onClick={handleAddJob}>Save</button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.header}>
        <h1 className={styles.title}>Job Tracker</h1>
        <button className={globalStyles.button} onClick={() => setIsModalOpen(true)}>
          + Create Job
        </button>
      </div>

      {loading ? (
        <div style={{textAlign: "center", padding: "2rem"}}>Loading data from AWS...</div>
      ) : (
        <div className={styles.kanbanBoard}>
          {/* Leads Column */}
          <div className={styles.column}>
            <h2 className={styles.columnTitle}>
              Leads <span style={{ color: "var(--color-text-tertiary)" }}>{leads.length}</span>
            </h2>
            {leads.map(job => (
              <div key={job.id} className={styles.jobCard} onClick={() => moveJob(job.id, "Scheduled")}>
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
              <div key={job.id} className={styles.jobCard} onClick={() => moveJob(job.id, "Completed")}>
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
              <div key={job.id} className={styles.jobCard} onClick={() => moveJob(job.id, "Lead")}>
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
      )}
    </div>
  );
}
