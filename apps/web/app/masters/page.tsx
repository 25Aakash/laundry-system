'use client';

import { useState } from 'react';
import { useMockStore } from '../../contexts/MockStoreContext';
import { Plus, Edit2, Check, X, ToggleLeft, ToggleRight, List, ShieldAlert, Award } from 'lucide-react';
import styles from '../../components/ui/ui.module.css';

export default function MastersPage() {
  const {
    categories,
    services,
    defects,
    addCategory,
    editCategory,
    addService,
    editService,
    addDefect,
    editDefect,
  } = useMockStore();

  const [activeTab, setActiveTab] = useState<'categories' | 'services' | 'defects'>('categories');

  // Input states for Add Forms
  const [newCatName, setNewCatName] = useState('');
  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvDesc, setNewSrvDesc] = useState('');
  const [newDefName, setNewDefName] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const handleAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory(newCatName.trim());
    setNewCatName('');
  };

  const handleAddSrv = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSrvName.trim()) return;
    addService(newSrvName.trim(), newSrvDesc.trim());
    setNewSrvName('');
    setNewSrvDesc('');
  };

  const handleAddDef = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDefName.trim()) return;
    addDefect(newDefName.trim());
    setNewDefName('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Tab Selectors */}
      <div 
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.75rem',
        }}
      >
        <button
          onClick={() => { setActiveTab('categories'); setEditingId(null); }}
          className={`${styles.btn}`}
          style={{
            background: activeTab === 'categories' ? 'var(--primary-glow)' : 'transparent',
            borderColor: activeTab === 'categories' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'categories' ? 'var(--primary)' : 'var(--text-secondary)',
            padding: '0.5rem 1rem',
          }}
        >
          <List size={16} />
          <span>Garment Categories</span>
        </button>

        <button
          onClick={() => { setActiveTab('services'); setEditingId(null); }}
          className={`${styles.btn}`}
          style={{
            background: activeTab === 'services' ? 'var(--primary-glow)' : 'transparent',
            borderColor: activeTab === 'services' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'services' ? 'var(--primary)' : 'var(--text-secondary)',
            padding: '0.5rem 1rem',
          }}
        >
          <Award size={16} />
          <span>Laundry Services</span>
        </button>

        <button
          onClick={() => { setActiveTab('defects'); setEditingId(null); }}
          className={`${styles.btn}`}
          style={{
            background: activeTab === 'defects' ? 'var(--primary-glow)' : 'transparent',
            borderColor: activeTab === 'defects' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'defects' ? 'var(--primary)' : 'var(--text-secondary)',
            padding: '0.5rem 1rem',
          }}
        >
          <ShieldAlert size={16} />
          <span>Standard Defects</span>
        </button>
      </div>

      {/* Content Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Side: Table List */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className={styles.cardTitle} style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Manage {activeTab === 'categories' ? 'Categories' : activeTab === 'services' ? 'Services' : 'Defects'}</span>
          </h3>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  {activeTab === 'services' && <th>Description</th>}
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* --- Categories Render --- */}
                {activeTab === 'categories' && categories.map((cat) => (
                  <tr key={cat.id}>
                    <td>
                      {editingId === cat.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className={styles.input}
                          style={{ padding: '0.25rem 0.5rem', width: '200px' }}
                        />
                      ) : (
                        <span style={{ fontWeight: 600 }}>{cat.name}</span>
                      )}
                    </td>
                    <td>
                      <span className={`${styles.badge} ${cat.activeStatus ? styles.badgeDelivered : styles.badgeReceived}`}>
                        {cat.activeStatus ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        {editingId === cat.id ? (
                          <>
                            <button
                              onClick={() => {
                                editCategory(cat.id, editName, cat.activeStatus);
                                setEditingId(null);
                              }}
                              className={`${styles.btn} ${styles.btnPrimary}`}
                              style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className={`${styles.btn} ${styles.btnSecondary}`}
                              style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(cat.id);
                                setEditName(cat.name);
                              }}
                              className={`${styles.btn} ${styles.btnSecondary}`}
                              style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => editCategory(cat.id, cat.name, !cat.activeStatus)}
                              className={`${styles.btn} ${styles.btnSecondary}`}
                              style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
                            >
                              {cat.activeStatus ? <ToggleRight size={18} style={{ color: 'var(--success)' }} /> : <ToggleLeft size={18} />}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {/* --- Services Render --- */}
                {activeTab === 'services' && services.map((srv) => (
                  <tr key={srv.id}>
                    <td>
                      {editingId === srv.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className={styles.input}
                          style={{ padding: '0.25rem 0.5rem', width: '150px' }}
                        />
                      ) : (
                        <span style={{ fontWeight: 600 }}>{srv.name}</span>
                      )}
                    </td>
                    <td>
                      {editingId === srv.id ? (
                        <input
                          type="text"
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          className={styles.input}
                          style={{ padding: '0.25rem 0.5rem', width: '250px' }}
                        />
                      ) : (
                        <span style={{ color: 'var(--text-secondary)' }}>{srv.description || '-'}</span>
                      )}
                    </td>
                    <td>
                      <span className={`${styles.badge} ${srv.activeStatus ? styles.badgeDelivered : styles.badgeReceived}`}>
                        {srv.activeStatus ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        {editingId === srv.id ? (
                          <>
                            <button
                              onClick={() => {
                                editService(srv.id, editName, editDesc, srv.activeStatus);
                                setEditingId(null);
                              }}
                              className={`${styles.btn} ${styles.btnPrimary}`}
                              style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className={`${styles.btn} ${styles.btnSecondary}`}
                              style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(srv.id);
                                setEditName(srv.name);
                                setEditDesc(srv.description || '');
                              }}
                              className={`${styles.btn} ${styles.btnSecondary}`}
                              style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => editService(srv.id, srv.name, srv.description || '', !srv.activeStatus)}
                              className={`${styles.btn} ${styles.btnSecondary}`}
                              style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
                            >
                              {srv.activeStatus ? <ToggleRight size={18} style={{ color: 'var(--success)' }} /> : <ToggleLeft size={18} />}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {/* --- Defects Render --- */}
                {activeTab === 'defects' && defects.map((def) => (
                  <tr key={def.id}>
                    <td>
                      {editingId === def.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className={styles.input}
                          style={{ padding: '0.25rem 0.5rem', width: '200px' }}
                        />
                      ) : (
                        <span style={{ fontWeight: 600 }}>{def.name}</span>
                      )}
                    </td>
                    <td>
                      <span className={`${styles.badge} ${def.activeStatus ? styles.badgeDelivered : styles.badgeReceived}`}>
                        {def.activeStatus ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        {editingId === def.id ? (
                          <>
                            <button
                              onClick={() => {
                                editDefect(def.id, editName, def.activeStatus);
                                setEditingId(null);
                              }}
                              className={`${styles.btn} ${styles.btnPrimary}`}
                              style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className={`${styles.btn} ${styles.btnSecondary}`}
                              style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(def.id);
                                setEditName(def.name);
                              }}
                              className={`${styles.btn} ${styles.btnSecondary}`}
                              style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => editDefect(def.id, def.name, !def.activeStatus)}
                              className={`${styles.btn} ${styles.btnSecondary}`}
                              style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
                            >
                              {def.activeStatus ? <ToggleRight size={18} style={{ color: 'var(--success)' }} /> : <ToggleLeft size={18} />}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Add Form Panel */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className={styles.cardTitle} style={{ marginBottom: '1.25rem' }}>
            Add New {activeTab === 'categories' ? 'Category' : activeTab === 'services' ? 'Service' : 'Defect'}
          </h3>

          {/* Categories Form */}
          {activeTab === 'categories' && (
            <form onSubmit={handleAddCat}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Kurta, Blazer, Curtain"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ width: '100%' }}>
                <Plus size={16} />
                <span>Create Category</span>
              </button>
            </form>
          )}

          {/* Services Form */}
          {activeTab === 'services' && (
            <form onSubmit={handleAddSrv}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Service Name</label>
                <input
                  type="text"
                  placeholder="e.g. Premium Wash, Alteration"
                  value={newSrvName}
                  onChange={(e) => setNewSrvName(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Description</label>
                <textarea
                  placeholder="Service details and pricing notes"
                  value={newSrvDesc}
                  onChange={(e) => setNewSrvDesc(e.target.value)}
                  className={styles.textarea}
                />
              </div>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ width: '100%' }}>
                <Plus size={16} />
                <span>Create Service</span>
              </button>
            </form>
          )}

          {/* Defects Form */}
          {activeTab === 'defects' && (
            <form onSubmit={handleAddDef}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Defect Name</label>
                <input
                  type="text"
                  placeholder="e.g. Collar Wear, Zip Broken"
                  value={newDefName}
                  onChange={(e) => setNewDefName(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ width: '100%' }}>
                <Plus size={16} />
                <span>Create Defect</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
