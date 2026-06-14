'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import styles from './ui.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  size?: 'default' | 'large';
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  actions,
  size = 'default',
}: ModalProps) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.dialogBackdrop} onClick={onClose}>
      <div 
        className={`${styles.dialog} ${size === 'large' ? styles.dialogLarge : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle}>{title}</h2>
          <button className={styles.dialogCloseBtn} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className={styles.dialogBody}>
          {children}
        </div>

        {actions && (
          <div className={styles.dialogActions}>
            {actions}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
