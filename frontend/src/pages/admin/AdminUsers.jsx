import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Shield,
  User,
  UserX,
  Calendar,
  Trash2,
  Edit2,
  ChevronUp,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  X,
  Check,
} from 'lucide-react';
import AdminLayout from './AdminLayout';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

const AVATAR_COLORS = [
  { bg: '#eef2ff', text: '#3730a3' },
  { bg: '#d1fae5', text: '#065f46' },
  { bg: '#fef3c7', text: '#92400e' },
  { bg: '#fee2e2', text: '#991b1b' },
  { bg: '#ede9fe', text: '#5b21b6' },
  { bg: '#e0f2fe', text: '#0369a1' },
  { bg: '#fce7f3', text: '#9d174d' },
];
const avatarColor = (name) => {
  const idx = (name?.charCodeAt(0) || 65) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};

const ROWS_PER_PAGE = 10;

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Edit user state
  const [editModal, setEditModal] = useState(null); // { id, name, email, phone, role }
  const [updating, setUpdating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.users);
      } else {
        setError(data.message || 'Failed to load users');
      }
    } catch (err) {
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/admin/users/${deleteModal.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== deleteModal.id));
        setDeleteModal(null);
      } else {
        alert(data.message || 'Failed to delete user');
      }
    } catch (err) {
      alert('Server error. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editModal) return;
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/admin/users/${editModal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editModal.name,
          email: editModal.email,
          phone: editModal.phone,
          role: editModal.role,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === editModal.id ? data.user : u))
        );
        setEditModal(null);
      } else {
        alert(data.message || 'Failed to update user');
      }
    } catch (err) {
      console.error(err);
      alert('Server error updating user.');
    } finally {
      setUpdating(false);
    }
  };

  // Filter
  const filtered = users.filter((u) => {
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.includes(q);
    return matchRole && matchSearch;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let va = a[sortField] || '';
    let vb = b[sortField] || '';
    if (sortField === 'createdAt') {
      va = new Date(va).getTime();
      vb = new Date(vb).getTime();
    } else {
      va = String(va).toLowerCase();
      vb = String(vb).toLowerCase();
    }
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);

  const totalCustomers = users.filter((u) => u.role !== 'admin').length;
  const totalAdmins = users.filter((u) => u.role === 'admin').length;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(1);
  };

  // Export to Excel (CSV with UTF-8 BOM for Microsoft Excel compatibility)
  const exportToExcel = () => {
    if (sorted.length === 0) return alert('No users to export');
    
    const headers = ['Name', 'Email', 'Phone', 'Address', 'Role', 'Joined Date'];
    const rows = sorted.map((u) => {
      const address = u.addresses && u.addresses.length > 0 ? `${u.addresses[0].street}, ${u.addresses[0].state}` : 'N/A';
      return [
      `"${(u.name || '').replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      `"${(u.phone || '').replace(/"/g, '""')}"`,
      `"${address.replace(/"/g, '""')}"`,
      `"${u.role === 'admin' ? 'Admin' : 'Customer'}"`,
      `"${new Date(u.createdAt).toLocaleDateString('en-IN')} ${new Date(u.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}"`,
      ];
    });

    const csvString = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Users_List_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export to PDF (Direct File Download)
  const exportToPDF = () => {
    if (sorted.length === 0) return alert('No users to export');

    const generatePDF = () => {
      try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.setTextColor(55, 48, 163);
        doc.text("Omri's Home Kitchen — Registered Users", 14, 15);

        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128);
        doc.text(`Generated on: ${new Date().toLocaleString('en-IN')} | Total Records: ${sorted.length}`, 14, 22);

        const tableColumn = ['S.No', 'Name', 'Email', 'Phone', 'Address', 'Role', 'Joined Date'];
        const tableRows = sorted.map((u, i) => {
          const address = u.addresses && u.addresses.length > 0 ? `${u.addresses[0].street}, ${u.addresses[0].state}` : 'N/A';
          return [
          i + 1,
          u.name || '',
          u.email || '',
          u.phone || 'N/A',
          address,
          u.role === 'admin' ? 'Admin' : 'Customer',
          `${new Date(u.createdAt).toLocaleDateString('en-IN')} ${new Date(u.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`,
        ];
        });

        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 28,
          theme: 'striped',
          headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 8, cellPadding: 3 },
        });

        doc.save(`Users_List_${new Date().toISOString().slice(0, 10)}.pdf`);
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

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <ChevronUp size={13} style={{ marginLeft: 2 }} /> : <ChevronDown size={13} style={{ marginLeft: 2 }} />;
  };

  const thStyle = (field) => ({
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    borderBottom: '1px solid #f3f4f6',
    display: 'flex',
    alignItems: 'center',
  });

  const tdStyle = {
    padding: '0.85rem 1rem',
    fontSize: '0.875rem',
    color: '#374151',
    borderBottom: '1px solid #f3f4f6',
    verticalAlign: 'middle',
  };

  return (
    <AdminLayout title="All Users">
      {/* Stats */}
      <div className="admin-stats-grid mb-6">
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#eef2ff' }}>
            <Users size={24} color="#3b5bdb" />
          </div>
          <div className="admin-stat-info">
            <h3>{loading ? '—' : users.length}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#ecfdf5' }}>
            <User size={24} color="#059669" />
          </div>
          <div className="admin-stat-info">
            <h3>{loading ? '—' : totalCustomers}</h3>
            <p>Customers</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#ede9fe' }}>
            <Shield size={24} color="#7c3aed" />
          </div>
          <div className="admin-stat-info">
            <h3>{loading ? '—' : totalAdmins}</h3>
            <p>Admins</p>
          </div>
        </div>
      </div>

      {/* Search, Filter & Export Bar */}
      <div className="admin-card mb-6" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#f3f4f6', padding: '0.55rem 1rem', borderRadius: '10px', flex: 1, maxWidth: 380 }}>
            <Search size={16} color="#9ca3af" style={{ marginRight: '0.5rem', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {['All', 'customer', 'admin'].map((r) => (
              <button
                key={r}
                onClick={() => { setRoleFilter(r); setPage(1); }}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: roleFilter === r ? '1px solid #3b5bdb' : '1px solid #e5e7eb',
                  background: roleFilter === r ? '#3b5bdb' : '#fff',
                  color: roleFilter === r ? '#fff' : '#374151',
                  cursor: 'pointer',
                }}
              >
                {r === 'All' ? 'All' : r === 'customer' ? 'Customers' : 'Admins'}
              </button>
            ))}

            {/* Export Buttons */}
            <button
              onClick={exportToExcel}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700,
                border: '1px solid #10b981', background: '#ecfdf5', color: '#047857', cursor: 'pointer',
              }}
              title="Download Excel / CSV"
            >
              <FileSpreadsheet size={15} /> Excel
            </button>

            <button
              onClick={exportToPDF}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700,
                border: '1px solid #ef4444', background: '#fef2f2', color: '#b91c1c', cursor: 'pointer',
              }}
              title="Download PDF"
            >
              <FileText size={15} /> PDF
            </button>

            <button
              onClick={fetchUsers}
              className="admin-btn admin-btn-ghost"
              style={{ padding: '0.45rem 0.75rem' }}
              title="Refresh"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-card" style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
          <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
          <p style={{ fontWeight: 600 }}>Loading users...</p>
        </div>
      ) : error ? (
        <div className="admin-card" style={{ padding: '3rem', textAlign: 'center', color: '#dc2626' }}>
          <UserX size={48} color="#fecaca" style={{ margin: '0 auto 1rem' }} />
          <p style={{ fontWeight: 600 }}>{error}</p>
          <button onClick={fetchUsers} className="admin-btn admin-btn-primary" style={{ marginTop: '1rem' }}>Try Again</button>
        </div>
      ) : (
        <div className="admin-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fafafa' }}>
                  <th style={{ ...tdStyle, borderBottom: '1px solid #f3f4f6' }}>
                    <div style={thStyle('name')} onClick={() => handleSort('name')}>
                      USER <SortIcon field="name" />
                    </div>
                  </th>
                  <th style={{ ...tdStyle, borderBottom: '1px solid #f3f4f6' }}>
                    <div style={thStyle('email')} onClick={() => handleSort('email')}>
                      EMAIL <SortIcon field="email" />
                    </div>
                  </th>
                  <th style={{ ...tdStyle, borderBottom: '1px solid #f3f4f6' }}>
                    <div style={thStyle('phone')} onClick={() => handleSort('phone')}>
                      PHONE <SortIcon field="phone" />
                    </div>
                  </th>
                  <th style={{ ...tdStyle, borderBottom: '1px solid #f3f4f6' }}>
                    <div style={thStyle('')}>
                      ADDRESS
                    </div>
                  </th>
                  <th style={{ ...tdStyle, borderBottom: '1px solid #f3f4f6' }}>
                    <div style={thStyle('role')} onClick={() => handleSort('role')}>
                      ROLE <SortIcon field="role" />
                    </div>
                  </th>
                  <th style={{ ...tdStyle, borderBottom: '1px solid #f3f4f6' }}>
                    <div style={thStyle('createdAt')} onClick={() => handleSort('createdAt')}>
                      JOINED <SortIcon field="createdAt" />
                    </div>
                  </th>
                  <th style={{ ...tdStyle, borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                    <div style={{ ...thStyle(''), cursor: 'default', justifyContent: 'center' }}>
                      ACTIONS
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem' }}>
                      No users found matching your search.
                    </td>
                  </tr>
                ) : (
                  paged.map((user) => {
                    const color = avatarColor(user.name);
                    const isAdmin = user.role === 'admin';
                    const joinDate = new Date(user.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    });
                    const joinTime = new Date(user.createdAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    });

                    return (
                      <tr key={user._id} style={{ transition: 'background 0.15s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#fafbfc')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {/* User (avatar + name) */}
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: 38, height: 38, borderRadius: 10,
                              background: color.bg, color: color.text,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.8rem', fontWeight: 800, flexShrink: 0,
                            }}>
                              {getInitials(user.name)}
                            </div>
                            <span style={{ fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>{user.name}</span>
                          </div>
                        </td>

                        {/* Email */}
                        <td style={tdStyle}>
                          <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>{user.email}</span>
                        </td>

                        {/* Phone */}
                        <td style={tdStyle}>
                          <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>{user.phone || '—'}</span>
                        </td>

                        {/* Address */}
                        <td style={tdStyle}>
                          <div style={{ color: '#374151', fontSize: '0.8rem', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={user.addresses && user.addresses.length > 0 ? `${user.addresses[0].street}, ${user.addresses[0].state}` : 'N/A'}>
                            {user.addresses && user.addresses.length > 0 ? (
                              <>
                                <div style={{ fontWeight: 500 }}>{user.addresses[0].street}</div>
                                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{user.addresses[0].state}</div>
                              </>
                            ) : (
                              <span style={{ color: '#9ca3af' }}>—</span>
                            )}
                          </div>
                        </td>

                        {/* Role badge */}
                        <td style={tdStyle}>
                          {isAdmin ? (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              fontSize: '0.75rem', fontWeight: 700,
                              background: '#eef2ff', color: '#4f46e5',
                              padding: '4px 10px', borderRadius: '20px',
                            }}>
                              <Shield size={11} /> Admin
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              fontSize: '0.75rem', fontWeight: 700,
                              background: '#ecfdf5', color: '#059669',
                              padding: '4px 10px', borderRadius: '20px',
                            }}>
                              <User size={11} /> Customer
                            </span>
                          )}
                        </td>

                        {/* Joined date + AM/PM Time */}
                        <td style={tdStyle}>
                          <div style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 500 }}>{joinDate}</div>
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{joinTime}</div>
                        </td>

                        {/* Actions: Edit & Remove */}
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            {/* Edit Button */}
                            <button
                              onClick={() => setEditModal({
                                id: user._id,
                                name: user.name || '',
                                email: user.email || '',
                                phone: user.phone || '',
                                role: user.role || 'customer',
                              })}
                              style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                width: 34, height: 34, borderRadius: 8,
                                border: 'none', background: '#eef2ff',
                                color: '#4f46e5', cursor: 'pointer',
                                transition: 'background 0.15s',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = '#c7d2fe')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = '#eef2ff')}
                              title="Edit user"
                            >
                              <Edit2 size={15} />
                            </button>

                            {/* Remove Button (Customers only) */}
                            {!isAdmin ? (
                              <button
                                onClick={() => setDeleteModal({ id: user._id, name: user.name })}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                  width: 34, height: 34, borderRadius: 8,
                                  border: 'none', background: '#fef2f2',
                                  color: '#ef4444', cursor: 'pointer',
                                  transition: 'background 0.15s',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = '#fee2e2')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = '#fef2f2')}
                                title="Remove user"
                              >
                                <Trash2 size={15} />
                              </button>
                            ) : (
                              <span style={{ width: 34, display: 'inline-block', fontSize: '0.75rem', color: '#d1d5db' }}>—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {sorted.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.85rem 1.25rem', borderTop: '1px solid #f3f4f6',
              fontSize: '0.82rem', color: '#6b7280',
            }}>
              <span style={{ color: '#10b981', fontWeight: 500 }}>
                Showing {(safePage - 1) * ROWS_PER_PAGE + 1} to {Math.min(safePage * ROWS_PER_PAGE, sorted.length)} of {sorted.length} users
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
        </div>
      )}

      {/* ── Edit User Modal ── */}
      {editModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit2 size={18} color="#4f46e5" />
                </div>
                <h3 style={{ fontWeight: 800, color: '#111827', margin: 0, fontSize: '1.05rem' }}>Edit User Details</h3>
              </div>
              <button
                onClick={() => setEditModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.35rem' }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={editModal.name}
                  onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.875rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.35rem' }}>Email Address</label>
                <input
                  type="email"
                  required
                  value={editModal.email}
                  onChange={(e) => setEditModal({ ...editModal, email: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.875rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.35rem' }}>Phone Number</label>
                <input
                  type="text"
                  required
                  value={editModal.phone}
                  onChange={(e) => setEditModal({ ...editModal, phone: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.875rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.35rem' }}>User Role</label>
                <select
                  value={editModal.role}
                  onChange={(e) => setEditModal({ ...editModal, role: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.875rem', outline: 'none', background: '#fff' }}
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setEditModal(null)}
                  disabled={updating}
                  style={{ flex: 1, padding: '0.65rem', borderRadius: 10, border: '1px solid #d1d5db', background: '#fff', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  style={{ flex: 1, padding: '0.65rem', borderRadius: 10, border: 'none', background: '#3b5bdb', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', opacity: updating ? 0.6 : 1 }}
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', maxWidth: 380, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={22} color="#dc2626" />
              </div>
              <div>
                <h3 style={{ fontWeight: 700, color: '#111827', margin: 0, fontSize: '1rem' }}>Remove User?</h3>
                <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>This action cannot be undone</p>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#374151', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
              You are about to permanently delete <strong>{deleteModal.name}</strong> from the system.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setDeleteModal(null)}
                disabled={deleting}
                style={{ flex: 1, padding: '0.6rem', borderRadius: 10, border: '1px solid #d1d5db', background: '#fff', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ flex: 1, padding: '0.6rem', borderRadius: 10, border: 'none', background: '#dc2626', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', opacity: deleting ? 0.6 : 1 }}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
