import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  LogOut,
  ShoppingBag,
  ChevronRight,
} from 'lucide-react';
import './Admin.css';
import logo from '../../assets/images/Omris_Home_Kitchen_logo1.png';

const navItems = [
  { label: 'Dashboard',    icon: LayoutDashboard, to: '/admin' },
  { label: 'All Products', icon: Package,         to: '/admin/products' },
  { label: 'Add Product',  icon: PlusCircle,      to: '/admin/products/add' },
];

const AdminLayout = ({ children, title = 'Admin Panel' }) => {
  const navigate = useNavigate();
  const userInfoStr = localStorage.getItem('userInfo');
  const user = userInfoStr ? JSON.parse(userInfoStr) : null;
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'A';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  return (
    <div className="admin-layout">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <ShoppingBag size={22} color="#3b5bdb" />
          <span>Omris Kitchen</span>
          <span className="logo-badge">Admin</span>
        </div>

        <nav className="admin-nav">
          <div className="admin-nav-section">Main Menu</div>
          {navItems.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) =>
                `admin-nav-item${isActive ? ' active' : ''}`
              }
            >
              <Icon size={18} />
              {label}
              <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.4 }} />
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-nav-item" onClick={handleLogout} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="admin-main">
        <div className="admin-topbar">
          <h1 className="admin-topbar-title">{title}</h1>
          <div className="admin-topbar-user">
            <span>{user?.name || 'Admin'}</span>
            <div className="admin-avatar">{initials}</div>
          </div>
        </div>
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
