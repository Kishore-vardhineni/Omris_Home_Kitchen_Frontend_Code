import axios from 'axios';

// ─────────────────────────────────────────────────────────────────────────────
// CENTRALIZED API SERVICE FOR PRODUCTS
// ─────────────────────────────────────────────────────────────────────────────

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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
 * Fetch all products with query parameters.
 * @param {Object} params - { category, featured, search, page, limit }
 * @returns {Promise<Object>} The parsed response data from the server.
 */
export const getProducts = async (params = {}) => {
  try {
    const response = await API.get('/products', { params });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Fetch a single product by MongoDB ID or URL slug.
 * @param {string} slug - MongoDB ID or product slug
 * @returns {Promise<Object>} The parsed response data for the product.
 */
export const getProductBySlug = async (slug) => {
  try {
    const response = await API.get(`/products/${slug}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Create a new product (admin-only).
 * @param {Object} productData - New product payload matching Product schema
 * @param {string} token - User's authorization token (JWT)
 * @returns {Promise<Object>} The parsed response data of the created product.
 */
export const createProduct = async (productData, token) => {
  try {
    const response = await API.post('/products', productData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export default {
  getProducts,
  getProductBySlug,
  createProduct,
};
