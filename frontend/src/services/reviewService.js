import axios from 'axios';

// ─────────────────────────────────────────────────────────────────────────────
// CENTRALIZED API SERVICE FOR REVIEWS
// ─────────────────────────────────────────────────────────────────────────────

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
});

/**
 * Helper to extract error message from API response and throw a clean Error.
 * @param {Error} error
 */
const handleApiError = (error) => {
  if (error.response && error.response.data && error.response.data.message) {
    throw new Error(error.response.data.message);
  }
  throw new Error(error.message || 'An unexpected error occurred');
};

/**
 * Fetch recent approved reviews across ALL products (for homepage testimonials).
 * @param {Object} params - { limit, rating }
 * @returns {Promise<Object>} { success, count, reviews }
 */
export const getAllReviews = async (params = {}) => {
  try {
    const response = await API.get('/reviews', { params });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Fetch all approved reviews for a product (with pagination & sort).
 * @param {string} productId - MongoDB product ID
 * @param {Object} params    - { page, limit, sort }
 * @returns {Promise<Object>} { success, reviews, total, totalPages, currentPage, ratingBreakdown }
 */
export const getProductReviews = async (productId, params = {}) => {
  try {
    const response = await API.get(`/reviews/${productId}`, { params });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Submit a new review for a product.
 * @param {string} productId  - MongoDB product ID
 * @param {Object} reviewData - { name, email, rating, title, comment, photos }
 * @returns {Promise<Object>} { success, message, review }
 */
export const createReview = async (productId, reviewData) => {
  try {
    const response = await API.post(`/reviews/${productId}`, reviewData);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Mark a review as helpful (increment helpfulVotes by 1).
 * @param {string} reviewId - MongoDB review ID
 * @returns {Promise<Object>} { success, message, helpfulVotes }
 */
export const markReviewHelpful = async (reviewId) => {
  try {
    const response = await API.patch(`/reviews/${reviewId}/helpful`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export default {
  getAllReviews,
  getProductReviews,
  createReview,
  markReviewHelpful,
};
