import Order from '../models/Order.js';
import sendOrderNotificationEmail from '../utils/sendOrderEmail.js';

/**
 * @desc    Place a new order
 * @route   POST /api/orders
 * @access  Public/Optional (supports logged-in users and guests)
 */
export const placeOrder = async (req, res) => {
  try {
    const { orderItems, totalPrice, paymentMethod, status, guestInfo, shippingAddress } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items provided',
      });
    }

    const orderData = {
      orderItems,
      totalPrice,
      paymentMethod: paymentMethod || 'WhatsApp',
      status: status || 'Awaiting Confirmation',
      shippingAddress: shippingAddress || {},
    };

    if (req.user) {
      orderData.user = req.user._id;
    } else if (guestInfo) {
      orderData.guestInfo = guestInfo;
    }

    const order = await Order.create(orderData);

    // Determine target recipient email & name for notification email
    const recipientEmail = req.user?.email || guestInfo?.email || req.body.customerEmail;
    const recipientName = req.user?.name || guestInfo?.name || req.body.customerName || 'Customer';

    if (recipientEmail) {
      // Fire email asynchronously
      sendOrderNotificationEmail(order, recipientEmail, recipientName).catch((err) =>
        console.error('Failed sending order creation email:', err)
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    console.error('Error in placeOrder:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while placing order',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all orders for the logged-in user
 * @route   GET /api/orders/myorders
 * @access  Private (logged-in user)
 */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Error in getMyOrders:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching orders',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all orders (admin)
 * @route   GET /api/orders
 * @access  Private/Admin
 */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    const totalRevenue = orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((acc, o) => acc + o.totalPrice, 0);

    return res.status(200).json({
      success: true,
      count: orders.length,
      totalRevenue,
      orders,
    });
  } catch (error) {
    console.error('Error in getAllOrders:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching all orders',
      error: error.message,
    });
  }
};

/**
 * @desc    Update order status (admin)
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const oldStatus = order.status;
    order.status = status || order.status;
    if (status === 'Delivered') {
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();

    // Send email notification to customer on status update
    const recipientEmail = updatedOrder.user?.email || updatedOrder.guestInfo?.email;
    const recipientName = updatedOrder.user?.name || updatedOrder.guestInfo?.name || 'Valued Customer';

    if (recipientEmail && oldStatus !== updatedOrder.status) {
      sendOrderNotificationEmail(updatedOrder, recipientEmail, recipientName).catch((err) =>
        console.error('Failed sending status update email:', err)
      );
    }

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${updatedOrder.status}`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating order status',
      error: error.message,
    });
  }
};

/**
 * @desc    Mark order as paid (admin) & send invoice email
 * @route   PUT /api/orders/:id/pay
 * @access  Private/Admin
 */
export const markOrderAsPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentMethod = req.body.paymentMethod || 'PhonePe / UPI';
    order.paymentResult = {
      id: req.body.transactionId || `PHONEPE_${Date.now()}`,
      status: 'SUCCESS',
      update_time: new Date().toISOString(),
    };

    // Automatically update status to Confirmed when paid
    if (order.status === 'Awaiting Confirmation' || order.status === 'Pending') {
      order.status = 'Confirmed';
    }

    const updatedOrder = await order.save();

    // Send payment confirmation & invoice notification email
    const recipientEmail = updatedOrder.user?.email || updatedOrder.guestInfo?.email;
    const recipientName = updatedOrder.user?.name || updatedOrder.guestInfo?.name || 'Valued Customer';

    if (recipientEmail) {
      sendOrderNotificationEmail(updatedOrder, recipientEmail, recipientName).catch((err) =>
        console.error('Failed sending payment confirmation email:', err)
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Order marked as Paid successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error in markOrderAsPaid:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while marking order as paid',
      error: error.message,
    });
  }
};
