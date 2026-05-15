"use client";

import styles from "./page.module.css";
import { useState } from "react";

const initialJobs = [
  { id: 1, title: "Project Chimera - Nexus Dynamics", assignee: "L. Chen", budget: "$45k", progress: 65, status: "Leads", avatars: ["a", "b", "c"] },
  { id: 2, title: "Alpha Contract - Synapse Inc", assignee: "K. Patel", budget: "$32k", progress: 40, status: "Leads", avatars: ["d", "e"] },
  { id: 3, title: "Beta Launch - Quantum Solutions", assignee: "J. Rodriguez", budget: "$60k", progress: 85, status: "Scheduled", avatars: ["f", "g", "h"] },
  { id: 4, title: "System Upgrade - OmniCorp", assignee: "S. Kim", budget: "$21k", progress: 30, status: "Scheduled", avatars: ["i", "j", "k"] },
  { id: 5, title: "Integration - Atlas Tech", assignee: "A. Lee", budget: "$55k", progress: 90, status: "Scheduled", avatars: ["l", "m", "n"] },
  { id: 6, title: "Security Audit - CyberNet", assignee: "P. Singh", budget: "$15k", progress: 100, status: "Completed", avatars: ["o", "p"] },
  { id: 7, title: "Data Migration - Void Systems", assignee: "M. Wong", budget: "$28k", progress: 100, status: "Completed", avatars: ["q", "r", "s"] },
  { id: 8, title: "Network Security - Matrix LTD", assignee: "T. Davis", budget: "$41k", progress: 100, status: "Completed", avatars: ["t", "u"] },
  { id: 9, title: "Network Security - CyberNetic", assignee: "R. Garcia", budget: "$26k", progress: 100, status: "Completed", avatars: ["v", "w", "x"] }
];

export default function Dashboard() {
  const [jobs, setJobs] = useState(initialJobs);

  const leads = jobs.filter(j => j.status === "Leads");
  const scheduled = jobs.filter(j => j.status === "Scheduled");
  const completed = jobs.filter(j => j.status === "Completed");

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleWrapper}>
          <span className={styles.companyName}>TerraCRM</span>
          <span className={styles.divider}>|</span>
          <h1 className={styles.pageTitle}>Project Dashboard</h1>
        </div>
        
        <div className={styles.headerActions}>
          <div className={styles.searchBox}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Search" className={styles.searchInput} />
          </div>
          <button className={styles.filterBtn}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            Filter
          </button>
          <div className={styles.dropdownBtn}>
            All filtering
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          <button className={styles.primaryBtn}>
            Add New Project
          </button>
        </div>
      </div>

      <div className={styles.kanbanBoard}>
        <div className={styles.kanbanColumn}>
          <div className={styles.columnHeader}>
            <h3>Leads ({leads.length})</h3>
            <button className={styles.moreBtn}>...</button>
          </div>
          <div className={styles.cardList}>
            {leads.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>

        <div className={styles.kanbanColumn}>
          <div className={styles.columnHeader}>
            <h3>Scheduled ({scheduled.length})</h3>
            <button className={styles.moreBtn}>...</button>
          </div>
          <div className={styles.cardList}>
            {scheduled.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>

        <div className={styles.kanbanColumn}>
          <div className={styles.columnHeader}>
            <h3>Completed ({completed.length})</h3>
            <button className={styles.moreBtn}>...</button>
          </div>
          <div className={styles.cardList}>
            {completed.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function JobCard({ job }: { job: any }) {
  return (
    <div className={styles.jobCard}>
      <h4 className={styles.jobTitle}>{job.title}</h4>
      <div className={styles.jobDetails}>
        <div className={styles.assignee}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          {job.assignee}
        </div>
        <div className={styles.budget}>{job.budget}</div>
      </div>
      <div className={styles.progressSection}>
        <div className={styles.progressLabel}>Progress</div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${job.progress}%` }}></div>
        </div>
      </div>
      <div className={styles.cardFooter}>
        <div className={styles.avatarGroup}>
          {job.avatars.map((a: string, i: number) => (
             <img key={i} src={`https://i.pravatar.cc/150?u=${a}`} alt="Avatar" className={styles.cardAvatar} style={{ zIndex: 10 - i }} />
          ))}
        </div>
      </div>
    </div>
  );
}
