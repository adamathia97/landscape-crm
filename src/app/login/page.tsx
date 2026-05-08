"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { signIn, signUp, confirmSignUp, forgotPassword, confirmForgotPassword } from "@/lib/auth";

type AuthMode = "login" | "signup" | "confirm" | "forgot" | "resetCode";

// Eye icon SVGs
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [mode, setMode] = useState<AuthMode>("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await forgotPassword(email);
      setMode("resetCode");
      setError("");
    } catch (err: any) {
      if (err.code === "UserNotFoundException") {
        setError("No account found with this email.");
      } else if (err.code === "LimitExceededException") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError(err.message || "Failed to send reset code.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      await confirmForgotPassword(email, verificationCode, newPassword);
      // Auto-login with new password
      await signIn(email, newPassword);
      router.push("/dashboard");
    } catch (err: any) {
      if (err.code === "CodeMismatchException") {
        setError("Invalid verification code.");
      } else if (err.code === "InvalidPasswordException") {
        setError("Password must have at least 8 characters, 1 uppercase letter, and 1 number.");
      } else {
        setError(err.message || "Password reset failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const PasswordInput = ({ id, value, onChange, placeholder, show, onToggle }: {
    id: string; value: string; onChange: (v: string) => void; placeholder: string; show: boolean; onToggle: () => void;
  }) => (
    <div className={styles.passwordWrapper}>
      <input
        id={id}
        type={show ? "text" : "password"}
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
      <button type="button" className={styles.eyeButton} onClick={onToggle} tabIndex={-1}>
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={`glass-surface ${styles.authCard}`}>
        <div>
          <div style={{ textAlign: "center", marginBottom: "var(--spacing-sm)" }}>
            <img src="/logo.png" alt="TerraCRM" style={{ width: "48px", height: "48px", borderRadius: "8px", boxShadow: "0 0 15px rgba(0, 217, 230, 0.4)" }} />
          </div>
          <h1 className={styles.title}>
            {mode === "login" && "SIGN IN"}
            {mode === "signup" && "CREATE ACCOUNT"}
            {mode === "confirm" && "VERIFY EMAIL"}
            {mode === "forgot" && "RESET PASSWORD"}
            {mode === "resetCode" && "NEW PASSWORD"}
          </h1>
          <p className={styles.subtitle}>
            {mode === "login" && "Sign in to manage your business"}
            {mode === "signup" && "Set up your TerraCRM account"}
            {mode === "confirm" && "Enter the verification code sent to your email"}
            {mode === "forgot" && "Enter your email to receive a reset code"}
            {mode === "resetCode" && "Enter the code and your new password"}
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
              <label className={styles.label} htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="password">Password</label>
              <PasswordInput
                id="password"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                show={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
              />
            </div>

            <div style={{ textAlign: "right", marginTop: "-4px" }}>
              <button type="button" className={styles.link} style={{ fontSize: "0.8rem" }} onClick={() => { setMode("forgot"); setError(""); }}>
                Forgot Password?
              </button>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <div className={styles.footer}>
              Don&apos;t have an account? <button type="button" className={styles.link} onClick={() => { setMode("signup"); setError(""); }}>
                Sign Up
              </button>
            </div>
          </form>
        )}

        {/* SIGNUP FORM */}
        {mode === "signup" && (
          <form className={styles.form} onSubmit={handleSignUp}>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                className={styles.input}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="signup-password">Password</label>
              <PasswordInput
                id="signup-password"
                value={password}
                onChange={setPassword}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                show={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="confirm-password">Confirm Password</label>
              <PasswordInput
                id="confirm-password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="••••••••"
                show={showConfirmPassword}
                onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <div className={styles.footer}>
              Already have an account? <button type="button" className={styles.link} onClick={() => { setMode("login"); setError(""); }}>
                Sign In
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
              {loading ? "Verifying..." : "Confirm & Sign In"}
            </button>

            <div className={styles.footer}>
              <button type="button" className={styles.link} onClick={() => { setMode("login"); setError(""); }}>
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {mode === "forgot" && (
          <form className={styles.form} onSubmit={handleForgotPassword}>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="forgot-email">Email</label>
              <input
                id="forgot-email"
                type="email"
                className={styles.input}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Sending Code..." : "Send Reset Code"}
            </button>

            <div className={styles.footer}>
              <button type="button" className={styles.link} onClick={() => { setMode("login"); setError(""); }}>
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* RESET PASSWORD WITH CODE */}
        {mode === "resetCode" && (
          <form className={styles.form} onSubmit={handleResetPassword}>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="reset-code">Reset Code</label>
              <input
                id="reset-code"
                type="text"
                className={styles.input}
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="new-password">New Password</label>
              <PasswordInput
                id="new-password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                show={showNewPassword}
                onToggle={() => setShowNewPassword(!showNewPassword)}
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Resetting..." : "Reset & Sign In"}
            </button>

            <div className={styles.footer}>
              <button type="button" className={styles.link} onClick={() => { setMode("login"); setError(""); }}>
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {mode === "login" && (
          <div className={styles.footer}>
            <Link href="/" className={styles.link}>← Back to Home</Link>
          </div>
        )}
      </div>
    </div>
  );
}
