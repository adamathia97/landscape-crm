"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

type Job = {
  id: string;
  title: string;
  client: string;
  date: string;
  status: string;
};

type Client = {
  id: string;
  status: string;
};

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/jobs").then(res => res.json()),
      fetch("/api/clients").then(res => res.json())
    ]).then(([jobsData, clientsData]) => {
      if (jobsData.jobs) setJobs(jobsData.jobs);
      if (clientsData.clients) setClients(clientsData.clients);
      setLoading(false);
    }).catch(err => {
      console.error("Error fetching dashboard data", err);
      setLoading(false);
    });
  }, []);

  const activeClients = clients.filter(c => c.status === "Active").length;
  const pendingJobs = jobs.filter(j => j.status === "Lead" || j.status === "Scheduled").length;
  const completedJobs = jobs.filter(j => j.status === "Completed").length;
  
  // Sort by newest first (assuming ID has some chronological order or just using the array as is for recent)
  const recentJobs = [...jobs].reverse().slice(0, 5);

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard Overview</h1>
      </div>

      {loading ? (
        <div style={{padding: "2rem", color: "var(--color-text-secondary)"}}>Syncing with AWS...</div>
      ) : (
        <>
          <div className={styles.statsGrid}>
            <div className={`glass-surface ${styles.statCard}`}>
              <h3 className={styles.statTitle}>ACTIVE CLIENTS</h3>
              <div className={styles.statValue}>{activeClients}</div>
            </div>
            
            <div className={`glass-surface ${styles.statCard}`}>
              <h3 className={styles.statTitle}>JOBS PENDING</h3>
              <div className={styles.statValue}>{pendingJobs}</div>
            </div>
            
            <div className={`glass-surface ${styles.statCard}`}>
              <h3 className={styles.statTitle}>COMPLETED THIS MONTH</h3>
              <div className={styles.statValue}>{completedJobs}</div>
            </div>
          </div>

          <div className={`glass-surface ${styles.recentSection}`}>
            <h2 className={styles.recentTitle}>Recent Jobs</h2>
            <div className={styles.recentList}>
              {recentJobs.length === 0 ? (
                <div style={{color: "var(--color-text-tertiary)"}}>No recent jobs found.</div>
              ) : recentJobs.map(job => (
                <div key={job.id} className={styles.recentItem}>
                  <div>
                    <div className={styles.recentItemTitle}>{job.title} - {job.client}</div>
                    <div className={styles.recentItemDate}>{job.date}</div>
                  </div>
                  <div className={
                    job.status === 'Completed' ? styles.statusBadgeSuccess : 
                    job.status === 'Scheduled' ? styles.statusBadgeWarning : 
                    styles.statusBadgeWarning // fallback for lead
                  }>
                    {job.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
