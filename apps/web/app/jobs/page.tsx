'use client';

import { useState } from 'react';
import { useMockStore, Job, JobItem, Customer, Garment } from '../../contexts/MockStoreContext';
import { 
  Plus, Search, Tag, Camera, ClipboardList, Trash2, Eye, User, 
  FileText, CheckCircle2, ChevronRight, AlertTriangle, X, Check, Sparkles 
} from 'lucide-react';
import Modal from '../../components/ui/Modal';
import CameraMock from '../../components/ui/CameraMock';
import styles from '../../components/ui/ui.module.css';

export default function JobsPage() {
  const {
    jobs,
    customers,
    garments,
    services,
    defects,
    categories,
    addCustomer,
    addGarment,
    addJob,
    updateJobStatus,
  } = useMockStore();

  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [jobSearch, setJobSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  // Detail Modal State
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // --- New Job Intake Form State ---
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [selectedCustId, setSelectedCustId] = useState('');
  const [isNewCustomerInline, setIsNewCustomerInline] = useState(false);
  
  // Inline Customer Form States
  const [newCustName, setNewCustName] = useState('');
  const [newCustMobile, setNewCustMobile] = useState('');
  const [newCustNotes, setNewCustNotes] = useState('');

  // General remarks and photos for the overall job
  const [jobRemarks, setJobRemarks] = useState('');
  const [jobPhotos, setJobPhotos] = useState<{ url: string; type: 'front' | 'back' | 'defect' }[]>([]);

  // List of items added to the current job card
  const [items, setItems] = useState<Omit<JobItem, 'id'>[]>([]);

  // Temp states for adding a single item
  const [isNewGarmentInline, setIsNewGarmentInline] = useState(false);
  const [selectedGarmentId, setSelectedGarmentId] = useState('');
  
  // Inline Garment Form States
  const [newGatCategoryId, setNewGatCategoryId] = useState(categories[0]?.id || '');
  const [newGatBrand, setNewGatBrand] = useState('');
  const [newGatColor, setNewGatColor] = useState('Navy Blue');
  const [newGatSize, setNewGatSize] = useState('M');
  const [newGatFabric, setNewGatFabric] = useState('Cotton');
  const [newGatRemarks, setNewGatRemarks] = useState('');
  const [newGatPhoto, setNewGatPhoto] = useState('');

  // Selected Service & Defects for the item
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [itemRemarks, setItemRemarks] = useState('');
  const [selectedDefectIds, setSelectedDefectIds] = useState<string[]>([]);

  // --- Filtering Customers for Selection ---
  const filteredCustomerResults = customerSearchQuery.trim() === '' 
    ? [] 
    : customers.filter(c => 
        c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) || 
        c.mobile.includes(customerSearchQuery)
      );

  const selectedCustomerObj = customers.find(c => c.id === selectedCustId);
  const customerGarmentsList = garments.filter(g => g.customerId === selectedCustId);

  // Filtered jobs list
  const filteredJobs = jobs.filter(job => {
    const cust = customers.find(c => c.id === job.customerId);
    const matchesSearch = 
      job.jobNumber.includes(jobSearch) ||
      (cust && cust.name.toLowerCase().includes(jobSearch.toLowerCase())) ||
      (cust && cust.mobile.includes(jobSearch));
    
    const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectCustomer = (cust: Customer) => {
    setSelectedCustId(cust.id);
    setCustomerSearchQuery('');
    setIsNewCustomerInline(false);
  };

  const handleTriggerNewCustomer = () => {
    setIsNewCustomerInline(true);
    setSelectedCustId('');
    setNewCustMobile(customerSearchQuery); // Pre-fill phone if they searched
  };

  const handleToggleDefect = (defId: string) => {
    setSelectedDefectIds(prev => 
      prev.includes(defId) ? prev.filter(id => id !== defId) : [...prev, defId]
    );
  };

  // Add Item to the job queue
  const handleAddItemToJob = (e: React.FormEvent) => {
    e.preventDefault();

    let targetGarmentId = selectedGarmentId;

    // If inline garment registration is active, create the garment first
    if (isNewGarmentInline) {
      if (!selectedCustId && !isNewCustomerInline) {
        alert('Please select or register a customer first.');
        return;
      }
      if (!newGatBrand.trim()) {
        alert('Please specify the garment brand.');
        return;
      }

      // Create garment object (simulate DB save inline)
      // We will assign a temporary garment ID and owner customer, 
      // but wait! If customer is also new, we will save the customer first.
      let finalCustId = selectedCustId;
      if (isNewCustomerInline) {
        if (!newCustName.trim() || !newCustMobile.trim()) {
          alert('Please fill out the new customer details first.');
          return;
        }
        const createdCust = addCustomer({
          name: newCustName.trim(),
          mobile: newCustMobile.trim(),
          notes: newCustNotes.trim() || undefined,
        });
        finalCustId = createdCust.id;
        setSelectedCustId(createdCust.id);
        setIsNewCustomerInline(false);
      }

      const createdGat = addGarment({
        customerId: finalCustId,
        categoryId: newGatCategoryId,
        brand: newGatBrand.trim(),
        color: newGatColor,
        size: newGatSize,
        fabric: newGatFabric,
        remarks: newGatRemarks.trim() || undefined,
        photo: newGatPhoto || undefined,
      });

      targetGarmentId = createdGat.id;
      
      // Reset inline garment form
      setNewGatBrand('');
      setNewGatRemarks('');
      setNewGatPhoto('');
      setIsNewGarmentInline(false);
    }

    if (!targetGarmentId) {
      alert('Please select or register a garment.');
      return;
    }

    if (items.some(it => it.garmentId === targetGarmentId)) {
      alert('This garment is already in this job card.');
      return;
    }

    setItems(prev => [
      ...prev,
      {
        garmentId: targetGarmentId,
        serviceId: selectedServiceId,
        defectIds: selectedDefectIds,
        remarks: itemRemarks.trim() || undefined,
        quantity: 1,
      }
    ]);

    // Reset Form Input states
    setSelectedGarmentId('');
    setItemRemarks('');
    setSelectedDefectIds([]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveJobCard = () => {
    let finalCustId = selectedCustId;

    // If new customer is inline and hasn't been saved yet (i.e. no items triggered customer save)
    if (isNewCustomerInline) {
      if (!newCustName.trim() || !newCustMobile.trim()) {
        alert('Please fill out the new customer details.');
        return;
      }
      const createdCust = addCustomer({
        name: newCustName.trim(),
        mobile: newCustMobile.trim(),
        notes: newCustNotes.trim() || undefined,
      });
      finalCustId = createdCust.id;
      setSelectedCustId(createdCust.id);
      setIsNewCustomerInline(false);
    }

    if (!finalCustId) {
      alert('Please select or create a customer.');
      return;
    }

    if (items.length === 0) {
      alert('Please add at least one garment to the job card.');
      return;
    }

    addJob(finalCustId, items, jobRemarks.trim(), jobPhotos);

    // Reset all forms
    setSelectedCustId('');
    setItems([]);
    setJobRemarks('');
    setJobPhotos([]);
    setActiveTab('list');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header Tabs */}
      <div 
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.75rem',
        }}
      >
        <button
          onClick={() => setActiveTab('list')}
          className={styles.btn}
          style={{
            background: activeTab === 'list' ? 'var(--primary-glow)' : 'transparent',
            borderColor: activeTab === 'list' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'list' ? 'var(--primary)' : 'var(--text-secondary)',
            padding: '0.5rem 1rem',
          }}
        >
          <ClipboardList size={16} />
          <span>Active Jobs List</span>
        </button>

        <button
          onClick={() => setActiveTab('create')}
          className={styles.btn}
          style={{
            background: activeTab === 'create' ? 'var(--primary-glow)' : 'transparent',
            borderColor: activeTab === 'create' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'create' ? 'var(--primary)' : 'var(--text-secondary)',
            padding: '0.5rem 1rem',
          }}
        >
          <Plus size={16} />
          <span>Create New Job Card</span>
        </button>
      </div>

      {/* VIEW: JOBS LIST */}
      {activeTab === 'list' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          {/* Filters Bar */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search job number, customer, mobile..."
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                className={styles.input}
                style={{ paddingLeft: '36px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {['All', 'Received', 'In Process', 'Ready', 'Delivered'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={styles.btn}
                  style={{
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.8rem',
                    background: statusFilter === status ? 'rgba(15, 23, 42, 0.05)' : 'transparent',
                    borderColor: statusFilter === status ? 'rgba(15, 23, 42, 0.15)' : 'transparent',
                    color: statusFilter === status ? 'var(--primary)' : 'var(--text-secondary)',
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Jobs Table */}
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Job #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items Count</th>
                  <th>Remarks</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.length > 0 ? (
                  filteredJobs.map(job => {
                    const cust = customers.find(c => c.id === job.customerId);
                    return (
                      <tr key={job.id}>
                        <td style={{ fontWeight: 700 }}>#{job.jobNumber}</td>
                        <td>{new Date(job.createdDate).toLocaleDateString()}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{cust?.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{cust?.mobile}</div>
                        </td>
                        <td>{job.items.length} garments</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{job.remarks || '-'}</td>
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
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => setSelectedJob(job)}
                              className={styles.btnSecondary}
                              style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', gap: '0.25rem' }}
                            >
                              <Eye size={12} />
                              <span>View</span>
                            </button>

                            {job.status !== 'Delivered' && (
                              <button
                                onClick={() => {
                                  const nextStatus = 
                                    job.status === 'Received' ? 'In Process' :
                                    job.status === 'In Process' ? 'Ready' : 'Delivered';
                                  updateJobStatus(job.id, nextStatus as any);
                                }}
                                className={`${styles.btn} ${styles.btnPrimary}`}
                                style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', gap: '0.25rem' }}
                              >
                                <span>Advance</span>
                                <ChevronRight size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
                      No jobs active in this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: CREATE JOB (ENHANCED INLINE POS FLOW) */}
      {activeTab === 'create' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
          
          {/* Left Check-in Intake Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* STEP 1: CUSTOMER SELECTION (INLINE WORKFLOW) */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 className={styles.cardTitle} style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={18} style={{ color: 'var(--primary)' }} />
                <span>1. Customer Account Selection</span>
              </h3>

              {!selectedCustId && !isNewCustomerInline && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Type mobile or customer name to search..."
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      className={styles.input}
                      style={{ paddingLeft: '36px' }}
                    />
                  </div>

                  {/* Search Results Dropdown Overlay */}
                  {customerSearchQuery.trim() !== '' && (
                    <div className="glass-panel" style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '200px', overflowY: 'auto', border: '1px solid rgba(15,23,42,0.15)', background: '#fff' }}>
                      {filteredCustomerResults.map(c => (
                        <div 
                          key={c.id} 
                          onClick={() => handleSelectCustomer(c)}
                          className="interactive"
                          style={{ padding: '0.5rem 0.75rem', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}
                        >
                          <div>
                            <span style={{ fontWeight: 600 }}>{c.name}</span>
                            <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>({c.mobile})</span>
                          </div>
                          <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                        </div>
                      ))}

                      <div 
                        onClick={handleTriggerNewCustomer}
                        className="interactive"
                        style={{ padding: '0.5rem 0.75rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 600, borderTop: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                      >
                        <Plus size={14} />
                        <span>Create new account: "{customerSearchQuery}"</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Inline Registration Form */}
              {isNewCustomerInline && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px dashed var(--primary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', background: 'rgba(79,70,229,0.01)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Register New Client Account Inline
                    </span>
                    <button onClick={() => setIsNewCustomerInline(false)} className={styles.dialogCloseBtn}>
                      <X size={16} />
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                      <label className={styles.label}>Customer Name *</label>
                      <input 
                        type="text" 
                        placeholder="Name" 
                        value={newCustName} 
                        onChange={(e) => setNewCustName(e.target.value)} 
                        className={styles.input}
                        required
                      />
                    </div>
                    <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                      <label className={styles.label}>Mobile Number *</label>
                      <input 
                        type="tel" 
                        placeholder="Phone" 
                        value={newCustMobile} 
                        onChange={(e) => setNewCustMobile(e.target.value)} 
                        className={styles.input}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                    <label className={styles.label}>Intake Preferences / Notes</label>
                    <input 
                      type="text" 
                      placeholder="e.g. low heat iron, allergy to scents" 
                      value={newCustNotes} 
                      onChange={(e) => setNewCustNotes(e.target.value)} 
                      className={styles.input}
                    />
                  </div>
                </div>
              )}

              {/* Selected Customer Info Display */}
              {selectedCustomerObj && (
                <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(79,70,229,0.03)', border: '1px solid rgba(79,70,229,0.15)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <span className={styles.label} style={{ color: 'var(--primary)' }}>Client Account</span>
                    <h4 style={{ fontWeight: 700, fontSize: '1.05rem', marginTop: '0.15rem' }}>{selectedCustomerObj.name}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedCustomerObj.mobile} • {selectedCustomerObj.email || 'No Email'}</p>
                  </div>

                  <button 
                    onClick={() => { setSelectedCustId(''); setItems([]); }}
                    className={styles.btnSecondary}
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                  >
                    Change Account
                  </button>
                </div>
              )}
            </div>

            {/* STEP 2: MULTI-ITEM INTAKE TABLE */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 className={styles.cardTitle} style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ClipboardList size={18} style={{ color: 'var(--primary)' }} />
                <span>2. Garment Intake Items</span>
              </h3>

              {/* Queue of added garments */}
              <div className={styles.tableContainer} style={{ marginBottom: '1.5rem' }}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Garment (QR Code)</th>
                      <th>Service Required</th>
                      <th>Tagged Defects</th>
                      <th>Remarks</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length > 0 ? (
                      items.map((item, idx) => {
                        const g = garments.find(gar => gar.id === item.garmentId);
                        const cat = categories.find(c => c.id === g?.categoryId);
                        const srv = services.find(s => s.id === item.serviceId);
                        return (
                          <tr key={idx}>
                            <td>
                              <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{g?.qrCode}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{g?.brand} {cat?.name} ({g?.color})</div>
                            </td>
                            <td><span style={{ fontWeight: 600 }}>{srv?.name}</span></td>
                            <td>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                {item.defectIds.length > 0 ? (
                                  item.defectIds.map(defId => (
                                    <span key={defId} className={`${styles.badge} ${styles.badgeReceived}`} style={{ fontSize: '0.65rem' }}>
                                      {defects.find(d => d.id === defId)?.name}
                                    </span>
                                  ))
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None</span>
                                )}
                              </div>
                            </td>
                            <td><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{item.remarks || '-'}</span></td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                onClick={() => handleRemoveItem(idx)}
                                className={`${styles.btn} ${styles.btnDanger}`}
                                style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
                          No garments checkin. Add garments below.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Intake sub-form */}
              {selectedCustId || isNewCustomerInline ? (
                <form onSubmit={handleAddItemToJob} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'rgba(15,23,42,0.01)', border: '1px dashed var(--border-color)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                  
                  {/* Select or Register Garment selector */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={styles.label} style={{ color: 'var(--primary)' }}>Select/Add Garment Tag</span>
                    <button 
                      type="button"
                      onClick={() => setIsNewGarmentInline(!isNewGarmentInline)}
                      className={styles.btnSecondary}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', gap: '0.25rem' }}
                    >
                      {isNewGarmentInline ? 'Select Existing Garment' : '+ Register New Garment Inline'}
                    </button>
                  </div>

                  {/* SUBFLOW A: SELECT EXISTING GARMENT */}
                  {!isNewGarmentInline && (
                    <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                      <label className={styles.label}>Select Garment</label>
                      <select 
                        value={selectedGarmentId} 
                        onChange={(e) => setSelectedGarmentId(e.target.value)} 
                        className={styles.select}
                        required={!isNewGarmentInline}
                      >
                        <option value="">-- Choose registered garment --</option>
                        {customerGarmentsList.map(g => (
                          <option key={g.id} value={g.id}>
                            {g.qrCode} ({g.brand} {categories.find(c => c.id === g.categoryId)?.name} • {g.color})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* SUBFLOW B: REGISTER GARMENT INLINE (ZERO MODAL FLOW) */}
                  {isNewGarmentInline && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '3px solid var(--primary)', paddingLeft: '1rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                          <label className={styles.label}>Category</label>
                          <select 
                            value={newGatCategoryId} 
                            onChange={(e) => setNewGatCategoryId(e.target.value)}
                            className={styles.select}
                          >
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                          <label className={styles.label}>Brand *</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Polo" 
                            value={newGatBrand} 
                            onChange={(e) => setNewGatBrand(e.target.value)}
                            className={styles.input}
                            required={isNewGarmentInline}
                          />
                        </div>
                        <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                          <label className={styles.label}>Fabric</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Cotton" 
                            value={newGatFabric} 
                            onChange={(e) => setNewGatFabric(e.target.value)}
                            className={styles.input}
                          />
                        </div>
                      </div>

                      {/* Presets Grid: Touchscreen selection for Size and Color */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <div>
                          <label className={styles.label}>Quick Size presets</label>
                          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                            {['XS', 'S', 'M', 'L', 'XL', 'XXL', '32'].map(sz => (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => setNewGatSize(sz)}
                                className={styles.btnSecondary}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  fontSize: '0.75rem',
                                  borderRadius: '4px',
                                  background: newGatSize === sz ? 'var(--primary-glow)' : '#ffffff',
                                  borderColor: newGatSize === sz ? 'var(--primary)' : 'var(--border-color)',
                                  color: newGatSize === sz ? 'var(--primary)' : 'var(--text-secondary)',
                                }}
                              >
                                {sz}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className={styles.label}>Quick Color presets</label>
                          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                            {['Navy', 'Black', 'Charcoal', 'White', 'Blue', 'Red', 'Beige'].map(cl => (
                              <button
                                key={cl}
                                type="button"
                                onClick={() => setNewGatColor(cl)}
                                className={styles.btnSecondary}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  fontSize: '0.75rem',
                                  borderRadius: '4px',
                                  background: newGatColor === cl ? 'var(--primary-glow)' : '#ffffff',
                                  borderColor: newGatColor === cl ? 'var(--primary)' : 'var(--border-color)',
                                  color: newGatColor === cl ? 'var(--primary)' : 'var(--text-secondary)',
                                }}
                              >
                                {cl}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                          <label className={styles.label}>Garment Remarks</label>
                          <input 
                            type="text" 
                            placeholder="Defects/wear notes" 
                            value={newGatRemarks} 
                            onChange={(e) => setNewGatRemarks(e.target.value)}
                            className={styles.input}
                          />
                        </div>
                        <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                          <label className={styles.label}>Upload / Snap Photo</label>
                          <input 
                            type="text" 
                            placeholder="Image URL (Simulated Snap)" 
                            value={newGatPhoto} 
                            onChange={(e) => setNewGatPhoto(e.target.value)}
                            className={styles.input}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TOUCHSCREEN PILLS: SERVICE SELECTION */}
                  <div>
                    <label className={styles.label}>Select Service Preset</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                      {services.map(s => {
                        const isSelected = selectedServiceId === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setSelectedServiceId(s.id)}
                            className={styles.btn}
                            style={{
                              padding: '0.4rem 1rem',
                              fontSize: '0.8rem',
                              background: isSelected ? 'var(--primary-glow)' : '#ffffff',
                              borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                              color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                              boxShadow: 'var(--shadow-sm)',
                            }}
                          >
                            <span>{s.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* TOUCHSCREEN PILLS: DEFECT TAGGING */}
                  <div>
                    <label className={styles.label}>Tag Common Defects</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                      {defects.map(d => {
                        const isChecked = selectedDefectIds.includes(d.id);
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => handleToggleDefect(d.id)}
                            className={styles.btn}
                            style={{
                              padding: '0.4rem 0.8rem',
                              fontSize: '0.75rem',
                              background: isChecked ? 'rgba(220,38,38,0.08)' : '#ffffff',
                              borderColor: isChecked ? 'var(--error)' : 'var(--border-color)',
                              color: isChecked ? 'var(--error)' : 'var(--text-secondary)',
                              boxShadow: 'var(--shadow-sm)',
                            }}
                          >
                            <span>{d.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                    <label className={styles.label}>Remarks for this service</label>
                    <input
                      type="text"
                      placeholder="e.g. Iron cuffs sharply, clean stain on pocket"
                      value={itemRemarks}
                      onChange={(e) => setItemRemarks(e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ fontSize: '0.85rem' }}>
                      <Plus size={14} />
                      <span>Intake Garment</span>
                    </button>
                  </div>

                </form>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--warning-glow)', color: 'var(--warning)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                  <AlertTriangle size={18} />
                  <span>Please select a client account in Step 1 to load check-in subform.</span>
                </div>
              )}

            </div>
          </div>

          {/* Right Panel: Job Remarks & Intake Condition Snaps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 className={styles.cardTitle} style={{ marginBottom: '1.25rem' }}>General Remarks</h3>
              <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                <label className={styles.label}>General Job Instructions</label>
                <textarea
                  placeholder="e.g. deliver hanger garments in nylon plastics, client requested rush checkout."
                  value={jobRemarks}
                  onChange={(e) => setJobRemarks(e.target.value)}
                  className={styles.textarea}
                  style={{ minHeight: '60px' }}
                />
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 className={styles.cardTitle} style={{ marginBottom: '1.25rem' }}>Condition Proof Snaps</h3>
              
              <CameraMock
                onCapture={(url) => setJobPhotos(prev => [...prev, { url, type: 'front' }])}
                label="Snap condition tags"
              />

              {jobPhotos.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  {jobPhotos.map((photo, index) => (
                    <div key={index} style={{ width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
                      <img src={photo.url} alt="Proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        onClick={() => setJobPhotos(prev => prev.filter((_, i) => i !== index))}
                        style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={handleSaveJobCard}
              className={`${styles.btn} ${styles.btnPrimary}`} 
              style={{ width: '100%', padding: '1rem', fontSize: '1.05rem' }}
            >
              <CheckCircle2 size={18} />
              <span>Confirm & Print Job Card</span>
            </button>

          </div>

        </div>
      )}

      {/* DETAIL MODAL OVERLAY */}
      <Modal
        isOpen={selectedJob !== null}
        onClose={() => setSelectedJob(null)}
        title={selectedJob ? `Job Card Details #${selectedJob.jobNumber}` : ''}
        size="large"
      >
        {selectedJob && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <span className={styles.label}>Intake Date</span>
                <div style={{ fontWeight: 600 }}>{new Date(selectedJob.createdDate).toLocaleString()}</div>
              </div>
              <div>
                <span className={styles.label}>Customer Account</span>
                <div style={{ fontWeight: 600 }}>
                  {customers.find(c => c.id === selectedJob.customerId)?.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {customers.find(c => c.id === selectedJob.customerId)?.mobile}
                </div>
              </div>
              <div>
                <span className={styles.label}>Job Status</span>
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
              <h4 className={styles.cardTitle} style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Intake Garments</h4>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Garment QR Code</th>
                      <th>Category & Brand</th>
                      <th>Service Required</th>
                      <th>Tagged Defects</th>
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
                          <td>
                            <div>{cat?.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{g?.brand} ({g?.color} • {g?.size})</div>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600 }}>{srv?.name}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                              {item.defectIds.map(defId => (
                                <span key={defId} className={`${styles.badge} ${styles.badgeReceived}`} style={{ fontSize: '0.65rem' }}>
                                  {defects.find(d => d.id === defId)?.name}
                                </span>
                              ))}
                            </div>
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

            {selectedJob.photos.length > 0 && (
              <div>
                <span className={styles.label}>Condition Proof Photos</span>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  {selectedJob.photos.map((p, idx) => (
                    <div key={idx} style={{ width: '120px', height: '90px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                      <img src={p.url} alt="Proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
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
