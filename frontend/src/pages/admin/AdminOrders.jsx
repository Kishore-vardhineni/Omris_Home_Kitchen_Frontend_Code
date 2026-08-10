import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  Package,
  Truck,
  XCircle,
  ChevronDown,
  ChevronUp,
  User,
  Phone,
  Mail,
  IndianRupee,
} from 'lucide-react';
import AdminLayout from './AdminLayout';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const STATUS_CONFIG = {
  Pending:    { color: '#d97706', bg: '#fef3c7', border: '#fde68a', label: 'Pending' },
  Confirmed:  { color: '#059669', bg: '#d1fae5', border: '#a7f3d0', label: 'Order Placed' },
  Processing: { color: '#7c3aed', bg: '#ede9fe', border: '#ddd6fe', label: 'Processing' },
  Shipped:    { color: '#0284c7', bg: '#e0f2fe', border: '#bae6fd', label: 'Shipped' },
  Delivered:  { color: '#16a34a', bg: '#dcfce7', border: '#86efac', label: 'Delivered' },
  Cancelled:  { color: '#dc2626', bg: '#fee2e2', border: '#fecaca', label: 'Cancelled' },
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedOrders, setExpandedOrders] = useState({});
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(data.orders || []);
      } else {
        setError(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error(err);
      setError('Server error while loading orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(prev =>
          prev.map(o => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtered orders logic
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      order._id.toLowerCase().includes(searchLower) ||
      order.user?.name?.toLowerCase().includes(searchLower) ||
      order.user?.email?.toLowerCase().includes(searchLower) ||
      order.user?.phone?.includes(searchTerm) ||
      order.orderItems?.some(item => item.name?.toLowerCase().includes(searchLower));

    return matchesStatus && matchesSearch;
  });

  // Calculate metrics
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const activeOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;

  return (
    <AdminLayout title="Order Management">
      {/* ── Summary Stats Grid ── */}
      <div className="admin-stats-grid mb-6">
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#eef2ff' }}>
            <ShoppingBag size={24} color="#3b5bdb" />
          </div>
          <div className="admin-stat-info">
            <h3>{loading ? '—' : totalOrders}</h3>
            <p>Total Orders</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#d1fae5' }}>
            <IndianRupee size={24} color="#059669" />
          </div>
          <div className="admin-stat-info">
            <h3>{loading ? '—' : `₹${totalRevenue.toFixed(2)}`}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#fef3c7' }}>
            <Clock size={24} color="#d97706" />
          </div>
          <div className="admin-stat-info">
            <h3>{loading ? '—' : activeOrders}</h3>
            <p>Active Orders</p>
          </div>
        </div>
      </div>

      {/* ── Filters & Search Toolbar ── */}
      <div className="admin-card mb-6" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#f3f4f6', padding: '0.6rem 1rem', borderRadius: '10px', width: '100%', maxWidth: '360px' }}>
            <Search size={18} color="#9ca3af" style={{ marginRight: '0.5rem' }} />
            <input
              type="text"
              placeholder="Search by ID, customer name, phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '0.875rem' }}
            />
          </div>

          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Filter size={16} color="#6b7280" style={{ marginRight: '0.25rem' }} />
            {['All', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: statusFilter === st ? '1px solid #3b5bdb' : '1px solid #e5e7eb',
                  background: statusFilter === st ? '#3b5bdb' : '#fff',
                  color: statusFilter === st ? '#fff' : '#4b5563',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {st === 'Confirmed' ? 'Placed' : st}
              </button>
            ))}

            <button
              onClick={fetchOrders}
              className="admin-btn admin-btn-ghost"
              style={{ padding: '0.45rem 0.75rem', marginLeft: '0.5rem' }}
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Orders Table / List ── */}
      <div className="admin-card">
        <div className="admin-card-header">
          <span className="admin-card-title">Order History</span>
          <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500 }}>
            Showing {filteredOrders.length} of {orders.length} orders
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div className="admin-spinner" style={{ margin: '0 auto 1rem auto' }} />
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Loading customer orders...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#dc2626' }}>
            <XCircle size={36} style={{ margin: '0 auto 0.5rem auto' }} />
            <p style={{ fontWeight: 600 }}>{error}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            <ShoppingBag size={48} color="#d1d5db" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.1rem', color: '#374151', marginBottom: '0.25rem' }}>No orders found</h3>
            <p style={{ fontSize: '0.875rem' }}>No orders match your filter criteria.</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>Order ID & Date</th>
                  <th>Customer</th>
                  <th>Items Summary</th>
                  <th>Total Price</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => {
                  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.Confirmed;
                  const isExpanded = !!expandedOrders[order._id];
                  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <React.Fragment key={order._id}>
                      <tr style={{ background: isExpanded ? '#fafafa' : '#fff' }}>
                        <td>
                          <button
                            onClick={() => toggleExpand(order._id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}
                          >
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.85rem', color: '#111827' }}>
                            #{order._id.slice(-8).toUpperCase()}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                            {formattedDate}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '0.875rem' }}>
                            {order.user?.name || 'Customer'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Mail size={12} /> {order.user?.email || 'N/A'}
                          </div>
                          {order.user?.phone && (
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                              <Phone size={12} /> {order.user?.phone}
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem', color: '#374151' }}>
                            <strong>{order.orderItems?.length || 0}</strong> item(s)
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {order.orderItems?.map(i => i.name?.replace(/\s*\([^)]*\)/, '')).join(', ')}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>
                            ₹{(order.totalPrice || 0).toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: '#f3f4f6',
                            color: '#374151',
                          }}>
                            {order.paymentMethod || 'WhatsApp'}
                          </span>
                        </td>
                        <td>
                          <select
                            value={order.status}
                            onChange={e => handleStatusChange(order._id, e.target.value)}
                            disabled={updatingId === order._id}
                            style={{
                              background: statusInfo.bg,
                              color: statusInfo.color,
                              border: `1px solid ${statusInfo.border}`,
                              borderRadius: '8px',
                              padding: '4px 8px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              outline: 'none',
                            }}
                          >
                            <option value="Confirmed">Order Placed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>

                      {/* Expanded Order Detail Row */}
                      {isExpanded && (
                        <tr style={{ background: '#f9fafb' }}>
                          <td colSpan={7} style={{ padding: '1.25rem 1.5rem', borderBottom: '2px solid #e5e7eb' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                              
                              {/* Left Column: Order Items */}
                              <div>
                                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#6b7280', marginBottom: '0.75rem', tracking: '0.05em' }}>
                                  Itemized Details
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                  {order.orderItems?.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        {item.image ? (
                                          <img src={item.image} alt={item.name} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                                        ) : (
                                          <div style={{ width: 36, height: 36, borderRadius: 6, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🥒</div>
                                        )}
                                        <div>
                                          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                                            {item.name?.replace(/\s*\([^)]*\)/, '') || item.name}
                                          </p>
                                          <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                                            {item.weight && <span>{item.weight}</span>}
                                            {item.packing && item.packing !== 'Without Bottle' && <span> • {item.packing}</span>}
                                            <span> × {item.quantity}</span>
                                          </p>
                                        </div>
                                      </div>
                                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>
                                        ₹{(item.price * item.quantity).toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Right Column: Customer & Delivery Info */}
                              <div style={{ background: '#fff', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#6b7280', marginBottom: '0.75rem' }}>
                                  Customer & Order Summary
                                </h4>
                                <div style={{ fontSize: '0.85rem', color: '#374151', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                  <p><strong>Customer Name:</strong> {order.user?.name || 'Guest/User'}</p>
                                  <p><strong>Email:</strong> {order.user?.email || 'N/A'}</p>
                                  <p><strong>Phone:</strong> {order.user?.phone || 'N/A'}</p>
                                  <p><strong>Order ID:</strong> #{order._id}</p>
                                  <p><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString('en-IN')}</p>
                                  <p><strong>Payment Method:</strong> {order.paymentMethod || 'WhatsApp'}</p>
                                  <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 600 }}>Grand Total:</span>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669' }}>
                                      ₹{(order.totalPrice || 0).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
