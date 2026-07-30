import Review from '../models/Review.js';
import Product from '../models/Product.js';

// ─────────────────────────────────────────────────────────────────────────────
// REVIEW CONTROLLER (Omris Home Kitchen)
// All handlers follow the { success, message, data } envelope pattern.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Get recent approved reviews across ALL products (for homepage testimonials)
 * @route   GET /api/reviews?limit=12&rating=4
 * @access  Public
 */
export const getAllReviews = async (req, res) => {
  try {
    const { limit = 12, rating } = req.query;

    const filter = { isApproved: true };
    if (rating) filter.rating = { $gte: Number(rating) };

    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('-email -__v')
      .lean();

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error('Error in getAllReviews:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews.',
      error: error.message,
    });
  }
};

/**
 * @desc    Submit a new review for a product
 * @route   POST /api/reviews/:productId
 * @access  Public (anyone can review; verified-purchase flag set server-side)
 */
export const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, email, rating, title, comment, photos } = req.body;

    // ── 1. Validate required fields ──────────────────────────────────────────
    if (!name || !email || !rating || !title || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields: name, email, rating, title, and review.',
      });
    }

    // ── 2. Confirm product exists ────────────────────────────────────────────
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    // ── 3. Guard: one review per product per email ───────────────────────────
    const existing = await Review.findOne({ product: productId, email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a review for this product.',
      });
    }

    // ── 4. Validate photos array (max 5) ─────────────────────────────────────
    if (photos && (!Array.isArray(photos) || photos.length > 5)) {
      return res.status(400).json({
        success: false,
        message: 'You can upload a maximum of 5 photos per review.',
      });
    }

    // ── 5. Optionally flag as verified purchase (if user is logged in) ───────
    let isVerifiedPurchase = false;
    if (req.user) {
      // Future: Check order history to confirm user purchased this product
      // const hasPurchased = await Order.exists({ user: req.user._id, 'items.product': productId });
      // isVerifiedPurchase = !!hasPurchased;
      isVerifiedPurchase = false; // Placeholder until Order model is implemented
    }

    // ── 6. Create review document ────────────────────────────────────────────
    const review = await Review.create({
      product: productId,
      user: req.user?._id || undefined,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      rating: Number(rating),
      title: title.trim(),
      comment: comment.trim(),
      photos: Array.isArray(photos) ? photos : [],
      isVerifiedPurchase,
    });
    // Post-save hook in Review.js automatically recalculates product averageRating & numReviews

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been submitted successfully.',
      review,
    });
  } catch (error) {
    console.error('Error in createReview:', error);

    // Duplicate key (product + email unique index)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a review for this product.',
      });
    }

    // Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while submitting your review.',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all approved reviews for a product
 * @route   GET /api/reviews/:productId
 * @access  Public
 */
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;

    // Confirm product exists
    const productExists = await Product.exists({ _id: productId });
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    // Build sort option
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      highest: { rating: -1 },
      lowest: { rating: 1 },
      helpful: { helpfulVotes: -1 },
    };
    const sortBy = sortOptions[sort] || sortOptions.newest;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      Review.find({ product: productId, isApproved: true })
        .sort(sortBy)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-email -__v')           // Hide email from public response
        .lean(),
      Review.countDocuments({ product: productId, isApproved: true }),
    ]);

    // Calculate rating breakdown (1-5 stars)
    const ratingBreakdown = await Review.aggregate([
      { $match: { product: new (await import('mongoose')).default.Types.ObjectId(productId), isApproved: true } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingBreakdown.forEach(({ _id, count }) => { breakdown[_id] = count; });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      ratingBreakdown: breakdown,
      reviews,
    });
  } catch (error) {
    console.error('Error in getProductReviews:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews.',
      error: error.message,
    });
  }
};

/**
 * @desc    Mark a review as helpful (increment helpfulVotes by 1)
 * @route   PATCH /api/reviews/:reviewId/helpful
 * @access  Public
 */
export const markReviewHelpful = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { $inc: { helpfulVotes: 1 } },
      { new: true, select: '-email -__v' }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Marked as helpful.',
      helpfulVotes: review.helpfulVotes,
    });
  } catch (error) {
    console.error('Error in markReviewHelpful:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error.',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a review (Admin only)
 * @route   DELETE /api/reviews/:reviewId
 * @access  Private/Admin
 */
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.reviewId);
    // Post-delete hook in Review.js recalculates product averageRating & numReviews

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully.',
    });
  } catch (error) {
    console.error('Error in deleteReview:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting review.',
      error: error.message,
    });
  }
};
