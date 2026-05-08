"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import globalStyles from "../../page.module.css";

type Client = {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: string;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    countryCode: "+1",
    phone: "",
    status: "Active"
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      if (data.clients) setClients(data.clients);
    } catch (err) {
      console.error("Failed to fetch clients", err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedClientId(null);
    setFormData({ name: "", address: "", countryCode: "+1", phone: "", status: "Active" });
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setModalMode("edit");
    setSelectedClientId(client.id);
    // Simple split for phone number if it has a country code, else default to +1
    let cCode = "+1";
    let pNum = client.phone;
    if (client.phone.includes(" ")) {
      const parts = client.phone.split(" ");
      cCode = parts[0];
      pNum = parts.slice(1).join(" ");
    }
    
    setFormData({
      name: client.name,
      address: client.address,
      countryCode: cCode,
      phone: pNum,
      status: client.status
    });
    setIsModalOpen(true);
  };

  const handleSaveClient = async () => {
    if (!formData.name) return;

    const fullPhone = `${formData.countryCode} ${formData.phone}`;

    try {
      if (modalMode === "create") {
        const res = await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            address: formData.address,
            phone: fullPhone,
            status: formData.status
          }),
        });
        const data = await res.json();
        if (data.client) {
          setClients([...clients, data.client]);
        }
      } else if (modalMode === "edit" && selectedClientId) {
        const res = await fetch("/api/clients", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedClientId,
            name: formData.name,
            address: formData.address,
            phone: fullPhone,
            status: formData.status
          }),
        });
        const data = await res.json();
        if (data.client) {
          setClients(clients.map(c => c.id === selectedClientId ? data.client : c));
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save client", err);
    }
  };

  return (
    <div>
      {isModalOpen && (
        <div className={globalStyles.modalOverlay}>
          <div className={globalStyles.modalContent}>
            <h2 className={globalStyles.modalTitle}>
              {modalMode === "create" ? "Add New Client" : "Edit Client"}
            </h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
              <div>
                <label style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>Client Name</label>
                <input 
                  type="text" 
                  className={globalStyles.modalInput}
                  placeholder="Enter client name..."
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{ marginBottom: 0, marginTop: "4px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>Address</label>
                <input 
                  type="text" 
                  className={globalStyles.modalInput}
                  placeholder="123 Main St..."
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  style={{ marginBottom: 0, marginTop: "4px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>Phone Number</label>
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <select 
                    className={globalStyles.modalInput}
                    style={{ width: "115px", marginBottom: 0, padding: "var(--spacing-sm) 4px" }}
                    value={formData.countryCode}
                    onChange={(e) => setFormData({...formData, countryCode: e.target.value})}
                  >
                    <option value="+1">+1 (US/CA)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+61">+61 (AU)</option>
                    <option value="+91">+91 (IN)</option>
                  </select>
                  <input 
                    type="text" 
                    className={globalStyles.modalInput}
                    placeholder="555-0100"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    style={{ marginBottom: 0, flex: 1 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>Status</label>
                <select 
                  className={globalStyles.modalInput}
                  style={{ marginBottom: 0, marginTop: "4px" }}
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Lead">Lead</option>
                </select>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", marginTop: "4px" }}>
                  Active clients are currently receiving services. Inactive clients are past customers. Leads are prospective clients.
                </p>
              </div>
            </div>

            <div className={globalStyles.modalActions} style={{ marginTop: "var(--spacing-xl)" }}>
              <button className={globalStyles.modalBtnCancel} onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button className={globalStyles.button} style={{padding: "var(--spacing-sm) var(--spacing-md)"}} onClick={handleSaveClient}>
                {modalMode === "create" ? "Save Client" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.header}>
        <h1 className={styles.title}>Client Database</h1>
        <button className={globalStyles.button} onClick={openCreateModal}>
          + Add Client
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>ID</th>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Address</th>
              <th className={styles.th}>Phone</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className={styles.td} style={{textAlign: "center"}}>Loading data from AWS...</td></tr>
            ) : clients.length === 0 ? (
              <tr><td colSpan={6} className={styles.td} style={{textAlign: "center"}}>No clients found. Click Add Client to create one.</td></tr>
            ) : clients.map((client) => (
              <tr key={client.id} className={styles.tr}>
                <td className={styles.td} style={{ color: "var(--color-text-tertiary)" }}>{client.id}</td>
                <td className={styles.td} style={{ fontWeight: 600 }}>{client.name}</td>
                <td className={styles.td}>{client.address}</td>
                <td className={styles.td}>{client.phone}</td>
                <td className={styles.td}>
                  <span style={{ 
                    color: client.status === "Active" ? "var(--color-success)" : 
                           client.status === "Lead" ? "var(--color-primary)" : "var(--color-text-tertiary)",
                  }}>
                    {client.status}
                  </span>
                </td>
                <td className={styles.td}>
                  <button className={styles.actionBtn} onClick={() => openEditModal(client)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
