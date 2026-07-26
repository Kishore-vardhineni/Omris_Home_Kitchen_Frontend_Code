import React from 'react';
import { Star, CheckSquare } from 'lucide-react';

const DEFAULT_BREAKDOWN = [
  { stars: 5, count: 207 },
  { stars: 4, count: 113 },
  { stars: 3, count: 30 },
  { stars: 2, count: 0 },
  { stars: 1, count: 0 },
];

/**
 * ReviewsSummary Component
 * 
 * A 3-column "Customer Reviews" summary bar featuring:
 * - Overall rating score with partial decimal star fill and verified badge
 * - Rating breakdown progress bars dynamically calculated relative to the max count
 * - Call-to-action button for writing a review
 * 
 * @param {Object} props
 * @param {number} [props.averageRating=4.51] - Average rating score (e.g. 4.51)
 * @param {number} [props.totalReviews=350] - Total number of reviews
 * @param {Array<{stars: number, count: number}>} [props.ratingBreakdown] - Rating counts by star level
 * @param {Function} [props.onWriteReview] - Callback function when "Write a Review" is clicked
 */
const ReviewsSummary = ({
  averageRating = 4.51,
  totalReviews = 350,
  ratingBreakdown = DEFAULT_BREAKDOWN,
  onWriteReview = () => {},
}) => {
  // Sort breakdown in descending order (5 stars down to 1 star)
  const sortedBreakdown = [...ratingBreakdown].sort((a, b) => b.stars - a.stars);

  // Maximum count amongst all star levels to calculate relative percentage bar widths
  const maxCount = Math.max(...sortedBreakdown.map((item) => item.count), 0);

  /**
   * Helper to render full or partial star fill based on decimal rating value
   */
  const renderPartialStar = (starIndex, rating) => {
    const fillAmount = Math.max(0, Math.min(1, rating - (starIndex - 1)));
    const fillPercentage = (fillAmount * 100).toFixed(1);

    return (
      <div key={starIndex} className="relative inline-block w-5 h-5 sm:w-6 sm:h-6 shrink-0">
        {/* Background / empty star */}
        <Star className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300 fill-gray-100" />
        {/* Foreground / filled star with dynamic width clip */}
        {fillAmount > 0 && (
          <div
            className="absolute top-0 left-0 overflow-hidden h-full"
            style={{ width: `${fillPercentage}%` }}
          >
            <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 fill-yellow-400" />
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="w-full bg-white border-b border-gray-200 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Centered Heading */}
        <h2 className="text-2xl sm:text-3xl font-semibold text-center text-gray-900 mb-6 sm:mb-8 tracking-tight">
          Customer Reviews
        </h2>

        {/* 3-Column Summary Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-0 items-center">
          
          {/* COLUMN 1 — Overall Rating (left-aligned) */}
          <div className="md:col-span-4 flex flex-col justify-center items-start md:pr-6 lg:pr-8 md:border-r md:border-gray-200 h-full py-1">
            <div className="flex flex-col space-y-2">
              {/* Star Rating Row + Rating Text */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div
                  className="flex items-center gap-1"
                  aria-label={`Rated ${averageRating} out of 5 stars`}
                >
                  {[1, 2, 3, 4, 5].map((starIndex) => renderPartialStar(starIndex, averageRating))}
                </div>
                <span className="font-bold text-gray-900 text-base sm:text-lg">
                  {averageRating} out of 5
                </span>
              </div>

              {/* Based on X reviews + Verified Badge */}
              <div className="flex items-center gap-1.5 text-sm sm:text-base font-bold text-gray-800">
                <span>Based on {totalReviews.toLocaleString()} reviews</span>
                <CheckSquare
                  className="w-4 h-4 text-teal-600 shrink-0"
                  aria-label="Verified reviews badge"
                />
              </div>
            </div>
          </div>

          {/* COLUMN 2 — Rating Breakdown (center) */}
          <div className="md:col-span-5 flex flex-col justify-center md:px-6 lg:px-8 md:border-r md:border-gray-200 h-full py-1">
            <div className="space-y-2 w-full max-w-md mx-auto md:max-w-none">
              {sortedBreakdown.map((item) => {
                const barPercentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                return (
                  <div
                    key={item.stars}
                    className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm"
                  >
                    {/* Star icons (filled yellow up to level, rest outlined) */}
                    <div
                      className="flex items-center gap-0.5 shrink-0"
                      aria-label={`${item.stars} star reviews count: ${item.count}`}
                    >
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                            s <= item.stars
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300 fill-transparent'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Progress bar track & fill */}
                    <div className="flex-1 bg-gray-200 h-2.5 sm:h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-neutral-900 h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${barPercentage}%` }}
                      />
                    </div>

                    {/* Count number (right-aligned) */}
                    <span className="w-8 text-right text-gray-500 font-medium shrink-0">
                      {item.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUMN 3 — Write a Review (right-aligned) */}
          <div className="md:col-span-3 flex items-center justify-start md:justify-end md:pl-6 lg:pl-8 h-full py-1">
            <button
              type="button"
              onClick={onWriteReview}
              className="w-full md:w-auto px-6 py-3 sm:px-8 sm:py-3.5 bg-black hover:bg-neutral-800 text-white font-bold rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm text-center text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 cursor-pointer"
            >
              Write a Review
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ReviewsSummary;
