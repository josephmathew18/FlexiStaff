import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2, X, Send } from 'lucide-react';
import { toast } from 'react-toastify';

export const ForgotPassword = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      toast.success('Password reset instructions have been sent to your email.');
    }, 600);
  };

  const handleResetState = () => {
    setEmail('');
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
          className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl space-y-5"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={handleResetState}
            className="absolute top-5 right-5 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>

          {!isSubmitted ? (
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#004ac6] flex items-center justify-center border border-blue-100 shadow-2xs">
                <Mail size={22} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Reset Your Password
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your registered email address and we'll send you instructions to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email or username"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#004ac6] to-[#2563eb] hover:from-[#003da6] hover:to-[#1d4ed8] text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isLoading ? (
                    <span>Sending Reset Link...</span>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <Send size={14} />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-3 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 size={26} />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Check Your Inbox
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 max-w-xs mx-auto leading-relaxed">
                  Password reset instructions have been sent to{' '}
                  <strong className="text-slate-900">{email}</strong>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500">
                For this mini-project demonstration, use the standard demo credentials displayed on the login page.
              </div>

              <button
                type="button"
                onClick={handleResetState}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004ac6] hover:underline"
              >
                <ArrowLeft size={14} />
                <span>Back to Login</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ForgotPassword;
