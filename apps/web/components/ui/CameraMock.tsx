'use client';

import { useState } from 'react';
import { Camera, RefreshCw, Upload, Check, Trash2, Eye } from 'lucide-react';
import styles from './ui.module.css';

interface CameraMockProps {
  onCapture: (url: string) => void;
  label: string;
}

const PRESET_MOCK_IMAGES = [
  { name: 'Navy Shirt', url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600' },
  { name: 'Black Blazer', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600' },
  { name: 'Denim Jeans', url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600' },
  { name: 'Red T-Shirt', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600' },
  { name: 'Fabric Tear', url: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=600' }, // Close-up texture/stain/tear mock
];

export default function CameraMock({ onCapture, label }: CameraMockProps) {
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);

  const startCamera = () => {
    setIsCapturing(true);
  };

  const capturePhoto = () => {
    const randomImg = PRESET_MOCK_IMAGES[selectedPresetIndex]?.url || '';
    setPhotoUrl(randomImg);
    setIsCapturing(false);
    onCapture(randomImg);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result as string;
        setPhotoUrl(base64Url);
        onCapture(base64Url);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetCamera = () => {
    setPhotoUrl('');
    setIsCapturing(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      <span className={styles.label}>{label}</span>

      <div 
        style={{
          width: '100%',
          height: '200px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          background: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {photoUrl ? (
          <>
            <img 
              src={photoUrl} 
              alt={label} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            <div 
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                display: 'flex',
                gap: '0.5rem',
              }}
            >
              <button 
                type="button" 
                onClick={resetCamera} 
                className={`${styles.btn} ${styles.btnDanger}`} 
                style={{ padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-sm)' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </>
        ) : isCapturing ? (
          <div 
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '1rem',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%)',
            }}
          >
            {/* Camera Viewfinder graphics */}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)' }}>
              <div style={{ borderTop: '2px solid', borderLeft: '2px solid', width: '15px', height: '15px' }} />
              <div style={{ borderTop: '2px solid', borderRight: '2px solid', width: '15px', height: '15px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              {/* Preset Selector */}
              <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                <select 
                  value={selectedPresetIndex}
                  onChange={(e) => setSelectedPresetIndex(Number(e.target.value))}
                  className={styles.select}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: '130px', background: '#0d121f' }}
                >
                  {PRESET_MOCK_IMAGES.map((preset, idx) => (
                    <option key={idx} value={idx}>{preset.name}</option>
                  ))}
                </select>
                <button 
                  type="button"
                  onClick={capturePhoto} 
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)' }}
                >
                  Snap
                </button>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>[Simulated Viewfinder Active]</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)' }}>
              <div style={{ borderBottom: '2px solid', borderLeft: '2px solid', width: '15px', height: '15px' }} />
              <div style={{ borderBottom: '2px solid', borderRight: '2px solid', width: '15px', height: '15px' }} />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1rem' }}>
            <Camera size={32} style={{ color: 'var(--text-muted)' }} />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                type="button" 
                onClick={startCamera} 
                className={`${styles.btn} ${styles.btnSecondary}`} 
                style={{ padding: '0.4rem 0.75rem', gap: '0.35rem', fontSize: '0.8rem' }}
              >
                <Camera size={14} />
                <span>Open Lens</span>
              </button>

              <label 
                className={`${styles.btn} ${styles.btnSecondary}`} 
                style={{ padding: '0.4rem 0.75rem', gap: '0.35rem', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                <Upload size={14} />
                <span>Upload</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  style={{ display: 'none' }} 
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
