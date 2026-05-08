"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { signIn, signUp, confirmSignUp } from "@/lib/auth";

type AuthMode = "login" | "signup" | "confirm";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [mode, setMode] = useState<AuthMode>("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      if (err.code === "UserNotConfirmedException") {
        setError("Please verify your email first. Check your inbox for a code.");
        setMode("confirm");
      } else if (err.code === "NotAuthorizedException") {
        setError("Incorrect email or password.");
      } else if (err.code === "UserNotFoundException") {
        setError("No account found with this email.");
      } else {
        setError(err.message || "Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password);
      setMode("confirm");
      setError("");
    } catch (err: any) {
      if (err.code === "UsernameExistsException") {
        setError("An account with this email already exists.");
      } else {
        setError(err.message || "Sign up failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await confirmSignUp(email, verificationCode);
      // Auto-login after confirming
      await signIn(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      if (err.code === "CodeMismatchException") {
        setError("Invalid verification code. Please try again.");
      } else {
        setError(err.message || "Verification failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={`glass-surface ${styles.authCard}`}>
        <div>
          <div style={{ textAlign: "center", marginBottom: "var(--spacing-sm)" }}>
            <img src="/logo.png" alt="TerraCRM" style={{ width: "48px", height: "48px", borderRadius: "8px", boxShadow: "0 0 15px rgba(0, 217, 230, 0.4)" }} />
          </div>
          <h1 className={styles.title}>
            {mode === "login" && "ACCESS TERMINAL"}
            {mode === "signup" && "CREATE ACCOUNT"}
            {mode === "confirm" && "VERIFY EMAIL"}
          </h1>
          <p className={styles.subtitle}>
            {mode === "login" && "Enter credentials to access TerraCRM"}
            {mode === "signup" && "Register a new operator account"}
            {mode === "confirm" && "Enter the verification code sent to your email"}
          </p>
        </div>

        {error && (
          <div className={styles.errorBox}>
            {error}
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === "login" && (
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

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Authenticating..." : "Initialize Connection"}
            </button>

            <div className={styles.footer}>
              No account? <button type="button" className={styles.link} onClick={() => { setMode("signup"); setError(""); }}>
                Register New Operator
              </button>
            </div>
          </form>
        )}

        {/* SIGNUP FORM */}
        {mode === "signup" && (
          <form className={styles.form} onSubmit={handleSignUp}>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="signup-email">Operator Email</label>
              <input
                id="signup-email"
                type="email"
                className={styles.input}
                placeholder="user@terracrm.sys"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="signup-password">Create Passcode</label>
              <input
                id="signup-password"
                type="password"
                className={styles.input}
                placeholder="Min 8 characters, 1 uppercase, 1 number"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="confirm-password">Confirm Passcode</label>
              <input
                id="confirm-password"
                type="password"
                className={styles.input}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Creating Account..." : "Register Operator"}
            </button>

            <div className={styles.footer}>
              Already registered? <button type="button" className={styles.link} onClick={() => { setMode("login"); setError(""); }}>
                Access Terminal
              </button>
            </div>
          </form>
        )}

        {/* VERIFICATION FORM */}
        {mode === "confirm" && (
          <form className={styles.form} onSubmit={handleConfirm}>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="code">Verification Code</label>
              <input
                id="code"
                type="text"
                className={styles.input}
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                autoFocus
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Verifying..." : "Confirm & Access"}
            </button>

            <div className={styles.footer}>
              <button type="button" className={styles.link} onClick={() => { setMode("login"); setError(""); }}>
                Back to Login
              </button>
            </div>
          </form>
        )}

        {mode === "login" && (
          <div className={styles.footer}>
            Authorization required. <Link href="/" className={styles.link}>Return to Public Net</Link>
          </div>
        )}
      </div>
    </div>
  );
}
