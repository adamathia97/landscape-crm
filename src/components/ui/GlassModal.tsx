import React from 'react';
import styles from './GlassModal.module.css';

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  footerActions?: React.ReactNode;
}

export function GlassModal({
  isOpen,
  onClose,
  title,
  children,
  headerActions,
  footerActions
}: GlassModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <div className={styles.headerActions}>
            {headerActions}
          </div>
        </div>
        
        <div className={styles.modalBody}>
          {children}
        </div>
        
        {footerActions && (
          <div className={styles.modalFooter}>
            {footerActions}
          </div>
        )}
      </div>
    </div>
  );
}
