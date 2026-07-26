import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Camera, UploadCloud, AlertCircle } from 'lucide-react';

/**
 * WriteReviewModal Component
 * 
 * Accessible modal dialog for submitting a customer review.
 * Features:
 * - Interactive 5-star rating selector with hover preview
 * - Field validation (Name, Email, Rating, Review text)
 * - Photo upload with live thumbnail previews and removal option
 * - Backdrop click & Escape key listeners to close modal
 */
const WriteReviewModal = ({ isOpen, onClose, onSubmit }) => {
  const backdropRef = useRef(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [photos, setPhotos] = useState([]); // Array of { file, url }

  // Validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setName('');
      setEmail('');
      setRating(0);
      setHoverRating(0);
      setTitle('');
      setReviewText('');
      setPhotos([]);
      setErrors({});
      setTouched({});
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Validation logic
  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Your name is required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (rating === 0) {
      newErrors.rating = 'Please select a rating of at least 1 star.';
    }

    if (!reviewText.trim()) {
      newErrors.reviewText = 'Your review text is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle photo upload
  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newPhotos = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setPhotos((prev) => [...prev, ...newPhotos]);
    // Reset file input value so same file can be chosen again if removed
    e.target.value = '';
  };

  // Remove photo thumbnail
  const handleRemovePhoto = (index) => {
    setPhotos((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].url);
      updated.splice(index, 1);
      return updated;
    });
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      rating: true,
      reviewText: true,
    });

    if (validate()) {
      const newReview = {
        id: Date.now(),
        name: name.trim(),
        email: email.trim(),
        rating,
        title: title.trim(),
        text: reviewText.trim(),
        photos: photos.map((p) => p.url),
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        verified: true,
      };

      onSubmit(newReview);
      onClose();
    }
  };

  // Rating label helper
  const getRatingLabel = (val) => {
    switch (val) {
      case 1:
        return '1 Star - Poor';
      case 2:
        return '2 Stars - Fair';
      case 3:
        return '3 Stars - Average';
      case 4:
        return '4 Stars - Good';
      case 5:
        return '5 Stars - Excellent';
      default:
        return 'Select your rating';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        ref={backdropRef}
        onClick={(e) => e.target === backdropRef.current && onClose()}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        aria-modal="true"
        role="dialog"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 font-sans">Write a Review</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* 1. Your Name */}
            <div>
              <label htmlFor="reviewer-name" className="block text-sm font-semibold text-gray-800 mb-1">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                id="reviewer-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (touched.name) validate();
                }}
                onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                placeholder="e.g. Priya Sharma"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 ${
                  touched.name && errors.name
                    ? 'border-red-500 focus:ring-red-200 bg-red-50/30'
                    : 'border-gray-300 focus:border-black focus:ring-black/10'
                }`}
              />
              {touched.name && errors.name && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.name}
                </p>
              )}
            </div>

            {/* 2. Email Address */}
            <div>
              <label htmlFor="reviewer-email" className="block text-sm font-semibold text-gray-800 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="reviewer-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (touched.email) validate();
                }}
                onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                placeholder="e.g. priya@example.com"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 ${
                  touched.email && errors.email
                    ? 'border-red-500 focus:ring-red-200 bg-red-50/30'
                    : 'border-gray-300 focus:border-black focus:ring-black/10'
                }`}
              />
              {touched.email && errors.email && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.email}
                </p>
              )}
            </div>

            {/* 3. Your Rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Your Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1 py-1">
                {[1, 2, 3, 4, 5].map((starIndex) => {
                  const active = starIndex <= (hoverRating || rating);
                  return (
                    <button
                      key={starIndex}
                      type="button"
                      onClick={() => {
                        setRating(starIndex);
                        setTouched((p) => ({ ...p, rating: true }));
                        if (errors.rating) {
                          setErrors((p) => ({ ...p, rating: null }));
                        }
                      }}
                      onMouseEnter={() => setHoverRating(starIndex)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform transform hover:scale-110 focus:outline-none"
                      aria-label={`Rate ${starIndex} out of 5 stars`}
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          active
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300 fill-transparent'
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="ml-3 text-xs font-medium text-gray-500">
                  {getRatingLabel(hoverRating || rating)}
                </span>
              </div>
              {touched.rating && errors.rating && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.rating}
                </p>
              )}
            </div>

            {/* 4. Review Title */}
            <div>
              <label htmlFor="reviewer-title" className="block text-sm font-semibold text-gray-800 mb-1">
                Review Title <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                id="reviewer-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your review a short title"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-colors"
              />
            </div>

            {/* 5. Your Review */}
            <div>
              <label htmlFor="reviewer-text" className="block text-sm font-semibold text-gray-800 mb-1">
                Your Review <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reviewer-text"
                rows={4}
                value={reviewText}
                onChange={(e) => {
                  setReviewText(e.target.value);
                  if (touched.reviewText) validate();
                }}
                onBlur={() => setTouched((p) => ({ ...p, reviewText: true }))}
                placeholder="Write your detailed review here..."
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 resize-none ${
                  touched.reviewText && errors.reviewText
                    ? 'border-red-500 focus:ring-red-200 bg-red-50/30'
                    : 'border-gray-300 focus:border-black focus:ring-black/10'
                }`}
              />
              {touched.reviewText && errors.reviewText && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.reviewText}
                </p>
              )}
            </div>

            {/* 6. Add Photos (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Add Photos <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                className="hidden"
              />
              <label
                htmlFor="photo-upload"
                className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-black cursor-pointer transition-colors bg-gray-50/50 hover:bg-gray-100/50 group"
              >
                <div className="flex items-center gap-2 text-gray-500 group-hover:text-black transition-colors">
                  <Camera className="w-5 h-5" />
                  <span className="text-xs font-semibold">Click to upload photos</span>
                </div>
                <span className="text-[11px] text-gray-400 mt-0.5">JPEG, PNG or WEBP</span>
              </label>

              {/* Photo Previews */}
              {photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {photos.map((photo, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 group">
                      <img src={photo.url} alt={`Upload preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white p-0.5 rounded-full transition-colors"
                        aria-label="Remove photo"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 7. Submit Review Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-bold rounded-xl shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 text-sm sm:text-base cursor-pointer"
              >
                Submit Review
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WriteReviewModal;
