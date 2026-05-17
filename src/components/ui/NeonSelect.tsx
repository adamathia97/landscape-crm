"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./NeonSelect.module.css";

type NeonSelectOption = {
  value: string;
  label: string;
};

type NeonSelectProps = {
  label?: string;
  options: NeonSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function NeonSelect({ label, options, value, onChange, placeholder }: NeonSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.container} ref={containerRef}>
      {label && <label className={styles.label}>{label}</label>}
      <div style={{ position: "relative" }}>
        <button
          type="button"
          className={`${styles.trigger} ${isOpen ? styles.open : ""}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedOption ? (
            selectedOption.label
          ) : (
            <span className={styles.placeholder}>{placeholder || "Select..."}</span>
          )}
        </button>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.open : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
        {isOpen && (
          <div className={styles.dropdown}>
            {options.map(opt => (
              <div
                key={opt.value}
                className={`${styles.option} ${opt.value === value ? styles.selected : ""}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
                {opt.value === value && (
                  <svg className={styles.checkmark} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
