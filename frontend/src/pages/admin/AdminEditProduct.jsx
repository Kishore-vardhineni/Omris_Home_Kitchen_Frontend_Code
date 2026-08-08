import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Trash2, ArrowLeft, PlusCircle } from 'lucide-react';
import AdminLayout from './AdminLayout';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const CATEGORIES = ['veg-pickle', 'non-veg-pickle', 'podi', 'sweet', 'snack', 'combo', 'gift-pack'];

const AdminEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    name: '', category: 'veg-pickle', subCategory: '', shortDescription: '',
    longDescription: '', ingredients: '', shelfLife: '', storageInstructions: '',
    certificationBadges: '',
    isFeatured: false, isBestseller: false, isNewArrival: false,
    isActive: true, isVegetarian: true,
  });
  const [images, setImages] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [variants, setVariants] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API}/products/${id}`);
        const data = await res.json();
        if (data.success) {
          const p = data.product;
          setForm({
            name: p.name || '',
            category: p.category || 'veg-pickle',
            subCategory: p.subCategory || '',
            shortDescription: p.shortDescription || '',
            longDescription: p.longDescription || '',
            ingredients: Array.isArray(p.ingredients) ? p.ingredients.join(', ') : '',
            shelfLife: p.shelfLife || '',
            storageInstructions: p.storageInstructions || '',
            certificationBadges: Array.isArray(p.certificationBadges) ? p.certificationBadges.join(', ') : '',
            isFeatured: !!p.isFeatured,
            isBestseller: !!p.isBestseller,
            isNewArrival: !!p.isNewArrival,
            isActive: p.isActive !== false,
            isVegetarian: p.isVegetarian !== false,
          });
          
          let existing = [];
          if (p.image?.url) existing.push(p.image);
          if (Array.isArray(p.gallery)) existing = [...existing, ...p.gallery];
          setExistingImages(existing);
          setVariants((p.variants || []).map(v => ({
            label: v.label || '',
            weightInGrams: v.weightInGrams || '',
            sku: v.sku || '',
            price: v.price || '',
            discountedPrice: v.discountedPrice || '',
            stock: v.stock ?? 0,
          })));
        } else {
          setError('Product not found');
        }
      } catch {
        setError('Network error loading product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleVariantChange = (index, field, value) =>
    setVariants(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));

  const addVariant = () => setVariants(prev => [...prev, { label: '', weightInGrams: '', sku: '', price: '', discountedPrice: '', stock: 0 }]);
  const removeVariant = (i) => setVariants(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSubmitting(true);

    const formData = new FormData();
    formData.append('name', form.name.trim());
    formData.append('category', form.category);
    if (form.subCategory) formData.append('subCategory', form.subCategory);
    if (form.shortDescription) formData.append('shortDescription', form.shortDescription);
    if (form.longDescription) formData.append('longDescription', form.longDescription);
    if (form.shelfLife) formData.append('shelfLife', form.shelfLife);
    if (form.storageInstructions) formData.append('storageInstructions', form.storageInstructions);
    formData.append('isFeatured', form.isFeatured);
    formData.append('isBestseller', form.isBestseller);
    formData.append('isNewArrival', form.isNewArrival);
    formData.append('isActive', form.isActive);
    formData.append('isVegetarian', form.isVegetarian);

    const ingredientsArr = form.ingredients ? form.ingredients.split(',').map(s => s.trim()).filter(Boolean) : [];
    formData.append('ingredients', JSON.stringify(ingredientsArr));

    const badgesArr = form.certificationBadges ? form.certificationBadges.split(',').map(s => s.trim()).filter(Boolean) : [];
    formData.append('certificationBadges', JSON.stringify(badgesArr));

    const variantsArr = variants.map(v => ({
      label: v.label.trim(),
      weightInGrams: Number(v.weightInGrams),
      sku: v.sku.trim().toUpperCase(),
      price: Number(v.price),
      discountedPrice: v.discountedPrice ? Number(v.discountedPrice) : undefined,
      stock: Number(v.stock) || 0,
    }));
    formData.append('variants', JSON.stringify(variantsArr));

    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        formData.append('images', images[i]);
      }
    }

    try {
      const res = await fetch(`${API}/products/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Product updated successfully!');
        setTimeout(() => navigate('/admin/products'), 1500);
      } else {
        setError(data.message || 'Update failed');
      }
    } catch {
      setError('Network error — could not update product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <AdminLayout title="Edit Product">
      <div className="admin-loader"><div className="admin-spinner" /></div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Edit Product">
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
                <input className="admin-form-input" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Category <span>*</span></label>
                <select className="admin-form-select" name="category" value={form.category} onChange={handleChange}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Sub-Category</label>
                <input className="admin-form-input" name="subCategory" value={form.subCategory} onChange={handleChange} />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Shelf Life</label>
                <input className="admin-form-input" name="shelfLife" value={form.shelfLife} onChange={handleChange} />
              </div>
              <div className="admin-form-group full-width">
                <label className="admin-form-label">Short Description</label>
                <input className="admin-form-input" name="shortDescription" value={form.shortDescription} onChange={handleChange} />
              </div>
              <div className="admin-form-group full-width">
                <label className="admin-form-label">Long Description</label>
                <textarea className="admin-form-textarea" name="longDescription" value={form.longDescription} onChange={handleChange} />
              </div>
              <div className="admin-form-group full-width">
                <label className="admin-form-label">Ingredients (comma separated)</label>
                <input className="admin-form-input" name="ingredients" value={form.ingredients} onChange={handleChange} />
              </div>
              <div className="admin-form-group full-width">
                <label className="admin-form-label">Storage Instructions</label>
                <input className="admin-form-input" name="storageInstructions" value={form.storageInstructions} onChange={handleChange} />
              </div>
              <div className="admin-form-group full-width">
                <label className="admin-form-label">Certification Badges (comma separated)</label>
                <input className="admin-form-input" name="certificationBadges" value={form.certificationBadges} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="admin-card" style={{ marginBottom: '1.25rem' }}>
          <div className="admin-card-header"><span className="admin-card-title">Product Images</span></div>
          <div style={{ padding: '1.25rem' }}>
            {existingImages.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--adm-muted)', marginBottom: '0.5rem' }}>Existing Images:</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {existingImages.map((img, i) => (
                    <img key={i} src={img.url} alt={`existing-${i}`} style={{ height: '100px', borderRadius: '8px', border: '1px solid var(--admin-border)', objectFit: 'cover' }} />
                  ))}
                </div>
              </div>
            )}
            <div className="admin-form-group">
              <label className="admin-form-label">Upload New Images (First image is primary)</label>
              <input 
                className="admin-form-input" 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={(e) => setImages(e.target.files)} 
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--adm-muted)', marginTop: '0.25rem' }}>Note: Uploading new images will add to your gallery. Reordering images is not yet supported.</p>
            </div>
            {images && images.length > 0 && (
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {Array.from(images).map((file, i) => (
                  <img key={i} src={URL.createObjectURL(file)} alt={`preview-${i}`} style={{ height: '100px', borderRadius: '8px', border: '1px solid var(--admin-border)', objectFit: 'cover' }} />
                ))}
              </div>
            )}
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
                  <input className="admin-form-input" value={v.label} onChange={e => handleVariantChange(i, 'label', e.target.value)} required />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Weight (g)</label>
                  <input className="admin-form-input" type="number" value={v.weightInGrams} onChange={e => handleVariantChange(i, 'weightInGrams', e.target.value)} min="1" />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">SKU</label>
                  <input className="admin-form-input" value={v.sku} onChange={e => handleVariantChange(i, 'sku', e.target.value)} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Price ₹</label>
                  <input className="admin-form-input" type="number" value={v.price} onChange={e => handleVariantChange(i, 'price', e.target.value)} min="0" />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Discounted ₹</label>
                  <input className="admin-form-input" type="number" value={v.discountedPrice} onChange={e => handleVariantChange(i, 'discountedPrice', e.target.value)} min="0" />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Stock</label>
                  <input className="admin-form-input" type="number" value={v.stock} onChange={e => handleVariantChange(i, 'stock', e.target.value)} min="0" />
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

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="admin-btn admin-btn-primary" disabled={submitting} style={{ padding: '0.65rem 1.5rem' }}>
            {submitting ? 'Saving...' : <><Save size={16} /> Save Changes</>}
          </button>
          <button type="button" className="admin-btn admin-btn-ghost" onClick={() => navigate('/admin/products')}>Cancel</button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminEditProduct;
