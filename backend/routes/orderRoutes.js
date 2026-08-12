import express from 'express';
import {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, optionalProtect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/orders
// @desc    Place a new order (supports both logged-in users and guests)
// @access  Public/Optional
router.post('/', optionalProtect, placeOrder);

// @route   GET /api/orders/myorders
// @desc    Get logged-in user's orders
// @access  Private
router.get('/myorders', protect, getMyOrders);

// @route   GET /api/orders
// @desc    Get all orders (admin)
// @access  Admin
router.get('/', protect, adminOnly, getAllOrders);

// @route   PUT /api/orders/:id/status
// @desc    Update order status (admin)
// @access  Admin
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

export default router;
