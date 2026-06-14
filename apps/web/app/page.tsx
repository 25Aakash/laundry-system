'use client';

import { useState } from 'react';
import { useMockStore, Job, Customer, Garment } from '../contexts/MockStoreContext';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  Users, 
  Plus, 
  QrCode, 
  Shirt, 
  Settings, 
  ArrowRight, 
  TrendingUp,
  Search,
  X,
  FileText,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Modal from '../components/ui/Modal';
import styles from '../components/ui/ui.module.css';

export default function DashboardPage() {
  const { jobs, customers, garments, categories, services, defects } = useMockStore();
  const router = useRouter();

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // --- Unified Global Search States ---
  const [globalSearch, setGlobalSearch] = useState('');
  
  // Results structures
  const getSearchResults = () => {
    const query = globalSearch.trim().toLowerCase();
    if (query === '') return { foundCustomers: [], foundGarments: [], foundJobs: [] };

    const foundCustomers = customers.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.mobile.includes(query)
    ).slice(0, 3);

    const foundGarments = garments.filter(g => {
      const cat = categories.find(c => c.id === g.categoryId);
      return (
        g.qrCode.toLowerCase().includes(query) ||
        g.brand.toLowerCase().includes(query) ||
        (cat && cat.name.toLowerCase().includes(query))
      );
    }).slice(0, 3);

    const foundJobs = jobs.filter(j => 
      j.jobNumber.includes(query) || 
      j.status.toLowerCase().includes(query)
    ).slice(0, 3);

    return { foundCustomers, foundGarments, foundJobs };
  };

  const { foundCustomers, foundGarments, foundJobs } = getSearchResults();
  const showSearchResults = globalSearch.trim() !== '';

  // --- Calculate Statistics ---
  const activeJobs = jobs.filter(j => j.status !== 'Delivered');
  const inProcessCount = jobs.filter(j => j.status === 'In Process').length;
  const readyCount = jobs.filter(j => j.status === 'Ready').length;
  const receivedCount = jobs.filter(j => j.status === 'Received').length;
  const customerCount = customers.length;
  const garmentCount = garments.length;

  // Recent jobs
  const recentJobs = [...jobs].sort((a, b) => 
    new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
  ).slice(0, 5);

  // Garment Category Stats calculation for progress bars
  const getCategoryStats = () => {
    const counts: Record<string, number> = {};
    garments.forEach(g => {
      counts[g.categoryId] = (counts[g.categoryId] || 0) + 1;
    });

    return categories.map(cat => {
      const count = counts[cat.id] || 0;
      const pct = garmentCount > 0 ? Math.round((count / garmentCount) * 100) : 0;
      return {
        name: cat.name,
        count,
        percentage: pct,
      };
    }).sort((a, b) => b.count - a.count).slice(0, 4);
  };

  const categoryStats = getCategoryStats();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Welcome Banner */}
      <div className={`glass-panel ${styles.welcomeBanner}`}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
            Welcome back, Alex! 👋
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.95rem' }}>
            LaunderERP Store Front is active. You have <b>{readyCount} jobs</b> ready for delivery.
          </p>
        </div>

        {/* UNIFIED GLOBAL SEARCH BAR */}
        <div className={styles.welcomeBannerSearch}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search clients, tag QR, job card..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className={styles.input}
              style={{ paddingLeft: '38px', paddingRight: '36px', boxShadow: 'var(--shadow-sm)' }}
            />
            {showSearchResults && (
              <button 
                onClick={() => setGlobalSearch('')}
                style={{ position: 'absolute', right: '12px', top: '12px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Floating Global Search Results Overlay */}
          {showSearchResults && (
            <div 
              className="glass-panel"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: '0',
                right: '0',
                maxHeight: '400px',
                overflowY: 'auto',
                zIndex: '50',
                border: '1px solid rgba(15,23,42,0.15)',
                background: '#ffffff',
                padding: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              {/* Group A: Customers */}
              <div>
                <span className={styles.label} style={{ fontSize: '0.65rem', paddingLeft: '0.5rem', color: 'var(--primary)' }}>Customers</span>
                {foundCustomers.length > 0 ? (
                  foundCustomers.map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => { router.push(`/customers`); setGlobalSearch(''); }}
                      className="interactive" 
                      style={{ padding: '0.4rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <span style={{ fontWeight: 600 }}>{c.name}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{c.mobile}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '0.5rem' }}>No matching clients</div>
                )}
              </div>

              {/* Group B: Garments */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                <span className={styles.label} style={{ fontSize: '0.65rem', paddingLeft: '0.5rem', color: '#10b981' }}>Garments (QR Codes)</span>
                {foundGarments.length > 0 ? (
                  foundGarments.map(g => (
                    <div 
                      key={g.id} 
                      onClick={() => { router.push(`/garments`); setGlobalSearch(''); }}
                      className="interactive" 
                      style={{ padding: '0.4rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{g.qrCode}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{g.brand} {categories.find(cat => cat.id === g.categoryId)?.name}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '0.5rem' }}>No matching garments</div>
                )}
              </div>

              {/* Group C: Jobs */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                <span className={styles.label} style={{ fontSize: '0.65rem', paddingLeft: '0.5rem', color: 'var(--warning)' }}>Laundry Jobs</span>
                {foundJobs.length > 0 ? (
                  foundJobs.map(job => (
                    <div 
                      key={job.id} 
                      onClick={() => { setSelectedJob(job); setGlobalSearch(''); }}
                      className="interactive" 
                      style={{ padding: '0.4rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <span style={{ fontWeight: 600 }}>Job #{job.jobNumber}</span>
                      <span className={`${styles.badge} ${job.status === 'Ready' ? styles.badgeReady : styles.badgeReceived}`} style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem' }}>
                        {job.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '0.5rem' }}>No matching job cards</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPI Counters Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        
        {/* KPI: Active Jobs */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--info-glow)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{activeJobs.length}</h4>
            <span className={styles.label}>Active Job Orders</span>
          </div>
        </div>

        {/* KPI: In Process */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--warning-glow)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{inProcessCount}</h4>
            <span className={styles.label}>In Processing</span>
          </div>
        </div>

        {/* KPI: Ready for Delivery */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{readyCount}</h4>
            <span className={styles.label}>Ready for Pickup</span>
          </div>
        </div>

        {/* KPI: Customers */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--success-glow)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{customerCount}</h4>
            <span className={styles.label}>Active Customers</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Recent Activity & Quick Controls */}
      <div className={styles.layoutRightFixed}>
        
        {/* Left Panel: Recent Job Cards */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 className={styles.cardTitle}>Recent Job Cards</h3>
            <button 
              onClick={() => router.push('/jobs')} 
              className={styles.btnSecondary}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', gap: '0.25rem', display: 'flex', alignItems: 'center' }}
            >
              <span>View All</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Customer</th>
                  <th>Garments</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.map(job => {
                  const cust = customers.find(c => c.id === job.customerId);
                  return (
                    <tr key={job.id}>
                      <td style={{ fontWeight: 700 }}>#{job.jobNumber}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{cust?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{cust?.mobile}</div>
                      </td>
                      <td>{job.items.length} items</td>
                      <td>
                        <span className={`${styles.badge} ${
                          job.status === 'Received' ? styles.badgeReceived :
                          job.status === 'In Process' ? styles.badgeInProcess :
                          job.status === 'Ready' ? styles.badgeReady : styles.badgeDelivered
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedJob(job)}
                          className={styles.btnSecondary}
                          style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel: Operations & Progress Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Quick Actions Control Center */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 className={styles.cardTitle}>Control Center</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button 
                onClick={() => router.push('/jobs')}
                className="glass-panel interactive"
                style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)', background: '#ffffff', boxShadow: 'var(--shadow-sm)' }}
              >
                <Plus size={20} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Intake Job</span>
              </button>

              <button 
                onClick={() => router.push('/scan')}
                className="glass-panel interactive"
                style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)', background: '#ffffff', boxShadow: 'var(--shadow-sm)' }}
              >
                <QrCode size={20} style={{ color: 'var(--info)' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>QR Delivery</span>
              </button>

              <button 
                onClick={() => router.push('/garments')}
                className="glass-panel interactive"
                style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)', background: '#ffffff', boxShadow: 'var(--shadow-sm)' }}
              >
                <Shirt size={20} style={{ color: '#10b981' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Register Item</span>
              </button>

              <button 
                onClick={() => router.push('/masters')}
                className="glass-panel interactive"
                style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)', background: '#ffffff', boxShadow: 'var(--shadow-sm)' }}
              >
                <Settings size={20} style={{ color: 'var(--warning)' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Masters</span>
              </button>
            </div>
          </div>

          {/* Garments by Category Metrics list */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={16} style={{ color: 'var(--primary)' }} />
              <span>Garment Distribution</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {categoryStats.map(stat => (
                <div key={stat.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{stat.name}</span>
                    <span>{stat.count} items ({stat.percentage}%)</span>
                  </div>
                  
                  {/* Custom progress bar */}
                  <div style={{ width: '100%', height: '6px', background: 'rgba(15,23,42,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${stat.percentage}%`, 
                        height: '100%', 
                        background: 'linear-gradient(90deg, var(--primary) 0%, var(--info) 100%)',
                        borderRadius: '3px' 
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Job Detail Dialog Modal */}
      <Modal
        isOpen={selectedJob !== null}
        onClose={() => setSelectedJob(null)}
        title={selectedJob ? `Job Card Details #${selectedJob.jobNumber}` : ''}
        size="large"
      >
        {selectedJob && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className={styles.modalHeaderGrid}>
              <div>
                <span className={styles.label}>Intake Date</span>
                <div style={{ fontWeight: 600 }}>{new Date(selectedJob.createdDate).toLocaleString()}</div>
              </div>
              <div>
                <span className={styles.label}>Customer</span>
                <div style={{ fontWeight: 600 }}>
                  {customers.find(c => c.id === selectedJob.customerId)?.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {customers.find(c => c.id === selectedJob.customerId)?.mobile}
                </div>
              </div>
              <div>
                <span className={styles.label}>Current Status</span>
                <div>
                  <span className={`${styles.badge} ${
                    selectedJob.status === 'Received' ? styles.badgeReceived :
                    selectedJob.status === 'In Process' ? styles.badgeInProcess :
                    selectedJob.status === 'Ready' ? styles.badgeReady : styles.badgeDelivered
                  }`}>
                    {selectedJob.status}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className={styles.cardTitle} style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Job Garments</h4>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Garment ID</th>
                      <th>Category</th>
                      <th>Brand</th>
                      <th>Service Required</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedJob.items.map(item => {
                      const g = garments.find(gar => gar.id === item.garmentId);
                      const cat = categories.find(c => c.id === g?.categoryId);
                      const srv = services.find(s => s.id === item.serviceId);
                      return (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{g?.qrCode}</td>
                          <td>{cat?.name}</td>
                          <td>{g?.brand}</td>
                          <td>
                            <span style={{ fontWeight: 600 }}>{srv?.name}</span>
                          </td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{item.remarks || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedJob.remarks && (
              <div style={{ background: 'rgba(15,23,42,0.01)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span className={styles.label}>General Remarks</span>
                <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{selectedJob.remarks}</p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <button onClick={() => setSelectedJob(null)} className={styles.btnSecondary}>Close</button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
