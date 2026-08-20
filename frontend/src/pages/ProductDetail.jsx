import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Zap, ShieldCheck, Truck, RefreshCw,
  Heart, Share2, Check, Star, ArrowLeft, PackageX, Download,
} from 'lucide-react';
import ProductGallery from '../components/Product/ProductGallery';
import VariantSelector from '../components/Product/VariantSelector';
import QuantitySelector from '../components/Product/QuantitySelector';
import StickyMobileAddToCart from '../components/Product/StickyMobileAddToCart';
import ProductReviewsSection from '../components/ProductReviewsSection';

import { useCart } from '../context/CartContext';
import { getProductBySlug } from '../services/productService';

// ─────────────────────────────────────────────────────────────────────────────
// Product Not Found — professional 404 experience
// ─────────────────────────────────────────────────────────────────────────────
const ProductNotFound = ({ message }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center font-inter">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-stone-100 flex items-center justify-center">
            <PackageX className="w-12 h-12 text-stone-400" strokeWidth={1.5} />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3 tracking-tight">
          Product Not Found
        </h1>
        <p className="text-neutral-500 text-base sm:text-lg mb-8 leading-relaxed">
          {message || "The product you're looking for doesn't exist or may have been removed."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-neutral-200 text-neutral-700 font-semibold hover:border-neutral-400 hover:text-neutral-900 transition-all duration-200"
          >
            <ArrowLeft size={18} /> Go Back
          </button>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-black text-white font-semibold hover:bg-neutral-800 transition-all duration-200"
          >
            Browse Collections
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Animated price display — numbers flip smoothly when weight changes
// ─────────────────────────────────────────────────────────────────────────────
const AnimatedPrice = ({ price }) => (
  <AnimatePresence mode="wait">
    <motion.span
      key={price}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight tabular-nums"
    >
      ₹&nbsp;{price}
    </motion.span>
  </AnimatePresence>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Product Detail Page
// ─────────────────────────────────────────────────────────────────────────────
const ProductDetail = () => {
  const { id } = useParams(); // URL parameter id contains the product slug
  const navigate = useNavigate();
  const { dispatch } = useCart();

  // ── States ─────────────────────────────────────────────────────────────────
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedWeight, setSelectedWeight] = useState('');

  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [activeGalleryImage, setActiveGalleryImage] = useState(null);

  // ── Ref for smooth scroll to reviews ──────────────────────────────────────
  const reviewsRef = useRef(null);

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Gallery image setup (Combines primary image + gallery images)
  const productImages = useMemo(() => {
    if (!product) return [];
    const list = [];
    if (product.image?.url) {
      list.push({ src: product.image.url, alt: product.image.altText || product.name });
    }
    if (Array.isArray(product.gallery)) {
      product.gallery.forEach((g) => {
        if (g?.url && g.url !== product.image?.url) {
          list.push({ src: g.url, alt: g.altText || product.name });
        }
      });
    }
    return list.length > 0 ? list : [{ src: 'https://via.placeholder.com/600', alt: product.name }];
  }, [product]);

  // ── Fetch single product ───────────────────────────────────────────────────
  const loadProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProductBySlug(id);
      setProduct(data.product);

      // Pre-select first available variant
      if (data.product?.variants && data.product.variants.length > 0) {
        const firstAvailable = data.product.variants.find((v) => v.isAvailable && v.stock > 0) || data.product.variants[0];
        setSelectedWeight(firstAvailable.label);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch product details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  // ── Early Render States ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        <p className="text-neutral-600 font-semibold">Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto gap-4">
        <p className="text-red-600 font-bold text-xl">{error}</p>
        <button
          onClick={loadProduct}
          className="px-8 py-3 bg-black text-white font-semibold rounded-xl hover:bg-neutral-800 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!product) {
    return <ProductNotFound />;
  }

  // ── Derived State Options ──────────────────────────────────────────────────
  const weightOptions = product.variants ? product.variants.map((v) => v.label) : [];
  // Identify active variant details
  const activeVariant = product.variants?.find((v) => v.label === selectedWeight) || product.variants?.[0];
  const unitPrice = activeVariant ? (activeVariant.discountedPrice ?? activeVariant.price) : 0;
  const originalUnitPrice = activeVariant?.discountedPrice ? activeVariant.price : null;
  const discountPercent = (originalUnitPrice && originalUnitPrice > unitPrice)
    ? Math.round(((originalUnitPrice - unitPrice) / originalUnitPrice) * 100)
    : 0;
  const totalPrice = (unitPrice * quantity).toFixed(2);

  // Disabled weight options (out of stock or unavailable)
  const disabledWeights = product.variants
    ? product.variants.filter((v) => !v.isAvailable || v.stock <= 0).map((v) => v.label)
    : [];

  // Generate price hints map for Weight VariantSelector
  const weightPriceHintMap = product.variants
    ? Object.fromEntries(product.variants.map((v) => [v.label, v.discountedPrice ?? v.price]))
    : {};


  const downloadSrc = activeGalleryImage || product.image?.url;

  // ── Download Image Handler ───────────────────────────────────────────────
  const handleDownloadImage = async (e, url, filename) => {
    e.preventDefault();
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
      // Fallback: just open the image in a new tab if fetch fails due to CORS
      window.open(url, '_blank');
    }
  };

  // ── Cart Handlers ─────────────────────────────────────────────────────────
  const handleAddToCart = () => {
    if (!activeVariant) return;

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: `${product._id}-${selectedWeight}`,
        name: product.name,
        price: unitPrice,
        originalPrice: originalUnitPrice,
        image: product.image?.url,
        quantity: quantity,
        description: product.shortDescription || product.longDescription,
        weight: selectedWeight,
      },
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  return (
    <div className="bg-white min-h-screen font-inter text-neutral-900 selection:bg-black selection:text-white">

      {/* ── Toast: Added to Cart ──────────────────────────────────────────── */}
      <AnimatePresence>
        {addedToCart && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 text-sm font-semibold border border-neutral-700 whitespace-nowrap"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-black flex-shrink-0">
              <Check size={12} strokeWidth={3} />
            </div>
            <span>Added {quantity} × {product.name} ({selectedWeight}) to cart!</span>
            <Link to="/cart" className="ml-2 underline text-amber-400 hover:text-amber-300 transition-colors">
              View Cart →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-6 lg:py-12">

        {/* ── Breadcrumbs ──────────────────────────────────────────────────── */}
        <nav
          aria-label="Breadcrumb"
          className="mb-4 lg:mb-8 text-xs sm:text-sm text-neutral-500 flex flex-wrap items-center gap-1.5"
        >
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-black transition-colors">Products</Link>
          <span>/</span>
          <span className="text-neutral-900 font-medium line-clamp-1">{product.name}</span>
        </nav>

        {/* ── Back button ──────────────────────────────────────────────────── */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-black transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* ── Main columns grid ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">

          {/* Left Column: Gallery */}
          <div className="w-full lg:sticky lg:top-24">
            <ProductGallery
              images={productImages}
              productName={product.name}
              onActiveImageChange={setActiveGalleryImage}
            />

            {downloadSrc && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={(e) => handleDownloadImage(e, downloadSrc, `${product.name.replace(/\s+/g, '_')}.png`)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 hover:border-neutral-400 transition-all duration-200"
                  aria-label={`Download ${product.name} image`}
                >
                  <Download size={15} strokeWidth={2} />
                  Download Image
                </button>
              </div>
            )}

            {/* Quality Badges */}
            <div className="mt-6 grid grid-cols-3 gap-2 p-3 sm:p-4 bg-stone-50 rounded-2xl border border-stone-200/70">
              {[
                { icon: ShieldCheck, title: product.isOrganicCertified ? 'Certified Organic' : '100% Natural', sub: product.isVegetarian ? 'Pure Vegetarian' : 'Fresh Recipe' },
                { icon: Truck, title: 'Fast Shipping', sub: 'Dispatch in 24h', border: true },
                { icon: RefreshCw, title: 'Traditional', sub: 'Andhra Recipe' },
              ].map(({ icon: Icon, title, sub, border }) => (
                <div
                  key={title}
                  className={`flex flex-col items-center text-center p-1.5 sm:p-2 ${border ? 'border-x border-stone-200' : ''}`}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-800 mb-1" strokeWidth={1.75} />
                  <span className="text-[10px] sm:text-xs font-bold text-neutral-800 leading-tight">{title}</span>
                  <span className="text-[9px] sm:text-[11px] text-neutral-500 mt-0.5 leading-tight">{sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Info & Selectors */}
          <div className="flex flex-col gap-5 lg:gap-6">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs sm:text-sm font-semibold tracking-widest text-neutral-500 uppercase">
                OmrisHomeKitchen
              </span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  aria-label="Save to Wishlist"
                  className="p-2 sm:p-2.5 rounded-full border border-neutral-200 text-neutral-600 hover:text-black hover:border-black transition-colors"
                >
                  <Heart size={18} fill={isWishlisted ? '#000' : 'none'} className={isWishlisted ? 'text-black' : ''} />
                </button>
                <button
                  type="button"
                  aria-label="Copy link to share"
                  onClick={() => navigator.clipboard?.writeText(window.location.href)}
                  className="p-2 sm:p-2.5 rounded-full border border-neutral-200 text-neutral-600 hover:text-black hover:border-black transition-colors"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-neutral-900 leading-tight">
                {product.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-2.5">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < Math.round(product.averageRating || 5) ? 'currentColor' : 'none'}
                      stroke={i < Math.round(product.averageRating || 5) ? 'none' : 'currentColor'}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-neutral-900">{product.averageRating || '4.9'}</span>
                <span className="text-xs text-neutral-400">•</span>
                <button
                  type="button"
                  onClick={scrollToReviews}
                  className="text-xs font-medium text-neutral-500 underline cursor-pointer hover:text-black transition-colors"
                >
                  {product.numReviews || '148'} Verified Reviews
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-baseline gap-3 pt-1">
              <AnimatedPrice price={totalPrice} />
              {originalUnitPrice && (
                <span className="text-lg sm:text-xl text-neutral-400 line-through font-medium">
                  ₹{(originalUnitPrice * quantity).toFixed(0)}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            <p className="-mt-3 text-xs sm:text-sm text-neutral-500 font-medium">
              Taxes included.{' '}
              <span className="underline cursor-pointer hover:text-black">Shipping</span>{' '}
              calculated at checkout.
            </p>

            <hr className="border-neutral-200" />

            {/* Weight Selectors */}
            {weightOptions.length > 0 && (
              <VariantSelector
                label="Weight"
                options={weightOptions}
                selectedValue={selectedWeight}
                onChange={setSelectedWeight}
                priceHint={weightPriceHintMap}
                disabledOptions={disabledWeights}
              />
            )}



            {/* Quantity selector */}
            <QuantitySelector
              quantity={quantity}
              onIncrement={() => setQuantity((p) => Math.min(p + 1, activeVariant?.stock || 20))}
              onDecrement={() => setQuantity((p) => Math.max(p - 1, 1))}
            />

            {/* Add to Cart CTA */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <motion.button
                type="button"
                onClick={handleAddToCart}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.15 }}
                className="w-full py-3.5 sm:py-4 px-6 sm:px-8 bg-black text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-xl hover:bg-neutral-800 transition-all duration-200 flex items-center justify-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                <ShoppingBag size={20} strokeWidth={2.2} />
                <span>Add to Cart</span>
              </motion.button>
            </div>

            {/* Tabbed Info */}
            <div className="mt-4 pt-6 border-t border-neutral-200 flex flex-col gap-4">
              <div
                className="flex border-b border-neutral-200 gap-4 sm:gap-6 overflow-x-auto"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {['description', 'ingredients', 'storage'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-bold transition-colors relative whitespace-nowrap flex-shrink-0 focus:outline-none ${activeTab === tab ? 'text-black' : 'text-neutral-400 hover:text-neutral-700'
                      }`}
                  >
                    {tab === 'description' && 'Description'}
                    {tab === 'ingredients' && 'Ingredients'}
                    {tab === 'storage' && 'Storage & Shelf Life'}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="text-sm text-neutral-600 leading-relaxed min-h-[100px]">
                {activeTab === 'description' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    <p>
                      {product.longDescription || product.shortDescription || 'Experience authentic homemade recipes from OmrisHomeKitchen.'}
                    </p>
                  </motion.div>
                )}

                {activeTab === 'ingredients' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                    {product.ingredients && product.ingredients.length > 0 ? (
                      <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:text-sm">
                        {product.ingredients.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-black flex-shrink-0 mt-1.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>Traditional ingredients used. No artificial colors or preservatives.</p>
                    )}
                  </motion.div>
                )}

                {activeTab === 'storage' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                    <p><strong>Shelf Life:</strong> {product.shelfLife || 'Best before 6 months from packaging.'}</p>
                    <p>
                      <strong>Storage Instructions:</strong> {product.storageInstructions || 'Store in a cool, dry place. Always use a dry spoon.'}
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Reviews Section */}
        <div ref={reviewsRef} className="mt-12 lg:mt-16 scroll-mt-24">
          <ProductReviewsSection productId={product._id} productName={product.name} reviewsData={product.reviews || []} />
        </div>
      </div>

      {/* Sticky Mobile Cart CTA */}
      <StickyMobileAddToCart
        productName={product.name}
        price={`₹ ${totalPrice}`}
        selectedWeight={selectedWeight}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};

export default ProductDetail;
