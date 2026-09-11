import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Users,
  Building2,
  User,
  X,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'react-toastify';

export const AssignmentRequestModal = ({
  isOpen = false,
  onClose,
  project,
  selectedWorkforce = [],
  onSubmit,
}) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !project) return null;

  const professionals = selectedWorkforce.filter(
    (w) => w.roleType === 'Professional' || w.source === 'Partner Company' || Boolean(w.partnerCompany || w.partner)
  );

  const freelancers = selectedWorkforce.filter(
    (w) => w.roleType === 'Freelancer' || w.source === 'Freelancer' || (!w.partnerCompany && !w.partner)
  );

  const totalCount = selectedWorkforce.length;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (totalCount === 0) {
      toast.error('Please select at least 1 candidate.');
      return;
    }
    if (professionals.length > 5) {
      toast.error('Maximum 5 Partner Employees can be assigned per project.');
      return;
    }
    if (freelancers.length > 5) {
      toast.error('Maximum 5 Freelancers can be assigned per project.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        onSubmit(notes);
      }
      toast.success('Assignment Request submitted to Company Admin for sign-off!');
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
          className="relative z-10 w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 p-6 bg-slate-50/70">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase text-[#004ac6] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                  {project.id}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                  Assignment Request Gate
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mt-1">
                Create Assignment Request
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Route proposed candidate squad to Company Admin for final authorization.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
            {/* Squad Summary */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase block">
                Selected Candidate Squad ({totalCount})
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block">
                      {professionals.length} / 5 Partner Employees
                    </span>
                    <span className="text-[10px] text-slate-500">Provided by Partner</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                    <User size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block">
                      {freelancers.length} / 5 Freelancers
                    </span>
                    <span className="text-[10px] text-slate-500">Independent talent</span>
                  </div>
                </div>
              </div>

              {/* List of candidates */}
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {selectedWorkforce.map((cand) => (
                  <div
                    key={cand.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={
                          cand.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
                        }
                        alt={cand.name || cand.pseudonym}
                        className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 block truncate">
                          {cand.name || cand.pseudonym}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {cand.role || cand.assignedRole}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border text-slate-700">
                      {cand.source === 'Partner Company' || cand.partnerCompany ? 'Partner' : 'Freelancer'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes Textarea */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Matching Rationale & Manager Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Explain skill match justification, rate agreement, or start date preferences for Company Admin review..."
                className="w-full rounded-2xl border border-slate-300 bg-white p-3 text-xs text-slate-900 outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-[11px] font-medium flex items-start gap-2">
              <ShieldCheck size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <span>
                Once submitted, Company Admin will review the assignment proposal. Upon approval, offers will be sent to the talent.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || totalCount === 0 || professionals.length > 5 || freelancers.length > 5}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={14} />
                <span>{isSubmitting ? 'Submitting...' : 'Send to Admin for Approval'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AssignmentRequestModal;
