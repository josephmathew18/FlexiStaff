import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, CheckCircle2, X, KeyRound } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

export const ForgotPassword = ({ isOpen, onClose, onSuccess }) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your registered email address or username.');
      toast.error('Please enter your email address or username.');
      return;
    }
    if (!newPassword.trim()) {
      setErrorMsg('Please enter your new password.');
      toast.error('Please enter your new password.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter your password.');
      toast.error('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 300));
      const res = await resetPassword(email, newPassword);

      setIsLoading(false);
      if (res && res.success) {
        setIsSubmitted(true);
        toast.success('Password changed successfully!');
        if (onSuccess) {
          onSuccess(email, newPassword);
        }
      } else {
        setErrorMsg(res?.error || 'Failed to update password. Please check your username or email.');
        toast.error(res?.error || 'Failed to update password.');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg('An error occurred while changing password.');
      toast.error('An error occurred while changing password.');
    }
  };

  const handleResetState = () => {
    setEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg('');
    setIsSubmitted(false);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleResetState}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#14132b] p-6 sm:p-7 shadow-2xl space-y-5 text-slate-900 dark:text-white"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={handleResetState}
            className="absolute top-5 right-5 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <X size={18} />
          </button>

          {!isSubmitted ? (
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#004ac6] dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/40 shadow-2xs">
                <KeyRound size={22} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Change Password
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Enter your email/username and set your new password directly.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs font-semibold text-rose-700 dark:text-rose-300">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
                {/* Email / Username */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email Address or Username
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder="e.g. admin, partner@infosys.com, john@example.com"
                      className="w-full rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#1c1a36] py-2.5 pl-10 pr-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder="Enter new password (min. 6 chars)"
                      className="w-full rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#1c1a36] py-2.5 pl-10 pr-10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                    >
                      {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder="Re-enter new password"
                      className="w-full rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#1c1a36] py-2.5 pl-10 pr-10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                    >
                      {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 mt-2 rounded-xl bg-gradient-to-r from-[#004ac6] to-[#2563eb] hover:from-[#003da6] hover:to-[#1d4ed8] text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isLoading ? (
                    <span>Updating Password...</span>
                  ) : (
                    <>
                      <KeyRound size={15} />
                      <span>Update Password Now</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-3 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-100 dark:border-emerald-900/40">
                <CheckCircle2 size={26} />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Password Updated Successfully!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 max-w-xs mx-auto leading-relaxed">
                  The password for <strong className="text-slate-900 dark:text-white">{email}</strong> has been updated. You can now sign in using your new password.
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetState}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to Sign In</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ForgotPassword;
