'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Plus, QrCode, Menu } from 'lucide-react';
import styles from './layout.module.css';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Get Page Title from Path
  const getPageTitle = () => {
    if (pathname === '/') return 'Dashboard Overview';
    if (pathname.startsWith('/customers')) return 'Customer Management';
    if (pathname.startsWith('/garments')) return 'Garment Tracking Master';
    if (pathname.startsWith('/jobs')) return 'Laundry Job Cards';
    if (pathname.startsWith('/scan')) return 'QR Scanner & Delivery';
    if (pathname.startsWith('/masters')) return 'System Configuration Masters';
    return 'LaunderERP';
  };

  return (
    <header className={styles.header}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button 
          className={styles.hamburgerBtn} 
          onClick={onToggleSidebar}
          aria-label="Open sidebar"
        >
          <Menu size={24} />
        </button>
        <h1 className={styles.pageTitle}>{getPageTitle()}</h1>
      </div>

      <div className={styles.headerActions}>
        <button 
          onClick={() => router.push('/scan')}
          className={styles.quickActionBtn}
          style={{ background: 'transparent', border: '1px solid var(--border-color)', boxShadow: 'none' }}
        >
          <QrCode size={16} />
          <span className={styles.hideOnMobile}>Quick Scan</span>
        </button>

        <button 
          onClick={() => router.push('/jobs')}
          className={styles.quickActionBtn}
        >
          <Plus size={16} />
          <span className={styles.hideOnMobile}>Create New Job</span>
        </button>
      </div>
    </header>
  );
}
