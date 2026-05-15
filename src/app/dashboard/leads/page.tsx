"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { GlassModal } from "@/components/ui/GlassModal";
import { NeonInput } from "@/components/ui/NeonInput";
import { CyberButton } from "@/components/ui/CyberButton";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: "New" | "Contacted" | "Qualified" | "Lost";
  notes: string;
  createdAt: string;
};

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof Lead>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("Website");
  const [status, setStatus] = useState<Lead["status"]>("New");
  const [notes, setNotes] = useState("");

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; type: 'delete' | 'convert' | null; lead: Lead | null }>({
    isOpen: false,
    type: null,
    lead: null
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads");
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (err) {
      console.error("Failed to fetch leads", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads
    .filter(lead => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        lead.name.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      const aVal = String(a[sortField]).toLowerCase();
      const bVal = String(b[sortField]).toLowerCase();
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const handleSort = (field: keyof Lead) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const openAddModal = () => {
    setEditingLeadId(null);
    setName("");
    setEmail("");
    setPhone("");
    setSource("Website");
    setStatus("New");
    setNotes("");
    setIsModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setEditingLeadId(lead.id);
    setName(lead.name);
    setEmail(lead.email);
    setPhone(lead.phone || "");
    setSource(lead.source || "Website");
    setStatus(lead.status || "New");
    setNotes(lead.notes || "");
    setIsModalOpen(true);
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = { name, email, phone, source, status, notes };

    try {
      if (editingLeadId && !editingLeadId.startsWith("mock-")) {
        // Edit existing AWS lead
        const res = await fetch("/api/leads", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingLeadId, ...payload })
        });
        if (res.ok) {
          fetchLeads();
        } else {
          setLeads(leads.map(l => l.id === editingLeadId ? { ...l, ...payload } as Lead : l));
        }
      } else if (!editingLeadId) {
        // Create new AWS lead
        const tempId = `mock-${Date.now()}`;
        const newLead = { id: tempId, ...payload, createdAt: new Date().toISOString() } as Lead;

        const res = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newLead)
        });

        if (res.ok) {
          const data = await res.json();
          setLeads(prev => [data.lead, ...prev]);
        } else {
          // Fallback to local state if DB not provisioned
          setLeads(prev => [newLead, ...prev]);
        }
      } else {
        // Update local mock (for testing without db)
        setLeads(leads.map(l => l.id === editingLeadId ? { ...l, ...payload } as Lead : l));
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save lead", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLead = (lead: Lead) => {
    setConfirmModal({ isOpen: true, type: 'delete', lead });
  };

  const executeDeleteLead = async () => {
    if (!confirmModal.lead) return;
    const id = confirmModal.lead.id;
    try {
      await fetch(`/api/leads?id=${id}`, { method: "DELETE" });
      setLeads(leads.filter(l => l.id !== id));
      setConfirmModal({ isOpen: false, type: null, lead: null });
    } catch (err) {
      console.error("Failed to delete lead", err);
    }
  };

  const handleConvertToJob = (lead: Lead) => {
    setConfirmModal({ isOpen: true, type: 'convert', lead });
  };

  const executeConvertToJob = async () => {
    if (!confirmModal.lead) return;
    const lead = confirmModal.lead;

    try {
      // 1. Create Job
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Project - ${lead.name}`,
          client: lead.name,
          status: "Lead",
          progress: 0
        })
      });

      if (res.ok) {
        // 2. Delete Lead
        await fetch(`/api/leads?id=${lead.id}`, { method: "DELETE" });
        // 3. Redirect
        router.push("/dashboard");
      } else {
        // Optimistic redirect if db is not connected
        setLeads(leads.filter(l => l.id !== lead.id));
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Failed to convert lead", err);
    }
  };

  const SortIcon = ({ field }: { field: keyof Lead }) => {
    if (sortField !== field) return null;
    return (
      <svg style={{ marginLeft: 4 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
        {sortOrder === "asc" ? <polyline points="18 15 12 9 6 15"></polyline> : <polyline points="6 9 12 15 18 9"></polyline>}
      </svg>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleWrapper}>
          <span className={styles.companyName}>TerraCRM</span>
          <span className={styles.divider}>|</span>
          <h1 className={styles.pageTitle}>Leads Management</h1>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.searchBox}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input
              type="text"
              placeholder="Search leads..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <CyberButton onClick={openAddModal}>
            Add New Lead
          </CyberButton>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {loading ? (
          <div style={{ color: "var(--color-primary)", padding: "2rem", textAlign: "center" }}>Loading Leads...</div>
        ) : (
          <table className={styles.leadsTable}>
            <thead>
              <tr>
                <th onClick={() => handleSort("name")}>Name <SortIcon field="name" /></th>
                <th onClick={() => handleSort("email")}>Contact <SortIcon field="email" /></th>
                <th onClick={() => handleSort("source")}>Source <SortIcon field="source" /></th>
                <th onClick={() => handleSort("status")}>Status <SortIcon field="status" /></th>
                <th onClick={() => handleSort("createdAt")}>Date <SortIcon field="createdAt" /></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>No leads found.</td>
                </tr>
              ) : (
                filteredLeads.map(lead => (
                  <tr key={lead.id}>
                    <td className={styles.nameCell}>{lead.name}</td>
                    <td>
                      <div>{lead.email}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--color-text-tertiary)" }}>{lead.phone}</div>
                    </td>
                    <td>{lead.source}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[`status${lead.status}`]}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className={styles.actionsCell}>
                        <button className={styles.actionBtn} onClick={() => openEditModal(lead)} title="Edit Lead">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button className={`${styles.actionBtn} ${styles.convertBtn}`} onClick={() => handleConvertToJob(lead)} title="Convert to Job">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                        </button>
                        <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDeleteLead(lead)} title="Delete Lead">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <GlassModal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={editingLeadId ? "Edit Lead" : "Add New Lead"}
        footerActions={
          <>
            <CyberButton
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </CyberButton>
            <CyberButton
              type="submit"
              form="leadForm"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Lead"}
            </CyberButton>
          </>
        }
      >
        <form id="leadForm" onSubmit={handleSaveLead} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
          <NeonInput
            label="Name"
            placeholder="Lead Name"
            required
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <div style={{ display: "flex", gap: "var(--spacing-md)" }}>
            <NeonInput
              label="Email"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <NeonInput
              label="Phone"
              placeholder="Phone Number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: "var(--spacing-md)" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "var(--spacing-sm)", display: "block" }}>Source</label>
              <select
                value={source}
                onChange={e => setSource(e.target.value)}
                style={{
                  width: "100%", padding: "var(--spacing-sm)", backgroundColor: "rgba(0, 0, 0, 0.5)",
                  border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)",
                  color: "var(--color-text-primary)", fontFamily: "var(--font-family-sans)", colorScheme: "dark"
                }}
              >
                <option value="Website" style={{ background: "var(--color-surface)", color: "var(--color-text-primary)" }}>Website</option>
                <option value="Referral" style={{ background: "var(--color-surface)", color: "var(--color-text-primary)" }}>Referral</option>
                <option value="Cold Call" style={{ background: "var(--color-surface)", color: "var(--color-text-primary)" }}>Cold Call</option>
                <option value="Advertisement" style={{ background: "var(--color-surface)", color: "var(--color-text-primary)" }}>Advertisement</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "var(--spacing-sm)", display: "block" }}>Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                style={{
                  width: "100%", padding: "var(--spacing-sm)", backgroundColor: "rgba(0, 0, 0, 0.5)",
                  border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)",
                  color: "var(--color-text-primary)", fontFamily: "var(--font-family-sans)", colorScheme: "dark"
                }}
              >
                <option value="New" style={{ background: "var(--color-surface)", color: "var(--color-text-primary)" }}>New</option>
                <option value="Contacted" style={{ background: "var(--color-surface)", color: "var(--color-text-primary)" }}>Contacted</option>
                <option value="Qualified" style={{ background: "var(--color-surface)", color: "var(--color-text-primary)" }}>Qualified</option>
                <option value="Lost" style={{ background: "var(--color-surface)", color: "var(--color-text-primary)" }}>Lost</option>
              </select>
            </div>
          </div>
          <NeonInput
            label="Notes"
            placeholder="Additional notes..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </form>
      </GlassModal>

      <GlassModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: null, lead: null })}
        title={confirmModal.type === 'delete' ? 'Delete Lead' : 'Convert to Job'}
        footerActions={
          <>
            <CyberButton
              variant="secondary"
              onClick={() => setConfirmModal({ isOpen: false, type: null, lead: null })}
            >
              Cancel
            </CyberButton>
            <CyberButton
              onClick={confirmModal.type === 'delete' ? executeDeleteLead : executeConvertToJob}
              style={confirmModal.type === 'delete'
                ? { backgroundColor: 'rgba(255, 77, 79, 0.2)', color: '#ff4d4f', border: '1px solid #ff4d4f' }
                : { backgroundColor: 'rgba(51, 255, 87, 0.2)', color: '#33ff57', border: '1px solid #33ff57' }}
            >
              {confirmModal.type === 'delete' ? 'Delete' : 'Convert to Job'}
            </CyberButton>
          </>
        }
      >
        <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
          {confirmModal.type === 'delete'
            ? `Are you sure you want to permanently delete the lead "${confirmModal.lead?.name}"? This action cannot be undone.`
            : `Are you sure you want to convert "${confirmModal.lead?.name}" into a new Job? They will be removed from this table and moved to the Kanban board.`}
        </p>
      </GlassModal>
    </div>
  );
}
