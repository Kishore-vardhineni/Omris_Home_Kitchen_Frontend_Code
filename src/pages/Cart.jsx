import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Star, Minus, Plus, MapPin, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const CartItem = ({ item, dispatch }) => {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 xl:gap-16 mb-16 pb-16 border-b border-gray-200 last:border-b-0">
      
      {/* LEFT SECTION - IMAGE */}
      <div className="w-full lg:w-1/2 flex justify-center">
        <div className="w-full max-w-[600px] aspect-[4/5] bg-white rounded shadow-sm overflow-hidden flex items-center justify-center p-4">
          <img 
            src={item.image || "https://images.unsplash.com/photo-1589301773950-a92c4c1538df?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"} 
            alt={item.name} 
            className="w-full h-full object-cover rounded"
          />
        </div>
      </div>

      {/* RIGHT SECTION - DETAILS */}
      <div className="w-full lg:w-1/2 flex flex-col gap-5 xl:gap-6">
        
        {/* Title & Ratings */}
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-[40px] font-extrabold text-[#3a2a22] leading-tight mb-2 tracking-tight">
            {item.name}
          </h1>
          <div className="flex items-center gap-2">
            <div className="flex text-[#ffc107]">
              <Star fill="currentColor" stroke="none" size={18} />
              <Star fill="currentColor" stroke="none" size={18} />
              <Star fill="currentColor" stroke="none" size={18} />
              <Star fill="currentColor" stroke="none" size={18} />
              <Star fill="currentColor" stroke="none" size={18} />
            </div>
            <span className="text-[#333] text-sm font-medium ml-1">Excellent Reviews</span>
          </div>
        </div>



        {/* Price Section */}
        <div className="mt-1">
          <p className="text-[32px] lg:text-[36px] font-extrabold leading-none text-[#3a2a22] mb-1">
            Rs. {item.price}
          </p>
          <p className="text-sm text-gray-600">
            Tax included. <span className="text-[#f88812] cursor-pointer hover:underline">Shipping</span> calculated at checkout
          </p>
        </div>

        {/* Product Quantity Selector */}
        <div className="mt-2">
          <p className="font-bold text-sm text-[#3a2a22] mb-2">Quantity</p>
          <div className="flex items-center border border-gray-300 rounded w-fit overflow-hidden bg-white h-10">
            <button 
              onClick={() => {
                if(item.quantity > 1) {
                  dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity - 1 } });
                }
              }}
              className="px-4 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
            <button 
              onClick={() => {
                dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity + 1 } });
              }}
              className="px-4 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-3 max-w-md">
          <button 
            onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item })}
            className="w-full h-12 bg-white text-red-500 border border-red-500 rounded font-bold text-sm tracking-wide hover:bg-red-50 transition-colors shadow-sm flex justify-center items-center gap-2"
          >
            <Trash2 size={18} />
            REMOVE FROM CART
          </button>
        </div>



        {/* Description Section */}
        <div className="mt-4 pt-4 border-t border-gray-200 max-w-xl">
          <div 
            className="flex justify-between items-center mb-4 cursor-pointer"
            onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
          >
            <h3 className="font-extrabold text-xl text-[#3a2a22]">Description</h3>
            {isDescriptionOpen ? <Minus size={20} className="text-gray-500" /> : <Plus size={20} className="text-gray-500" />}
          </div>
          
          {isDescriptionOpen && (
            <div className="text-[14px] text-gray-700 space-y-4 leading-relaxed font-medium">
              <p>
                {item.description || `Enjoy the authentic taste of ${item.name}. Carefully prepared using our traditional recipes to bring you the best flavor and experience. Perfect for everyday meals and special occasions.`}
              </p>
              <div>
                <h4 className="font-bold text-[#3a2a22] text-[15px] mb-2">Highlights</h4>
                <ul className="space-y-1.5 ml-1">
                  <li className="flex items-start gap-2">
                    <span className="text-[#333] text-[10px] mt-1.5">●</span>
                    <span>100% Authentic Taste</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#333] text-[10px] mt-1.5">●</span>
                    <span>No artificial colors added</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#333] text-[10px] mt-1.5">●</span>
                    <span>Homestyle preparation</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
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
      // ⚠️ Replace with your actual Razorpay Key ID from https://dashboard.razorpay.com
      key: 'rzp_test_YourKeyHere',
      amount: state.total * 100, // Razorpay expects amount in paise (1 Rs = 100 paise)
      currency: 'INR',
      name: 'Omris Home Kitchen',
      description: `Order of ${state.items.length} item(s)`,
      image: 'https://i.ibb.co/placeholder/logo.png', // Replace with your logo URL
      handler: function (response) {
        setIsProcessing(false);
        // Clear cart on success
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
      notes: {
        address: 'Omris Home Kitchen, Hyderabad, Telangana',
      },
      theme: {
        color: '#f88812',
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
    <div className="bg-[#fcfbf9] min-h-screen font-sans text-[#333] p-4 md:p-8 lg:p-12">
      <div className="max-w-[1280px] mx-auto">
        
        {/* Breadcrumbs */}
        <div className="text-[13px] font-medium mb-6">
          <Link to="/" className="text-[#f88812] cursor-pointer hover:underline">Home</Link>
          <span className="text-gray-500 mx-2">/</span>
          <span className="text-gray-700">Shopping Cart</span>
        </div>

        {state.items.length === 0 ? (
          <div className="bg-white rounded p-12 text-center shadow-sm border border-gray-200 mt-12 max-w-2xl mx-auto">
            <ShoppingBag className="mx-auto text-gray-300 mb-4" size={64} />
            <h2 className="text-2xl font-extrabold text-[#3a2a22] mb-2">Your cart is empty</h2>
            <p className="text-gray-500 font-medium mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link to="/">
              <button className="h-12 px-8 bg-[#f88812] text-white rounded font-bold text-sm tracking-wide hover:bg-[#e67a0a] transition-colors shadow-sm inline-block">
                START SHOPPING
              </button>
            </Link>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#3a2a22] tracking-tight">Your Cart</h1>
              <div className="text-right">
                <p className="text-sm text-gray-500 font-medium">Subtotal</p>
                <p className="text-2xl font-extrabold text-[#3a2a22]">Rs. {state.total}</p>
              </div>
            </div>

            <div className="flex flex-col">
              {state.items.map(item => (
                <CartItem key={item.id} item={item} dispatch={dispatch} />
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200 flex justify-end">
              <div className="w-full max-w-md">
                <div className="flex justify-between items-center mb-4 text-gray-700 font-medium">
                  <span>Cart Total ({state.items.length} items)</span>
                  <span className="font-extrabold text-xl">Rs. {state.total}</span>
                </div>
                <button 
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className={`w-full h-14 text-white rounded font-bold text-base tracking-wide transition-all shadow-md flex items-center justify-center gap-2 ${
                    isProcessing 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-[#f88812] hover:bg-[#e67a0a] cursor-pointer'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'PROCEED TO CHECKOUT'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
