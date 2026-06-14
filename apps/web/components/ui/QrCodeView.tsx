'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Printer, Download } from 'lucide-react';
import styles from './ui.module.css';

interface QrCodeViewProps {
  value: string; // garment QR text, e.g., LM-000001
  customerName?: string;
  categoryName?: string;
  brandName?: string;
  color?: string;
}

export default function QrCodeView({
  value,
  customerName = 'Unknown',
  categoryName = 'Garment',
  brandName = '',
  color = '',
}: QrCodeViewProps) {
  const [qrUrl, setQrUrl] = useState<string>('');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    QRCode.toDataURL(
      value,
      {
        width: 150,
        margin: 1,
        color: {
          dark: '#0f172a', // deep navy for barcode scanners to read easily
          light: '#ffffff',
        },
      },
      (err, url) => {
        if (!err) setQrUrl(url);
      }
    );
  }, [value]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Label - ${value}</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }
            .label-card {
              border: 2px dashed #000;
              padding: 15px;
              width: 200px;
              text-align: center;
              border-radius: 8px;
              background-color: #fff;
            }
            .qr-image {
              width: 140px;
              height: 140px;
              margin: 5px auto;
            }
            .qr-text {
              font-size: 16px;
              font-weight: bold;
              margin: 3px 0;
              letter-spacing: 1px;
            }
            .meta {
              font-size: 10px;
              color: #555;
              text-transform: uppercase;
              margin: 2px 0;
            }
            .client {
              font-size: 12px;
              font-weight: 600;
              margin-top: 5px;
              border-top: 1px solid #ddd;
              padding-top: 5px;
            }
          </style>
        </head>
        <body>
          <div class="label-card">
            <div class="meta">${categoryName} ${brandName ? `| ${brandName}` : ''}</div>
            <img class="qr-image" src="${qrUrl}" alt="QR Code" />
            <div class="qr-text">${value}</div>
            <div class="client">${customerName}</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `QR-${value}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div 
        ref={printRef}
        style={{
          background: '#fff',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          border: '1px solid rgba(0,0,0,0.1)',
          width: '200px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
        }}
      >
        <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
          {categoryName} {color ? `(${color})` : ''}
        </span>
        
        {qrUrl ? (
          <img src={qrUrl} alt={value} style={{ width: '130px', height: '130px', margin: '0.5rem 0' }} />
        ) : (
          <div style={{ width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            Generating...
          </div>
        )}

        <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.05em', color: '#0f172a', fontFamily: 'var(--font-display)' }}>
          {value}
        </span>
        <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 500, borderTop: '1px solid #e2e8f0', width: '100%', textAlign: 'center', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
          {customerName}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
        <button 
          onClick={handlePrint} 
          style={{ flex: 1, padding: '0.5rem 0.75rem', gap: '0.35rem' }}
          className={`${styles.btn} ${styles.btnPrimary}`}
          disabled={!qrUrl}
        >
          <Printer size={15} />
          <span>Print Tag</span>
        </button>

        <button 
          onClick={handleDownload} 
          style={{ flex: 1, padding: '0.5rem 0.75rem', gap: '0.35rem' }}
          className={`${styles.btn} ${styles.btnSecondary}`}
          disabled={!qrUrl}
        >
          <Download size={15} />
          <span>Save PNG</span>
        </button>
      </div>
    </div>
  );
}
