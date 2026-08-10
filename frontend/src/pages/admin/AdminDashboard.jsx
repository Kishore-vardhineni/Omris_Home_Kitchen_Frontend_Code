import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Tag, PlusCircle, TrendingUp, ShoppingBag } from 'lucide-react';
import AdminLayout from './AdminLayout';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const categoryColors = {
  'veg-pickle':     { bg: '#d1fae5', color: '#065f46', label: 'Veg Pickle' },
  'non-veg-pickle': { bg: '#fee2e2', color: '#991b1b', label: 'Non-Veg Pickle' },
  'podi':           { bg: '#fef3c7', color: '#92400e', label: 'Podi' },
  'sweet':          { bg: '#ede9fe', color: '#5b21b6', label: 'Sweet' },
  'snack':          { bg: '#dbeafe', color: '#1e40af', label: 'Snack' },
  'combo':          { bg: '#fce7f3', color: '#9d174d', label: 'Combo' },
  'gift-pack':      { bg: '#e0e7ff', color: '#3730a3', label: 'Gift Pack' },
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API}/products?limit=100&active=true`);
        const data = await res.json();
        if (data.success) {
          const byCategory = data.products.reduce((acc, p) => {
            acc[p.category] = (acc[p.category] || 0) + 1;
            return acc;
          }, {});
          setStats({ total: data.total, byCategory });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <AdminLayout title="Dashboard">
      {/* Stat Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#eef2ff' }}>
            <Package size={24} color="#3b5bdb" />
          </div>
          <div className="admin-stat-info">
            <h3>{loading ? '—' : stats?.total ?? 0}</h3>
            <p>Total Products</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#d1fae5' }}>
            <Tag size={24} color="#065f46" />
          </div>
          <div className="admin-stat-info">
            <h3>{loading ? '—' : Object.keys(stats?.byCategory || {}).length}</h3>
            <p>Categories</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#fef3c7' }}>
            <TrendingUp size={24} color="#92400e" />
          </div>
          <div className="admin-stat-info">
            <h3>{loading ? '—' : stats?.byCategory?.['veg-pickle'] ?? 0}</h3>
            <p>Veg Pickles</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#fee2e2' }}>
            <TrendingUp size={24} color="#991b1b" />
          </div>
          <div className="admin-stat-info">
            <h3>{loading ? '—' : stats?.byCategory?.['non-veg-pickle'] ?? 0}</h3>
            <p>Non-Veg Pickles</p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
        <div className="admin-card-header">
          <span className="admin-card-title">Products by Category</span>
          <Link to="/admin/products/add" className="admin-btn admin-btn-primary">
            <PlusCircle size={16} /> Add Product
          </Link>
        </div>
        <div style={{ padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {loading ? (
            <div className="admin-loader"><div className="admin-spinner" /></div>
          ) : Object.entries(stats?.byCategory || {}).map(([cat, count]) => {
            const style = categoryColors[cat] || { bg: '#f3f4f6', color: '#374151', label: cat };
            return (
              <div key={cat} style={{
                background: style.bg,
                color: style.color,
                borderRadius: '10px',
                padding: '0.75rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '110px',
              }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{count}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: '0.2rem' }}>{style.label}</span>
              </div>
            );
          })}
          {!loading && Object.keys(stats?.byCategory || {}).length === 0 && (
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>No products yet. <Link to="/admin/products/add" style={{ color: '#3b5bdb' }}>Add your first product →</Link></p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-card">
        <div className="admin-card-header">
          <span className="admin-card-title">Quick Actions</span>
        </div>
        <div style={{ padding: '1rem 1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/admin/orders" className="admin-btn admin-btn-primary">
            <ShoppingBag size={16} /> View Order History
          </Link>
          <Link to="/admin/products" className="admin-btn admin-btn-ghost">
            <Package size={16} /> Manage Products
          </Link>
          <Link to="/admin/products/add" className="admin-btn admin-btn-ghost">
            <PlusCircle size={16} /> Add New Product
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
