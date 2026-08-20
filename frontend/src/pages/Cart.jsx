import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowLeft, Clock, CheckCircle2, X, Loader2, Star, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Cart Item Component ────────────────────────────────────────────────────────
const CartItem = ({ item, dispatch }) => {
  const cleanName = item.name ? item.name.replace(/\s*\([^)]*\)/, '') : '';
  const rawVariant = item.name && item.name.match(/\(([^)]+)\)/)?.[1];
  const displayWeight = item.weight || rawVariant || '250 gms';
  const itemTotal = (item.price * item.quantity).toFixed(0);
  const originalTotal = item.originalPrice ? (item.originalPrice * item.quantity).toFixed(0) : null;
  const discountPercent = originalTotal && originalTotal > itemTotal
    ? Math.round(((originalTotal - itemTotal) / originalTotal) * 100)
    : 0;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-5 border-b border-neutral-100 last:border-b-0">
      <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto flex-1">
        <div className="p-1 border border-neutral-200 rounded bg-white flex-shrink-0">
          <img
            src={item.image || "https://images.unsplash.com/photo-1589301773950-a92c4c1538df?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"}
            alt={cleanName || item.name}
            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded bg-neutral-50"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-[#0f172a] text-base sm:text-[17px] leading-snug tracking-tight">
            {cleanName || item.name} {displayWeight}
          </h3>
          <p className="text-[#64748b] text-[13px] mt-1 mb-3 uppercase tracking-wide">
            NOS
          </p>
          <div className="flex items-baseline gap-2.5">
            <span className="font-bold text-[#0f172a] text-base sm:text-lg">₹{itemTotal}</span>
            {originalTotal && (
              <span className="text-sm text-[#64748b] line-through font-medium">₹{originalTotal}</span>
            )}
            {discountPercent > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#dcfce7] text-[#166534]">
                {discountPercent}% OFF
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-auto w-full sm:w-auto justify-end mt-2 sm:mt-0">
        <div className="flex items-center bg-white rounded border border-neutral-200 overflow-hidden">
          <button
            onClick={() => {
              if (item.quantity > 1) {
                dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity - 1 } });
              }
            }}
            className="w-8 h-8 flex items-center justify-center hover:bg-neutral-50 text-[#5c4bdf] transition-colors text-lg border-r border-neutral-100"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="w-10 text-center text-sm text-neutral-800 select-none">
            {item.quantity}
          </span>
          <button
            onClick={() => {
              dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity + 1 } });
            }}
            className="w-8 h-8 flex items-center justify-center hover:bg-neutral-50 text-[#5c4bdf] transition-colors text-lg border-l border-neutral-100"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <button
          onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item })}
          className="text-neutral-400 hover:text-red-500 transition-colors p-1"
          aria-label="Remove item"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

