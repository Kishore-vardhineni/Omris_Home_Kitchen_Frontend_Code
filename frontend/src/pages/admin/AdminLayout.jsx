import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  LogOut,
  ShoppingBag,
  ChevronRight,
  Menu,
  X,
  TrendingUp,
  Users,
  FileText,
  QrCode,
} from 'lucide-react';
import './Admin.css';
import logo from '../../assets/images/Pickel_Home_Kitchen_Logo.png';

const NAV_GROUPS = [
  {
    section: 'Overview',
    items: [
      { label: 'Dashboard',         icon: LayoutDashboard, to: '/admin', end: true },
      { label: 'Revenue Analytics', icon: TrendingUp,      to: '/admin/revenue' },
      { label: 'Order History',     icon: ShoppingBag,     to: '/admin/orders' },
    ]
  },
  {
    section: 'Reports',
    items: [
      { label: 'Order Reports', icon: FileText, to: '/admin/reports' },
    ]
  },
  {
    section: 'Users',
    items: [
      { label: 'All Users', icon: Users, to: '/admin/users' },
    ]
  },
  {
    section: 'Catalogue',
    items: [
      { label: 'All Products', icon: Package,     to: '/admin/products' },
      { label: 'Add Product',  icon: PlusCircle,  to: '/admin/products/add' },
    ]
  },
  {
    section: 'Settings',
    items: [
      { label: 'Payment Settings', icon: QrCode, to: '/admin/settings' },
    ]
  },
];

const AdminLayout = ({ children, title = 'Dashboard' }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const userInfoStr = localStorage.getItem('userInfo');
  const user = userInfoStr ? JSON.parse(userInfoStr) : null;
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  return (
    <div className="admin-layout">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* ═══════════ SIDEBAR ═══════════ */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>

        {/* Logo */}
        <div className="admin-sidebar-logo">
          <img src={logo} alt="Pickel Home Kitchen Logo" className="admin-logo-img" />
          <div className="logo-text">
            <span className="logo-title">Pickel Kitchen</span>
            <span className="logo-sub">Admin Panel</span>
          </div>
          <button className="admin-sidebar-close" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} color="#fff" />
          </button>
        </div>

        {/* Nav */}
        <nav className="admin-nav">
          {NAV_GROUPS.map(group => (
            <div key={group.section}>
              <div className="admin-nav-section">{group.section}</div>
              {group.items.map(({ label, icon: Icon, to, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    `admin-nav-item${isActive ? ' active' : ''}`
                  }
                >
                  <Icon size={17} />
                  <span className="nav-label">{label}</span>
                  <ChevronRight size={13} className="nav-arrow" />
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="admin-sidebar-footer">
          {/* User mini */}
          <div className="admin-user-mini">
            <div className="admin-topbar-avatar" style={{ width: 32, height: 32, fontSize: '0.72rem', borderRadius: '8px' }}>
              {initials}
            </div>
            <div className="admin-user-mini-info">
              <span className="user-name">{user?.name || 'Admin'}</span>
              <span className="user-role">Admin</span>
            </div>
          </div>

          <button
            className="admin-nav-item"
            onClick={handleLogout}
            style={{ borderRadius: '8px' }}
          >
            <LogOut size={17} />
            <span className="nav-label">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ═══════════ MAIN ═══════════ */}
      <main className="admin-main">

        {/* Topbar */}
        <div className="admin-topbar">
          <div className="admin-topbar-left">
            <button className="admin-sidebar-toggle" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <h1 className="admin-topbar-title">{title}</h1>
          </div>
          <div className="admin-topbar-right">
            <span className="admin-topbar-name">{user?.name}</span>
            <div className="admin-topbar-avatar">{initials}</div>
            <button 
              onClick={handleLogout}
              title="Sign Out"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginLeft: '12px',
                padding: '6px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: '#fff',
                color: '#ef4444',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.borderColor = '#fca5a5'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              <LogOut size={16} />
              <span className="hidden sm:inline" style={{ display: 'none' }}>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
