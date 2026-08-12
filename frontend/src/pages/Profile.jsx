import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Shield, ShoppingBag, ArrowLeft, LogOut, KeyRound, Clock, Phone } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const userInfoStr = localStorage.getItem('userInfo');
  const user = userInfoStr ? JSON.parse(userInfoStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/login');
    window.location.reload();
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
          <div className="h-28 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 bg-gradient-to-r from-[#1c1917] via-[#3d2e1e] to-[#78350f] relative flex items-end px-8 pb-4">
            <span className="text-xs font-semibold tracking-wider uppercase text-amber-200/80">
              Omris Home Kitchen Member
            </span>
          </div>

          {/* User Info Container */}
          <div className="relative flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-12 gap-4">
            <div className="flex items-end gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-lg border-4 border-white flex-shrink-0">
                {getInitials(user.name)}
              </div>
              <div className="mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1917] capitalize">
                  {user.name}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <Mail size={14} className="text-amber-600" />
                  <span>{user.email}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                user.role === 'admin'
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
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">
            Account Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
              <div className="text-base font-semibold text-gray-800 bg-stone-50 px-4 py-3 rounded-xl border border-stone-200/70">
                {user.name}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
              <div className="text-base font-semibold text-gray-800 bg-stone-50 px-4 py-3 rounded-xl border border-stone-200/70">
                {user.email}
              </div>
            </div>
          </div>

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
