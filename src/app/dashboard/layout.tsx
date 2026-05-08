"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./layout.module.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/clients", label: "Clients" },
    { href: "/dashboard/jobs", label: "Jobs" },
  ];

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.logo}>
          TerraCRM
        </Link>
        <nav className={styles.nav}>
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <button className={`${styles.navLink} ${styles.logout}`} style={{ textAlign: "left", background: "none", border: "none", cursor: "pointer" }}>
          Log Out
        </button>
      </aside>
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
