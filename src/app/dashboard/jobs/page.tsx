"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
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
  const [clients, setClients] = useState<{name: string, id: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    client: "",
    status: "Lead"
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/jobs").then(res => res.json()),
      fetch("/api/clients").then(res => res.json())
    ]).then(([jobsData, clientsData]) => {
      if (jobsData.jobs) setJobs(jobsData.jobs);
      if (clientsData.clients) setClients(clientsData.clients);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to fetch data", err);
      setLoading(false);
    });
  }, []);

  const openCreateModal = () => {
    setFormData({ 
      title: "", 
      client: clients.length > 0 ? clients[0].name : "", 
      status: "Lead" 
    });
    setIsModalOpen(true);
  };

  const handleAddJob = async () => {
    if (!formData.title) return;

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          client: formData.client,
          status: formData.status
        }),
      });
      const data = await res.json();
      if (data.job) {
        setJobs([...jobs, data.job]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to add job", err);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return; // Dropped outside
    if (destination.droppableId === source.droppableId && destination.index === source.index) return; // Dropped in same spot

    const newStatus = destination.droppableId;
    
    // Optimistic UI update
    setJobs(jobs.map(job => job.id === draggableId ? { ...job, status: newStatus } : job));

    try {
      await fetch("/api/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: draggableId, status: newStatus }),
      });
    } catch (err) {
      console.error("Failed to move job", err);
      // Revert on error could be added here
      fetch("/api/jobs").then(res => res.json()).then(data => {
        if (data.jobs) setJobs(data.jobs);
      });
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
            
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
              <div>
                <label style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>Job Title</label>
                <input 
                  type="text" 
                  className={globalStyles.modalInput}
                  placeholder="e.g., Front Yard Landscaping"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  autoFocus
                  style={{ marginBottom: 0, marginTop: "4px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>Client Name</label>
                {clients.length === 0 ? (
                  <div style={{ color: "var(--color-warning)", fontSize: "0.875rem", marginTop: "4px" }}>
                    Please create a client first before adding a job.
                  </div>
                ) : (
                  <select 
                    className={globalStyles.modalInput}
                    style={{ marginBottom: 0, marginTop: "4px" }}
                    value={formData.client}
                    onChange={(e) => setFormData({...formData, client: e.target.value})}
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>Starting Status</label>
                <select 
                  className={globalStyles.modalInput}
                  style={{ marginBottom: 0, marginTop: "4px" }}
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Lead">Lead</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className={globalStyles.modalActions} style={{ marginTop: "var(--spacing-xl)" }}>
              <button className={globalStyles.modalBtnCancel} onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className={globalStyles.button} style={{padding: "var(--spacing-sm) var(--spacing-md)"}} onClick={handleAddJob}>Save Job</button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.header}>
        <h1 className={styles.title}>Job Tracker</h1>
        <button className={globalStyles.button} onClick={openCreateModal}>
          + Create Job
        </button>
      </div>

      {loading ? (
        <div style={{textAlign: "center", padding: "2rem"}}>Loading data from AWS...</div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className={styles.kanbanBoard}>
            
            {/* Leads Column */}
            <div className={styles.column}>
              <h2 className={styles.columnTitle}>
                Leads <span style={{ color: "var(--color-text-tertiary)" }}>{leads.length}</span>
              </h2>
              <Droppable droppableId="Lead">
                {(provided, snapshot) => (
                  <div 
                    ref={provided.innerRef} 
                    {...provided.droppableProps}
                    style={{ minHeight: "200px", paddingBottom: "20px" }}
                  >
                    {leads.map((job, index) => (
                      <Draggable key={job.id} draggableId={job.id} index={index}>
                        {(provided, snapshot) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={styles.jobCard}
                            style={{
                              ...provided.draggableProps.style,
                              boxShadow: snapshot.isDragging ? "0 5px 15px rgba(0, 217, 230, 0.4)" : undefined,
                              cursor: "grab",
                            }}
                          >
                            <div className={styles.jobTitle}>{job.title}</div>
                            <div className={styles.jobClient}>{job.client}</div>
                            <div className={styles.jobDate}>
                              <span>{job.id}</span>
                              <span>{job.date}</span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            {/* Scheduled Column */}
            <div className={styles.column}>
              <h2 className={styles.columnTitle}>
                Scheduled <span style={{ color: "var(--color-primary)" }}>{scheduled.length}</span>
              </h2>
              <Droppable droppableId="Scheduled">
                {(provided, snapshot) => (
                  <div 
                    ref={provided.innerRef} 
                    {...provided.droppableProps}
                    style={{ minHeight: "200px", paddingBottom: "20px" }}
                  >
                    {scheduled.map((job, index) => (
                      <Draggable key={job.id} draggableId={job.id} index={index}>
                        {(provided, snapshot) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={styles.jobCard}
                            style={{
                              ...provided.draggableProps.style,
                              boxShadow: snapshot.isDragging ? "0 5px 15px rgba(0, 217, 230, 0.4)" : undefined,
                              cursor: "grab",
                            }}
                          >
                            <div className={styles.jobTitle}>{job.title}</div>
                            <div className={styles.jobClient}>{job.client}</div>
                            <div className={styles.jobDate}>
                              <span>{job.id}</span>
                              <span style={{ color: "var(--color-primary)" }}>{job.date}</span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            {/* Completed Column */}
            <div className={styles.column}>
              <h2 className={styles.columnTitle}>
                Completed <span style={{ color: "var(--color-success)" }}>{completed.length}</span>
              </h2>
              <Droppable droppableId="Completed">
                {(provided, snapshot) => (
                  <div 
                    ref={provided.innerRef} 
                    {...provided.droppableProps}
                    style={{ minHeight: "200px", paddingBottom: "20px" }}
                  >
                    {completed.map((job, index) => (
                      <Draggable key={job.id} draggableId={job.id} index={index}>
                        {(provided, snapshot) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={styles.jobCard}
                            style={{
                              ...provided.draggableProps.style,
                              boxShadow: snapshot.isDragging ? "0 5px 15px rgba(32, 216, 102, 0.4)" : undefined,
                              cursor: "grab",
                            }}
                          >
                            <div className={styles.jobTitle}>{job.title}</div>
                            <div className={styles.jobClient}>{job.client}</div>
                            <div className={styles.jobDate}>
                              <span>{job.id}</span>
                              <span style={{ color: "var(--color-success)" }}>{job.date}</span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

          </div>
        </DragDropContext>
      )}
    </div>
  );
}
