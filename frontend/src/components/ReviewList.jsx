import React from 'react';
import { Star, CheckSquare, ThumbsUp } from 'lucide-react';

/**
 * ReviewList Component
 * 
 * Renders the list of individual customer reviews.
 * Features:
 * - Reviewer initials avatar
 * - Verified Buyer badge
 * - 5-star rating display
 * - Review title, body text, and date
 * - Uploaded photo gallery thumbnails
 */
const ReviewList = ({ reviews = [] }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        No reviews yet. Be the first to write a review!
      </div>
    );
  }

  // Get initials for avatar circle
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  return (
    <div className="divide-y divide-gray-200">
      {reviews.map((review) => (
        <div key={review.id} className="py-6 space-y-3 font-sans">
          {/* Top row: Avatar + Name + Date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-900 text-white font-bold text-sm flex items-center justify-center shrink-0">
                {getInitials(review.name)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                    {review.name}
                  </h4>
                  {review.verified && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      <CheckSquare className="w-3 h-3 text-teal-600" /> Verified Buyer
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">{review.date}</span>
              </div>
            </div>

            {/* Star Rating */}
            <div className="flex items-center gap-0.5" aria-label={`Rated ${review.rating} out of 5 stars`}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= review.rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300 fill-transparent'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Title & Body */}
          <div>
            {review.title && (
              <h5 className="font-bold text-gray-900 text-sm mb-1">
                {review.title}
              </h5>
            )}
            <p className="text-sm text-gray-700 leading-relaxed">
              {review.text}
            </p>
          </div>

          {/* Uploaded Photos (if any) */}
          {review.photos && review.photos.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {review.photos.map((photoUrl, idx) => (
                <img
                  key={idx}
                  src={photoUrl}
                  alt={`Review photo ${idx + 1}`}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-gray-200 shadow-sm"
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
