import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Pages
const Home        = React.lazy(() => import('./pages/Home'));
const Products    = React.lazy(() => import('./pages/Products'));
const VegPickles  = React.lazy(() => import('./pages/VegPickles'));
const NonVegPickles = React.lazy(() => import('./pages/NonVegPickles'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Cart        = React.lazy(() => import('./pages/Cart'));
const Checkout    = React.lazy(() => import('./pages/Checkout'));
const About       = React.lazy(() => import('./pages/About'));
const Contact     = React.lazy(() => import('./pages/Contact'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const FAQ         = React.lazy(() => import('./pages/FAQ'));

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Navbar />
      <React.Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>}>
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/veg-pickles"   element={<VegPickles />} />
          <Route path="/non-veg-pickles" element={<NonVegPickles />} />
          <Route path="/products"      element={<Products />} />
          <Route path="/products/:id"  element={<ProductDetail />} />
          <Route path="/cart"          element={<Cart />} />
          <Route path="/checkout"      element={<Checkout />} />
          <Route path="/about"         element={<About />} />
          <Route path="/contact"       element={<Contact />} />
          <Route path="/privacy"       element={<PrivacyPolicy />} />
          <Route path="/faq"           element={<FAQ />} />
        </Routes>
      </React.Suspense>
      <Footer />
    </Router>
  );
}

export default App;

