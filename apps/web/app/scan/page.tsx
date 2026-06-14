'use client';

import { useState, useEffect } from 'react';
import { useMockStore, Garment, Customer, Job } from '../../contexts/MockStoreContext';
import { QrCode, Search, Check, Sparkles, AlertTriangle, ArrowRight, User, Shirt, ShoppingBag, Plus } from 'lucide-react';
import styles from '../../components/ui/ui.module.css';

export default function ScanPage() {
  const { garments, customers, jobs, services, categories, defects, updateJobStatus } = useMockStore();

  const [qrValue, setQrValue] = useState('');
  const [scannedGarment, setScannedGarment] = useState<Garment | null>(null);
  const [scannedCustomer, setScannedCustomer] = useState<Customer | null>(null);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Simulated Camera States
  const [isScanningCamera, setIsScanningCamera] = useState(false);
  const [cameraOutput, setCameraOutput] = useState('');

  // Handle scanned value processing
  const processQrCode = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const g = garments.find(gar => gar.id === cleanCode || gar.qrCode === cleanCode);
    
    if (g) {
      setScannedGarment(g);
      const owner = customers.find(c => c.id === g.customerId);
      setScannedCustomer(owner || null);

      // Find the latest job for this garment that is not delivered, or the most recent job
      const garmentJobs = jobs.filter(j => 
        j.items.some(item => item.garmentId === g.id)
      );

      // Prefer non-delivered jobs
      const active = garmentJobs.find(j => j.status !== 'Delivered') || garmentJobs[0];
      setActiveJob(active || null);
      setSuccessMsg('');
    } else {
      setScannedGarment(null);
      setScannedCustomer(null);
      setActiveJob(null);
      alert(`Garment tag "${cleanCode}" not found in database. Make sure it is registered.`);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrValue) return;
    processQrCode(qrValue);
  };

  // Perform Simulated Delivery Action
  const handleDeliver = () => {
    if (!activeJob) return;
    updateJobStatus(activeJob.id, 'Delivered');
    
    // Refresh local active job state
    setActiveJob(prev => prev ? { ...prev, status: 'Delivered' } : null);
    setSuccessMsg(`Garment ${scannedGarment?.qrCode} successfully marked as DELIVERED!`);
  };

  return (
    <div className={styles.layoutScan}>
      
      {/* Left Column: QR Scan Area (Simulated Camera Scanner & Quick Preset Clicks) */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div>
          <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <QrCode size={18} style={{ color: 'var(--primary)' }} />
            <span>Garment QR Scanner</span>
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Point camera at the garment QR tag or select a simulator tag.
          </p>
        </div>

        {/* Video Camera Viewfinder Mock */}
        <div 
          style={{
            width: '100%',
            height: '240px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            background: 'linear-gradient(135deg, rgba(8, 11, 17, 0.9) 0%, rgba(13, 18, 31, 0.9) 100%)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Scan Reticle Overlay */}
          <div 
            style={{
              width: '180px',
              height: '180px',
              border: '2px dashed rgba(99, 102, 241, 0.4)',
              borderRadius: 'var(--radius-md)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.1)',
            }}
          >
            {/* Scan Laser Animation */}
            <div 
              style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                height: '2px',
                background: 'linear-gradient(90deg, transparent 10%, var(--primary) 50%, transparent 90%)',
                animation: 'scanLaser 2s linear infinite',
                boxShadow: '0 0 8px var(--primary)',
              }}
            />
            <QrCode size={48} style={{ color: 'rgba(99, 102, 241, 0.3)' }} />
          </div>

          {/* Camera Scan corners */}
          <div style={{ position: 'absolute', top: '20px', left: '20px', borderTop: '3px solid var(--primary)', borderLeft: '3px solid var(--primary)', width: '20px', height: '20px' }} />
          <div style={{ position: 'absolute', top: '20px', right: '20px', borderTop: '3px solid var(--primary)', borderRight: '3px solid var(--primary)', width: '20px', height: '20px' }} />
          <div style={{ position: 'absolute', bottom: '20px', left: '20px', borderBottom: '3px solid var(--primary)', borderLeft: '3px solid var(--primary)', width: '20px', height: '20px' }} />
          <div style={{ position: 'absolute', bottom: '20px', right: '20px', borderBottom: '3px solid var(--primary)', borderRight: '3px solid var(--primary)', width: '20px', height: '20px' }} />
        </div>

        {/* Quick Simulator Picker */}
        <div>
          <span className={styles.label}>Scan Simulation Presets</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.35rem' }}>
            {garments.map((g, idx) => (
              <button
                key={g.id}
                onClick={() => {
                  setQrValue(g.qrCode);
                  processQrCode(g.qrCode);
                }}
                className={styles.btnSecondary}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.4rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'center',
                }}
              >
                Scan #{idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Manual search input */}
        <form onSubmit={handleManualSearch} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Or Manual Tag Search</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="e.g. LM-000001"
                value={qrValue}
                onChange={(e) => setQrValue(e.target.value)}
                className={styles.input}
              />
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ padding: '0.5rem 1rem' }}>
                <Search size={16} />
              </button>
            </div>
          </div>
        </form>

      </div>

      {/* Right Column: Scanned Results & Delivery Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {successMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--success-glow)', color: 'var(--success)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <Sparkles size={24} />
            <div>
              <h4 style={{ fontWeight: 700 }}>Success!</h4>
              <p style={{ fontSize: '0.85rem', marginTop: '0.1rem' }}>{successMsg}</p>
            </div>
          </div>
        )}

        {scannedGarment && scannedCustomer ? (
          <>
            {/* Scanned Garment Overview */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <span className={styles.label} style={{ color: 'var(--primary)' }}>Scan Result Found</span>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>{scannedGarment.brand} {categories.find(c => c.id === scannedGarment.categoryId)?.name}</span>
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>({scannedGarment.qrCode})</span>
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <User size={18} style={{ color: 'var(--primary)', marginTop: '2px' }} />
                  <div>
                    <div className={styles.label}>Customer Details</div>
                    <div style={{ fontWeight: 600 }}>{scannedCustomer.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{scannedCustomer.mobile}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <Shirt size={18} style={{ color: 'var(--primary)', marginTop: '2px' }} />
                  <div>
                    <div className={styles.label}>Garment Details</div>
                    <div style={{ fontWeight: 600 }}>{scannedGarment.color} • {scannedGarment.size}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{scannedGarment.fabric}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Job Tracker / Delivery Panel */}
            <div className="glass-panel" style={{ padding: '2rem', border: '1px solid var(--border-color)', position: 'relative' }}>
              
              {activeJob ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ShoppingBag size={18} style={{ color: 'var(--primary)' }} />
                      <span>Current Active Job Card #{activeJob.jobNumber}</span>
                    </h3>
                    <span className={`${styles.badge} ${
                      activeJob.status === 'Received' ? styles.badgeReceived :
                      activeJob.status === 'In Process' ? styles.badgeInProcess :
                      activeJob.status === 'Ready' ? styles.badgeReady : styles.badgeDelivered
                    }`}>
                      {activeJob.status}
                    </span>
                  </div>

                  {/* Job item specific details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                    {activeJob.items
                      .filter(item => item.garmentId === scannedGarment.id)
                      .map((item, idx) => {
                        const srv = services.find(s => s.id === item.serviceId);
                        return (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Service Required</div>
                              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)', marginTop: '0.15rem' }}>{srv?.name}</div>
                              {item.remarks && (
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Notes: {item.remarks}</div>
                              )}
                            </div>
                            
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Tagged Defects</div>
                              <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem' }}>
                                {item.defectIds.length > 0 ? (
                                  item.defectIds.map(defId => (
                                    <span key={defId} className={`${styles.badge} ${styles.badgeReceived}`} style={{ fontSize: '0.65rem' }}>
                                      {/* Just print names */}
                                      {defects.find(d => d.id === defId)?.name}
                                    </span>
                                  ))
                                ) : (
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Delivery Actions */}
                  {activeJob.status === 'Ready' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', background: 'var(--success-glow)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                        <Check size={18} />
                        <span>Verification Check: All garments clean and inspected. Package is ready for customer delivery.</span>
                      </div>

                      <button 
                        onClick={handleDeliver} 
                        className={`${styles.btn} ${styles.btnPrimary}`} 
                        style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', gap: '0.5rem' }}
                      >
                        <Check size={20} />
                        <span>Verify & Mark as DELIVERED</span>
                      </button>
                    </div>
                  ) : activeJob.status === 'Delivered' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.9rem', justifyContent: 'center', padding: '1rem 0' }}>
                      <Check size={20} />
                      <span>This garment was delivered to the customer.</span>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)', background: 'var(--warning-glow)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                        <AlertTriangle size={18} />
                        <span>This garment is currently <b>{activeJob.status}</b>. It must be marked as <b>Ready</b> before delivery can be processed.</span>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No active job card found for this garment. Ready for next service checkin.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <QrCode size={48} style={{ marginBottom: '1rem', color: 'var(--text-muted)' }} />
            <h3>Scan a Tag</h3>
            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Use the scan simulator or manual input on the left column to read a garment's permanent QR tag. The system will load the current job card and delivery actions.</p>
          </div>
        )}

      </div>

      <style jsx global>{`
        @keyframes scanLaser {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>
    </div>
  );
}
