import React, { useState, useEffect, useRef } from 'react';
import {
  IndianRupee,
  Calendar,
  TrendingUp,
  ShoppingBag,
  RefreshCw,
  BarChart3,
  PieChart,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import AdminLayout from './AdminLayout';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const TIMEFRAMES = [
  { id: 'daily',    label: 'Daily (Today)',   days: 1 },
  { id: 'weekly',   label: 'Weekly (7 Days)', days: 7 },
  { id: '15days',   label: '15 Days',         days: 15 },
  { id: '1month',   label: '1 Month (30 Days)', days: 30 },
  { id: '3months',  label: '3 Months (90 Days)', days: 90 },
  { id: '6months',  label: '6 Months (180 Days)', days: 180 },
  { id: '1year',    label: '1 Year (365 Days)', days: 365 },
];

const AdminRevenue = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('1month');
  const [chartType, setChartType] = useState('line'); // line or bar
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Revenue fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders by selected timeframe
  const selectedTimeframeObj = TIMEFRAMES.find(t => t.id === timeframe) || TIMEFRAMES[3];
  const now = new Date();

  let startDate = new Date();
  if (timeframe === 'daily') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else {
    startDate = new Date(now.getTime() - selectedTimeframeObj.days * 24 * 60 * 60 * 1000);
  }

  const validOrders = orders.filter(
    o => o.status !== 'Cancelled' && new Date(o.createdAt) >= startDate
  );

  // Financial calculations
  const totalRevenue = validOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const totalOrdersCount = validOrders.length;
  const avgOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
  const highestOrder = validOrders.reduce((max, o) => Math.max(max, o.totalPrice || 0), 0);

  // Group orders for Chart.js labels & data points
  const prepareChartData = () => {
    const labels = [];
    const dataPoints = [];
    const numDays = selectedTimeframeObj.days;

    if (timeframe === 'daily') {
      // Group by Hours (00:00 to 23:00)
      for (let h = 0; h < 24; h += 2) {
        const hourLabel = `${h.toString().padStart(2, '0')}:00`;
        labels.push(hourLabel);
        
        const hourRev = validOrders
          .filter(o => {
            const d = new Date(o.createdAt);
            return d.getHours() >= h && d.getHours() < h + 2;
          })
          .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
          
        dataPoints.push(hourRev);
      }
    } else if (numDays <= 30) {
      // Group Day by Day
      for (let i = numDays - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        labels.push(dayStr);

        const dayRev = validOrders
          .filter(o => {
            const od = new Date(o.createdAt);
            return (
              od.getDate() === d.getDate() &&
              od.getMonth() === d.getMonth() &&
              od.getFullYear() === d.getFullYear()
            );
          })
          .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

        dataPoints.push(dayRev);
      }
    } else {
      // Group by Months / Weeks
      const monthMap = {};
      for (let i = numDays - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const mKey = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        if (!monthMap[mKey]) monthMap[mKey] = 0;
      }

      validOrders.forEach(o => {
        const od = new Date(o.createdAt);
        const mKey = od.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        if (monthMap[mKey] !== undefined) {
          monthMap[mKey] += o.totalPrice || 0;
        }
      });

      Object.keys(monthMap).forEach(key => {
        labels.push(key);
        dataPoints.push(monthMap[key]);
      });
    }

    return { labels, dataPoints };
  };

  // Render Chart.js
  useEffect(() => {
    if (!canvasRef.current || loading) return;

    const { labels, dataPoints } = prepareChartData();

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    if (window.Chart) {
      const ctx = canvasRef.current.getContext('2d');

      // Create gradient fill
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

      chartInstanceRef.current = new window.Chart(ctx, {
        type: chartType,
        data: {
          labels,
          datasets: [
            {
              label: `Revenue (₹) - ${selectedTimeframeObj.label}`,
              data: dataPoints,
              borderColor: '#10b981',
              borderWidth: 3,
              backgroundColor: chartType === 'bar' ? '#10b981' : gradient,
              fill: chartType === 'line',
              tension: 0.35,
              pointBackgroundColor: '#10b981',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                font: { family: 'Inter', size: 12, weight: '600' },
                color: '#374151',
              },
            },
            tooltip: {
              backgroundColor: '#111827',
              titleFont: { size: 13, weight: '700' },
              bodyFont: { size: 13, weight: '600' },
              padding: 12,
              displayColors: false,
              callbacks: {
                label: (context) => ` Revenue: ₹${context.raw.toFixed(2)}`,
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#6b7280', font: { size: 11, weight: '500' } },
            },
            y: {
              grid: { color: '#f3f4f6' },
              ticks: {
                color: '#6b7280',
                font: { size: 11, weight: '500' },
                callback: (val) => `₹${val}`,
              },
              beginAtZero: true,
            },
          },
        },
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [timeframe, chartType, orders, loading]);

  return (
    <AdminLayout title="Revenue Analytics & Reports">
      {/* ── Top Control Bar ── */}
      <div className="admin-card mb-6" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justify: 'center' }}>
              <TrendingUp size={20} color="#10b981" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                Revenue Dashboard
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>
                Analyze your earnings across customizable timeframes
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
            {/* Timeframe Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', background: '#f3f4f6', padding: '0.4rem 0.85rem', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
              <Calendar size={16} color="#4b5563" style={{ marginRight: '0.5rem' }} />
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', marginRight: '0.5rem' }}>
                Period:
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#111827',
                  cursor: 'pointer',
                }}
              >
                {TIMEFRAMES.map((tf) => (
                  <option key={tf.id} value={tf.id}>
                    {tf.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Chart Type Toggle */}
            <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '8px', padding: '2px', border: '1px solid #e5e7eb' }}>
              <button
                onClick={() => setChartType('line')}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: 'none',
                  background: chartType === 'line' ? '#fff' : 'transparent',
                  color: chartType === 'line' ? '#111827' : '#6b7280',
                  boxShadow: chartType === 'line' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                }}
              >
                Line
              </button>
              <button
                onClick={() => setChartType('bar')}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: 'none',
                  background: chartType === 'bar' ? '#fff' : 'transparent',
                  color: chartType === 'bar' ? '#111827' : '#6b7280',
                  boxShadow: chartType === 'bar' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                }}
              >
                Bar
              </button>
            </div>

            {/* Refresh */}
            <button
              onClick={fetchOrders}
              className="admin-btn admin-btn-ghost"
              style={{ padding: '0.5rem 0.75rem' }}
              title="Refresh Data"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

        </div>
      </div>

      {/* ── Key Financial KPI Cards ── */}
      <div className="admin-stats-grid mb-6">
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#ecfdf5' }}>
            <IndianRupee size={24} color="#10b981" />
          </div>
          <div className="admin-stat-info">
            <h3>{loading ? '—' : `₹${totalRevenue.toFixed(2)}`}</h3>
            <p>Selected Revenue ({selectedTimeframeObj.label})</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#eef2ff' }}>
            <ShoppingBag size={24} color="#3b5bdb" />
          </div>
          <div className="admin-stat-info">
            <h3>{loading ? '—' : totalOrdersCount}</h3>
            <p>Total Orders ({selectedTimeframeObj.label})</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#fef3c7' }}>
            <ArrowUpRight size={24} color="#d97706" />
          </div>
          <div className="admin-stat-info">
            <h3>{loading ? '—' : `₹${avgOrderValue.toFixed(2)}`}</h3>
            <p>Average Order Value</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#f5f3ff' }}>
            <BarChart3 size={24} color="#7c3aed" />
          </div>
          <div className="admin-stat-info">
            <h3>{loading ? '—' : `₹${highestOrder.toFixed(2)}`}</h3>
            <p>Highest Order Value</p>
          </div>
        </div>
      </div>

      {/* ── Chart.js Visualization Card ── */}
      <div className="admin-card mb-6">
        <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="admin-card-title">Revenue Graph Visualization (Chart.js)</span>
            <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: '2px 0 0 0' }}>
              Showing earnings timeline for <strong>{selectedTimeframeObj.label}</strong>
            </p>
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, background: '#f3f4f6', padding: '4px 10px', borderRadius: '6px', color: '#374151' }}>
            Interactive Canvas
          </span>
        </div>

        <div style={{ padding: '1.25rem', height: '340px', position: 'relative' }}>
          {loading ? (
            <div className="admin-loader" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="admin-spinner" />
            </div>
          ) : (
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
          )}
        </div>
      </div>

      {/* ── All Timeframes Quick Comparative Table ── */}
      <div className="admin-card">
        <div className="admin-card-header">
          <span className="admin-card-title">Revenue Comparison across All Periods</span>
        </div>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Time Horizon</th>
                <th>Timeframe Window</th>
                <th>Total Orders</th>
                <th>Revenue Generated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {TIMEFRAMES.map((tf) => {
                let start = new Date();
                if (tf.id === 'daily') {
                  start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                } else {
                  start = new Date(now.getTime() - tf.days * 24 * 60 * 60 * 1000);
                }

                const periodOrders = orders.filter(
                  o => o.status !== 'Cancelled' && new Date(o.createdAt) >= start
                );

                const periodRev = periodOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
                const isSelected = timeframe === tf.id;

                return (
                  <tr key={tf.id} style={{ background: isSelected ? '#ecfdf5' : '#fff' }}>
                    <td>
                      <span style={{ fontWeight: 700, color: isSelected ? '#065f46' : '#111827' }}>
                        {tf.label}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                      {tf.days === 1 ? 'Today' : `Last ${tf.days} Days`}
                    </td>
                    <td style={{ fontWeight: 600 }}>{periodOrders.length}</td>
                    <td>
                      <span style={{ fontWeight: 800, color: '#059669', fontSize: '0.95rem' }}>
                        ₹{periodRev.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setTimeframe(tf.id)}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          border: isSelected ? '1px solid #10b981' : '1px solid #d1d5db',
                          background: isSelected ? '#10b981' : '#fff',
                          color: isSelected ? '#fff' : '#374151',
                          cursor: 'pointer',
                        }}
                      >
                        {isSelected ? 'Viewing Graph' : 'Plot Graph'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminRevenue;
