import Sidebar from './Sidebar';
import Header from './Header';
import styles from './layout.module.css';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      {/* Visual background elements */}
      <div className={styles.orb1} />
      <div className={styles.orb2} />

      <Sidebar />

      <div className={styles.mainContent}>
        <Header />
        <main className={styles.contentBody}>
          {children}
        </main>
      </div>
    </div>
  );
}
