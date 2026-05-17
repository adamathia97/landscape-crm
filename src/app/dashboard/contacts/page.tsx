"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { CyberButton } from "@/components/ui/CyberButton";
import { GlassModal } from "@/components/ui/GlassModal";
import { NeonInput } from "@/components/ui/NeonInput";
import { NeonSelect } from "@/components/ui/NeonSelect";

type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  source: string;
  notes: string;
  status: "Lead" | "Active" | "Inactive";
  createdAt: string;
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formSource, setFormSource] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formStatus, setFormStatus] = useState<"Lead" | "Active" | "Inactive">("Active");

  // Delete Confirm
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; contact: Contact | null }>({
    isOpen: false,
    contact: null,
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await fetch("/api/contacts");
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts || []);
      }
    } catch (err) {
      console.error("Failed to fetch contacts", err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered contacts
  const filteredContacts = contacts.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.address || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const totalContacts = contacts.length;
  const leadContacts = contacts.filter(c => c.status === "Lead").length;
  const activeContacts = contacts.filter(c => c.status === "Active").length;
  const inactiveContacts = contacts.filter(c => c.status === "Inactive").length;

  // Open add modal
  const openAddModal = () => {
    setEditingContactId(null);
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormAddress("");
    setFormSource("");
    setFormNotes("");
    setFormStatus("Active");
    setIsModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (contact: Contact) => {
    setEditingContactId(contact.id);
    setFormName(contact.name);
    setFormEmail(contact.email || "");
    setFormPhone(contact.phone || "");
    setFormAddress(contact.address || "");
    setFormSource(contact.source || "");
    setFormNotes(contact.notes || "");
    setFormStatus(contact.status || "Active");
    setIsModalOpen(true);
  };

  // Save (create or update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingContactId) {
        // PATCH
        await fetch("/api/contacts", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingContactId,
            name: formName,
            email: formEmail,
            phone: formPhone,
            address: formAddress,
            source: formSource,
            notes: formNotes,
            status: formStatus,
          }),
        });
      } else {
        // POST
        await fetch("/api/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName,
            email: formEmail,
            phone: formPhone,
            address: formAddress,
            source: formSource,
            notes: formNotes,
            status: formStatus,
          }),
        });
      }
      fetchContacts();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save contact", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete flow
  const handleDeleteClick = (contact: Contact) => {
    setConfirmModal({ isOpen: true, contact });
  };

  const executeDelete = async () => {
    if (!confirmModal.contact) return;
    const id = confirmModal.contact.id;
    try {
      await fetch(`/api/contacts?id=${id}`, { method: "DELETE" });
      setContacts(contacts.filter(c => c.id !== id));
      setConfirmModal({ isOpen: false, contact: null });
    } catch (err) {
      console.error("Failed to delete contact", err);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleWrapper}>
          <span className={styles.companyName}>TerraCRM</span>
          <span className={styles.divider}>|</span>
          <h1 className={styles.pageTitle}>Clients</h1>
        </div>
        <div className={styles.headerActions}>
          <CyberButton onClick={openAddModal}>Add New Client</CyberButton>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsBar}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Clients</span>
          <span className={styles.statValue}>{totalContacts}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Leads</span>
          <span className={styles.statValue} style={{ color: "var(--color-primary)" }}>{leadContacts}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Active</span>
          <span className={`${styles.statValue} ${styles.active}`}>{activeContacts}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Inactive</span>
          <span className={`${styles.statValue} ${styles.inactive}`}>{inactiveContacts}</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            type="text"
            placeholder="Search clients by name, email, phone..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ minWidth: "160px" }}>
          <NeonSelect
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: "All", label: "All Status" },
              { value: "Lead", label: "Lead" },
              { value: "Active", label: "Active" },
              { value: "Inactive", label: "Inactive" },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <div className={styles.contentArea}>
        {loading ? (
          <div style={{ color: "var(--color-primary)", padding: "2rem", textAlign: "center" }}>Syncing with Database...</div>
        ) : filteredContacts.length === 0 ? (
          <div className={styles.emptyState}>
            <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span>{contacts.length === 0 ? "No clients yet. Add your first client." : "No clients match your search."}</span>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Added</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map(contact => (
                  <tr key={contact.id}>
                    <td>
                      <div className={styles.contactNameCell}>
                        <div className={styles.avatar}>{contact.name.charAt(0).toUpperCase()}</div>
                        <div>
                          <div className={styles.contactName}>{contact.name}</div>
                          <div className={styles.contactId}>{contact.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: contact.email ? "var(--color-text-primary)" : "var(--color-text-tertiary)" }}>
                      {contact.email || "--"}
                    </td>
                    <td>{contact.phone || "--"}</td>
                    <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {contact.address || "--"}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${contact.status === "Active" ? styles.active : contact.status === "Lead" ? styles.lead : styles.inactive}`}>
                        <span className={`${styles.statusDot} ${contact.status === "Active" ? styles.active : contact.status === "Lead" ? styles.lead : styles.inactive}`}></span>
                        {contact.status}
                      </span>
                    </td>
                    <td style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>
                      {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : "--"}
                    </td>
                    <td>
                      <div className={styles.actionBtns}>
                        <button className={styles.iconBtn} onClick={() => openEditModal(contact)} title="Edit Contact">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button className={`${styles.iconBtn} ${styles.deleteBtn}`} onClick={() => handleDeleteClick(contact)} title="Delete Contact">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <GlassModal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={editingContactId ? "Edit Client" : "Add New Client"}
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
              form="contactForm"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : editingContactId ? "Save Changes" : "Add Client"}
            </CyberButton>
          </>
        }
      >
        <form id="contactForm" onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
          <NeonInput
            label="Full Name"
            placeholder="e.g. John Smith"
            required
            value={formName}
            onChange={e => setFormName(e.target.value)}
          />
          <NeonInput
            label="Email Address"
            placeholder="client@example.com"
            type="email"
            value={formEmail}
            onChange={e => setFormEmail(e.target.value)}
          />
          <NeonInput
            label="Phone Number"
            placeholder="+1 555-123-4567"
            value={formPhone}
            onChange={e => setFormPhone(e.target.value)}
          />
          <NeonInput
            label="Address"
            placeholder="123 Main St, City, State"
            value={formAddress}
            onChange={e => setFormAddress(e.target.value)}
          />
          <div style={{ display: "flex", gap: "var(--spacing-md)" }}>
            <div style={{ flex: 1 }}>
              <NeonSelect
                label="Source"
                value={formSource}
                onChange={setFormSource}
                options={[
                  { value: "", label: "None" },
                  { value: "Website", label: "Website" },
                  { value: "Referral", label: "Referral" },
                  { value: "Cold Call", label: "Cold Call" },
                  { value: "Advertisement", label: "Advertisement" },
                ]}
              />
            </div>
            <div style={{ flex: 1 }}>
              <NeonSelect
                label="Status"
                value={formStatus}
                onChange={v => setFormStatus(v as "Lead" | "Active" | "Inactive")}
                options={[
                  { value: "Lead", label: "Lead" },
                  { value: "Active", label: "Active" },
                  { value: "Inactive", label: "Inactive" },
                ]}
              />
            </div>
          </div>
          <NeonInput
            label="Notes"
            placeholder="Additional notes about this client..."
            value={formNotes}
            onChange={e => setFormNotes(e.target.value)}
          />
        </form>
      </GlassModal>

      {/* Delete Confirmation */}
      <GlassModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, contact: null })}
        title="Delete Client"
        footerActions={
          <>
            <CyberButton
              variant="secondary"
              onClick={() => setConfirmModal({ isOpen: false, contact: null })}
            >
              Cancel
            </CyberButton>
            <CyberButton
              onClick={executeDelete}
              style={{ backgroundColor: "rgba(255, 77, 79, 0.2)", color: "#ff4d4f", border: "1px solid #ff4d4f" }}
            >
              Delete
            </CyberButton>
          </>
        }
      >
        <p style={{ color: "var(--color-text-secondary)", lineHeight: "1.5" }}>
          Are you sure you want to delete &quot;{confirmModal.contact?.name}&quot;? This action cannot be undone.
        </p>
      </GlassModal>
    </div>
  );
}
