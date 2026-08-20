import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Shield,
  ShoppingBag,
  ArrowLeft,
  LogOut,
  KeyRound,
  Clock,
  Phone,
  Pencil,
  CheckCircle2,
  AlertCircle,
  XCircle
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const userInfoStr = localStorage.getItem('userInfo');
    return userInfoStr ? JSON.parse(userInfoStr) : null;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem('userInfo', JSON.stringify(data.user));
          setFormData({
            name: data.user.name || '',
            email: data.user.email || '',
            phone: data.user.phone || '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/login');
    window.location.reload();
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleEdit = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
    setErrors({});
    setServerError('');
    setSuccessMessage('');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    setServerError('');
    setSuccessMessage('');
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setServerError('');
    setSuccessMessage('');
    setErrors({});

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setServerError(data.message || 'Failed to update profile. Please try again.');
        setIsSubmitting(false);
        return;
      }

      const updatedUser = {
        ...user,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
      };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setSuccessMessage(data.message || 'Profile updated successfully');
      setIsSubmitting(false);
      setIsEditing(false);
    } catch (err) {
      console.error('Profile update error:', err);
      setServerError('Unable to connect to server. Please check your network.');
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
          <User size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-[#1c1917] mb-2">Not Signed In</h2>
          <p className="text-gray-600 mb-6">Please log in to view your profile details.</p>
          <Link
            to="/login"
            className="inline-block bg-[#1c1917] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#332e2b] transition-colors"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  // Generate initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-[#1c1917] transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" /> Back to Home
          </Link>
        </div>

        {/* Profile Card Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/60 relative overflow-hidden"
        >
          {/* Background Decorative Gradient Banner */}
          <div className="h-28 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 bg-gradient-to-r from-[#1c1917] via-[#3d2e1e] to-[#78350f] relative flex items-end justify-end px-6 sm:px-8 pb-4">
            <span className="text-xs font-semibold tracking-wider uppercase text-amber-200/80">
              Omris Home Kitchen Member
            </span>
          </div>

          {/* User Info Container */}
          <div className="relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-lg border-4 border-white flex-shrink-0 -mt-10 sm:-mt-12">
                {getInitials(user.name)}
              </div>
              <div className="mb-1 mt-1 sm:mt-0">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1917] capitalize">
                  {user.name}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 break-all sm:break-normal">
                  <Mail size={14} className="text-amber-600 flex-shrink-0" />
                  <span>{user.email}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:mb-1">
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${user.role === 'admin'
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                {user.role === 'admin' ? <Shield size={13} /> : <User size={13} />}
                {user.role === 'admin' ? 'Administrator' : 'Customer Account'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Quick Access Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <Link
            to="/order-history"
            className="group bg-white p-6 rounded-2xl border border-stone-200/60 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <ShoppingBag size={22} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-amber-700 transition-colors">
                  My Orders
                </h3>
                <p className="text-xs text-gray-500">Track and view past order history</p>
              </div>
            </div>
            <span className="text-gray-400 group-hover:text-gray-700 transition-colors text-lg font-bold">→</span>
          </Link>

          <Link
            to="/cart"
            className="group bg-white p-6 rounded-2xl border border-stone-200/60 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <ShoppingBag size={22} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                  My Shopping Cart
                </h3>
                <p className="text-xs text-gray-500">Review selected pickles & podis</p>
              </div>
            </div>
            <span className="text-gray-400 group-hover:text-gray-700 transition-colors text-lg font-bold">→</span>
          </Link>
        </motion.div>

        {/* Account Details & Security Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/60 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 flex-1">
              Account Details
            </h2>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100/80 px-4 py-2.5 rounded-xl transition-colors ml-4"
              >
                <Pencil size={16} /> Edit Details
              </button>
            )}
          </div>

          <AnimatePresence>
            {serverError && (
              <motion.div
                className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                <div>
                  <strong className="block text-sm font-semibold">Update Failed</strong>
                  <p className="text-sm">{serverError}</p>
                </div>
              </motion.div>
            )}
            {successMessage && (
              <motion.div
                className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
                <div>
                  <strong className="block text-sm font-semibold">Success</strong>
                  <p className="text-sm">{successMessage}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className={`w-full text-base font-semibold text-gray-800 bg-stone-50 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${errors.name ? 'border-red-400 bg-red-50' : 'border-stone-200/70'
                        }`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.name}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-base font-semibold text-gray-800 bg-stone-50 px-4 py-3 rounded-xl border border-stone-200/70">
                    {user.name}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
                {isEditing ? (
                  <div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className={`w-full text-base font-semibold text-gray-800 bg-stone-50 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${errors.email ? 'border-red-400 bg-red-50' : 'border-stone-200/70'
                        }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.email}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-base font-semibold text-gray-800 bg-stone-50 px-4 py-3 rounded-xl border border-stone-200/70">
                    {user.email}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone Number</label>
                {isEditing ? (
                  <div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        className={`w-full text-base font-semibold text-gray-800 bg-stone-50 pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${errors.phone ? 'border-red-400 bg-red-50' : 'border-stone-200/70'
                          }`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.phone}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-base font-semibold text-gray-800 bg-stone-50 px-4 py-3 rounded-xl border border-stone-200/70">
                    {user.phone || 'Not provided'}
                  </div>
                )}
              </div>
            </div>

            {/* Address Display Section */}
            {!isEditing && (
              <div className="mt-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Saved Delivery Address</label>
                  <div className="text-base font-semibold text-gray-800 bg-stone-50 px-4 py-3 rounded-xl border border-stone-200/70">
                    {user?.addresses && user.addresses.length > 0 ? (
                      <div>
                        {user.addresses.filter(a => a.isDefault).length > 0 ? (
                          user.addresses.filter(a => a.isDefault).map((addr, idx) => (
                            <div key={idx}>
                              <p>{addr.street}</p>
                              <p className="text-sm text-gray-500 font-medium">{addr.state} {(addr.landmark || addr.remarks) ? `- ${addr.landmark || addr.remarks}` : ''}</p>
                            </div>
                          ))
                        ) : (
                          <div>
                            <p>{user.addresses[0].street}</p>
                            <p className="text-sm text-gray-500 font-medium">{user.addresses[0].state} {(user.addresses[0].landmark || user.addresses[0].remarks) ? `- ${user.addresses[0].landmark || user.addresses[0].remarks}` : ''}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 font-normal italic">No address saved yet. You can add one during checkout.</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isEditing && (
              <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-5 py-2.5 rounded-xl transition-colors"
                >
                  <XCircle size={16} /> Cancel
                </button>
                <motion.button
                  type="submit"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#1c1917] hover:bg-[#332e2b] px-5 py-2.5 rounded-xl transition-colors"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} /> Save Changes
                    </>
                  )}
                </motion.button>
              </div>
            )}
          </form>

          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100/80 px-4 py-2.5 rounded-xl transition-colors"
            >
              <KeyRound size={16} /> Reset Password
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-xl transition-colors"
            >
              <LogOut size={16} /> Sign Out of Account
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Profile;