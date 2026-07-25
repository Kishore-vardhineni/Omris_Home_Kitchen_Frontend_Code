import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

const CartItem = ({ item, dispatch }) => {
  // Extract clean title and weight subtitle matching the target screenshot design
  const cleanName = item.name ? item.name.replace(/\s*\([^)]*\)/, '') : '';
  const rawVariant = item.name && item.name.match(/\(([^)]+)\)/)?.[1];
  const displayWeight = item.weight || rawVariant || '250 gms';
  const displayPacking = item.packing && item.packing !== 'Without Bottle' ? ` • ${item.packing}` : '';

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 py-6 border-b border-neutral-100 last:border-b-0">
      {/* Left section: Product Thumbnail Image & Details */}
      <div className="flex items-center gap-5 sm:gap-6">
        <img
          src={item.image || "https://images.unsplash.com/photo-1589301773950-a92c4c1538df?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"}
          alt={cleanName || item.name}
          className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-md bg-neutral-50 flex-shrink-0"
        />
        <div>
          <h3 className="font-bold text-neutral-900 text-base sm:text-lg leading-snug">
            {cleanName || item.name}
          </h3>
          <p className="text-neutral-400 text-sm mt-1 font-normal">
            {displayWeight}{displayPacking}
          </p>
          <button
            onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item })}
            className="text-neutral-500 text-xs sm:text-sm hover:text-black transition-colors mt-3 font-normal underline block cursor-pointer"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Right section: Segmented Quantity Box & Price */}
      <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-10 w-full sm:w-auto">
        {/* Quantity Controls: [ - | 1 | + ] */}
        <div className="flex items-center bg-[#f5f5f5] rounded border border-neutral-200 overflow-hidden text-neutral-600">
          <button
            onClick={() => {
              if (item.quantity > 1) {
                dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity - 1 } });
              }
            }}
            className="w-8 h-8 flex items-center justify-center hover:bg-neutral-200 text-neutral-500 transition-colors text-sm font-medium"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="w-9 text-center text-sm font-medium text-neutral-800 select-none">
            {item.quantity}
          </span>
          <button
            onClick={() => {
              dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity + 1 } });
            }}
            className="w-8 h-8 flex items-center justify-center hover:bg-neutral-200 text-neutral-500 transition-colors text-sm font-medium"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* Formatted Price (e.g. Rs. 140.00) */}
        <div className="text-right font-medium text-neutral-700 text-base sm:text-lg min-w-[100px]">
          Rs. {(item.price * item.quantity).toFixed(2)}
        </div>
      </div>
    </div>
  );
};

const Cart = () => {
  const { state, dispatch } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    if (!window.Razorpay) {
      alert('Payment gateway is not loaded. Please refresh the page and try again.');
      return;
    }

    setIsProcessing(true);

    const options = {
      key: 'rzp_test_YourKeyHere',
      amount: state.total * 100,
      currency: 'INR',
      name: 'Omris Home Kitchen',
      description: `Order of ${state.items.length} item(s)`,
      image: 'https://i.ibb.co/placeholder/logo.png',
      handler: function (response) {
        setIsProcessing(false);
        dispatch({ type: 'CLEAR_CART' });
        alert(
          `✅ Payment Successful!\n\nPayment ID: ${response.razorpay_payment_id}\n\nThank you for ordering from Omris Home Kitchen! Your pickles are on their way. 🥒`
        );
      },
      prefill: {
        name: '',
        email: '',
        contact: '',
      },
      theme: {
        color: '#111111',
      },
      modal: {
        ondismiss: function () {
          setIsProcessing(false);
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setIsProcessing(false);
        alert(
          `❌ Payment Failed!\n\nReason: ${response.error.description}\n\nPlease try again or contact us on WhatsApp: +91 7670851967`
        );
      });
      rzp.open();
    } catch (err) {
      setIsProcessing(false);
      console.error('Razorpay error:', err);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="bg-[#faf9f6] min-h-screen font-sans text-neutral-800 p-4 sm:p-8 lg:p-12">
      <div className="max-w-[1000px] mx-auto">
        <h1 className="text-3xl sm:text-4xl font-serif text-neutral-900 mb-8 tracking-tight">
          Shopping Cart
        </h1>

        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-neutral-200/80">
          {state.items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="mx-auto text-neutral-300 mb-4" size={56} strokeWidth={1.5} />
              <h2 className="text-2xl font-serif text-neutral-800 mb-2">Your cart is empty</h2>
              <p className="text-neutral-500 mb-6 text-sm sm:text-base">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Link
                to="/products"
                className="inline-block px-6 py-3 bg-black text-white rounded-lg font-medium text-sm hover:bg-neutral-800 transition-colors shadow-sm"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div>
              <div className="divide-y divide-neutral-100">
                {state.items.map((item) => (
                  <CartItem key={item.id} item={item} dispatch={dispatch} />
                ))}
              </div>

              {/* Cart Footer Summary & Checkout Button */}
              <div className="mt-8 pt-6 border-t border-neutral-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <p className="text-neutral-400 text-xs sm:text-sm">
                  Taxes and shipping calculated at checkout
                </p>
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-neutral-500 block uppercase tracking-wider font-semibold">
                      Subtotal
                    </span>
                    <span className="text-xl font-bold text-neutral-900">
                      Rs. {state.total.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="px-6 py-3.5 bg-black text-white rounded-lg font-medium text-sm hover:bg-neutral-800 transition-colors shadow-sm disabled:bg-neutral-400 cursor-pointer"
                  >
                    {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
