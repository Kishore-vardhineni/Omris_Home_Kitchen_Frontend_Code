import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Phone, Mail, Facebook, Instagram, PhoneCall, Menu, X, User, Shield, History } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Navbar.css';
import logo from '../assets/images/Omris_Home_Kitchen_logo1.png';

const Navbar = () => {
  const { state } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const itemCount = state.items.reduce((acc, item) => acc + item.quantity, 0);

  // Get user info from localStorage
  const userInfoStr = localStorage.getItem('userInfo');
  const user = userInfoStr ? JSON.parse(userInfoStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    window.location.href = '/';
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="header">
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <div className="top-bar">
        <div className="container top-bar-inner">
          <div className="contact-info">
            <span><Phone size={14} /> +91 7670851967</span>
            <span><Mail size={14} /> omrishomekitchen@gmail.com</span>
          </div>
          <div className="social-links">
            <a href="#"><Facebook size={14} /></a>
            <a href="https://www.instagram.com/omrishomekichen?utm_source=qr&igsh=cHQ0ZXFzb3NjN200"><Instagram size={14} /></a>
            <a href="#"><PhoneCall size={14} /></a>
          </div>
        </div>
      </div>

      {/* ── Main Navbar ─────────────────────────────────────── */}
      <div className="main-nav relative">
        <div className="container nav-inner flex justify-between items-center relative z-20 bg-[var(--bg-cream)]">

          {/* Logo */}
          <div className="logo">
            <Link to="/" onClick={closeMenu} className="flex items-center">
              <img
                src={logo}
                alt="Omris Home Kitchen Logo"
                className="w-[200px] h-[50px] object-contain transition-transform duration-200 hover:scale-105"
              />
            </Link>
          </div>

          {/* Nav Links */}
          <nav
            className={`nav-links flex-col lg:flex-row absolute lg:relative top-full left-0 w-full lg:w-auto bg-[var(--bg-cream)] lg:bg-transparent shadow-md lg:shadow-none p-6 lg:p-0 transition-all duration-300 ease-in-out lg:flex gap-4 lg:gap-8 ${isOpen ? 'flex' : 'hidden'}`}
          >
            <Link to="/" onClick={closeMenu} className="py-2 lg:py-0">Home</Link>
            <Link to="/about" onClick={closeMenu} className="py-2 lg:py-0">About Us</Link>
            <Link to="/veg-pickles" onClick={closeMenu} className="py-2 lg:py-0">Veg Pickles</Link>
            <Link to="/non-veg-pickles" onClick={closeMenu} className="py-2 lg:py-0">Non-Veg Pickles</Link>
            <Link to="/podis" onClick={closeMenu} className="py-2 lg:py-0">Podis</Link>
            <Link to="/contact" onClick={closeMenu} className="py-2 lg:py-0">Contact Us</Link>
            {user && user.role === 'admin' && (
              <Link to="/admin" onClick={closeMenu} className="py-2 lg:py-0" style={{ color: '#6366f1', fontWeight: 'bold' }}>
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Cart + User + Hamburger */}
          <div className="flex items-center gap-4">
            {/* User / Sign-In Icon */}
            <div
              className="user-icon-wrapper"
              onMouseEnter={() => setUserDropdown(true)}
              onMouseLeave={() => setUserDropdown(false)}
            >
              {user ? (
                <div className="user-link cursor-pointer flex items-center gap-2" onClick={closeMenu}>
                  <User size={24} strokeWidth={1.5} />
                  <span className="hidden lg:inline-block text-sm font-semibold truncate max-w-[120px]">
                    {user.name}
                  </span>
                </div>
              ) : (
                <Link to="/login" className="user-link" onClick={closeMenu} aria-label="Sign In">
                  <User size={24} strokeWidth={1.5} />
                </Link>
              )}
              {userDropdown && (
                <div className="user-dropdown">
                  {user ? (
                    <>
                      <div className="px-4 py-2 text-sm font-bold border-b border-gray-100 lg:hidden">
                        {user.name}
                      </div>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="user-dropdown-item"
                          style={{ color: '#6366f1', fontWeight: 700 }}
                          onClick={() => { closeMenu(); setUserDropdown(false); }}
                        >
                          <Shield size={13} style={{ display: 'inline', marginRight: '6px' }} />
                          Admin Panel
                        </Link>
                      )}
                      <Link
                        to="/order-history"
                        className="user-dropdown-item"
                        onClick={() => { closeMenu(); setUserDropdown(false); }}
                      >
                        <History size={13} style={{ display: 'inline', marginRight: '6px' }} />
                        My Orders
                      </Link>
                      <button className="user-dropdown-item text-left w-full" onClick={handleLogout}>
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="user-dropdown-item" onClick={() => { closeMenu(); setUserDropdown(false); }}>
                        Sign In
                      </Link>
                      <Link to="/signup" className="user-dropdown-item" onClick={() => { closeMenu(); setUserDropdown(false); }}>
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="cart-icon-wrapper">
              <Link to="/cart" className="cart-link" onClick={closeMenu}>
                <ShoppingCart size={24} />
                {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
              </Link>
            </div>
            <button
              className="lg:hidden text-[var(--text-dark)] focus:outline-none"
              onClick={toggleMenu}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
