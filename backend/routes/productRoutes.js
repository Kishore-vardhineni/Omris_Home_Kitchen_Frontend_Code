import express from 'express';
import {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/products
// @desc    Create a new product
// @access  Private/Admin
router.post('/', protect, adminOnly, addProduct);

// @route   GET /api/products
// @desc    Get all products (supports ?category=veg-pickle&featured=true&page=1&limit=12)
// @access  Public
router.get('/', getProducts);

// @route   GET /api/products/:idOrSlug
// @desc    Get a single product by MongoDB _id or URL slug
// @access  Public
router.get('/:idOrSlug', getProductById);

// @route   PUT /api/products/:id
// @desc    Update an existing product
// @access  Private/Admin
router.put('/:id', protect, adminOnly, updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
