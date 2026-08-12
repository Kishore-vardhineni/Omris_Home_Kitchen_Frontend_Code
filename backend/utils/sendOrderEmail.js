import sendEmail from './sendEmail.js';

const STATUS_DESCRIPTIONS = {
  'Awaiting Confirmation': {
    badge: 'Awaiting WhatsApp Confirmation ⏳',
    color: '#d97706',
    bg: '#fffbeb',
    desc: 'Your order has been received! Please ensure you send the WhatsApp message so our team can confirm your order details.',
  },
  Pending: {
    badge: 'Pending Confirmation ⏳',
    color: '#d97706',
    bg: '#fffbeb',
    desc: 'Your order is pending confirmation with our team.',
  },
  Confirmed: {
    badge: 'Order Confirmed ✅',
    color: '#059669',
    bg: '#d1fae5',
    desc: 'Great news! Your order has been officially confirmed by Omris Home Kitchen and is queued for preparation.',
  },
  Processing: {
    badge: 'Processing 👩‍🍳',
    color: '#7c3aed',
    bg: '#ede9fe',
    desc: 'Your order is currently being prepared with fresh ingredients and authentic home kitchen spices.',
  },
  Shipped: {
    badge: 'Shipped 🚚',
    color: '#0284c7',
    bg: '#e0f2fe',
    desc: 'Your order has been packaged and shipped! It is on its way to your delivery address.',
  },
  Delivered: {
    badge: 'Delivered 🎉',
    color: '#16a34a',
    bg: '#dcfce7',
    desc: 'Your order has been delivered successfully! Thank you for ordering from Omris Home Kitchen.',
  },
  Cancelled: {
    badge: 'Order Cancelled ❌',
    color: '#dc2626',
    bg: '#fee2e2',
    desc: 'Your order status has been updated to Cancelled. If you have any questions, please contact our support.',
  },
};

export const sendOrderNotificationEmail = async (order, targetEmail, targetName) => {
  if (!targetEmail) {
    console.warn('⚠️ No recipient email provided for order notification');
    return;
  }

  const orderId = order._id ? order._id.toString().slice(-8).toUpperCase() : 'N/A';
  const statusInfo = STATUS_DESCRIPTIONS[order.status] || STATUS_DESCRIPTIONS['Confirmed'];
  const customerName = targetName || 'Valued Customer';

  const itemsHtml = (order.orderItems || [])
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eeeeee;">
        <strong>${item.name}</strong>
        ${item.weight ? `<br><small style="color: #666666;">${item.weight} ${item.packing || ''}</small>` : ''}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`
    )
    .join('');

  const htmlMessage = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background: #ffffff;">
      
      <!-- Header -->
      <div style="background: #1c1917; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; color: #f59e0b; font-family: Georgia, serif;">Omris Home Kitchen</h1>
        <p style="margin: 4px 0 0; font-size: 13px; color: #d6d3d1;">Authentic Homemade Pickles & Podis</p>
      </div>

      <!-- Content -->
      <div style="padding: 24px;">
        <h2 style="color: #1c1917; font-size: 18px; margin-top: 0;">Hello ${customerName},</h2>
        <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
          The status of your order <strong>#${orderId}</strong> has been updated.
        </p>

        <!-- Status Box -->
        <div style="background: ${statusInfo.bg}; border: 1px solid ${statusInfo.color}; border-radius: 10px; padding: 16px; margin: 20px 0;">
          <h3 style="margin: 0 0 6px; color: ${statusInfo.color}; font-size: 16px;">${statusInfo.badge}</h3>
          <p style="margin: 0; font-size: 13px; color: #374151; line-height: 1.4;">${statusInfo.desc}</p>
        </div>

        <!-- Items Summary -->
        <h3 style="color: #1c1917; font-size: 15px; border-bottom: 2px solid #1c1917; padding-bottom: 6px; margin-top: 24px;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #374151;">
          <thead>
            <tr style="background: #f9fafb; text-align: left;">
              <th style="padding: 8px 10px; border-bottom: 1px solid #dddddd;">Item</th>
              <th style="padding: 8px 10px; border-bottom: 1px solid #dddddd; text-align: center;">Qty</th>
              <th style="padding: 8px 10px; border-bottom: 1px solid #dddddd; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="2" style="padding: 12px 10px; font-weight: bold; text-align: right; border-top: 2px solid #e5e7eb;">Total Amount:</td>
              <td style="padding: 12px 10px; font-weight: bold; text-align: right; font-size: 16px; color: #16a34a; border-top: 2px solid #e5e7eb;">₹${order.totalPrice ? order.totalPrice.toFixed(2) : '0.00'}</td>
            </tr>
          </tfoot>
        </table>

        <!-- Contact Support -->
        <div style="margin-top: 30px; padding-top: 16px; border-top: 1px solid #eeeeee; font-size: 13px; color: #6b7280; text-align: center;">
          <p style="margin: 0 0 4px;">Need help with your order?</p>
          <p style="margin: 0;"><strong>Phone / WhatsApp:</strong> +91 7670851967 | <strong>Email:</strong> omrishomekichen@gmail.com</p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #f5f5f4; padding: 14px; text-align: center; font-size: 12px; color: #78716c;">
        © Omris Home Kitchen. All rights reserved.
      </div>
    </div>
  `;

  try {
    await sendEmail({
      email: targetEmail,
      subject: `Order Update #${orderId} - ${statusInfo.badge} | Omris Home Kitchen`,
      message: `Your order #${orderId} status: ${statusInfo.badge}. ${statusInfo.desc}`,
      htmlMessage,
    });
    console.log(`📧 Notification email sent to ${targetEmail} for order #${orderId} [${order.status}]`);
  } catch (error) {
    console.error(`❌ Failed to send order notification email to ${targetEmail}:`, error.message);
  }
};

export default sendOrderNotificationEmail;
