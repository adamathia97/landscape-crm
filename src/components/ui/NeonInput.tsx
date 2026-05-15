import React from 'react';
import styles from './NeonInput.module.css';

interface NeonInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const NeonInput = React.forwardRef<HTMLInputElement, NeonInputProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <div className={`${styles.wrapper} ${className}`}>
        {label && <label className={styles.label}>{label}</label>}
        <input 
          ref={ref} 
          className={styles.input} 
          {...props} 
        />
      </div>
    );
  }
);

NeonInput.displayName = 'NeonInput';
