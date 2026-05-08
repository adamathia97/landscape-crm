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

  const handleAddClient = async () => {
    const name = prompt("Enter Client Name:");
    if (!name) return;

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          address: "New Address",
          phone: "555-0000",
          status: "Active"
        }),
      });
      const data = await res.json();
      if (data.client) {
        setClients([...clients, data.client]);
      }
    } catch (err) {
      console.error("Failed to add client", err);
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Client Database</h1>
        <button className={globalStyles.button} onClick={handleAddClient}>
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
                    color: client.status === "Active" ? "var(--color-success)" : "var(--color-text-tertiary)",
                    textShadow: client.status === "Active" ? "0 0 5px rgba(32, 216, 102, 0.3)" : "none"
                  }}>
                    {client.status}
                  </span>
                </td>
                <td className={styles.td}>
                  <button className={styles.actionBtn}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
