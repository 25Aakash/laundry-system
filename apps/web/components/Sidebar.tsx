'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Shirt, ClipboardList, QrCode, Settings, WashingMachine } from 'lucide-react';
import styles from './layout.module.css';

export default function Sidebar() {
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
    <aside className={styles.sidebar}>
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div className={styles.logoArea}>
          <WashingMachine className={styles.logoIcon} size={28} />
          <span className={styles.logoText}>LaunderERP</span>
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
