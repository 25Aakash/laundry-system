'use client';

import { useState } from 'react';
import { useMockStore, Garment, Job } from '../../contexts/MockStoreContext';
import { Plus, Search, Eye, Shirt, Tag, Calendar, User, ShoppingBag, Clock } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import QrCodeView from '../../components/ui/QrCodeView';
import CameraMock from '../../components/ui/CameraMock';
import styles from '../../components/ui/ui.module.css';

export default function GarmentsPage() {
  const { garments, customers, categories, services, jobs, addGarment } = useMockStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGarmentId, setSelectedGarmentId] = useState<string | null>(garments[0]?.id || null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [newlyCreatedGarment, setNewlyCreatedGarment] = useState<Garment | null>(null);

  // Form States
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [fabric, setFabric] = useState('');
  const [remarks, setRemarks] = useState('');
  const [photo, setPhoto] = useState('');

  // Handle Garment Search (Filter by ID/QR, Customer Name, Category)
  const filteredGarments = garments.filter(g => {
    const owner = customers.find(c => c.id === g.customerId);
    const cat = categories.find(c => c.id === g.categoryId);
    const q = searchQuery.toLowerCase();
    return (
      g.id.toLowerCase().includes(q) ||
      (owner && owner.name.toLowerCase().includes(q)) ||
      (owner && owner.mobile.includes(q)) ||
      (cat && cat.name.toLowerCase().includes(q)) ||
      g.brand.toLowerCase().includes(q)
    );
  });

  const selectedGarment = garments.find(g => g.id === selectedGarmentId);
  const garmentOwner = selectedGarment ? customers.find(c => c.id === selectedGarment.customerId) : null;
  const garmentCategory = selectedGarment ? categories.find(c => c.id === selectedGarment.categoryId) : null;

  // Garment Lifecycle Metrics & previous jobs list
  const getGarmentHistory = (): { jobsList: any[]; totalVisits: number; lastVisit: string; mostUsedService: string } => {
    if (!selectedGarmentId) return { jobsList: [], totalVisits: 0, lastVisit: 'N/A', mostUsedService: 'N/A' };

    // Find all jobs that contain this garment
    const relatedJobs = jobs.filter(j => 
      j.items.some(item => item.garmentId === selectedGarmentId)
    );

    const jobsList = relatedJobs.map(job => {
      const item = job.items.find(it => it.garmentId === selectedGarmentId);
      const srv = services.find(s => s.id === item?.serviceId);
      return {
        id: job.id,
        jobNumber: job.jobNumber,
        date: job.createdDate,
        service: srv?.name || 'Laundry',
        status: job.status,
        remarks: item?.remarks || '-',
      };
    });

    const totalVisits = relatedJobs.length;
    const lastVisit = relatedJobs[0] ? new Date(relatedJobs[0].createdDate).toLocaleDateString() : 'Never';

    // Calculate most used service
    const serviceCounts: Record<string, number> = {};
    relatedJobs.forEach(job => {
      const item = job.items.find(it => it.garmentId === selectedGarmentId);
      if (item) {
        serviceCounts[item.serviceId] = (serviceCounts[item.serviceId] || 0) + 1;
      }
    });

    let maxCount = 0;
    let mostUsedSrvId = '';
    Object.entries(serviceCounts).forEach(([srvId, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostUsedSrvId = srvId;
      }
    });

    const mostUsedService = services.find(s => s.id === mostUsedSrvId)?.name || 'N/A';

    return { jobsList, totalVisits, lastVisit, mostUsedService };
  };

  const { jobsList, totalVisits, lastVisit, mostUsedService } = getGarmentHistory();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !categoryId || !brand.trim()) return;

    const newG = addGarment({
      customerId,
      categoryId,
      brand: brand.trim(),
      color: color.trim(),
      size: size.trim(),
      fabric: fabric.trim(),
      remarks: remarks.trim() || undefined,
      photo: photo || undefined,
    });

    setSelectedGarmentId(newG.id);
    setNewlyCreatedGarment(newG);
    setIsAddModalOpen(false);
    setShowQrModal(true); // Open QR card immediately for printing!

    // Reset Form
    setBrand('');
    setColor('');
    setSize('');
    setFabric('');
    setRemarks('');
    setPhoto('');
  };

  return (
    <div className={styles.layoutLeftFixed}>
      
      {/* Left Column: Garment List & Filter */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', minHeight: 'calc(100vh - 120px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className={styles.cardTitle}>Garments</h3>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className={`${styles.btn} ${styles.btnPrimary}`}
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', gap: '0.35rem' }}
          >
            <Plus size={14} />
            <span>Register</span>
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search QR, customer, item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.input}
            style={{ paddingLeft: '36px' }}
          />
        </div>

        {/* Garments List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', maxHeight: '55vh' }}>
          {filteredGarments.length > 0 ? (
            filteredGarments.map(g => {
              const owner = customers.find(c => c.id === g.customerId);
              const cat = categories.find(c => c.id === g.categoryId);
              return (
                <div
                  key={g.id}
                  onClick={() => setSelectedGarmentId(g.id)}
                  className="glass-panel interactive"
                  style={{
                    padding: '1rem',
                    borderLeft: selectedGarmentId === g.id ? '4px solid var(--primary)' : '1px solid var(--border-color)',
                    background: selectedGarmentId === g.id ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }}>{g.qrCode}</span>
                    <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                      {cat?.name || 'Garment'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                    <User size={12} style={{ marginTop: '2px' }} />
                    <span>{owner?.name} ({owner?.mobile})</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {g.brand} • {g.color} • {g.size}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0', fontSize: '0.9rem' }}>
              No garments found.
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Garment Lifecycle & QR printer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {selectedGarment ? (
          <>
            {/* Upper: Details & QR Label */}
            <div className={styles.layoutRight240}>
              
              {/* Profile Card */}
              <div className="glass-panel" style={{ padding: '2rem', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Garment Master Card
                      </span>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', fontFamily: 'var(--font-display)' }}>
                        {selectedGarment.brand} {garmentCategory?.name}
                      </h2>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Registered: {new Date(selectedGarment.createdDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className={styles.gridTwoCol} style={{ marginBottom: '1.5rem' }}>
                    <div>
                      <div className={styles.label}>Garment ID / QR</div>
                      <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>{selectedGarment.qrCode}</div>
                    </div>
                    <div>
                      <div className={styles.label}>Fabric & Size</div>
                      <div style={{ fontWeight: 600 }}>{selectedGarment.fabric || 'N/A'} • {selectedGarment.size || 'N/A'}</div>
                    </div>
                    <div>
                      <div className={styles.label}>Color</div>
                      <div style={{ fontWeight: 600 }}>{selectedGarment.color || 'N/A'}</div>
                    </div>
                    <div>
                      <div className={styles.label}>Owner Account</div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{garmentOwner?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{garmentOwner?.mobile}</div>
                    </div>
                  </div>
                </div>

                {/* Photo and Remarks */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  {selectedGarment.photo ? (
                    <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                      <img src={selectedGarment.photo} alt="Garment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                      <Shirt size={24} />
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <div className={styles.label}>Permanent Remarks</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {selectedGarment.remarks || 'No remarks added.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* QR Code Printable Card */}
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(13, 18, 31, 0.5)' }}>
                <h4 className={styles.cardTitle} style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Print Barcode Tag</h4>
                <QrCodeView
                  value={selectedGarment.qrCode}
                  customerName={garmentOwner?.name}
                  categoryName={garmentCategory?.name}
                  brandName={selectedGarment.brand}
                  color={selectedGarment.color}
                />
              </div>

            </div>

            {/* Metrics Row */}
            <div className={styles.layoutThreeCol}>
              <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h5 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{totalVisits}</h5>
                  <span className={styles.label} style={{ fontSize: '0.65rem' }}>Total Visits</span>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--success-glow)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={20} />
                </div>
                <div>
                  <h5 style={{ fontSize: '1rem', fontWeight: 800 }}>{lastVisit}</h5>
                  <span className={styles.label} style={{ fontSize: '0.65rem' }}>Last Visit Date</span>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--warning-glow)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={20} />
                </div>
                <div>
                  <h5 style={{ fontSize: '1rem', fontWeight: 800 }}>{mostUsedService}</h5>
                  <span className={styles.label} style={{ fontSize: '0.65rem' }}>Most Used Service</span>
                </div>
              </div>
            </div>

            {/* Garment Lifecycle History */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 className={styles.cardTitle} style={{ marginBottom: '1rem' }}>Garment Lifecycle History</h3>
              
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Job #</th>
                      <th>Intake Date</th>
                      <th>Service Requested</th>
                      <th>Item Remarks</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobsList.length > 0 ? (
                      jobsList.map(job => (
                        <tr key={job.id}>
                          <td style={{ fontWeight: 700 }}>#{job.jobNumber}</td>
                          <td>{new Date(job.date).toLocaleDateString()}</td>
                          <td>{job.service}</td>
                          <td>{job.remarks}</td>
                          <td>
                            <span className={`${styles.badge} ${
                              job.status === 'Received' ? styles.badgeReceived :
                              job.status === 'In Process' ? styles.badgeInProcess :
                              job.status === 'Ready' ? styles.badgeReady : styles.badgeDelivered
                            }`}>
                              {job.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem 0' }}>
                          No history records for this garment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Shirt size={48} style={{ marginBottom: '1rem' }} />
            <h3>Select a Garment</h3>
            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Choose a garment from the left sidebar to view its full tracking label, owner information, and lifetime lifecycle log.</p>
          </div>
        )}
      </div>

      {/* Register Garment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Garment"
        size="large"
        actions={
          <>
            <button onClick={() => setIsAddModalOpen(false)} className={styles.btnSecondary} style={{ display: 'inline-flex', padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-md)' }}>Cancel</button>
            <button onClick={handleRegister} className={`${styles.btn} ${styles.btnPrimary}`}>Register & Generate QR</button>
          </>
        }
      >
        <form onSubmit={handleRegister} className={styles.formRegisterGrid}>
          {/* Left Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            
            <div className={styles.gridTwoCol}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Select Owner Customer *</label>
                <select 
                  value={customerId} 
                  onChange={(e) => setCustomerId(e.target.value)} 
                  className={styles.select}
                  required
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>
                  ))}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Garment Category *</label>
                <select 
                  value={categoryId} 
                  onChange={(e) => setCategoryId(e.target.value)} 
                  className={styles.select}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.gridTwoCol}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Brand Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Levi's, Zara, Armani"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Color *</label>
                <input
                  type="text"
                  placeholder="e.g. Navy Blue, Charcoal"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
            </div>

            <div className={styles.gridTwoCol}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Size</label>
                <input
                  type="text"
                  placeholder="e.g. L, XL, 32"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Fabric</label>
                <input
                  type="text"
                  placeholder="e.g. Wool, Denim, Silk"
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Permanent Remarks / Damaged Spots</label>
              <textarea
                placeholder="Remarks that stick to this garment forever (e.g. Small hole on left pocket, permanently faded cuffs)."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className={styles.textarea}
                style={{ minHeight: '60px' }}
              />
            </div>
          </div>

          {/* Right Camera Mock */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <CameraMock
              onCapture={(url) => setPhoto(url)}
              label="Capture Garment Base Photo"
            />
          </div>
        </form>
      </Modal>

      {/* Printable QR Dialog (shown immediately after creation) */}
      <Modal
        isOpen={showQrModal}
        onClose={() => { setShowQrModal(false); setNewlyCreatedGarment(null); }}
        title="Garment Registered Successfully!"
      >
        {newlyCreatedGarment && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '1rem 0' }}>
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ color: 'var(--success)', fontWeight: 700 }}>Label Ready for Printing</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Attach this permanent QR code tag to the garment.
              </p>
            </div>

            <QrCodeView
              value={newlyCreatedGarment.qrCode}
              customerName={customers.find(c => c.id === newlyCreatedGarment.customerId)?.name}
              categoryName={categories.find(c => c.id === newlyCreatedGarment.categoryId)?.name}
              brandName={newlyCreatedGarment.brand}
              color={newlyCreatedGarment.color}
            />

            <button 
              onClick={() => { setShowQrModal(false); setNewlyCreatedGarment(null); }}
              className={`${styles.btn} ${styles.btnSecondary}`}
              style={{ width: '100%' }}
            >
              Close
            </button>
          </div>
        )}
      </Modal>

    </div>
  );
}
