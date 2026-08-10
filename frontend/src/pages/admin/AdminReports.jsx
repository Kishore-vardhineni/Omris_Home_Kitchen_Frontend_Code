import React, { useState, useEffect } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Calendar,
  Filter,
  RefreshCw,
  ShoppingBag,
  IndianRupee,
  TrendingUp,
  Download,
  Search,
} from 'lucide-react';
import AdminLayout from './AdminLayout';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const STATUS_CONFIG = {
  Pending:    { color: '#d97706', bg: '#fef3c7', label: 'Pending' },
  Confirmed:  { color: '#059669', bg: '#d1fae5', label: 'Order Placed' },
  Processing: { color: '#7c3aed', bg: '#ede9fe', label: 'Processing' },
  Shipped:    { color: '#0284c7', bg: '#e0f2fe', label: 'Shipped' },
  Delivered:  { color: '#16a34a', bg: '#dcfce7', label: 'Delivered' },
  Cancelled:  { color: '#dc2626', bg: '#fee2e2', label: 'Cancelled' },
};

const AdminReports = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Report Filters
  const [datePreset, setDatePreset] = useState('all'); // 'all', 'today', '7days', '30days', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

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

  // Filter Orders based on preset or custom date range and status
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    const now = new Date();

    // 1. Status Filter
    if (statusFilter !== 'All' && order.status !== statusFilter) return false;

    // 2. Search Filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        order._id.toLowerCase().includes(q) ||
        order.user?.name?.toLowerCase().includes(q) ||
        order.user?.email?.toLowerCase().includes(q) ||
        order.user?.phone?.includes(q);
      if (!matchSearch) return false;
    }

    // 3. Date Preset Filter
    if (datePreset === 'today') {
      const isToday =
        orderDate.getDate() === now.getDate() &&
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear();
      if (!isToday) return false;
    } else if (datePreset === '7days') {
      const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
      if (orderDate < sevenDaysAgo) return false;
    } else if (datePreset === '30days') {
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      if (orderDate < thirtyDaysAgo) return false;
    } else if (datePreset === 'custom') {
      if (startDate && orderDate < new Date(startDate)) return false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (orderDate > end) return false;
      }
    }

    return true;
  });

  // Calculate Metrics for Report Summary
  const totalReportOrders = filteredOrders.length;
  const totalReportRevenue = filteredOrders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const deliveredCount = filteredOrders.filter(o => o.status === 'Delivered').length;
  const pendingCount = filteredOrders.filter(o => o.status === 'Confirmed' || o.status === 'Processing').length;

  // Export to Excel (CSV with UTF-8 BOM)
  const exportToExcel = () => {
    if (filteredOrders.length === 0) return alert('No order records found for this report filter.');

    const headers = ['Order ID', 'Date', 'Time (AM/PM)', 'Customer Name', 'Customer Email', 'Phone', 'Items Summary', 'Total Price (INR)', 'Payment Method', 'Status'];
    const rows = filteredOrders.map(o => {
      const dateStr = new Date(o.createdAt).toLocaleDateString('en-IN');
      const timeStr = new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      const itemsSummary = (o.orderItems || []).map(i => `${i.name} (x${i.qty || 1})`).join('; ');
      return [
        `"#${o._id.slice(-8).toUpperCase()}"`,
        `"${dateStr}"`,
        `"${timeStr}"`,
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
    link.setAttribute('download', `Order_Report_${datePreset}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export to PDF (Direct File Download)
  const exportToPDF = () => {
    if (filteredOrders.length === 0) return alert('No order records found for this report filter.');

    const generatePDF = () => {
      try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l', 'mm', 'a4'); // Landscape

        doc.setFontSize(16);
        doc.setTextColor(55, 48, 163);
        doc.text("Omri's Home Kitchen — Order Report Summary", 14, 15);

        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128);
        doc.text(
          `Generated on: ${new Date().toLocaleString('en-IN')} | Filter: ${datePreset.toUpperCase()} | Total Orders: ${totalReportOrders} | Total Revenue: INR ${totalReportRevenue.toFixed(2)}`,
          14,
          22
        );

        const tableColumn = ['S.No', 'Order ID', 'Date & Time', 'Customer Name', 'Phone', 'Items Summary', 'Total (INR)', 'Status'];
        const tableRows = filteredOrders.map((o, i) => [
          i + 1,
          `#${o._id.slice(-8).toUpperCase()}`,
          `${new Date(o.createdAt).toLocaleDateString('en-IN')} ${new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`,
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

        doc.save(`Order_Report_${datePreset}_${new Date().toISOString().slice(0, 10)}.pdf`);
      } catch (err) {
        console.error('PDF export error:', err);
        alert('Failed to generate PDF report download.');
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

  return (
    <AdminLayout title="Order Reports">
      {/* Report Summary Cards */}
      <div className="admin-stats-grid mb-6">
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#eef2ff' }}>
            <ShoppingBag size={24} color="#3b5bdb" />
          </div>
          <div className="admin-stat-info">
            <h3>{loading ? '—' : totalReportOrders}</h3>
            <p>Filtered Orders</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#d1fae5' }}>
            <IndianRupee size={24} color="#059669" />
          </div>
          <div className="admin-stat-info">
            <h3>{loading ? '—' : `₹${totalReportRevenue.toFixed(2)}`}</h3>
            <p>Report Revenue</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#fef3c7' }}>
            <TrendingUp size={24} color="#d97706" />
          </div>
          <div className="admin-stat-info">
            <h3>{loading ? '—' : deliveredCount}</h3>
            <p>Delivered Orders</p>
          </div>
        </div>
      </div>

      {/* Report Filter Controls */}
      <div className="admin-card mb-6" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Top Row: Date Presets & Custom Range */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
            
            {/* Date Preset Buttons */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <Calendar size={16} color="#6b7280" style={{ marginRight: '0.2rem' }} />
              {[
                { key: 'all', label: 'All Time' },
                { key: 'today', label: 'Today' },
                { key: '7days', label: 'Last 7 Days' },
                { key: '30days', label: 'Last 30 Days' },
                { key: 'custom', label: 'Custom Range' },
              ].map(p => (
                <button
                  key={p.key}
                  onClick={() => setDatePreset(p.key)}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    border: datePreset === p.key ? '1px solid #3b5bdb' : '1px solid #e5e7eb',
                    background: datePreset === p.key ? '#3b5bdb' : '#fff',
                    color: datePreset === p.key ? '#fff' : '#4b5563',
                    cursor: 'pointer',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Generate & Download Report Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={exportToExcel}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700,
                  border: '1px solid #10b981', background: '#ecfdf5', color: '#047857', cursor: 'pointer',
                }}
              >
                <FileSpreadsheet size={16} /> Export Excel
              </button>

              <button
                onClick={exportToPDF}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700,
                  border: '1px solid #ef4444', background: '#fef2f2', color: '#b91c1c', cursor: 'pointer',
                }}
              >
                <FileText size={16} /> Export PDF
              </button>
            </div>

          </div>

          {/* Custom Date Picker (if selected) */}
          {datePreset === 'custom' && (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Start Date:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  style={{ padding: '0.35rem 0.65rem', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>End Date:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  style={{ padding: '0.35rem 0.65rem', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                />
              </div>
            </div>
          )}

          {/* Bottom Row: Status Filter & Search */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f3f4f6', padding: '0.5rem 0.85rem', borderRadius: '10px', flex: 1, maxWidth: '340px' }}>
              <Search size={16} color="#9ca3af" style={{ marginRight: '0.4rem' }} />
              <input
                type="text"
                placeholder="Search report records..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', marginRight: '0.2rem' }}>Status:</span>
              {['All', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: '0.3rem 0.7rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    border: statusFilter === st ? '1px solid #4f46e5' : '1px solid #e5e7eb',
                    background: statusFilter === st ? '#eef2ff' : '#fff',
                    color: statusFilter === st ? '#4f46e5' : '#4b5563',
                    cursor: 'pointer',
                  }}
                >
                  {st === 'Confirmed' ? 'Placed' : st}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Reports Table Preview */}
      <div className="admin-card">
        <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="admin-card-title">Order Report Preview</span>
          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
            {filteredOrders.length} records found
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem' }} />
            <p>Loading report data...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            <FileText size={40} color="#d1d5db" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1rem', color: '#374151', marginBottom: 4 }}>No report data found</h3>
            <p style={{ fontSize: '0.85rem' }}>Try selecting a different date range or status filter.</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date & Time</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Items Summary</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => {
                  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
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
                    <tr key={order._id}>
                      <td>
                        <strong style={{ color: '#111827' }}>#{order._id.slice(-8).toUpperCase()}</strong>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', color: '#111827' }}>{formattedDate}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{formattedTime}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#111827' }}>{order.user?.name || 'Guest'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{order.user?.email || ''}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>{order.user?.phone || 'N/A'}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', color: '#374151' }}>
                          {(order.orderItems || []).map(i => `${i.name} (x${i.qty || 1})`).join(', ')}
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: '#111827' }}>₹{order.totalPrice?.toFixed(2)}</strong>
                      </td>
                      <td>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          background: statusInfo.bg,
                          color: statusInfo.color,
                        }}>
                          {statusInfo.label}
                        </span>
                      </td>
                    </tr>
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

export default AdminReports;
