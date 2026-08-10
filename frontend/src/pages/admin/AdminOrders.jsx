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
  FileSpreadsheet,
  FileText,
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

const ROWS_PER_PAGE = 10;

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
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

  // Sorted orders logic
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let va = a[sortField];
    let vb = b[sortField];

    if (sortField === 'createdAt') {
      va = new Date(a.createdAt).getTime();
      vb = new Date(b.createdAt).getTime();
    } else if (sortField === 'customer') {
      va = (a.user?.name || '').toLowerCase();
      vb = (b.user?.name || '').toLowerCase();
    } else if (sortField === 'totalPrice') {
      va = a.totalPrice || 0;
      vb = b.totalPrice || 0;
    } else if (sortField === 'status') {
      va = a.status || '';
      vb = b.status || '';
    } else if (sortField === '_id') {
      va = a._id;
      vb = b._id;
    }

    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pagedOrders = sortedOrders.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc'); // Default to newest or highest first
    }
    setPage(1);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <ChevronUp size={13} style={{ marginLeft: 2, display: 'inline-block' }} /> : <ChevronDown size={13} style={{ marginLeft: 2, display: 'inline-block' }} />;
  };

  // Export Orders to Excel (CSV with UTF-8 BOM for Microsoft Excel compatibility)
  const exportToExcel = () => {
    if (sortedOrders.length === 0) return alert('No orders to export');

    const headers = ['Order ID', 'Date', 'Customer Name', 'Customer Email', 'Phone', 'Items Summary', 'Total Price (INR)', 'Payment Method', 'Status'];
    const rows = sortedOrders.map(o => {
      const dateStr = new Date(o.createdAt).toLocaleDateString('en-IN');
      const itemsSummary = (o.orderItems || []).map(i => `${i.name} (x${i.qty || 1})`).join('; ');
      return [
        `"#${o._id.slice(-8).toUpperCase()}"`,
        `"${dateStr}"`,
        `"${(o.user?.name || 'Guest').replace(/"/g, '""')}"`,
        `"${(o.user?.email || 'N/A').replace(/"/g, '""')}"`,
        `"${(o.user?.phone || 'N/A').replace(/"/g, '""')}"`,
        `"${itemsSummary.replace(/"/g, '""')}"`,
        `"${o.totalPrice || 0}"`,
        `"${o.paymentMethod || 'WhatsApp'}"`,
        `"${STATUS_CONFIG[o.status]?.label || o.status}"`,
      ];
    });

    const csvString = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Orders_History_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export Orders to PDF (Direct File Download)
  const exportToPDF = () => {
    if (sortedOrders.length === 0) return alert('No orders to export');

    const generatePDF = () => {
      try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for order details

        doc.setFontSize(16);
        doc.setTextColor(55, 48, 163);
        doc.text("Omri's Home Kitchen — Order History Report", 14, 15);

        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128);
        doc.text(`Generated on: ${new Date().toLocaleString('en-IN')} | Total Orders: ${sortedOrders.length}`, 14, 22);

        const tableColumn = ['S.No', 'Order ID', 'Date', 'Customer', 'Phone', 'Items Summary', 'Total (INR)', 'Status'];
        const tableRows = sortedOrders.map((o, i) => [
          i + 1,
          `#${o._id.slice(-8).toUpperCase()}`,
          new Date(o.createdAt).toLocaleDateString('en-IN'),
          o.user?.name || 'Guest',
          o.user?.phone || 'N/A',
          (o.orderItems || []).map(item => `${item.name} (x${item.qty || 1})`).join(', '),
          `INR ${o.totalPrice || 0}`,
          STATUS_CONFIG[o.status]?.label || o.status,
        ]);

        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 28,
          theme: 'striped',
          headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 8, cellPadding: 3 },
        });

        doc.save(`Orders_History_${new Date().toISOString().slice(0, 10)}.pdf`);
      } catch (err) {
        console.error('PDF export error:', err);
        alert('Failed to generate PDF download.');
      }
    };

    if (window.jspdf && window.jspdf.jsPDF) {
      generatePDF();
    } else {
      const script1 = document.createElement('script');
      script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script1.onload = () => {
        const script2 = document.createElement('script');
        script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js';
        script2.onload = generatePDF;
        document.body.appendChild(script2);
      };
      document.body.appendChild(script1);
    }
  };

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
      <div className="admin-card mb-6" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#f3f4f6', padding: '0.55rem 0.85rem', borderRadius: '10px', width: '100%', maxWidth: '360px' }}>
            <Search size={16} color="#9ca3af" style={{ marginRight: '0.4rem', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search by ID, customer name, phone..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
              style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem' }}
            />
          </div>

          {/* Status Filter Buttons + Download Options */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Filter size={15} color="#6b7280" style={{ marginRight: '0.2rem' }} />
            {['All', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(st => (
              <button
                key={st}
                onClick={() => { setStatusFilter(st); setPage(1); }}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
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

            {/* Excel Download Button */}
            <button
              onClick={exportToExcel}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700,
                border: '1px solid #10b981', background: '#ecfdf5', color: '#047857', cursor: 'pointer',
              }}
              title="Download Orders Excel / CSV"
            >
              <FileSpreadsheet size={14} /> Excel
            </button>

            {/* PDF Download Button */}
            <button
              onClick={exportToPDF}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700,
                border: '1px solid #ef4444', background: '#fef2f2', color: '#b91c1c', cursor: 'pointer',
              }}
              title="Download Orders PDF"
            >
              <FileText size={14} /> PDF
            </button>

            <button
              onClick={fetchOrders}
              className="admin-btn admin-btn-ghost"
              style={{ padding: '0.4rem 0.65rem' }}
              title="Refresh Orders"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

        </div>
      </div>

      {/* ── Orders Table ── */}
      <div className="admin-card">
        <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span className="admin-card-title">Order History</span>
          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
            Showing {sortedOrders.length > 0 ? (safePage - 1) * ROWS_PER_PAGE + 1 : 0} to {Math.min(safePage * ROWS_PER_PAGE, sortedOrders.length)} of {sortedOrders.length} orders
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem' }} />
            <p>Loading orders...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#dc2626' }}>
            <p style={{ fontWeight: 600 }}>{error}</p>
            <button onClick={fetchOrders} className="admin-btn admin-btn-primary" style={{ marginTop: '0.75rem' }}>
              Try Again
            </button>
          </div>
        ) : pagedOrders.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            <ShoppingBag size={40} color="#d1d5db" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1rem', color: '#374151', marginBottom: 4 }}>No orders found</h3>
            <p style={{ fontSize: '0.85rem' }}>Try adjusting your filter or search query.</p>
          </div>
        ) : (
          <>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}></th>
                    <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('createdAt')}>
                      Order ID & Date <SortIcon field="createdAt" />
                    </th>
                    <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('customer')}>
                      Customer <SortIcon field="customer" />
                    </th>
                    <th>Items Summary</th>
                    <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('totalPrice')}>
                      Total Price <SortIcon field="totalPrice" />
                    </th>
                    <th>Payment</th>
                    <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('status')}>
                      Status <SortIcon field="status" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pagedOrders.map(order => {
                    const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
                    const isExpanded = !!expandedOrders[order._id];
                    const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    });
                    const formattedTime = new Date(order.createdAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    });

                    return (
                      <React.Fragment key={order._id}>
                        {/* Main Table Row */}
                        <tr
                          style={{ cursor: 'pointer', background: isExpanded ? '#f9fafb' : 'transparent' }}
                          onClick={() => toggleExpand(order._id)}
                        >
                          <td style={{ textAlign: 'center', color: '#9ca3af' }}>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </td>

                          <td>
                            <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.875rem' }}>
                              #{order._id.slice(-8).toUpperCase()}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                              {formattedDate} • {formattedTime}
                            </div>
                          </td>

                          <td>
                            <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>
                              {order.user?.name || 'Guest User'}
                            </div>
                            {order.user?.email && (
                              <div style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Mail size={11} /> {order.user.email}
                              </div>
                            )}
                            {order.user?.phone && (
                              <div style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Phone size={11} /> {order.user.phone}
                              </div>
                            )}
                          </td>

                          <td>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                              {order.orderItems?.length || 0} item(s)
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                              {order.orderItems?.map(i => i.name).join(', ')}
                            </div>
                          </td>

                          <td>
                            <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem' }}>
                              ₹{order.totalPrice?.toFixed(2)}
                            </div>
                          </td>

                          <td>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: '#f3f4f6',
                              color: '#374151'
                            }}>
                              {order.paymentMethod || 'WhatsApp'}
                            </span>
                          </td>

                          <td onClick={e => e.stopPropagation()}>
                            <select
                              value={order.status}
                              disabled={updatingId === order._id}
                              onChange={e => handleStatusChange(order._id, e.target.value)}
                              style={{
                                padding: '0.35rem 0.65rem',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                background: statusInfo.bg,
                                color: statusInfo.color,
                                border: `1px solid ${statusInfo.border}`,
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

                        {/* Expandable Order Details Row */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={7} style={{ background: '#f9fafb', padding: '1.25rem', borderBottom: '1px solid #e5e7eb' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                                
                                {/* Left: Customer & Shipping Details */}
                                <div style={{ background: '#fff', padding: '1rem', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <User size={14} color="#6366f1" /> Customer & Contact Information
                                  </h4>
                                  <div style={{ fontSize: '0.8rem', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    <div><strong>Name:</strong> {order.user?.name || 'N/A'}</div>
                                    <div><strong>Email:</strong> {order.user?.email || 'N/A'}</div>
                                    <div><strong>Phone:</strong> {order.user?.phone || 'N/A'}</div>
                                    <div><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString('en-IN')}</div>
                                  </div>
                                </div>

                                {/* Right: Item Breakdown */}
                                <div style={{ background: '#fff', padding: '1rem', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Package size={14} color="#10b981" /> Itemized Order Breakdown
                                  </h4>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    {order.orderItems?.map((item, idx) => (
                                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', borderBottom: idx < order.orderItems.length - 1 ? '1px dashed #f3f4f6' : 'none', paddingBottom: '0.4rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                          {item.image ? (
                                            <img src={item.image} alt={item.name} style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />
                                          ) : (
                                            <div style={{ width: 32, height: 32, borderRadius: 6, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                                              📦
                                            </div>
                                          )}
                                          <div>
                                            <div style={{ fontWeight: 600, color: '#111827' }}>{item.name}</div>
                                            <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                                              {item.weight && `Weight: ${item.weight} `}
                                              {item.packingOption && `(${item.packingOption})`}
                                            </div>
                                          </div>
                                        </div>
                                        <div style={{ fontWeight: 700, color: '#111827' }}>
                                          {item.qty || 1} x ₹{item.price} = ₹{(item.qty || 1) * item.price}
                                        </div>
                                      </div>
                                    ))}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.875rem', borderTop: '1.5px solid #e5e7eb', paddingTop: '0.5rem', marginTop: '0.25rem', color: '#111827' }}>
                                      <span>Total Amount:</span>
                                      <span>₹{order.totalPrice?.toFixed(2)}</span>
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

            {/* Pagination Controls */}
            {sortedOrders.length > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.85rem 1.25rem', borderTop: '1px solid #f3f4f6',
                fontSize: '0.82rem', color: '#6b7280',
              }}>
                <span style={{ color: '#10b981', fontWeight: 500 }}>
                  Showing {(safePage - 1) * ROWS_PER_PAGE + 1} to {Math.min(safePage * ROWS_PER_PAGE, sortedOrders.length)} of {sortedOrders.length} orders
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    style={{
                      fontSize: '0.82rem', fontWeight: 600,
                      color: safePage === 1 ? '#d1d5db' : '#374151',
                      background: 'none', border: 'none', cursor: safePage === 1 ? 'default' : 'pointer',
                    }}
                  >
                    Previous
                  </button>
                  <span style={{ fontWeight: 700, color: '#111827' }}>{safePage} / {totalPages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    style={{
                      fontSize: '0.82rem', fontWeight: 600,
                      color: safePage === totalPages ? '#d1d5db' : '#374151',
                      background: 'none', border: 'none', cursor: safePage === totalPages ? 'default' : 'pointer',
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
