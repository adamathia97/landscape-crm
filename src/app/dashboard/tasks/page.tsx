"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { CyberButton } from "@/components/ui/CyberButton";
import { GlassModal } from "@/components/ui/GlassModal";
import { NeonInput } from "@/components/ui/NeonInput";
import { DatePicker } from "@/components/ui/DatePicker";

type Task = {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  status: "Pending" | "Completed";
  jobId?: string;
  createdAt: string;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "calendar">("list");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [jobId, setJobId] = useState("");
  const [showAssignees, setShowAssignees] = useState(false);
  
  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; task: Task | null }>({
    isOpen: false,
    task: null
  });

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchTasks();
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await fetch("/api/team");
      if (res.ok) {
        const data = await res.json();
        setTeamMembers(data.team.map((m: any) => m.name));
      }
    } catch (err) {
      console.error("Failed to fetch team", err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingTaskId(null);
    setTitle("");
    setAssignee("");
    setDueDate(new Date().toISOString().split('T')[0]);
    setJobId("");
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setAssignee(task.assignee);
    setDueDate(task.dueDate || new Date().toISOString().split('T')[0]);
    setJobId(task.jobId || "");
    setIsModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = { title, assignee, dueDate, jobId, status: "Pending" };

    try {
      if (editingTaskId) {
        const res = await fetch("/api/tasks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingTaskId, ...payload, status: tasks.find(t => t.id === editingTaskId)?.status })
        });
        if (res.ok) fetchTasks();
      } else {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.ok) fetchTasks();
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save task", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === "Pending" ? "Completed" : "Pending";
    // Optimistic UI
    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    
    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, status: newStatus })
      });
    } catch (err) {
      console.error("Failed to toggle status", err);
      // Revert on error
      fetchTasks();
    }
  };

  const handleDeleteClick = (task: Task) => {
    setConfirmModal({ isOpen: true, task });
  };

  const executeDeleteTask = async () => {
    if (!confirmModal.task) return;
    const id = confirmModal.task.id;
    try {
      await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
      setTasks(tasks.filter(t => t.id !== id));
      setConfirmModal({ isOpen: false, task: null });
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  // List View Grouping
  const today = new Date().toISOString().split('T')[0];
  const pendingTasks = tasks.filter(t => t.status === "Pending").sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const completedTasks = tasks.filter(t => t.status === "Completed").sort((a, b) => b.dueDate.localeCompare(a.dueDate));
  
  const todayTasks = pendingTasks.filter(t => t.dueDate === today);
  const upcomingTasks = pendingTasks.filter(t => t.dueDate > today);
  const overdueTasks = pendingTasks.filter(t => t.dueDate < today);

  // Calendar Logic
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const daysInPrevMonth = getDaysInMonth(year, month - 1);

    const cells = [];
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Weekday Headers
    weekdays.forEach(day => {
      cells.push(<div key={`header-${day}`} className={styles.weekdayHeader}>{day}</div>);
    });

    // Previous Month Days
    for (let i = 0; i < firstDay; i++) {
      const prevDay = daysInPrevMonth - firstDay + i + 1;
      cells.push(
        <div key={`prev-${i}`} className={`${styles.calendarDay} ${styles.otherMonth}`}>
          <span className={styles.dayNumber}>{prevDay}</span>
        </div>
      );
    }

    // Current Month Days
    const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    for (let i = 1; i <= daysInMonth; i++) {
      const dayStr = `${currentMonthPrefix}-${String(i).padStart(2, '0')}`;
      const isToday = dayStr === today;
      const dayTasks = tasks.filter(t => t.dueDate === dayStr);

      cells.push(
        <div key={`day-${i}`} className={`${styles.calendarDay} ${isToday ? styles.today : ''}`}>
          <span className={styles.dayNumber}>{i}</span>
          {dayTasks.map(task => (
            <div 
              key={task.id} 
              className={`${styles.calendarTask} ${task.status === "Completed" ? styles.completed : ''}`}
              onClick={() => openEditModal(task)}
              title={task.title}
            >
              {task.title}
            </div>
          ))}
        </div>
      );
    }

    // Next Month Days
    const totalCells = firstDay + daysInMonth;
    const nextDays = (Math.ceil(totalCells / 7) * 7) - totalCells;
    for (let i = 1; i <= nextDays; i++) {
      cells.push(
        <div key={`next-${i}`} className={`${styles.calendarDay} ${styles.otherMonth}`}>
          <span className={styles.dayNumber}>{i}</span>
        </div>
      );
    }

    return (
      <div className={styles.calendarWrapper}>
        <div className={styles.calendarHeader}>
          <h2 className={styles.currentMonth}>
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className={styles.monthNav}>
            <button 
              className={styles.navBtn} 
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            >
              &lt; Prev
            </button>
            <button 
              className={styles.navBtn} 
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </button>
            <button 
              className={styles.navBtn} 
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            >
              Next &gt;
            </button>
          </div>
        </div>
        <div className={styles.calendarGrid}>
          {cells}
        </div>
      </div>
    );
  };

  const renderTaskItem = (task: Task) => (
    <div key={task.id} className={`${styles.taskItem} ${task.status === "Completed" ? styles.taskItemCompleted : ''}`}>
      <input 
        type="checkbox" 
        className={styles.checkbox}
        checked={task.status === "Completed"}
        onChange={() => toggleTaskStatus(task)}
      />
      <div className={styles.taskDetails}>
        <div className={styles.taskTitle}>{task.title}</div>
        <div className={styles.taskMeta}>
          {task.assignee && (
            <div className={styles.taskAssignee}>
              <div className={styles.avatar}>{task.assignee.charAt(0)}</div>
              {task.assignee}
            </div>
          )}
          <div className={`${styles.taskDate} ${task.dueDate < today && task.status === "Pending" ? styles.overdue : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            {new Date(task.dueDate).toLocaleDateString()}
          </div>
          {task.jobId && (
            <div className={styles.taskJob}>
              Job: {task.jobId}
            </div>
          )}
        </div>
      </div>
      <div className={styles.taskActions}>
        <button className={styles.iconBtn} onClick={() => openEditModal(task)} title="Edit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <button className={`${styles.iconBtn} ${styles.deleteBtn}`} onClick={() => handleDeleteClick(task)} title="Delete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleWrapper}>
          <span className={styles.companyName}>TerraCRM</span>
          <span className={styles.divider}>|</span>
          <h1 className={styles.pageTitle}>Tasks & Scheduling</h1>
        </div>
        
        <div className={styles.headerActions}>
          <div className={styles.viewToggle}>
            <button 
              className={`${styles.toggleBtn} ${view === "list" ? styles.toggleBtnActive : ""}`}
              onClick={() => setView("list")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
              List
            </button>
            <button 
              className={`${styles.toggleBtn} ${view === "calendar" ? styles.toggleBtnActive : ""}`}
              onClick={() => setView("calendar")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              Calendar
            </button>
          </div>
          <CyberButton onClick={openAddModal}>
            Add New Task
          </CyberButton>
        </div>
      </div>

      <div className={styles.contentArea}>
        {loading ? (
          <div style={{color: "var(--color-primary)", padding: "2rem", textAlign: "center"}}>Loading Tasks...</div>
        ) : (
          view === "list" ? (
            <>
              {overdueTasks.length > 0 && (
                <div className={styles.listSection}>
                  <h3 className={styles.sectionTitle}>
                    <span style={{ color: "#ff4d4f" }}>Overdue</span>
                    <span className={styles.taskCount}>{overdueTasks.length}</span>
                  </h3>
                  <div className={styles.taskList}>
                    {overdueTasks.map(renderTaskItem)}
                  </div>
                </div>
              )}
              
              <div className={styles.listSection}>
                <h3 className={styles.sectionTitle}>
                  Today
                  <span className={styles.taskCount}>{todayTasks.length}</span>
                </h3>
                <div className={styles.taskList}>
                  {todayTasks.length === 0 ? (
                    <div style={{ color: "var(--color-text-tertiary)", padding: "1rem", textAlign: "center", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "var(--radius-md)" }}>
                      No tasks due today.
                    </div>
                  ) : todayTasks.map(renderTaskItem)}
                </div>
              </div>

              <div className={styles.listSection}>
                <h3 className={styles.sectionTitle}>
                  Upcoming
                  <span className={styles.taskCount}>{upcomingTasks.length}</span>
                </h3>
                <div className={styles.taskList}>
                  {upcomingTasks.map(renderTaskItem)}
                </div>
              </div>

              {completedTasks.length > 0 && (
                <div className={styles.listSection} style={{ opacity: 0.8 }}>
                  <h3 className={styles.sectionTitle}>
                    Completed
                    <span className={styles.taskCount}>{completedTasks.length}</span>
                  </h3>
                  <div className={styles.taskList}>
                    {completedTasks.map(renderTaskItem)}
                  </div>
                </div>
              )}
            </>
          ) : (
            renderCalendar()
          )
        )}
      </div>

      <GlassModal 
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={editingTaskId ? "Edit Task" : "Add New Task"}
        footerActions={
          <>
            <CyberButton type="button" variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </CyberButton>
            <CyberButton type="submit" form="taskForm" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Task"}
            </CyberButton>
          </>
        }
      >
        <form id="taskForm" onSubmit={handleSaveTask} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
          <NeonInput 
            label="Task Title"
            placeholder="What needs to be done?" 
            required 
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <div style={{ display: "flex", gap: "var(--spacing-md)", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
              <NeonInput 
                label="Assignee"
                placeholder="e.g. John Doe" 
                value={assignee}
                onChange={e => setAssignee(e.target.value)}
                onFocus={() => setShowAssignees(true)}
                onBlur={() => setTimeout(() => setShowAssignees(false), 200)}
              />
              {showAssignees && teamMembers.length > 0 && (
                <div className={styles.assigneeDropdown}>
                  {teamMembers.filter(a => a.toLowerCase().includes(assignee.toLowerCase())).map(a => (
                    <div 
                      key={a}
                      className={styles.suggestionItem}
                      onClick={() => {
                        setAssignee(a);
                        setShowAssignees(false);
                      }}
                    >
                      {a}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <label style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "var(--spacing-sm)", display: "block" }}>Due Date</label>
              <DatePicker 
                value={dueDate}
                onChange={setDueDate}
              />
            </div>
          </div>
          <NeonInput 
            label="Related Job ID (Optional)"
            placeholder="e.g. J-1234" 
            value={jobId}
            onChange={e => setJobId(e.target.value)}
          />
        </form>
      </GlassModal>

      <GlassModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, task: null })}
        title="Delete Task"
        footerActions={
          <>
            <CyberButton 
              variant="secondary" 
              onClick={() => setConfirmModal({ isOpen: false, task: null })}
            >
              Cancel
            </CyberButton>
            <CyberButton 
              onClick={executeDeleteTask}
              style={{ backgroundColor: 'rgba(255, 77, 79, 0.2)', color: '#ff4d4f', border: '1px solid #ff4d4f' }}
            >
              Delete
            </CyberButton>
          </>
        }
      >
        <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
          Are you sure you want to permanently delete the task "{confirmModal.task?.title}"? This action cannot be undone.
        </p>
      </GlassModal>
    </div>
  );
}
