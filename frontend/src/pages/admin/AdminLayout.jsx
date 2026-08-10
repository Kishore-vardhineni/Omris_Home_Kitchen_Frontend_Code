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
} from 'lucide-react';
import './Admin.css';

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
          <div className="admin-logo-icon">
            <ShoppingBag size={18} color="#fff" />
          </div>
          <div className="logo-text">
            <span className="logo-title">Omris Kitchen</span>
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
