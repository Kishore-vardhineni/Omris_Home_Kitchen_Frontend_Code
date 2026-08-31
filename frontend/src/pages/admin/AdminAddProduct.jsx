import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, ArrowLeft } from 'lucide-react';
import AdminLayout from './AdminLayout';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const CATEGORIES = ['veg-pickle', 'non-veg-pickle', 'podi', 'sweet', 'snack', 'combo', 'gift-pack'];

const emptyVariant = () => ({
  label: '', weightInGrams: '', sku: '', price: '', discountedPrice: '', stock: 0,
});

const emptyGalleryItem = () => ({
  file: null,
  url: '',
  altText: '',
  preview: '',
});

const AdminAddProduct = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [form, setForm] = useState({
    name: '',
    category: 'veg-pickle',
    subCategory: '',
    shortDescription: '',
    longDescription: '',
    ingredients: '',
    shelfLife: '',
    storageInstructions: '',
    isFeatured: false,
    isBestseller: false,
    isNewArrival: false,
    isActive: true,
    isVegetarian: true,
    certificationBadges: '',
  });

  const [primaryImage, setPrimaryImage] = useState({
    file: null,
    url: '',
    altText: '',
    preview: '',
  });

  const [galleryItems, setGalleryItems] = useState([]);
  const [variants, setVariants] = useState([emptyVariant()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleVariantChange = (index, field, value) => {
    setVariants(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  const addVariant = () => setVariants(prev => [...prev, emptyVariant()]);
  const removeVariant = (index) => setVariants(prev => prev.filter((_, i) => i !== index));

  const addGalleryItem = () => setGalleryItems(prev => [...prev, emptyGalleryItem()]);
  const removeGalleryItem = (index) => setGalleryItems(prev => prev.filter((_, i) => i !== index));
  const handleGalleryItemChange = (index, field, value) => {
    setGalleryItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const compressImage = (file, maxPx = 900, quality = 0.75) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const rawDataUrl = ev.target.result;
        const img = new Image();
        img.onload = () => {
          try {
            let { width, height } = img;
            if (width > maxPx || height > maxPx) {
              if (width > height) { height = Math.round((height * maxPx) / width); width = maxPx; }
              else { width = Math.round((width * maxPx) / height); height = maxPx; }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width; canvas.height = height;
            canvas.getContext('2d').drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } catch (e) {
            resolve(rawDataUrl);
          }
        };
        img.onerror = () => resolve(rawDataUrl);
        img.src = rawDataUrl;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      // 1. Process Primary Image
      let primaryPayload = { url: '', altText: primaryImage.altText || form.name };
      if (primaryImage.file) {
        const base64 = await compressImage(primaryImage.file);
        if (base64) {
          primaryPayload = { base64, altText: primaryImage.altText || form.name };
        }
      } else if (primaryImage.url && primaryImage.url.trim()) {
        primaryPayload = { url: primaryImage.url.trim(), altText: primaryImage.altText || form.name };
      }

      // 2. Process Gallery Items
      const processedGalleryItems = [];
      for (const item of galleryItems) {
        if (item.file) {
          const base64 = await compressImage(item.file);
          processedGalleryItems.push({ base64, altText: item.altText || form.name });
        } else if (item.url && item.url.trim()) {
          processedGalleryItems.push({ url: item.url.trim(), altText: item.altText || form.name });
        }
      }

      const payload = {
        name: form.name.trim(),
        category: form.category,
        subCategory: form.subCategory || undefined,
        shortDescription: form.shortDescription || undefined,
        longDescription: form.longDescription || undefined,
        ingredients: form.ingredients ? form.ingredients.split(',').map(s => s.trim()).filter(Boolean) : [],
        shelfLife: form.shelfLife || undefined,
        storageInstructions: form.storageInstructions || undefined,
        isFeatured: form.isFeatured,
        isBestseller: form.isBestseller,
        isNewArrival: form.isNewArrival,
        isActive: form.isActive,
        isVegetarian: form.isVegetarian,
        certificationBadges: form.certificationBadges ? form.certificationBadges.split(',').map(s => s.trim()).filter(Boolean) : [],
        variants: variants.map(v => ({
          label: v.label.trim(),
          weightInGrams: Number(v.weightInGrams),
          sku: v.sku.trim().toUpperCase(),
          price: Number(v.price),
          discountedPrice: v.discountedPrice ? Number(v.discountedPrice) : undefined,
          stock: Number(v.stock) || 0,
        })),
        primaryImage: primaryPayload,
        galleryItems: processedGalleryItems,
      };

      const res = await fetch(`${API}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Product added successfully! Redirecting...');
        setTimeout(() => navigate('/admin/products'), 1500);
      } else {
        setError(data.message || 'Failed to add product');
      }
    } catch {
      setError('Network error — could not add product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Add New Product">
      <div style={{ marginBottom: '1rem' }}>
        <button className="admin-btn admin-btn-ghost" onClick={() => navigate('/admin/products')}>
          <ArrowLeft size={16} /> Back to Products
        </button>
      </div>

      {error   && <div className="admin-alert admin-alert-error"   style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="admin-alert admin-alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="admin-card" style={{ marginBottom: '1.25rem' }}>
          <div className="admin-card-header"><span className="admin-card-title">Basic Information</span></div>
          <div style={{ padding: '1.25rem' }}>
            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label className="admin-form-label">Product Name <span>*</span></label>
                <input className="admin-form-input" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Mango Pickle" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Category <span>*</span></label>
                <select className="admin-form-select" name="category" value={form.category} onChange={handleChange}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Sub-Category</label>
                <input className="admin-form-input" name="subCategory" value={form.subCategory} onChange={handleChange} placeholder="e.g. Mango, Lemon" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Shelf Life</label>
                <input className="admin-form-input" name="shelfLife" value={form.shelfLife} onChange={handleChange} placeholder="e.g. 12 months" />
              </div>
              <div className="admin-form-group full-width">
                <label className="admin-form-label">Short Description</label>
                <input className="admin-form-input" name="shortDescription" value={form.shortDescription} onChange={handleChange} placeholder="One-line summary (max 300 chars)" />
              </div>
              <div className="admin-form-group full-width">
                <label className="admin-form-label">Long Description</label>
                <textarea className="admin-form-textarea" name="longDescription" value={form.longDescription} onChange={handleChange} placeholder="Detailed product description" />
              </div>
              <div className="admin-form-group full-width">
                <label className="admin-form-label">Ingredients (comma separated)</label>
                <input className="admin-form-input" name="ingredients" value={form.ingredients} onChange={handleChange} placeholder="Mango, Salt, Red Chilli, Mustard Oil" />
              </div>
              <div className="admin-form-group full-width">
                <label className="admin-form-label">Storage Instructions</label>
                <input className="admin-form-input" name="storageInstructions" value={form.storageInstructions} onChange={handleChange} placeholder="e.g. Store in cool, dry place" />
              </div>
              <div className="admin-form-group full-width">
                <label className="admin-form-label">Certification Badges (comma separated)</label>
                <input className="admin-form-input" name="certificationBadges" value={form.certificationBadges} onChange={handleChange} placeholder="No Preservatives, 100% Natural" />
              </div>
            </div>
          </div>
        </div>

        {/* 1. Primary Product Image */}
        <div className="admin-card" style={{ marginBottom: '1.25rem' }}>
          <div className="admin-card-header"><span className="admin-card-title">1. Primary Product Image <span>*</span></span></div>
          <div style={{ padding: '1.25rem' }}>
            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label className="admin-form-label">Upload Image File OR Paste Image URL <span>*</span></label>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="admin-form-input" 
                  style={{ marginBottom: '0.5rem' }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setPrimaryImage(prev => ({ ...prev, file, preview: URL.createObjectURL(file) }));
                    }
                  }}
                />
                <input 
                  className="admin-form-input" 
                  placeholder="Or paste primary image URL (https://...)" 
                  value={primaryImage.url} 
                  onChange={(e) => setPrimaryImage(prev => ({ ...prev, url: e.target.value }))} 
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Alt Text</label>
                <input 
                  className="admin-form-input" 
                  placeholder="Alt text for primary image" 
                  value={primaryImage.altText} 
                  onChange={(e) => setPrimaryImage(prev => ({ ...prev, altText: e.target.value }))} 
                />
              </div>
            </div>
            {(primaryImage.preview || primaryImage.url) && (
              <div style={{ marginTop: '0.75rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--adm-muted)', marginBottom: '0.25rem' }}>Preview:</p>
                <img 
                  src={primaryImage.preview || primaryImage.url} 
                  alt="Primary Preview" 
                  style={{ height: '100px', width: '100px', borderRadius: '8px', border: '2px solid #3b5bdb', objectFit: 'cover' }} 
                  onError={(e) => { e.target.style.display='none'; }} 
                />
              </div>
            )}
          </div>
        </div>

        {/* 2. Gallery Images (+ Add Gallery Image) */}
        <div className="admin-card" style={{ marginBottom: '1.25rem' }}>
          <div className="admin-card-header">
            <span className="admin-card-title">2. Gallery Images</span>
            <button type="button" className="admin-btn admin-btn-ghost" onClick={addGalleryItem}>
              <PlusCircle size={15} /> Add Gallery Image
            </button>
          </div>
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {galleryItems.length === 0 && (
              <p style={{ fontSize: '0.85rem', color: 'var(--adm-muted)', margin: 0 }}>
                No additional gallery images added yet. Click "+ Add Gallery Image" above to add extra photos.
              </p>
            )}
            {galleryItems.map((item, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', alignItems: 'flex-start', padding: '0.85rem', background: 'var(--admin-bg-light, #f8f9fa)', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Upload File OR Paste Image URL</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="admin-form-input"
                    style={{ marginBottom: '0.4rem' }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleGalleryItemChange(i, 'file', file);
                        handleGalleryItemChange(i, 'preview', URL.createObjectURL(file));
                      }
                    }}
                  />
                  <input
                    className="admin-form-input"
                    placeholder="Or paste gallery image URL (https://...)"
                    value={item.url}
                    onChange={(e) => handleGalleryItemChange(i, 'url', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Alt Text</label>
                  <input
                    className="admin-form-input"
                    placeholder="Alt text for gallery image"
                    value={item.altText}
                    onChange={(e) => handleGalleryItemChange(i, 'altText', e.target.value)}
                  />
                  {(item.preview || item.url) && (
                    <img
                      src={item.preview || item.url}
                      alt={`Gallery preview ${i+1}`}
                      style={{ marginTop: '0.5rem', height: '60px', width: '60px', borderRadius: '6px', border: '1px solid var(--admin-border)', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                </div>
                <button
                  type="button"
                  className="admin-btn admin-btn-danger"
                  style={{ padding: '0.4rem 0.6rem', alignSelf: 'center', marginTop: '1.25rem' }}
                  onClick={() => removeGalleryItem(i)}
                  title="Remove image"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Variants */}
        <div className="admin-card" style={{ marginBottom: '1.25rem' }}>
          <div className="admin-card-header">
            <span className="admin-card-title">Variants / Packing Sizes</span>
            <button type="button" className="admin-btn admin-btn-ghost" onClick={addVariant}>
              <PlusCircle size={15} /> Add Variant
            </button>
          </div>
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {variants.map((v, i) => (
              <div key={i} className="variant-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Label <span>*</span></label>
                  <input className="admin-form-input" value={v.label} onChange={e => handleVariantChange(i, 'label', e.target.value)} placeholder="250g" required />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Weight (g) <span>*</span></label>
                  <input className="admin-form-input" type="number" value={v.weightInGrams} onChange={e => handleVariantChange(i, 'weightInGrams', e.target.value)} placeholder="250" required min="1" />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">SKU <span>*</span></label>
                  <input className="admin-form-input" value={v.sku} onChange={e => handleVariantChange(i, 'sku', e.target.value)} placeholder="MNG-250G" required />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Price ₹ <span>*</span></label>
                  <input className="admin-form-input" type="number" value={v.price} onChange={e => handleVariantChange(i, 'price', e.target.value)} placeholder="199" required min="0" />
                </div>
                <div className="admin-form-group" style={{ minWidth: '90px' }}>
                  <label className="admin-form-label">Discount %</label>
                  <select 
                    className="admin-form-select" 
                    value={(() => {
                      if (v.price && v.discountedPrice && Number(v.price) > 0) {
                        const pct = Math.round(((Number(v.price) - Number(v.discountedPrice)) / Number(v.price)) * 100);
                        const options = [0, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100];
                        return options.includes(pct) ? pct : 0;
                      }
                      return 0;
                    })()}
                    onChange={e => {
                      const discount = parseInt(e.target.value, 10);
                      if (v.price && discount > 0) {
                        const newDiscountedPrice = Math.round(v.price * (1 - discount / 100));
                        handleVariantChange(i, 'discountedPrice', newDiscountedPrice);
                      } else if (discount === 0) {
                        handleVariantChange(i, 'discountedPrice', '');
                      }
                    }}
                  >
                    {[0, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100].map(pct => (
                      <option key={pct} value={pct}>{pct === 0 ? '0%' : `${pct}%`}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Discounted ₹</label>
                  <input className="admin-form-input" type="number" value={v.discountedPrice} onChange={e => handleVariantChange(i, 'discountedPrice', e.target.value)} placeholder="149" min="0" />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Stock</label>
                  <input className="admin-form-input" type="number" value={v.stock} onChange={e => handleVariantChange(i, 'stock', e.target.value)} placeholder="50" min="0" />
                </div>
                {variants.length > 1 && (
                  <button type="button" className="admin-btn admin-btn-danger" style={{ padding: '0.35rem 0.6rem', alignSelf: 'flex-end' }} onClick={() => removeVariant(i)}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Flags */}
        <div className="admin-card" style={{ marginBottom: '1.25rem' }}>
          <div className="admin-card-header"><span className="admin-card-title">Product Flags</span></div>
          <div style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
            {[
              { name: 'isFeatured', label: 'Featured' },
              { name: 'isBestseller', label: 'Bestseller' },
              { name: 'isNewArrival', label: 'New Arrival' },
              { name: 'isActive', label: 'Active' },
              { name: 'isVegetarian', label: 'Vegetarian' },
            ].map(({ name, label }) => (
              <label key={name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
                <input type="checkbox" name={name} checked={form[name]} onChange={handleChange} style={{ width: '16px', height: '16px', accentColor: '#3b5bdb' }} />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="admin-btn admin-btn-primary" disabled={submitting} style={{ padding: '0.65rem 1.5rem' }}>
            {submitting ? 'Adding...' : <><PlusCircle size={16} /> Add Product</>}
          </button>
          <button type="button" className="admin-btn admin-btn-ghost" onClick={() => navigate('/admin/products')}>
            Cancel
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminAddProduct;
