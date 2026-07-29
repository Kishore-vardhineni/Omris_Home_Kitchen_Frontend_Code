import mongoose from 'mongoose';

// ─────────────────────────────────────────────────────────────────────────────
// 1. REVIEW SUB-SCHEMA
//    Embedded reviews (no separate collection needed at this scale).
//    Keeps rating aggregation simple and co-located with the product.
// ─────────────────────────────────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    name: {
      type: String,
      required: [true, 'Reviewer name is required'],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Review title cannot exceed 100 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: [1000, 'Review comment cannot exceed 1000 characters'],
    },
    // Flagged true once we confirm the reviewer has purchased this product
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpfulVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: true, timestamps: true }
);

// ─────────────────────────────────────────────────────────────────────────────
// 2. VARIANT SUB-SCHEMA
//    Each product (e.g., Mango Pickle) can come in multiple weight/packing
//    sizes (250g, 500g, 1kg), each with its own price, SKU, and stock level.
// ─────────────────────────────────────────────────────────────────────────────
const variantSchema = new mongoose.Schema(
  {
    // Human-readable label shown in the UI  →  "250g", "500g", "1 kg"
    label: {
      type: String,
      required: [true, 'Variant label is required (e.g. 250g, 500g)'],
      trim: true,
    },
    // Weight in grams — used for shipping rate calculations
    weightInGrams: {
      type: Number,
      required: [true, 'Weight in grams is required'],
      min: [1, 'Weight must be a positive number'],
    },
    packagingType: {
      type: String,
      enum: ['Glass Jar', 'Plastic Jar', 'Pouch', 'Box', 'Tin'],
      default: 'Glass Jar',
    },
    // Stock-Keeping Unit — unique across the entire catalogue
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      uppercase: true,
      trim: true,
    },
    // MRP (original price before discount)
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    // Selling price (must be <= price); falls back to price if undefined
    discountedPrice: {
      type: Number,
      min: [0, 'Discounted price cannot be negative'],
      validate: {
        validator: function (val) {
          return val == null || val <= this.price;
        },
        message: 'Discounted price must be less than or equal to the regular price',
      },
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    // Trigger a restock alert when stock falls below this value
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: 0,
    },
    // Toggle off without deleting the variant
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

// ─────────────────────────────────────────────────────────────────────────────
// 3. MAIN PRODUCT SCHEMA
// ─────────────────────────────────────────────────────────────────────────────
const productSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [3, 'Product name must be at least 3 characters'],
      maxlength: [150, 'Product name cannot exceed 150 characters'],
    },
    // URL-friendly identifier  →  "mango-pickle-500g"
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // ── Categorisation ────────────────────────────────────────────────────
    category: {
      type: String,
      required: [true, 'Product category is required'],
      enum: {
        values: ['veg-pickle', 'non-veg-pickle', 'podi', 'combo', 'gift-pack'],
        message:
          'Category must be one of: veg-pickle, non-veg-pickle, podi, combo, gift-pack',
      },
      index: true, // Heavily queried — always indexed
    },
    // Fine-grained sub-category  e.g. "Mango", "Lemon", "Chicken", "Curry Leaf"
    subCategory: {
      type: String,
      trim: true,
    },
    // Ingredient / attribute tags for smart filtering
    // e.g. ["mango", "sesame oil", "red chilli", "traditional", "spicy"]
    tags: {
      type: [String],
      default: [],
      index: true,
    },

    // ── Descriptions ──────────────────────────────────────────────────────
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
    },
    longDescription: {
      type: String,
      trim: true,
      maxlength: [5000, 'Long description cannot exceed 5000 characters'],
    },
    ingredients: {
      type: [String],
      default: [],
    },
    // e.g. "12 months from manufacture date"
    shelfLife: {
      type: String,
      trim: true,
    },
    // e.g. "Store in a cool, dry place. Refrigerate after opening."
    storageInstructions: {
      type: String,
      trim: true,
    },

    // ── Media ─────────────────────────────────────────────────────────────
    // Primary display image
    image: {
      url: {
        type: String,
        required: [true, 'At least one product image URL is required'],
        trim: true,
      },
      altText: {
        type: String,
        trim: true,
        default: '',
      },
    },
    // Additional gallery images
    gallery: [
      {
        url:     { type: String, trim: true },
        altText: { type: String, trim: true, default: '' },
      },
    ],

    // ── Variants (weight / packing sizes) ─────────────────────────────────
    variants: {
      type: [variantSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'A product must have at least one variant',
      },
    },

    // ── Ratings & Reviews ─────────────────────────────────────────────────
    reviews: [reviewSchema],
    // Denormalised stats — kept in sync by addReview / removeReview helpers
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: (val) => Math.round(val * 10) / 10, // Round to 1 decimal
    },
    numReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Merchandising ─────────────────────────────────────────────────────
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isBestseller: {
      type: Boolean,
      default: false,
      index: true,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    // Soft-delete — hides product from storefront without removing from DB
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    // Running count of units sold — used for popularity/bestseller sort
    totalSold: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Dietary / Certification Badges ────────────────────────────────────
    isVegetarian: {
      type: Boolean,
      default: true,
    },
    isVegan: {
      type: Boolean,
      default: false,
    },
    isGlutenFree: {
      type: Boolean,
      default: false,
    },
    isOrganicCertified: {
      type: Boolean,
      default: false,
    },
    // Free-form badge strings displayed on the product card
    // e.g. ["No Preservatives", "100% Natural", "Made with Love"]
    certificationBadges: {
      type: [String],
      default: [],
    },

    // ── Nutritional Info (values per 100g) ────────────────────────────────
    nutritionalInfo: {
      calories:      { type: Number, min: 0 }, // kcal
      protein:       { type: Number, min: 0 }, // g
      carbohydrates: { type: Number, min: 0 }, // g
      fat:           { type: Number, min: 0 }, // g
      sodium:        { type: Number, min: 0 }, // mg
      fiber:         { type: Number, min: 0 }, // g
    },

    // ── SEO ───────────────────────────────────────────────────────────────
    seo: {
      metaTitle: {
        type: String,
        trim: true,
        maxlength: [70, 'Meta title cannot exceed 70 characters'],
      },
      metaDescription: {
        type: String,
        trim: true,
        maxlength: [160, 'Meta description cannot exceed 160 characters'],
      },
      metaKeywords: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,          // Adds createdAt & updatedAt automatically
    toJSON:  { virtuals: true },
    toObject:{ virtuals: true },
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// 4. VIRTUALS
// ─────────────────────────────────────────────────────────────────────────────

// Lowest selling price across active variants  →  displayed as "From Rs.xx"
productSchema.virtual('startingPrice').get(function () {
  const activePrices = this.variants
    .filter((v) => v.isAvailable)
    .map((v) => (v.discountedPrice != null ? v.discountedPrice : v.price));
  return activePrices.length ? Math.min(...activePrices) : null;
});

// true if at least one variant has stock > 0 and is available
productSchema.virtual('inStock').get(function () {
  return this.variants.some((v) => v.isAvailable && v.stock > 0);
});

// Sum of stock across all variants
productSchema.virtual('totalStock').get(function () {
  return this.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. COMPOUND INDEXES  (ordered by most common query patterns)
// ─────────────────────────────────────────────────────────────────────────────
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ category: 1, isFeatured: 1 });
productSchema.index({ category: 1, isBestseller: 1 });
productSchema.index({ category: 1, averageRating: -1 });
productSchema.index({ tags: 1 });
// Full-text search across name, shortDescription, and tags
productSchema.index({ name: 'text', shortDescription: 'text', tags: 'text' });
// Globally unique SKU per variant
productSchema.index({ 'variants.sku': 1 }, { unique: true, sparse: true });

// ─────────────────────────────────────────────────────────────────────────────
// 6. PRE-SAVE MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────────────

// Auto-generate a URL slug from the product name when created or name changes
productSchema.pre('save', function (next) {
  if (!this.slug || this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // strip special characters
      .replace(/\s+/g, '-')          // spaces → hyphens
      .replace(/-+/g, '-')           // collapse consecutive hyphens
      .trim();
  }
  next();
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. STATIC METHODS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Recalculate and persist averageRating + numReviews for a product.
 * Call this after adding or deleting a review via raw DB operations.
 *
 * @param {mongoose.Types.ObjectId} productId
 */
productSchema.statics.recalculateRatings = async function (productId) {
  const product = await this.findById(productId).select('reviews');
  if (!product) return;

  const { reviews } = product;
  const numReviews = reviews.length;
  const averageRating =
    numReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews
      : 0;

  await this.findByIdAndUpdate(productId, { averageRating, numReviews });
};

/**
 * Decrement stock for a specific variant after a successful order.
 * Returns false (without throwing) when stock is insufficient.
 *
 * @param {mongoose.Types.ObjectId} productId
 * @param {mongoose.Types.ObjectId} variantId
 * @param {number} qty
 * @returns {Promise<boolean>}
 */
productSchema.statics.decrementStock = async function (productId, variantId, qty) {
  const product = await this.findById(productId);
  if (!product) throw new Error('Product not found');

  const variant = product.variants.id(variantId);
  if (!variant) throw new Error('Variant not found');
  if (variant.stock < qty) return false; // Insufficient stock — caller handles this

  variant.stock   -= qty;
  product.totalSold += qty;

  // Auto-disable the variant when it goes out of stock
  if (variant.stock === 0) variant.isAvailable = false;

  await product.save();
  return true;
};

/**
 * Increment stock for a specific variant (restocking or order cancellation).
 *
 * @param {mongoose.Types.ObjectId} productId
 * @param {mongoose.Types.ObjectId} variantId
 * @param {number} qty
 */
productSchema.statics.incrementStock = async function (productId, variantId, qty) {
  const product = await this.findById(productId);
  if (!product) throw new Error('Product not found');

  const variant = product.variants.id(variantId);
  if (!variant) throw new Error('Variant not found');

  variant.stock += qty;

  // Re-enable the variant once stock is replenished
  if (variant.stock > 0) variant.isAvailable = true;

  await product.save();
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. INSTANCE METHODS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Add a review. Enforces the one-review-per-user constraint.
 * Automatically updates averageRating and numReviews in-memory before saving.
 *
 * @param {{ user: ObjectId, name: string, rating: number, title?: string, comment: string }} reviewData
 */
productSchema.methods.addReview = async function (reviewData) {
  const alreadyReviewed = this.reviews.some(
    (r) => r.user.toString() === reviewData.user.toString()
  );
  if (alreadyReviewed) {
    throw new Error('You have already reviewed this product');
  }

  this.reviews.push(reviewData);
  this.numReviews    = this.reviews.length;
  this.averageRating =
    this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.numReviews;

  return this.save();
};

/**
 * Remove a review by its ID and recalculate rating stats.
 *
 * @param {mongoose.Types.ObjectId} reviewId
 */
productSchema.methods.removeReview = async function (reviewId) {
  this.reviews = this.reviews.filter(
    (r) => r._id.toString() !== reviewId.toString()
  );
  this.numReviews    = this.reviews.length;
  this.averageRating =
    this.numReviews > 0
      ? this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.numReviews
      : 0;

  return this.save();
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. MODEL EXPORT
// ─────────────────────────────────────────────────────────────────────────────
const Product = mongoose.model('Product', productSchema);

export default Product;
