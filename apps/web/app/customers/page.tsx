'use client';

import { useState } from 'react';
import { useMockStore, Customer } from '../../contexts/MockStoreContext';
import { Plus, Search, Edit2, Phone, Mail, MapPin, FileText, Calendar, Shirt, ShoppingBag } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import styles from '../../components/ui/ui.module.css';

export default function CustomersPage() {
  const { customers, garments, jobs, addCustomer } = useMockStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(customers[0]?.id || null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form States
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [alternateMobile, setAlternateMobile] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  // Handle customer search
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.mobile.includes(searchQuery)
  );

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Stats for selected customer
  const customerGarments = garments.filter(g => g.customerId === selectedCustomerId);
  const customerJobs = jobs.filter(j => j.customerId === selectedCustomerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) return;

    const newCust = addCustomer({
      name,
      mobile,
      alternateMobile: alternateMobile.trim() || undefined,
      address: address.trim() || undefined,
      email: email.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setSelectedCustomerId(newCust.id);
    setIsAddModalOpen(false);

    // Reset Form
    setName('');
    setMobile('');
    setAlternateMobile('');
    setAddress('');
    setEmail('');
    setNotes('');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '2rem', alignItems: 'start' }}>
      
      {/* Left Column: Customer List & Search */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', minHeight: 'calc(100vh - 120px)' }}>
        <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className={styles.cardTitle}>Customers</h3>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className={`${styles.btn} ${styles.btnPrimary}`}
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', gap: '0.35rem' }}
          >
            <Plus size={14} />
            <span>Add</span>
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search mobile or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.input}
            style={{ paddingLeft: '36px' }}
          />
        </div>

        {/* Customers Scroll List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', maxHeight: '55vh' }}>
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map(cust => (
              <div
                key={cust.id}
                onClick={() => setSelectedCustomerId(cust.id)}
                className="glass-panel interactive"
                style={{
                  padding: '1rem',
                  borderLeft: selectedCustomerId === cust.id ? '4px solid var(--primary)' : '1px solid var(--border-color)',
                  background: selectedCustomerId === cust.id ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: selectedCustomerId === cust.id ? '#ffffff' : 'var(--text-primary)' }}>
                  {cust.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  <Phone size={12} />
                  <span>{cust.mobile}</span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0', fontSize: '0.9rem' }}>
              No customers found.
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Customer Profile */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {selectedCustomer ? (
          <>
            {/* Customer Details Card */}
            <div className="glass-panel" style={{ padding: '2rem', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Customer Profile
                  </span>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', fontFamily: 'var(--font-display)' }}>
                    {selectedCustomer.name}
                  </h2>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Registered: {new Date(selectedCustomer.createdDate).toLocaleDateString()}
                </span>
              </div>

              {/* Grid of details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <Phone size={18} style={{ color: 'var(--primary)', marginTop: '2px' }} />
                  <div>
                    <div className={styles.label}>Mobile Numbers</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{selectedCustomer.mobile}</div>
                    {selectedCustomer.alternateMobile && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Alt: {selectedCustomer.alternateMobile}</div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <Mail size={18} style={{ color: 'var(--primary)', marginTop: '2px' }} />
                  <div>
                    <div className={styles.label}>Email Address</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{selectedCustomer.email || 'N/A'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <MapPin size={18} style={{ color: 'var(--primary)', marginTop: '2px' }} />
                  <div>
                    <div className={styles.label}>Address</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                      {selectedCustomer.address || 'No address provided'}
                    </div>
                  </div>
                </div>
              </div>

              {selectedCustomer.notes && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <FileText size={16} style={{ color: 'var(--warning)', marginTop: '2px' }} />
                  <div>
                    <span className={styles.label} style={{ color: 'var(--warning)' }}>Important Notes</span>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{selectedCustomer.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shirt size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{customerGarments.length}</h4>
                  <span className={styles.label}>Garments Registered</span>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--success-glow)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{customerJobs.length}</h4>
                  <span className={styles.label}>Active Job Orders</span>
                </div>
              </div>
            </div>

            {/* Registered Garments List */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 className={styles.cardTitle} style={{ marginBottom: '1rem' }}>Registered Garments</h3>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Garment ID</th>
                      <th>Category</th>
                      <th>Brand</th>
                      <th>Color</th>
                      <th>Size</th>
                      <th>Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerGarments.length > 0 ? (
                      customerGarments.map(g => (
                        <tr key={g.id}>
                          <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{g.qrCode}</td>
                          <td>{g.categoryId === 'cat-1' ? 'Shirt' : g.categoryId === 'cat-3' ? 'Jeans' : 'Blazer'}</td>
                          <td>{g.brand}</td>
                          <td>{g.color}</td>
                          <td>{g.size}</td>
                          <td>{new Date(g.createdDate).toLocaleDateString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem 0' }}>
                          No garments registered under this customer.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Active / Previous Job Cards */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 className={styles.cardTitle} style={{ marginBottom: '1rem' }}>Job History</h3>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Job #</th>
                      <th>Date</th>
                      <th>Remarks</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerJobs.length > 0 ? (
                      customerJobs.map(job => (
                        <tr key={job.id}>
                          <td style={{ fontWeight: 700 }}>#{job.jobNumber}</td>
                          <td>{new Date(job.createdDate).toLocaleDateString()}</td>
                          <td>{job.remarks || '-'}</td>
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
                        <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem 0' }}>
                          No jobs found.
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
            <Phone size={48} style={{ marginBottom: '1rem' }} />
            <h3>Select a Customer</h3>
            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Choose a customer from the left sidebar or search to view their complete profile.</p>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Customer"
        actions={
          <>
            <button onClick={() => setIsAddModalOpen(false)} className={styles.btnSecondary} style={{ display: 'inline-flex', padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-md)' }}>Cancel</button>
            <button onClick={handleSubmit} className={`${styles.btn} ${styles.btnPrimary}`}>Create Customer</button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Customer Name *</label>
            <input
              type="text"
              placeholder="e.g. Liam Neeson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Mobile Number *</label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Alternate Mobile</label>
              <input
                type="tel"
                placeholder="Optional secondary number"
                value={alternateMobile}
                onChange={(e) => setAlternateMobile(e.target.value)}
                className={styles.input}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Email Address</label>
              <input
                type="email"
                placeholder="e.g. liam@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Address</label>
              <input
                type="text"
                placeholder="e.g. Apartment, House, Street"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Staff Remarks / Preferences</label>
            <textarea
              placeholder="e.g. Prefers low heat iron, wash separately, allergy to detergents."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={styles.textarea}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
