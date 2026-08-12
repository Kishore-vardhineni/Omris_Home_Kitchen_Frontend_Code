import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  RefreshCw,
  FileText,
} from 'lucide-react';
import generateInvoicePDF from '../utils/generateInvoicePDF';

// ── Status Configuration ──────────────────────────────────────────────────────
const STATUS_CONFIG = {
  'Awaiting Confirmation': {
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    icon: Clock,
    label: 'Awaiting WhatsApp Confirmation',
  },
  Pending: {
    color: '#f59e0b',
    bg: '#fffbeb',
    border: '#fde68a',
    icon: Clock,
    label: 'Pending',
  },
  Confirmed: {
    color: '#10b981',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    icon: CheckCircle2,
    label: 'Order Confirmed',
  },
  Processing: {
    color: '#8b5cf6',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    icon: Package,
    label: 'Processing',
  },
  Shipped: {
    color: '#0ea5e9',
    bg: '#f0f9ff',
    border: '#bae6fd',
    icon: Truck,
    label: 'Shipped',
  },
  Delivered: {
    color: '#10b981',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    icon: CheckCircle2,
    label: 'Delivered',
  },
  Cancelled: {
    color: '#ef4444',
    bg: '#fef2f2',
    border: '#fecaca',
    icon: XCircle,
    label: 'Cancelled',
  },
};

// ── Single Order Card ──────────────────────────────────────────────────────────
const OrderCard = ({ order, index }) => {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
  const StatusIcon = status.icon;

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = new Date(order.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Order Header */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Order Info */}
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: status.bg, border: `1px solid ${status.border}` }}
            >
              <StatusIcon size={22} style={{ color: status.color }} strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
                Order ID
              </p>
              <p className="font-mono text-sm font-semibold text-neutral-700 mt-0.5">
                #{order._id.slice(-8).toUpperCase()}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                {formattedDate} at {formattedTime}
              </p>
            </div>
          </div>

          {/* Right: Status + Total */}
          <div className="flex items-center gap-4 sm:gap-6 ml-16 sm:ml-0">
            <div className="text-left sm:text-right">
              <p className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Total</p>
              <p className="text-lg font-bold text-neutral-900 mt-0.5">
                ₹{order.totalPrice.toFixed(2)}
              </p>
            </div>

            {/* Status Badge */}
            <span
              className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap"
              style={{ color: status.color, background: status.bg, border: `1px solid ${status.border}` }}
            >
              {status.label}
            </span>

            {/* Download Invoice Button */}
            <button
              onClick={() => generateInvoicePDF(order)}
              className="flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap border border-stone-200"
              title="Download Tax Invoice PDF"
            >
              <FileText size={13} />
              <span className="hidden sm:inline">Invoice</span>
            </button>

            {/* Expand Button */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-9 h-9 rounded-xl border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800 transition-colors flex-shrink-0"
              aria-label={expanded ? 'Collapse order' : 'Expand order'}
            >
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>

        {/* Item Count Preview */}
        {!expanded && (
          <div className="mt-3 ml-16 flex items-center gap-2">
            <div className="flex -space-x-2">
              {order.orderItems.slice(0, 3).map((item, i) =>
                item.image ? (
                  <img
                    key={i}
                    src={item.image}
                    alt={item.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white"
                  />
                ) : (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center text-xs font-bold text-amber-700"
                  >
                    {item.name?.[0] || 'O'}
                  </div>
                )
              )}
            </div>
            <p className="text-sm text-neutral-500">
              {order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''} •{' '}
              <span className="capitalize text-neutral-400 text-xs">{order.paymentMethod}</span>
            </p>
          </div>
        )}

        {/* Awaiting Confirmation Notice Banner */}
        {order.status === 'Awaiting Confirmation' && (
          <div className="mt-3 sm:ml-16 bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-800 flex items-center gap-2">
            <Clock size={16} className="text-amber-600 flex-shrink-0" />
            <span>Waiting for your WhatsApp message to confirm this order. Once received, our team will update status to Confirmed.</span>
          </div>
        )}
      </div>

      {/* Expanded: Items Detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-neutral-100 px-5 sm:px-6 py-4 bg-neutral-50/60">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">
                Order Items
              </p>
              <div className="space-y-3">
                {order.orderItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover border border-neutral-200 flex-shrink-0 bg-white"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-xl flex-shrink-0">
                        🥒
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-neutral-800 text-sm truncate">
                        {item.name?.replace(/\s*\([^)]*\)/, '') || item.name}
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {item.weight && <span>{item.weight}</span>}
                        {item.packing && item.packing !== 'Without Bottle' && (
                          <span> • {item.packing}</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-neutral-800">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-xs text-neutral-400">
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-neutral-200 flex items-center justify-between">
                <span className="text-xs text-neutral-400 capitalize">
                  Payment: <strong className="text-neutral-600">{order.paymentMethod}</strong>
                </span>
                <div className="text-right">
                  <span className="text-xs text-neutral-400">Order Total</span>
                  <p className="text-base font-bold text-neutral-900">
                    ₹{order.totalPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Main Order History Page ────────────────────────────────────────────────────
const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/orders/myorders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || 'Failed to load orders');
      } else {
        setOrders(data.orders);
      }
    } catch (err) {
      setError('Unable to connect to server. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="bg-[#faf9f6] min-h-screen font-sans text-neutral-800 p-4 sm:p-8 lg:p-12">
      <div className="max-w-[860px] mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-3 text-xs sm:text-sm text-neutral-500 flex items-center gap-1.5">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <span className="text-neutral-900 font-medium">Order History</span>
        </nav>

        {/* Back Button */}
        <Link
          to="/cart"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={16} /> Back to Cart
        </Link>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8 mt-3">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif text-neutral-900 tracking-tight">
              My Orders
            </h1>
            {!loading && orders.length > 0 && (
              <p className="text-neutral-400 text-sm mt-1">
                {orders.length} order{orders.length > 1 ? 's' : ''} placed
              </p>
            )}
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 border border-neutral-300 rounded-xl hover:bg-neutral-100 transition-colors"
            title="Refresh orders"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-neutral-200 p-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-neutral-100" />
                  <div className="space-y-2">
                    <div className="h-3 w-28 bg-neutral-100 rounded" />
                    <div className="h-4 w-40 bg-neutral-100 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <XCircle size={40} className="mx-auto text-red-300 mb-3" />
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-4 px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-neutral-200 p-12 sm:p-16 text-center"
          >
            <ShoppingBag className="mx-auto text-neutral-200 mb-5" size={64} strokeWidth={1} />
            <h2 className="text-2xl font-serif text-neutral-800 mb-2">No orders yet</h2>
            <p className="text-neutral-400 text-sm sm:text-base mb-8">
              Once you place an order through WhatsApp, it will appear here.
            </p>
            <Link
              to="/products"
              className="inline-block px-7 py-3.5 bg-neutral-900 text-white rounded-xl font-semibold text-sm hover:bg-neutral-800 transition-colors shadow-sm"
            >
              Browse Products
            </Link>
          </motion.div>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <OrderCard key={order._id} order={order} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
