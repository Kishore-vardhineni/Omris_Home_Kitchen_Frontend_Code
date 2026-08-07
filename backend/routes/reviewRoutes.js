import express from 'express';
import {
  getAllReviews,
  createReview,
  getProductReviews,
  markReviewHelpful,
  deleteReview,
} from '../controllers/reviewController.js';

const router = express.Router();

// @route   GET /api/reviews
// @desc    Get recent approved reviews across all products (homepage testimonials)
// @access  Public
router.get('/', getAllReviews);

// @route   POST /api/reviews/:productId
// @desc    Submit a new review for a product
// @access  Public
router.post('/:productId', createReview);

// @route   GET /api/reviews/:productId
// @desc    Get all approved reviews for a product (with pagination & sort)
// @access  Public
router.get('/:productId', getProductReviews);

// @route   PATCH /api/reviews/:reviewId/helpful
// @desc    Increment helpfulVotes on a review
// @access  Public
router.patch('/:reviewId/helpful', markReviewHelpful);

// @route   DELETE /api/reviews/:reviewId
// @desc    Delete a review (Admin only)
// @access  Private/Admin
router.delete('/:reviewId', deleteReview);

export default router;
