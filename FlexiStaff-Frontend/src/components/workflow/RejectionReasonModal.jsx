import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, X, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export const RejectionReasonModal = ({
  isOpen = false,
  onClose,
  onSubmit,
  title = 'Reject Project Requirement',
  subtitle = 'Provide rejection feedback and instructions',
  placeholder = 'Specify the reason for rejection (e.g. scope budget, timeline adjustment, or resource availability)...',
  submitText = 'Confirm Rejection',
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Please enter a rejection reason.');
      return;
    }
    setIsSubmitting(true);
    try {
      onSubmit(reason.trim());
      setReason('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative z-10 w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8"
        >
          <div className="flex items-start justify-between border-b border-slate-100 p-5 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <XCircle size={18} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
                <p className="text-[11px] text-slate-500">{subtitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Rejection Reason & Feedback *
              </label>
              <textarea
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={placeholder}
                required
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-all"
              />
            </div>

            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-2 text-[11px] text-rose-800">
              <AlertCircle size={14} className="shrink-0 text-rose-600" />
              <span>This feedback will be communicated directly to the applicant for modification.</span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : submitText}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RejectionReasonModal;
