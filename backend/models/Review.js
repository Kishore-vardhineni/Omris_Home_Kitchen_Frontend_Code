import mongoose from 'mongoose';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * REVIEW MODEL (Omris Home Kitchen)
 * Standalone collection for managing customer product reviews and ratings.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const reviewSchema = new mongoose.Schema(
  {
    // Target Product Reference
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to a product'],
      index: true,
    },

    // User Reference (Optional — present if reviewer is logged in)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },

    // ── Form Fields ──────────────────────────────────────────────────────────
    
    // "Your Name"
    name: {
      type: String,
      required: [true, 'Please enter your name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    // "Email Address"
    email: {
      type: String,
      required: [true, 'Please enter your email address'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
        'Please enter a valid email address',
      ],
      index: true,
    },

    // "Your Rating" (1 to 5 stars)
    rating: {
      type: Number,
      required: [true, 'Please provide a star rating'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
    },

    // "Review Title"
    title: {
      type: String,
      required: [true, 'Please provide a review title'],
      trim: true,
      minlength: [3, 'Review title must be at least 3 characters long'],
      maxlength: [120, 'Review title cannot exceed 120 characters'],
    },

    // "Your Review"
    comment: {
      type: String,
      required: [true, 'Please write your review comment'],
      trim: true,
      minlength: [10, 'Review content must be at least 10 characters long'],
      maxlength: [2000, 'Review content cannot exceed 2000 characters'],
    },

    // "Add Photos" — Uploaded customer photo attachments (up to 5)
    photos: {
      type: [
        {
          url: {
            type: String,
            required: [true, 'Photo URL is required'],
            trim: true,
          },
          altText: {
            type: String,
            trim: true,
            default: '',
          },
        },
      ],
      validate: {
        validator: function (val) {
          return val.length <= 5;
        },
        message: 'You can upload a maximum of 5 photos per review',
      },
      default: [],
    },

    // ── Metadata & Moderation ────────────────────────────────────────────────
    
    // Verified buyer badge (flagged true if user purchased this product)
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },

    // Moderation toggle (defaults to true for instant publishing, or false if review approval workflow is enabled)
    isApproved: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Count of community "Was this helpful?" upvotes
    helpfulVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────────────────────

// Efficient query index for fetching approved product reviews ordered by latest date
reviewSchema.index({ product: 1, isApproved: 1, createdAt: -1 });

// Ensure one review per product per email address to prevent duplicate spam submissions
reviewSchema.index({ product: 1, email: 1 }, { unique: true });

// ─────────────────────────────────────────────────────────────────────────────
// STATIC METHOD: Recalculate Product Average Rating & Review Count
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Aggregates all approved reviews for a given product and updates averageRating & numReviews on Product model.
 * @param {mongoose.Types.ObjectId} productId
 */
reviewSchema.statics.calcAverageRating = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId, isApproved: true },
    },
    {
      $group: {
        _id: '$product',
        numReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      numReviews: stats[0].numReviews,
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
    });
  } else {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      numReviews: 0,
      averageRating: 0,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE HOOKS
// ─────────────────────────────────────────────────────────────────────────────

// Recalculate ratings after saving a new or modified review
reviewSchema.post('save', async function () {
  await this.constructor.calcAverageRating(this.product);
});

// Recalculate ratings after deleting a review
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRating(doc.product);
  }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
