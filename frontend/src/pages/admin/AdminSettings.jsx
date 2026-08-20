import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Upload, Save, CheckCircle, AlertCircle, X } from 'lucide-react';
import AdminLayout from './AdminLayout';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const AdminSettings = () => {
  const [upiId, setUpiId] = useState('');
  const [upiName, setUpiName] = useState('Omris Home Kitchen');
  const [upiQrCode, setUpiQrCode] = useState(''); // base64 or URL
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null); // {type: 'success'|'error', msg: ''}
  const fileInputRef = useRef(null);

  // Load existing settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API}/settings`);
        const data = await res.json();
        if (data.success && data.settings) {
          setUpiId(data.settings.upiId || '');
          setUpiName(data.settings.upiName || 'Omris Home Kitchen');
          setUpiQrCode(data.settings.upiQrCode || '');
          setPreviewUrl(data.settings.upiQrCode || '');
        }
      } catch (e) {
        console.error('Failed to load settings:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please select an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        // Compress: resize to max 400×400 and export as JPEG @ 80%
        const MAX = 400;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) {
            height = Math.round((height * MAX) / width);
            width = MAX;
          } else {
            width = Math.round((width * MAX) / height);
            height = MAX;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.80);
        setUpiQrCode(compressed);
        setPreviewUrl(compressed);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveQr = () => {
    setUpiQrCode('');
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ upiId, upiName, upiQrCode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', 'Settings saved successfully!');
      } else {
        showToast('error', data.message || 'Failed to save settings.');
      }
    } catch (err) {
      showToast('error', 'Server error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Payment Settings">
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed', top: 20, right: 20, zIndex: 9999,
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 18px', borderRadius: 10,
            background: toast.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: toast.type === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${toast.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            fontWeight: 500, fontSize: 14,
          }}
        >
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
        </div>
      )}

      {loading ? (
        <div className="admin-loader"><div className="admin-spinner" /></div>
      ) : (
        <div style={{ maxWidth: 700 }}>
          {/* Header card */}
          <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
            <div className="admin-card-header">
              <span className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <QrCode size={20} /> UPI Payment Settings
              </span>
            </div>
            <div style={{ padding: '1.5rem 1.25rem' }}>
              <p style={{ color: '#64748b', fontSize: 14, marginBottom: '1.5rem' }}>
                Configure your UPI payment details. The QR code uploaded here will appear on the checkout payment page for customers to scan.
              </p>

              {/* UPI Name */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>
                  Business Name (shown on QR)
                </label>
                <input
                  type="text"
                  value={upiName}
                  onChange={(e) => setUpiName(e.target.value)}
                  placeholder="Omris Home Kitchen"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    border: '1px solid #e2e8f0', fontSize: 14, outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* UPI ID */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>
                  UPI ID <span style={{ color: '#9ca3af', fontWeight: 400 }}>(e.g. yourname@upi)</span>
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    border: '1px solid #e2e8f0', fontSize: 14, outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* QR Code Upload */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 10 }}>
                  UPI QR Code Image
                </label>

                <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  {/* Upload area */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: 180, height: 180, border: '2px dashed #c7d2fe',
                      borderRadius: 12, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 10,
                      cursor: 'pointer', background: '#f8faff',
                      transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#818cf8'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#c7d2fe'}
                  >
                    <Upload size={28} color="#818cf8" />
                    <span style={{ fontSize: 12, color: '#6366f1', fontWeight: 600, textAlign: 'center', padding: '0 12px' }}>
                      Click to Upload QR Code
                    </span>
                    <span style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>PNG, JPG supported</span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />

                  {/* Preview */}
                  {previewUrl && (
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        width: 180, height: 180, border: '2px solid #e0e7ff',
                        borderRadius: 12, overflow: 'hidden', background: '#fff',
                        boxShadow: '0 2px 8px rgba(99,102,241,0.1)',
                      }}>
                        <img
                          src={previewUrl}
                          alt="UPI QR Code Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8, boxSizing: 'border-box' }}
                        />
                      </div>
                      <button
                        onClick={handleRemoveQr}
                        style={{
                          position: 'absolute', top: -8, right: -8,
                          background: '#ef4444', color: '#fff', border: 'none',
                          borderRadius: '50%', width: 24, height: 24,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        }}
                        title="Remove QR Code"
                      >
                        <X size={14} />
                      </button>
                      <p style={{ fontSize: 11, color: '#6b7280', textAlign: 'center', marginTop: 6 }}>Current QR Preview</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Save button */}
              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="admin-btn admin-btn-primary"
                  style={{ padding: '10px 28px', fontSize: 14, opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? (
                    <>Saving...</>
                  ) : (
                    <><Save size={16} /> Save Settings</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Preview card */}
          {previewUrl && (
            <div className="admin-card">
              <div className="admin-card-header">
                <span className="admin-card-title">Checkout Preview</span>
              </div>
              <div style={{ padding: '1.25rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{
                  background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12,
                  padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                }}>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Scan with any UPI app</p>
                  <img src={previewUrl} alt="QR" style={{ width: 150, height: 150, objectFit: 'contain' }} />
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['GPay', 'PhonePe', 'Paytm'].map(app => (
                      <span key={app} style={{
                        fontSize: 11, padding: '3px 10px', background: '#fff',
                        border: '1px solid #e2e8f0', borderRadius: 6, color: '#475569', fontWeight: 500,
                      }}>{app}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: 13, color: '#374151', fontWeight: 600, marginBottom: 4 }}>This is how your QR code will appear on the checkout page.</p>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                    UPI ID: <strong>{upiId || '(not set)'}</strong><br />
                    Name: <strong>{upiName}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminSettings;
