"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "./layout.module.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/clients", label: "Clients" },
    { href: "/dashboard/jobs", label: "Jobs" },
  ];

  return (
    <div className={styles.layout}>
      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        <Link href="/" className={styles.logo} style={{ marginBottom: 0 }}>
          <img src="/logo.png" alt="Logo" className={styles.logoImg} />
          TerraCRM
        </Link>
        <button 
          className={styles.menuButton} 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ""}`}>
        <Link href="/" className={styles.logo}>
          <img src="/logo.png" alt="Logo" className={styles.logoImg} />
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
                onClick={() => setIsMobileMenuOpen(false)}
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

      {/* Main Content & Footer */}
      <main className={styles.mainContent}>
        {children}
        <footer className={styles.footer}>
          <p>© {new Date().getFullYear()} TerraCRM. Built for Landscaping Businesses.</p>
        </footer>
      </main>
    </div>
  );
}
