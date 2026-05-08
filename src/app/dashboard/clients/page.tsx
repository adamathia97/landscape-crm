import styles from "./page.module.css";
import globalStyles from "../../page.module.css";

const MOCK_CLIENTS = [
  { id: "C-001", name: "The Smiths", address: "123 Elm St", phone: "555-0101", status: "Active" },
  { id: "C-002", name: "Oakhaven Estates", address: "450 Oak Ave", phone: "555-0102", status: "Active" },
  { id: "C-003", name: "Johnson Residence", address: "789 Pine Rd", phone: "555-0103", status: "Inactive" },
];

export default function ClientsPage() {
  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Client Database</h1>
        <button className={globalStyles.button}>
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
            {MOCK_CLIENTS.map((client) => (
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
