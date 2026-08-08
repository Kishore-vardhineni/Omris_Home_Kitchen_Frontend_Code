import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Pencil, Trash2, Search, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import AdminLayout from './AdminLayout';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const CATEGORIES = ['all', 'veg-pickle', 'non-veg-pickle', 'podi', 'sweet', 'snack', 'combo', 'gift-pack'];

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const token = localStorage.getItem('token');

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ limit: 100 });
      if (category !== 'all') params.set('category', category);
      const res = await fetch(`${API}/products?${params}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      } else {
        setError(data.message || 'Failed to load products');
      }
    } catch {
      setError('Network error — could not fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [category]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`${API}/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.filter(p => p._id !== id));
        setSuccess(`"${name}" deleted successfully`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Delete failed');
      }
    } catch {
      setError('Network error while deleting');
    } finally {
      setDeleting(null);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFiltered = React.useMemo(() => {
    let result = products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
    if (sortConfig.key) {
      result.sort((a, b) => {
        let valA, valB;
        if (sortConfig.key === 'variants') {
          valA = a.variants?.length || 0;
          valB = b.variants?.length || 0;
        } else if (sortConfig.key === 'price') {
          valA = a.startingPrice ?? (a.variants?.[0]?.price ?? 0);
          valB = b.startingPrice ?? (b.variants?.[0]?.price ?? 0);
        } else if (sortConfig.key === 'status') {
          valA = a.isActive ? 1 : 0;
          valB = b.isActive ? 1 : 0;
        } else {
          valA = (a[sortConfig.key] || '').toString().toLowerCase();
          valB = (b[sortConfig.key] || '').toString().toLowerCase();
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [products, search, sortConfig]);

  // Reset to first page on filter or sort change
  useEffect(() => { setCurrentPage(1); }, [search, category, sortConfig]);

  const totalPages = Math.ceil(sortedAndFiltered.length / itemsPerPage);
  const currentProducts = sortedAndFiltered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 4 }} /> : <ChevronDown size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 4 }} />;
  };

  return (
    <AdminLayout title="All Products">
      {/* Alerts */}
      {error   && <div className="admin-alert admin-alert-error"   style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="admin-alert admin-alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}

      <div className="admin-card">
        {/* Header */}
        <div className="admin-card-header">
          <span className="admin-card-title">Products ({sortedAndFiltered.length})</span>
          <Link to="/admin/products/add" className="admin-btn admin-btn-primary">
            <PlusCircle size={16} /> Add Product
          </Link>
        </div>

        {/* Filters */}
        <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--admin-border)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              className="admin-form-input"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '2.2rem' }}
            />
          </div>
          <select
            className="admin-form-select"
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{ width: 'auto' }}
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
            ))}
          </select>
          <button className="admin-btn admin-btn-ghost" onClick={fetchProducts} title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="admin-loader"><div className="admin-spinner" /></div>
        ) : sortedAndFiltered.length === 0 ? (
          <div className="admin-empty">
            <Package size={40} style={{ opacity: 0.3, margin: '0 auto 0.75rem' }} />
            <p>No products found.</p>
          </div>
        ) : (
          <>
            <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')} style={{cursor: 'pointer'}}>Product <SortIcon columnKey="name" /></th>
                  <th onClick={() => handleSort('category')} style={{cursor: 'pointer'}}>Category <SortIcon columnKey="category" /></th>
                  <th onClick={() => handleSort('variants')} style={{cursor: 'pointer'}}>Variants <SortIcon columnKey="variants" /></th>
                  <th onClick={() => handleSort('price')} style={{cursor: 'pointer'}}>Starting Price <SortIcon columnKey="price" /></th>
                  <th onClick={() => handleSort('status')} style={{cursor: 'pointer'}}>Status <SortIcon columnKey="status" /></th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map(p => (
                  <tr key={p._id}>
                    <td data-label="Product">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {p.image?.url
                          ? <img src={p.image.url} alt={p.name} className="admin-product-img" />
                          : <div className="admin-product-img" style={{ background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🥒</div>
                        }
                        <span style={{ fontWeight: 600, textAlign: 'left' }}>{p.name}</span>
                      </div>
                    </td>
                    <td data-label="Category">
                      <span className="admin-badge admin-badge-info">{p.category}</span>
                    </td>
                    <td data-label="Variants">{p.variants?.length ?? 0}</td>
                    <td data-label="Starting Price">₹{p.startingPrice ?? (p.variants?.[0]?.price ?? '—')}</td>
                    <td data-label="Status">
                      <span className={`admin-badge ${p.isActive ? 'admin-badge-success' : 'admin-badge-danger'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <Link to={`/admin/products/edit/${p._id}`} className="admin-btn admin-btn-ghost" style={{ padding: '0.35rem 0.6rem' }}>
                          <Pencil size={14} />
                        </Link>
                        <button
                          className="admin-btn admin-btn-danger"
                          style={{ padding: '0.35rem 0.6rem' }}
                          onClick={() => handleDelete(p._id, p.name)}
                          disabled={deleting === p._id}
                        >
                          {deleting === p._id ? '...' : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--adm-border)', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--adm-muted)' }}>
              Showing {sortedAndFiltered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedAndFiltered.length)} of {sortedAndFiltered.length} products
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="admin-btn admin-btn-ghost"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                style={{ padding: '0.4rem 0.8rem' }}
              >
                Previous
              </button>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                {currentPage} / {Math.max(1, totalPages)}
              </div>
              <button
                className="admin-btn admin-btn-ghost"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                style={{ padding: '0.4rem 0.8rem' }}
              >
                Next
              </button>
            </div>
          </div>
        </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
