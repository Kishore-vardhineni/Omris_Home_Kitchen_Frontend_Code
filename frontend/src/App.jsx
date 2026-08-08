import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// ── Public Site Pages ──────────────────────────────────────────────────────────
const Home          = React.lazy(() => import('./pages/Home'));
const Products      = React.lazy(() => import('./pages/Products'));
const VegPickles    = React.lazy(() => import('./pages/VegPickles'));
const NonVegPickles = React.lazy(() => import('./pages/NonVegPickles'));
const Podis         = React.lazy(() => import('./pages/Podis'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Cart          = React.lazy(() => import('./pages/Cart'));
const Checkout      = React.lazy(() => import('./pages/Checkout'));
const About         = React.lazy(() => import('./pages/About'));
const Contact       = React.lazy(() => import('./pages/Contact'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const FAQ           = React.lazy(() => import('./pages/FAQ'));
const Signup        = React.lazy(() => import('./pages/Signup'));
const Login         = React.lazy(() => import('./pages/Login'));

// ── Admin Pages ────────────────────────────────────────────────────────────────
const AdminDashboard   = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts    = React.lazy(() => import('./pages/admin/AdminProducts'));
const AdminAddProduct  = React.lazy(() => import('./pages/admin/AdminAddProduct'));
const AdminEditProduct = React.lazy(() => import('./pages/admin/AdminEditProduct'));

// ── Public Layout (wraps all non-admin routes with Navbar + Footer) ───────────
const PublicLayout = () => (
  <>
    <Navbar />
    <Outlet />
    <Footer />
  </>
);

function App() {
  return (
    <Router>
      <ScrollToTop />
      <React.Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>}>
        <Routes>

          {/* ══════════════ ADMIN ROUTES — no Navbar/Footer ══════════════ */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
          <Route path="/admin/products/add" element={<AdminRoute><AdminAddProduct /></AdminRoute>} />
          <Route path="/admin/products/edit/:id" element={<AdminRoute><AdminEditProduct /></AdminRoute>} />

          {/* ══════════════ PUBLIC ROUTES — wrapped in PublicLayout ══════════════ */}
          <Route element={<PublicLayout />}>
            <Route path="/"                element={<Home />} />
            <Route path="/veg-pickles"     element={<VegPickles />} />
            <Route path="/non-veg-pickles" element={<NonVegPickles />} />
            <Route path="/podis"           element={<Podis />} />
            <Route path="/products"        element={<Products />} />
            <Route path="/products/:id"    element={<ProductDetail />} />
            <Route path="/cart"            element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/checkout"        element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/signup"          element={<Signup />} />
            <Route path="/login"           element={<Login />} />
            <Route path="/about"           element={<About />} />
            <Route path="/contact"         element={<Contact />} />
            <Route path="/privacy"         element={<PrivacyPolicy />} />
            <Route path="/faq"             element={<FAQ />} />
          </Route>

        </Routes>
      </React.Suspense>
    </Router>
  );
}

export default App;
