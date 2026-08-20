import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;
  const shippingAddress = location.state?.shippingAddress;

  const orderNo = order?._id ? `#${order._id.substring(order._id.length - 8).toUpperCase()}` : '#UNKNOWN';
  const recipient = shippingAddress?.fullName || shippingAddress?.name || 'Customer';
  const mobile = shippingAddress?.phone || '';
  const addressStr = shippingAddress
    ? `${shippingAddress.street || shippingAddress.address || ''}, ${shippingAddress.state || ''}`.trim().replace(/^,|,$/g, '')
    : '';
  const total = order?.totalPrice || 0;

  // Auto-send WhatsApp message on page load
  useEffect(() => {
    if (!order) return;

    const adminWhatsApp = '917670851967';

    let msg = `Hello Omri's Home Kitchen! 🛒\n\n`;
    msg += `*New Order Placed!*\n\n`;
    msg += `*Order No:* ${orderNo}\n`;
    msg += `*Order Total:* ₹${total}\n`;
    msg += `*Payment Method:* ${order.paymentMethod || 'UPI'}\n\n`;
    msg += `*Delivery Details:*\n`;
    msg += `👤 Name: ${recipient}\n`;
    msg += `📞 Phone: ${mobile}\n`;
    msg += `📍 Address: ${addressStr}\n\n`;
    msg += `*Order Items:*\n`;
    order.orderItems?.forEach((item, i) => {
      msg += `${i + 1}. ${item.name}${item.weight ? ` (${item.weight})` : ''} × ${item.quantity} = ₹${(item.price * item.quantity).toFixed(0)}\n`;
    });
    msg += `\nPlease confirm the order. Thank you! 🙏`;

    const whatsappUrl = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(msg)}`;

    // Open WhatsApp automatically after a short delay so the page renders first
    const timer = setTimeout(() => {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }, 800);

    return () => clearTimeout(timer);
  }, [order]);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No order details found.</p>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-[#5c4bdf] text-white rounded">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-[#f8f9fc] py-16 px-4 font-sans">
      <div className="max-w-[600px] mx-auto flex flex-col items-center">

        {/* Success Icon */}
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-blue-100">
          <div className="w-16 h-16 bg-white rounded-full border border-blue-200 flex items-center justify-center">
            <CheckCircle size={32} className="text-[#3b82f6]" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-semibold text-[#1e293b] mb-2">Order Successfully Placed!</h1>
        <p className="text-sm text-gray-500 mb-8">Your order details have been sent to WhatsApp automatically.</p>

        {/* Order Card */}
        <div className="w-full bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden mb-8">

          {/* Card Header */}
          <div className="bg-[#f3f0ff] px-6 py-4 flex items-center justify-between">
            <span className="font-semibold text-gray-800">Order No.</span>
            <span className="font-bold text-gray-900">{orderNo}</span>
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-4">

            <div className="flex justify-between items-start gap-4">
              <span className="text-gray-500 text-sm">Recipient</span>
              <span className="text-gray-800 text-sm font-medium text-right">{recipient}</span>
            </div>

            <div className="flex justify-between items-start gap-4">
              <span className="text-gray-500 text-sm">Mobile number</span>
              <span className="text-gray-800 text-sm font-medium text-right">{mobile}</span>
            </div>

            <div className="flex justify-between items-start gap-4">
              <span className="text-gray-500 text-sm">Address</span>
              <span className="text-gray-800 text-sm font-medium text-right max-w-[250px]">{addressStr}</span>
            </div>

            <div className="flex justify-between items-start gap-4">
              <span className="text-gray-500 text-sm">Payment</span>
              <span className="text-gray-800 text-sm font-medium text-right">{order.paymentMethod}</span>
            </div>

            <hr className="border-gray-100 border-dashed my-2" />

            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-600 font-medium">Order Total</span>
              <span className="text-xl font-bold text-gray-900">₹{total}</span>
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-4">
          <Link
            to="/order-history"
            className="flex-1 py-3 text-center text-[#5c4bdf] bg-white border-2 border-[#5c4bdf] hover:bg-[#f3f0ff] rounded-lg font-medium transition-colors"
          >
            View Order
          </Link>
          <Link
            to="/"
            className="flex-1 py-3 text-center text-white bg-[#5c4bdf] hover:bg-[#4a3ab8] rounded-lg font-medium transition-colors"
          >
            &lt; Back to shopping
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccess;
