'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './layout.module.css';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile sidebar drawer automatically on navigation
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className={styles.container}>
      {/* Visual background elements */}
      <div className={styles.orb1} />
      <div className={styles.orb2} />

      {/* Backdrop overlay for mobile sidebar drawer */}
      <div 
        className={`${styles.backdrop} ${isSidebarOpen ? styles.backdropActive : ''}`} 
        onClick={() => setIsSidebarOpen(false)} 
      />

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className={styles.mainContent}>
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className={styles.contentBody}>
          {children}
        </main>
      </div>
    </div>
  );
}
