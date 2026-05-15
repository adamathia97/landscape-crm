"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { CyberButton } from "@/components/ui/CyberButton";
import { GlassModal } from "@/components/ui/GlassModal";
import { NeonInput } from "@/components/ui/NeonInput";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export default function SettingsPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Agent");

  // Delete Confirm State
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; member: TeamMember | null }>({
    isOpen: false,
    member: null
  });

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await fetch("/api/team");
      if (res.ok) {
        const data = await res.json();
        setTeam(data.team || []);
      }
    } catch (err) {
      console.error("Failed to fetch team", err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setName("");
    setEmail("");
    setRole("Agent");
    setIsModalOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role })
      });
      if (res.ok) fetchTeam();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save team member", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (member: TeamMember) => {
    setConfirmModal({ isOpen: true, member });
  };

  const executeDeleteMember = async () => {
    if (!confirmModal.member) return;
    const id = confirmModal.member.id;
    try {
      await fetch(`/api/team?id=${id}`, { method: "DELETE" });
      setTeam(team.filter(t => t.id !== id));
      setConfirmModal({ isOpen: false, member: null });
    } catch (err) {
      console.error("Failed to delete member", err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleWrapper}>
          <span className={styles.companyName}>TerraCRM</span>
          <span className={styles.divider}>|</span>
          <h1 className={styles.pageTitle}>Settings</h1>
        </div>
      </div>

      <div className={styles.contentArea}>
        
        {/* Team Management Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Team Management</h2>
              <p className={styles.sectionDescription}>
                Manage agents and managers. Added team members will automatically appear in Assignee dropdowns.
              </p>
            </div>
            <CyberButton onClick={openAddModal}>Add New Agent</CyberButton>
          </div>

          {loading ? (
            <div style={{color: "var(--color-primary)", padding: "2rem", textAlign: "center"}}>Loading Team...</div>
          ) : (
            <div className={styles.teamGrid}>
              {team.length === 0 ? (
                <div style={{ color: "var(--color-text-tertiary)", padding: "1rem" }}>
                  No team members added yet.
                </div>
              ) : (
                team.map(member => (
                  <div key={member.id} className={styles.teamCard}>
                    <div className={styles.avatar}>{member.name.charAt(0).toUpperCase()}</div>
                    <div className={styles.memberInfo}>
                      <div className={styles.memberName}>{member.name}</div>
                      <div className={styles.memberEmail}>{member.email || "No email provided"}</div>
                      <div className={`${styles.memberRole} ${member.role === "Manager" ? styles.admin : ""}`}>
                        {member.role}
                      </div>
                    </div>
                    <div className={styles.actions}>
                      <button className={styles.iconBtn} onClick={() => handleDeleteClick(member)} title="Remove Agent">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>

      </div>

      <GlassModal 
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title="Add New Agent"
        footerActions={
          <>
            <CyberButton type="button" variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </CyberButton>
            <CyberButton type="submit" form="agentForm" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Add Agent"}
            </CyberButton>
          </>
        }
      >
        <form id="agentForm" onSubmit={handleSaveMember} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
          <NeonInput 
            label="Agent Name"
            placeholder="e.g. L. Chen" 
            required 
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <NeonInput 
            label="Email Address"
            placeholder="agent@example.com" 
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <div>
            <label style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "var(--spacing-sm)", display: "block" }}>Role</label>
            <select 
              value={role} 
              onChange={e => setRole(e.target.value)}
              style={{
                width: "100%", padding: "var(--spacing-sm) var(--spacing-md)", backgroundColor: "rgba(0, 0, 0, 0.5)",
                border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)",
                color: "var(--color-text-primary)", fontFamily: "var(--font-family-sans)", colorScheme: "dark"
              }}
            >
              <option value="Agent" style={{ background: "var(--color-surface)", color: "var(--color-text-primary)" }}>Agent</option>
              <option value="Manager" style={{ background: "var(--color-surface)", color: "var(--color-text-primary)" }}>Manager</option>
            </select>
          </div>
        </form>
      </GlassModal>

      <GlassModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, member: null })}
        title="Remove Agent"
        footerActions={
          <>
            <CyberButton 
              variant="secondary" 
              onClick={() => setConfirmModal({ isOpen: false, member: null })}
            >
              Cancel
            </CyberButton>
            <CyberButton 
              onClick={executeDeleteMember}
              style={{ backgroundColor: 'rgba(255, 77, 79, 0.2)', color: '#ff4d4f', border: '1px solid #ff4d4f' }}
            >
              Remove
            </CyberButton>
          </>
        }
      >
        <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
          Are you sure you want to remove "{confirmModal.member?.name}" from the team? They will no longer appear in the Assignee dropdowns.
        </p>
      </GlassModal>
    </div>
  );
}
