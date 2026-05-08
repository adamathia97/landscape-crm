"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    router.push("/dashboard");
  };

  return (
    <div className={styles.container}>
      <div className={`glass-surface ${styles.authCard}`}>
        <div>
          <h1 className={styles.title}>ACCESS TERMINAL</h1>
          <p className={styles.subtitle}>Enter credentials to access TerraCRM</p>
        </div>

        <form className={styles.form} onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="email">Operator ID / Email</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="user@terracrm.sys"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="password">Passcode</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn}>
            Initialize Connection
          </button>
        </form>

        <div className={styles.footer}>
          Authorization required. <Link href="/" className={styles.link}>Return to Public Net</Link>
        </div>
      </div>
    </div>
  );
}
