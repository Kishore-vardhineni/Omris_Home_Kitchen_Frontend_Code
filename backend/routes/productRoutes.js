import express from 'express';
import {
  addProduct,
  getProducts,
  getProductById,
} from '../controllers/productController.js';

const router = express.Router();

// @route   POST /api/products
// @desc    Create a new product
// @access  Private/Admin
router.post('/', addProduct);

// @route   GET /api/products
// @desc    Get all products (supports ?category=veg-pickle&featured=true&page=1&limit=12)
// @access  Public
router.get('/', getProducts);

// @route   GET /api/products/:idOrSlug
// @desc    Get a single product by MongoDB _id or URL slug
// @access  Public
router.get('/:idOrSlug', getProductById);

export default router;
