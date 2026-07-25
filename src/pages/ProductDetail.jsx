import React, { useState } from 'react';
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
import { getProductById, PACKING_PRICES } from '../data/products';
import { useCart } from '../context/CartContext';

// ─────────────────────────────────────────────────────────────────────────────
// Product Not Found — professional 404 experience
// ─────────────────────────────────────────────────────────────────────────────
const ProductNotFound = () => {
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
          The product you're looking for doesn't exist or may have been removed.
          Browse our full collection to find what you need.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-neutral-200 text-neutral-700 font-semibold hover:border-neutral-400 hover:text-neutral-900 transition-all duration-200"
          >
            <ArrowLeft size={18} /> Go Back
          </button>
          <Link
            to="/products"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-black text-white font-semibold hover:bg-neutral-800 transition-all duration-200"
          >
            Browse All Products
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
      Rs.&nbsp;{price}
    </motion.span>
  </AnimatePresence>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Product Detail Page
// ─────────────────────────────────────────────────────────────────────────────
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dispatch } = useCart();

  // ── Look up canonical product ─────────────────────────────────────────────
  const product = getProductById(id);

  // ── State — initialised before the early-return so hook order is stable ───
  const defaultWeight = product?.defaultWeight || '250gm';
  const defaultPacking = 'Without Bottle';

  const [selectedWeight, setSelectedWeight] = useState(defaultWeight);
  const [selectedPacking, setSelectedPacking] = useState(defaultPacking);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [activeGalleryImage, setActiveGalleryImage] = useState(null);

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!product) return <ProductNotFound />;

  // ── Pricing logic (all derived — no duplication) ──────────────────────────
  // priceMap comes directly from the catalog — edit prices there, not here.
  const { priceMap } = product;
  const weightOptions = Object.keys(priceMap);         // e.g. ['250gm','500gm','1kg']
  const packingOptions = Object.keys(PACKING_PRICES);   // e.g. ['Without Bottle','Bottle']

  // Validate selectedWeight (guards against stale state if catalog changes)
  const activeWeight = weightOptions.includes(selectedWeight)
    ? selectedWeight
    : weightOptions[0];

  const unitPrice = priceMap[activeWeight];
  const packCharge = PACKING_PRICES[selectedPacking] ?? 0;
  const totalPrice = ((unitPrice + packCharge) * quantity).toFixed(2);

  // Is the 1kg tier selected? Show a "Save 15%" badge.
  const show1kgBadge = activeWeight === '1kg';

  // ── Gallery images dynamically loaded for selected product ────────────────
  const productImages = product.gallery || [
    { src: product.image, alt: `${product.name} – Main View` },
  ];

  const downloadSrc = activeGalleryImage || product.image;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAddToCart = () => {
    const itemPrice = unitPrice + packCharge;
    const variantSuffix = `${activeWeight}${selectedPacking !== 'Without Bottle' ? ` - ${selectedPacking}` : ''}`;
    
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: `${product.id}-${activeWeight}-${selectedPacking.replace(/\s+/g, '-').toLowerCase()}`,
        name: `${product.name} (${variantSuffix})`,
        price: itemPrice,
        image: product.image,
        quantity: quantity,
        description: product.description,
        weight: activeWeight,
        packing: selectedPacking,
      },
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleBuyNow = () => {
    const itemPrice = unitPrice + packCharge;
    const variantSuffix = `${activeWeight}${selectedPacking !== 'Without Bottle' ? ` - ${selectedPacking}` : ''}`;
    
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: `${product.id}-${activeWeight}-${selectedPacking.replace(/\s+/g, '-').toLowerCase()}`,
        name: `${product.name} (${variantSuffix})`,
        price: itemPrice,
        image: product.image,
        quantity: quantity,
        description: product.description,
        weight: activeWeight,
        packing: selectedPacking,
      },
    });

    navigate('/cart');
  };

  // ── Render ────────────────────────────────────────────────────────────────
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
            <span>Added {quantity} × {product.name} ({activeWeight}) to cart!</span>
            <Link to="/cart" className="ml-2 underline text-amber-400 hover:text-amber-300 transition-colors">
              View Cart →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page wrapper ─────────────────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-6 lg:py-12">

        {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
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

        {/* ── Two-column grid: stacks on mobile, side-by-side on lg+ ───────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">

          {/* ================================================================
              LEFT — Product Gallery (sticky on desktop)
             ================================================================ */}
          <div className="w-full lg:sticky lg:top-24">
            <ProductGallery
              images={productImages}
              productName={product.name}
              onActiveImageChange={setActiveGalleryImage}
            />

            {/* ── Download Image Button ─────────────────────────────────── */}
            <div className="mt-3 flex justify-end">
              <a
                href={downloadSrc}
                download={`${product.name.replace(/\s+/g, '_')}.png`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 hover:border-neutral-400 transition-all duration-200"
                aria-label={`Download ${product.name} image`}
              >
                <Download size={15} strokeWidth={2} />
                Download Image
              </a>
            </div>

            {/* Quality badges */}
            <div className="mt-6 grid grid-cols-3 gap-2 p-3 sm:p-4 bg-stone-50 rounded-2xl border border-stone-200/70">
              {[
                { icon: ShieldCheck, title: '100% Organic', sub: 'No Preservatives' },
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

          {/* ================================================================
              RIGHT — Product Info & Selectors
             ================================================================ */}
          <div className="flex flex-col gap-5 lg:gap-6">

            {/* ── Brand + action icons ───────────────────────────────────── */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs sm:text-sm font-semibold tracking-widest text-neutral-500 uppercase">
                PALLETURIPACHALLU
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

            {/* ── Product name + rating ──────────────────────────────────── */}
            <div className="-mt-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-neutral-900 leading-tight">
                {product.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-2.5">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" stroke="none" />
                  ))}
                </div>
                <span className="text-xs font-bold text-neutral-900">4.9</span>
                <span className="text-xs text-neutral-400">•</span>
                <span className="text-xs font-medium text-neutral-500 underline cursor-pointer hover:text-black">
                  148 Verified Ratings
                </span>
              </div>
            </div>

            {/* ── Price (animated) ───────────────────────────────────────── */}
            <div className="flex flex-wrap items-baseline gap-3 pt-1">
              <AnimatedPrice price={totalPrice} />
              {/* {show1kgBadge && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-xs sm:text-sm font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200"
                >
                  Save 15%
                </motion.span>
              )} */}
            </div>

            {/* ── Tax note ───────────────────────────────────────────────── */}
            <p className="-mt-3 text-xs sm:text-sm text-neutral-500 font-medium">
              Taxes included.{' '}
              <span className="underline cursor-pointer hover:text-black">Shipping</span>{' '}
              calculated at checkout.
            </p>

            <hr className="border-neutral-200" />

            {/* ================================================================
                WEIGHT SELECTOR
                Always shows all weight tiers from priceMap.
                priceHint surfaces the per-unit price under each pill.
               ================================================================ */}
            <VariantSelector
              label="Weight"
              options={weightOptions}
              selectedValue={activeWeight}
              onChange={setSelectedWeight}
              priceHint={priceMap}
            />

            {/* ================================================================
                PACKING SELECTOR
                Driven by PACKING_PRICES — add new options there, not here.
               ================================================================ */}
            <VariantSelector
              label="Packing"
              options={packingOptions}
              selectedValue={selectedPacking}
              onChange={setSelectedPacking}
              priceHint={
                Object.fromEntries(
                  packingOptions.map((opt) => [
                    opt,
                    PACKING_PRICES[opt] === 0 ? 'Free' : `+₹${PACKING_PRICES[opt]}`,
                  ])
                )
              }
            />

            {/* ── Quantity selector ──────────────────────────────────────── */}
            <QuantitySelector
              quantity={quantity}
              onIncrement={() => setQuantity((p) => Math.min(p + 1, 20))}
              onDecrement={() => setQuantity((p) => Math.max(p - 1, 1))}
            />

            {/* ── CTA buttons ────────────────────────────────────────────── */}
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

              <motion.button
                type="button"
                onClick={handleBuyNow}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.15 }}
                className="w-full py-3.5 sm:py-4 px-6 sm:px-8 bg-emerald-700 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-xl hover:bg-emerald-800 transition-all duration-200 flex items-center justify-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
              >
                <Zap size={20} strokeWidth={2.2} className="fill-current" />
                <span>Buy Now</span>
              </motion.button>
            </div>

            {/* ================================================================
                TABBED PRODUCT INFORMATION
               ================================================================ */}
            <div className="mt-4 pt-6 border-t border-neutral-200 flex flex-col gap-4">
              {/* Tab headers — scrollable so long labels don't overflow */}
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

              {/* Tab content */}
              <div className="text-sm text-neutral-600 leading-relaxed min-h-[100px]">
                {activeTab === 'description' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    <p>
                      Experience the authentic Andhra flavor with PALLETURIPACHALLU's{' '}
                      <strong>{product.name}</strong>.{' '}
                      {product.description}
                    </p>
                    <p>
                      Prepared in small-batch artisanal home kitchens using secret grandmother recipes
                      passed down for generations. No artificial colors, no MSG, and zero chemical preservatives.
                    </p>
                  </motion.div>
                )}

                {activeTab === 'ingredients' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:text-sm">
                      {[
                        'Fresh Selected Ingredients',
                        'Cold-Pressed Sesame Oil',
                        'Guntur Red Chili Powder',
                        'Rock Salt & Garlic',
                        'Mustard & Fenugreek Powder',
                        'Asafoetida (Hing)',
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-black flex-shrink-0 mt-1.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {activeTab === 'storage' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                    <p><strong>Shelf Life:</strong> Best before 6 months from date of packing.</p>
                    <p>
                      <strong>Storage Instructions:</strong> Store in a cool, dry place.
                      Always use a clean, dry spoon to avoid moisture contamination.
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

          </div>{/* end right section */}
        </div>{/* end grid */}
      </div>{/* end page wrapper */}

      {/* ── Sticky mobile Add-to-Cart bar (< 640 px) ─────────────────────── */}
      <StickyMobileAddToCart
        productName={product.name}
        price={`Rs. ${totalPrice}`}
        selectedWeight={activeWeight}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};

export default ProductDetail;
