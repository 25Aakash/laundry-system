'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Shirt, ClipboardList, QrCode, Settings, WashingMachine, X } from 'lucide-react';
import styles from './layout.module.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Customer Master', path: '/customers', icon: Users },
    { name: 'Garment Master', path: '/garments', icon: Shirt },
    { name: 'Job Card', path: '/jobs', icon: ClipboardList },
    { name: 'QR Scan / Delivery', path: '/scan', icon: QrCode },
    { name: 'System Masters', path: '/masters', icon: Settings },
  ];

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarActive : ''}`}>
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div className={styles.logoArea} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <WashingMachine className={styles.logoIcon} size={28} />
            <span className={styles.logoText}>LaunderERP</span>
          </div>
          <button 
            className={styles.sidebarCloseBtn} 
            onClick={onClose} 
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
