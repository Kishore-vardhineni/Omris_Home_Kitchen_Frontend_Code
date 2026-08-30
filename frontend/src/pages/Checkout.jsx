import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, Truck, CheckCircle2, QrCode, Edit } from 'lucide-react';

const Checkout = () => {
  const { state, dispatch } = useCart();
  const navigate = useNavigate();

  // Multi-step state
  const [step, setStep] = useState('address'); // 'address' or 'payment'

  // Address state
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null); // track which address is being edited

  // Payment state
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [upiSettings, setUpiSettings] = useState({ upiQrCode: '', upiId: '', upiName: 'Omris Home Kitchen' });

  // Fetch UPI settings from admin panel (only when on payment step)
  useEffect(() => {
    if (step !== 'payment') return;

    const fetchUpiSettings = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const res = await fetch(`${API_BASE_URL}/settings`);
        const data = await res.json();
        if (data.success && data.settings) {
          setUpiSettings(data.settings);
        }
      } catch (e) {
        console.error('Failed to fetch UPI settings:', e);
      }
    };
    fetchUpiSettings();
  }, [step]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    address: '',
    remarks: ''
  });

  useEffect(() => {
    // 1. Initial quick load from local storage
    const loadFromLocal = () => {
      const userInfoStr = localStorage.getItem('userInfo');
      if (userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr);
          if (userInfo.addresses && userInfo.addresses.length > 0) {
            const validAddresses = userInfo.addresses.filter(addr => {
              const name = addr.fullName || addr.name;
              const street = addr.street || addr.address;
              return name && name.trim() !== '' && street && street.trim() !== '';
            });

            if (validAddresses.length > 0) {
              setSavedAddresses(validAddresses);
              setShowAddressForm(false);
            } else {
              setShowAddressForm(true);
            }
            setFormData(prev => ({ ...prev, name: userInfo.name || '' }));
          } else {
            setShowAddressForm(true);
            setFormData(prev => ({ ...prev, name: userInfo.name || '' }));
          }
        } catch (e) {
          setShowAddressForm(true);
        }
      } else {
        setShowAddressForm(true);
      }
    };

    loadFromLocal();

    // 2. Fetch fresh profile data in background to ensure addresses are synced
    const fetchFreshProfile = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.user) {
          localStorage.setItem('userInfo', JSON.stringify(data.user));
          if (data.user.addresses && data.user.addresses.length > 0) {
            const validAddresses = data.user.addresses.filter(addr => {
              const name = addr.fullName || addr.name;
              const street = addr.street || addr.address;
              return name && name.trim() !== '' && street && street.trim() !== '';
            });
            if (validAddresses.length > 0) {
              setSavedAddresses(validAddresses);
              setShowAddressForm(false);
            }
          }
        }
      } catch (e) {
        console.error('Failed to sync profile:', e);
      }
    };

    fetchFreshProfile();
  }, []);

  // Calculate totals
  const originalTotal = state.items.reduce((acc, item) => {
    const origPrice = item.originalPrice || Math.round(item.price * 1.43);
    return acc + (origPrice * item.quantity);
  }, 0);
  const savings = originalTotal > state.total ? originalTotal - state.total : 0;
  const deliveryCharge = state.total >= 2000 ? 0 : 100;
  const orderTotal = state.total + deliveryCharge;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClearState = () => {
    setFormData(prev => ({ ...prev, state: '' }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to save your address and checkout.');
      navigate('/login');
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const res = await fetch(`${API_BASE_URL}/auth/profile/address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, addressId: editingAddressId }),
      });

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to save address');

        // Update user info in local storage based on the response which returns { addresses }
        const userInfoStr = localStorage.getItem('userInfo');
        if (userInfoStr && data.addresses) {
          const user = JSON.parse(userInfoStr);
          user.addresses = data.addresses;
          localStorage.setItem('userInfo', JSON.stringify(user));
          
          const validAddresses = data.addresses.filter(addr => {
            const name = addr.fullName || addr.name;
            const street = addr.street || addr.address;
            return name && name.trim() !== '' && street && street.trim() !== '';
          });
          setSavedAddresses(validAddresses);
          setSelectedAddressIndex(Math.max(0, validAddresses.length - 1));
        } else if (data.user) {
          // Fallback if the backend ever returns the full user object
          localStorage.setItem('userInfo', JSON.stringify(data.user));
          const validAddresses = (data.user.addresses || []).filter(addr => {
            const name = addr.fullName || addr.name;
            const street = addr.street || addr.address;
            return name && name.trim() !== '' && street && street.trim() !== '';
          });
          setSavedAddresses(validAddresses);
          setSelectedAddressIndex(Math.max(0, validAddresses.length - 1));
        }
      } else {
        const text = await res.text();
        console.error("Non-JSON API Response:", text);
        if (!res.ok) throw new Error(`Server returned an error (${res.status}).`);
      }

      setShowAddressForm(false);
      setEditingAddressId(null);
      setStep('payment');
    } catch (error) {
      console.error('Error saving address:', error);
      alert(error.message);
    }
  };

  const handleSelectAddress = (index) => {
    setSelectedAddressIndex(index);
  };

  const handleProceedToPayment = () => {
    if (savedAddresses.length > 0 && selectedAddressIndex !== null) {
      setStep('payment');
    }
  };

  const handleConfirmPayment = async () => {
    if (!termsAccepted) {
      alert("Please accept the payment terms and conditions.");
      return;
    }

    setIsProcessing(true);

    const token = localStorage.getItem('token');
    const selectedAddress = savedAddresses[selectedAddressIndex] || formData;

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
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          orderItems,
          totalPrice: orderTotal,
          paymentMethod: 'UPI',
          status: 'Payment Pending',
          shippingAddress: selectedAddress,
        }),
      });

      const data = await res.json();

      setIsProcessing(false);

      if (res.ok) {
        dispatch({ type: 'CLEAR_CART' });
        navigate('/order/success', { state: { order: data.order, shippingAddress: selectedAddress } });
      } else {
        throw new Error(data.message || 'Failed to place order');
      }
    } catch (err) {
      console.error('Order save error:', err);
      alert('Error placing order: ' + err.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#faf9f6] min-h-screen font-sans text-neutral-800 pb-12 pt-6 px-4 sm:px-8 lg:px-12">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-semibold text-[#2f3542]">Checkout</h1>
          <button
            onClick={() => step === 'payment' ? setStep('address') : navigate('/cart')}
            className="flex items-center gap-1.5 text-[#5c4bdf] border border-[#e0ddf7] hover:bg-[#f3f0ff] bg-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
          >
            <ChevronLeft size={16} /> {step === 'payment' ? 'Back to Addresses' : 'Back to Cart'}
          </button>
        </div>

        {/* Top Stepper */}
        <div className="mb-8 flex flex-wrap items-center gap-3 sm:gap-4 text-sm font-medium text-neutral-400 bg-white p-4 rounded-lg shadow-sm border border-neutral-100 w-full">
          <Link to="/cart" className="flex items-center gap-2 text-neutral-800 hover:text-[#5c4bdf] transition-colors">
            <span className="w-5 h-5 rounded-full bg-neutral-800 text-white flex items-center justify-center text-xs">✓</span>
            Cart
          </Link>
          <span>→</span>
          <div className={`flex items-center gap-2 ${step === 'address' ? 'text-[#5c4bdf]' : 'text-neutral-800 hover:text-[#5c4bdf] cursor-pointer'}`} onClick={() => setStep('address')}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step === 'address' ? 'bg-[#5c4bdf] text-white' : 'bg-neutral-800 text-white'}`}>
              {step === 'payment' ? '✓' : '2'}
            </span>
            Delivery Address
          </div>
          <span>→</span>
          <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-[#5c4bdf]' : 'text-neutral-300'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step === 'payment' ? 'bg-[#5c4bdf] text-white' : 'bg-neutral-200 text-white'}`}>3</span>
            Payment
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Left Column */}
          <div className="flex-1 w-full flex flex-col gap-6">

            {step === 'address' && (
              <div className="bg-white rounded-lg border border-neutral-200 p-6 sm:p-8">
                <h2 className="text-xl font-medium text-neutral-800 mb-6">Delivery Address</h2>

                {savedAddresses.length > 0 && !showAddressForm && (
                  <div className="space-y-4 mb-6">
                    {savedAddresses.map((addr, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelectAddress(index)}
                        className={`p-5 border rounded-lg cursor-pointer transition-colors ${selectedAddressIndex === index ? 'border-[#5c4bdf] bg-white' : 'border-neutral-200 hover:border-[#5c4bdf] bg-white'}`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-start gap-4">
                            <div className={`mt-1 flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center ${selectedAddressIndex === index ? 'border-[#5c4bdf]' : 'border-neutral-300'}`}>
                              {selectedAddressIndex === index && <div className="w-2.5 h-2.5 bg-[#5c4bdf] rounded-full"></div>}
                            </div>
                            <div>
                              <h3 className="text-[15px] font-medium text-[#2f3542]">{addr.fullName || addr.name}</h3>
                              <p className="text-[13px] text-[#64748b] mt-1">{addr.street || addr.address}, {addr.state}</p>
                              {(addr.landmark || addr.remarks) && <p className="text-[12px] text-[#94a3b8] mt-0.5">Remarks: {addr.landmark || addr.remarks}</p>}
                            </div>
                          </div>

                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setEditingAddressId(addr._id || null);
                              setFormData({
                                name: addr.fullName || addr.name || '',
                                state: addr.state || '',
                                address: addr.street || addr.address || '',
                                remarks: addr.landmark || addr.remarks || ''
                              });
                              setShowAddressForm(true); 
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#475569] rounded-md text-sm transition-colors border border-[#e2e8f0]"
                          >
                            <Edit size={14} /> Edit
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="mt-4">
                      <button
                        onClick={() => {
                          setEditingAddressId(null);
                          setFormData({ name: '', state: '', address: '', remarks: '' });
                          setShowAddressForm(true);
                        }}
                        className="text-[#5c4bdf] text-sm font-medium hover:underline"
                      >
                        + Add a new address
                      </button>
                    </div>
                  </div>
                )}

                {showAddressForm && (
                  <form id="address-form" onSubmit={handleSaveAddress} className="space-y-6">
                    {savedAddresses.length > 0 && (
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-neutral-800">Add New Address</h3>
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="text-neutral-500 hover:text-neutral-800 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Contact Name */}
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-neutral-600 mb-1.5">
                          Contact name <span className="text-neutral-400">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2.5 border border-neutral-200 rounded-md focus:outline-none focus:border-[#5c4bdf] text-sm text-neutral-800 placeholder-neutral-300"
                        />
                      </div>

                      {/* State */}
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-neutral-600 mb-1.5">
                          State <span className="text-neutral-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2.5 border border-neutral-200 rounded-md focus:outline-none focus:border-[#5c4bdf] text-sm text-neutral-800 placeholder-neutral-300 pr-10"
                          />
                          {formData.state && (
                            <button
                              type="button"
                              onClick={handleClearState}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Address details */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-600 mb-1.5">
                        Address details <span className="text-neutral-400">*</span>
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        rows="3"
                        className="w-full px-4 py-3 border border-neutral-200 rounded-md focus:outline-none focus:border-[#5c4bdf] text-sm text-neutral-800 placeholder-neutral-300 resize-none"
                      />
                    </div>

                    {/* Remarks */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-600 mb-1.5">
                        Remarks <span className="text-neutral-400">(optional)</span>
                      </label>
                      <input
                        type="text"
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleInputChange}
                        placeholder="Remarks"
                        className="w-full px-4 py-2.5 border border-neutral-200 rounded-md focus:outline-none focus:border-[#5c4bdf] text-sm text-neutral-800 placeholder-neutral-300"
                      />
                    </div>

                  </form>
                )}
              </div>
            )}

            {step === 'payment' && (
              <div className="bg-white rounded-lg p-0 sm:p-2 mb-8">
                <h2 className="text-xl font-medium text-neutral-800 mb-6 px-1">Select payment method</h2>

                <div className="border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm">
                  <div className="flex flex-col md:flex-row">
                    {/* Left side: Method & Terms */}
                    <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#e2e8f0]">
                      <div>
                        <div className="flex items-start gap-4 mb-8">
                          <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 border-[#5c4bdf] flex items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-[#5c4bdf] rounded-full"></div>
                          </div>
                          <div>
                            <h3 className="text-[17px] font-medium text-[#1e293b]">Pay manually via UPI</h3>
                            <p className="text-[13px] text-[#64748b] mt-1 leading-relaxed">Secure online payment using UPI apps<br/>(GPay, PayTM, PhonePe)</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 mb-3">
                          <input
                            type="checkbox"
                            id="terms"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            className="mt-1 w-4 h-4 text-[#5c4bdf] border-neutral-300 rounded focus:ring-[#5c4bdf] flex-shrink-0 cursor-pointer"
                          />
                          <label htmlFor="terms" className="text-sm font-semibold text-[#475569] cursor-pointer">
                            I understand and agree to these payment terms.
                          </label>
                        </div>
                        
                        <ul className="list-disc ml-9 text-[12px] text-[#94a3b8] space-y-2 mb-8 pr-4">
                          <li>The QR code is provided and managed by the store owner.</li>
                          <li>Omris Home Kitchen does not verify, process, or handle the payment.</li>
                          <li>Omris Home Kitchen is not responsible for any payment issues, disputes, or failed transactions.</li>
                          <li>For any concerns, please contact the store owner/merchant directly.</li>
                        </ul>
                      </div>

                      <button
                        onClick={handleConfirmPayment}
                        disabled={!termsAccepted || isProcessing}
                        className={`w-full max-w-[240px] py-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${!termsAccepted || isProcessing ? 'bg-[#cbd5e1] text-white cursor-not-allowed' : 'bg-[#7b68ee] hover:bg-[#6b58df] text-white'}`}
                      >
                        {isProcessing ? 'Processing...' : 'Confirm Payment'}
                      </button>
                    </div>

                    {/* Right side: QR Code */}
                    <div className="w-full md:w-1/2 p-6 sm:p-10 bg-[#f8f7ff] flex flex-col items-center justify-center">
                      <div className="w-full max-w-[260px] aspect-square bg-white rounded-xl p-2 shadow-[0_2px_12px_rgba(0,0,0,0.06)] mb-6 flex items-center justify-center">
                        {upiSettings.upiQrCode ? (
                          <img
                            src={upiSettings.upiQrCode}
                            alt="UPI QR Code"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-neutral-400 p-4">
                            <QrCode size={48} />
                            <p className="text-xs text-center">QR Code not configured.</p>
                          </div>
                        )}
                      </div>
                      
                      {upiSettings.upiId && (
                        <div className="flex items-center gap-2 text-[#5c4bdf] font-medium text-sm bg-white px-4 py-2 rounded-full shadow-sm border border-[#ede9fe]">
                          <CheckCircle2 size={16} className="flex-shrink-0" />
                          <span>{upiSettings.upiId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary (Identical to Cart page) */}
          <div className="w-full lg:w-[360px] flex-shrink-0 flex flex-col gap-4">

            <div className="bg-white rounded-lg p-5 sm:p-6 border border-neutral-200 shadow-sm">
              <h2 className="text-lg font-medium text-neutral-800 mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm text-neutral-500 mb-5">
                <div className="flex justify-between">
                  <span>Items ({state.items.length})</span>
                  <span className="text-neutral-800 font-medium">₹{state.total.toFixed(0)}</span>
                </div>
              </div>

              {/* Items List (Read-only summary) */}
              <div className="mb-5 space-y-4 max-h-[320px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                {state.items.map((item, index) => {
                  const cleanName = item.name ? item.name.replace(/\s*\([^)]*\)/, '') : '';
                  const rawVariant = item.name && item.name.match(/\(([^)]+)\)/)?.[1];
                  const displayWeight = item.weight || rawVariant || '250 gms';
                  const itemTotal = (item.price * item.quantity).toFixed(0);
                  const originalTotal = item.originalPrice ? (item.originalPrice * item.quantity).toFixed(0) : null;
                  const discountPercent = originalTotal && originalTotal > itemTotal
                    ? Math.round(((originalTotal - itemTotal) / originalTotal) * 100)
                    : 0;

                  return (
                    <div key={item.id || index} className="flex gap-3">
                      <div className="p-1 border border-neutral-200 rounded bg-white flex-shrink-0">
                        <img src={item.image || "https://images.unsplash.com/photo-1589301773950-a92c4c1538df?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"} alt={cleanName} className="w-16 h-16 object-cover rounded bg-neutral-50" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-[#0f172a] text-sm leading-snug truncate">{cleanName} {displayWeight}</h4>
                        <p className="text-[#64748b] text-[11px] mt-0.5 uppercase tracking-wide">NOS</p>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-bold text-[#0f172a] text-sm">₹{itemTotal}</span>
                            {originalTotal && (
                              <span className="text-[11px] text-[#64748b] line-through">₹{originalTotal}</span>
                            )}
                            {discountPercent > 0 && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#dcfce7] text-[#166534]">
                                {discountPercent}% OFF
                              </span>
                            )}
                          </div>
                          <span className="text-[#64748b] text-xs font-medium bg-neutral-100 px-2 py-0.5 rounded">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 text-sm text-neutral-500">
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

              {step === 'address' && (
                showAddressForm ? (
                  <button
                    type="submit"
                    form="address-form"
                    className="w-full py-3 bg-[#5c4bdf] hover:bg-[#4f3cc9] text-white rounded font-medium transition-colors mb-4"
                  >
                    Save and Continue
                  </button>
                ) : (
                  <button
                    onClick={handleProceedToPayment}
                    className="w-full py-3 bg-[#5c4bdf] hover:bg-[#4f3cc9] text-white rounded font-medium transition-colors mb-4"
                  >
                    Continue
                  </button>
                )
              )}

              {savings > 0 && (
                <div className="flex items-center justify-center gap-1.5 text-[#22c55e] text-sm font-medium mt-4">
                  <Star size={16} className="fill-current" /> Your Savings: ₹{savings.toFixed(0)}
                </div>
              )}
            </div>

            <div className="bg-[#f1f5f9] rounded-lg p-4 flex items-center gap-3 text-sm text-neutral-700 border border-neutral-100">
              <Truck size={20} className="text-neutral-400 flex-shrink-0" />
              <span>Free delivery with cart value above <strong>₹2,000</strong></span>
            </div>

            <div className="mt-2">
              <h3 className="text-[13px] font-medium text-slate-500 mb-3">Store Terms and Conditions</h3>
              <div className="bg-[#f8fafc] rounded-lg p-4 text-[11px] text-slate-500 space-y-3 leading-relaxed">
                <p>• NO RETURN, ONLY EXCHANGE, IF ANY DAMAGE.</p>
                <p>• WHEN YOU OPEN THE PACKAGE YOU CAN SHOOT A VIDEO AND SEND TO WHATSAPP.</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