// ── Order Confirm Modal ───────────────────────────────────────────────────────
const OrderConfirmModal = ({ items, total, onConfirm, onCancel, isSaving }) => (
  <motion.div
    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    {/* Backdrop */}
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />

    {/* Modal */}
    <motion.div
      className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      initial={{ y: 60, opacity: 0, scale: 0.97 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 60, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-neutral-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-neutral-900 text-base">Confirm Your Order</h2>
            <p className="text-xs text-neutral-400">Review your items before placing</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Order Items */}
      <div className="px-6 py-4 space-y-3">
        {items.map((item, i) => {
          const name = item.name?.replace(/\s*\([^)]*\)/, '') || item.name;
          const weight = item.weight || item.name?.match(/\(([^)]+)\)/)?.[1] || '';
          return (
            <div key={i} className="flex items-center gap-3">
              {item.image ? (
                <img src={item.image} alt={name} className="w-12 h-12 rounded-xl object-cover border border-neutral-100 flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-lg flex-shrink-0">🥒</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-neutral-800 text-sm truncate">{name}</p>
                <p className="text-xs text-neutral-400">{weight} × {item.quantity}</p>
              </div>
              <p className="font-bold text-neutral-900 text-sm flex-shrink-0">
                ₹{(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-600">Order Total</span>
        <span className="text-xl font-bold text-neutral-900">₹{total.toFixed(2)}</span>
      </div>

      {/* Info Banner */}
      <div className="mx-6 mb-4 mt-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 leading-relaxed">
        ✅ Your order will be <strong>saved to your account</strong> and a WhatsApp message will open for you to send to our kitchen team.
      </div>

      {/* Action Buttons */}
      <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 border border-neutral-300 text-neutral-700 rounded-xl text-sm font-semibold hover:bg-neutral-50 transition-colors"
          disabled={isSaving}
        >
          Go Back
        </button>
        <button
          onClick={onConfirm}
          disabled={isSaving}
          className="flex-1 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving Order...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Confirm & Open WhatsApp
            </>
          )}
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// ── Main Cart Page ────────────────────────────────────────────────────────────
const Cart = () => {
  const { state, dispatch } = useCart();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Build WhatsApp message text
  const buildWhatsAppMessage = () => {
    let message = `🛒 *New Order from Omris Home Kitchen*\n\n`;
    message += `*Items Ordered:*\n`;

    state.items.forEach((item, index) => {
      const cleanName = item.name ? item.name.replace(/\s*\([^)]*\)/, '') : item.name;
      const rawVariant = item.name && item.name.match(/\(([^)]+)\)/)?.[1];
      const displayWeight = item.weight || rawVariant || '250gm';
      const displayPacking = item.packing && item.packing !== 'Without Bottle' ? ` (${item.packing})` : '';
      const itemTotal = (item.price * item.quantity).toFixed(2);

      message += `${index + 1}. *${cleanName}*\n`;
      message += `   • Quantity: ${item.quantity}\n`;
      message += `   • Variant: ${displayWeight}${displayPacking}\n`;
      message += `   • Subtotal: ₹${itemTotal} (₹${item.price} each)\n\n`;
    });

    message += `------------------------------\n`;
    message += `💰 *Total Amount:* ₹${state.total.toFixed(2)}\n\n`;
    message += `Please confirm my order and share payment details. Thank you!`;

    return message;
  };

  // Step 1: Open confirmation modal
  const handleWhatsAppClick = () => {
    if (state.items.length === 0) return;
    setShowModal(true);
  };

  // Step 2: Save order to DB then open WhatsApp
  const handleConfirmOrder = async () => {
    setIsSaving(true);

    const token = localStorage.getItem('token');
    const userInfoStr = localStorage.getItem('userInfo');
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const orderItems = state.items.map(item => ({
        name: item.name,
        image: item.image || '',
        price: item.price,
        quantity: item.quantity,
        weight: item.weight || '',
        packing: item.packing || '',
        productId: item.productId || item._id || undefined,
      }));

      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          orderItems,
          totalPrice: state.total,
          paymentMethod: 'WhatsApp',
          status: 'Awaiting Confirmation',
          guestInfo: userInfo
            ? { name: userInfo.name, email: userInfo.email, phone: userInfo.phone }
            : undefined,
        }),
      });

      const data = await res.json();
      console.log('📦 Order creation API response:', data);
    } catch (err) {
      console.error('Order save error:', err);
    }

    setIsSaving(false);
    setShowModal(false);

    // Open WhatsApp
    const encodedMsg = encodeURIComponent(buildWhatsAppMessage());
    window.open(`https://wa.me/917670851967?text=${encodedMsg}`, '_blank', 'noopener,noreferrer');

    // Clear cart so badge resets to 0
    dispatch({ type: 'CLEAR_CART' });

    // Show success banner
    setOrderSuccess(true);
  };

  // Calculate original total for savings
  const originalTotal = state.items.reduce((acc, item) => {
    const origPrice = item.originalPrice || Math.round(item.price * 1.43);
    return acc + (origPrice * item.quantity);
  }, 0);
  const savings = originalTotal - state.total;
  const deliveryCharge = state.total > 2000 ? 0 : 100;
  const orderTotal = state.total + deliveryCharge;

  return (
    <div className="bg-[#faf9f6] min-h-screen font-sans text-neutral-800 p-4 sm:p-8 lg:p-12">
      <div className="max-w-[1200px] mx-auto">

        {/* Header: Title and Back Button */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <h1 className="text-3xl font-semibold text-[#2f3542]">My Cart</h1>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-[#5c4bdf] border border-[#e0ddf7] hover:bg-[#f3f0ff] bg-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
          >
            <ArrowLeft size={16} /> Back to shopping
          </button>
        </div>

        {/* Top Stepper inside a white box */}
        <div className="mb-8 flex flex-wrap items-center gap-3 sm:gap-4 text-sm font-medium text-neutral-400 bg-white p-4 rounded-lg shadow-sm border border-neutral-100 w-full">
          <div className="flex items-center gap-2 text-[#5c4bdf]">
            <span className="w-5 h-5 rounded-full bg-[#5c4bdf] text-white flex items-center justify-center text-xs">1</span>
            Cart
          </div>
          <span>→</span>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-neutral-200 text-neutral-400 flex items-center justify-center text-xs">2</span>
            Delivery Address
          </div>
          <span>→</span>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-neutral-200 text-neutral-400 flex items-center justify-center text-xs">3</span>
            Payment
          </div>
        </div>

        {/* ── Order Success Banner ── */}
        <AnimatePresence>
          {orderSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Clock size={22} className="text-amber-700" />
                </div>
                <div>
                  <p className="font-bold text-amber-900 text-sm">Order Placed! Awaiting Confirmation ⏳</p>
                  <p className="text-amber-700 text-xs mt-0.5">Your order is saved as "Awaiting Confirmation".</p>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-13 sm:ml-0">
                <Link
                  to="/order-history"
                  className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors whitespace-nowrap"
                >
                  <Clock size={14} />
                  View My Orders
                </Link>
                <button
                  onClick={() => setOrderSuccess(false)}
                  className="text-green-400 hover:text-green-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {state.items.length === 0 ? (
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-neutral-200 text-center py-16">
            <ShoppingBag className="mx-auto text-neutral-300 mb-4" size={56} strokeWidth={1.5} />
            <h2 className="text-2xl font-serif text-neutral-800 mb-2">Your cart is empty</h2>
            <p className="text-neutral-500 mb-6 text-sm sm:text-base">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link
              to="/products"
              className="inline-block px-6 py-3 bg-[#5c4bdf] text-white rounded font-medium text-sm hover:bg-[#4f3cc9] transition-colors shadow-sm"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* Left Column: Cart Items */}
            <div className="flex-1 w-full bg-white rounded-lg border border-neutral-200">
              <div className="flex items-center justify-between p-5 sm:p-6 border-b border-neutral-200">
                <h2 className="text-lg font-medium text-neutral-800">My cart ({state.items.length} Items)</h2>
                <span className="text-lg font-medium text-neutral-800">Total ₹{state.total.toFixed(0)}</span>
              </div>
              
              <div className="divide-y divide-neutral-200 px-5 sm:px-6">
                {state.items.map((item) => (
                  <CartItem key={item.id} item={item} dispatch={dispatch} />
                ))}
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="w-full lg:w-[360px] flex-shrink-0 flex flex-col gap-4">
              
              <div className="bg-white rounded-lg p-5 sm:p-6 border border-neutral-200">
                <h2 className="text-lg font-medium text-neutral-800 mb-4">Order Summary</h2>
                
                <div className="space-y-3 text-sm text-neutral-500">
                  <div className="flex justify-between">
                    <span>Items ({state.items.length})</span>
                    <span className="text-neutral-800 font-medium">₹{state.total.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charges</span>
                    <span className="text-neutral-800 font-medium">₹{deliveryCharge}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST</span>
                    <span className="text-neutral-800 font-medium">₹0</span>
                  </div>
                </div>

                <hr className="border-t border-dashed border-neutral-300 my-5" />
                
                <div className="flex justify-between items-center mb-6">
                  <span className="text-base text-neutral-800">Order Total</span>
                  <span className="text-lg font-bold text-neutral-900">₹{orderTotal.toFixed(0)}</span>
                </div>

                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full py-3 bg-[#5c4bdf] hover:bg-[#4f3cc9] text-white rounded font-medium transition-colors mb-4"
                >
                  Checkout
                </button>
                
                {savings > 0 && (
                  <div className="flex items-center justify-center gap-1.5 text-[#22c55e] text-sm font-medium">
                    <Star size={16} className="fill-current" /> Your Savings: ₹{savings.toFixed(0)}
                  </div>
                )}
              </div>
              
              <div className="bg-[#f1f5f9] rounded-lg p-4 flex items-center gap-3 text-sm text-neutral-700">
                <Truck size={20} className="text-neutral-400 flex-shrink-0" />
                <span>Free delivery with cart value above <strong>₹2,000</strong></span>
              </div>

              <div className="mt-2">
                <p className="text-[#64748b] font-medium mb-3">Store Terms and Conditions</p>
                <div className="bg-[#f8fafc] p-5 rounded-lg text-sm text-[#475569] leading-relaxed tracking-wide">
                  <ul className="list-disc pl-5 space-y-2 marker:text-[#94a3b8]">
                    <li>NO RETURN, ONLY EXCHANGE, IF ANY DAMAGE.</li>
                    <li>WHEN YOU OPEN THE PACKAGE YOU CAN SHOOT A VIDEO AND SEND TO WHATSAPP IF THERE IS ANY DAMAGES,</li>
                    <li>NOTE:</li>
                    <li><span role="img" aria-label="cross">❌</span>YOU CAN'T RECORD VIDEO OR YOU CAN'T SEND TO CUSTOMER SUPPORT WE CAN'T HELP YOU<span role="img" aria-label="cross">❌</span></li>
                    <li className="list-none">&nbsp;</li>
                    <li>PLEASE KINDLY FOLLOW.</li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* ── Order Confirm Modal ── */}
      <AnimatePresence>
        {showModal && (
          <OrderConfirmModal
            items={state.items}
            total={state.total}
            onConfirm={handleConfirmOrder}
            onCancel={() => setShowModal(false)}
            isSaving={isSaving}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cart;
