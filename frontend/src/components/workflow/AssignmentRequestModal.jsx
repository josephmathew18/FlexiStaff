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
    if (totalCount > 3) {
      toast.error('Maximum 3 workforce members can be assigned to a project.');
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
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs text-slate-700 max-h-[72vh] overflow-y-auto">
            {/* Project Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>{project.name || project.title}</span>
                <span className="text-[#004ac6]">{project.duration || '6 Months'}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Client: <strong className="text-slate-700">{project.client || 'Enterprise Client'}</strong> | Required Skills: {project.requiredSkills?.join(', ') || project.techStack}
              </p>
            </div>

            {/* Selected Candidates Summary */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>Selected Workforce Squad ({totalCount} / 3)</span>
                <span className="text-[11px] text-slate-500">
                  {professionals.length} Professional(s) + {freelancers.length} Freelancer(s)
                </span>
              </div>

              <div className="space-y-2">
                {selectedWorkforce.map((cand) => {
                  const isProf = cand.roleType === 'Professional' || cand.source === 'Partner Company' || Boolean(cand.partnerCompany || cand.partner);
                  return (
                    <div
                      key={cand.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={cand.avatar}
                          alt={cand.name}
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs">
                            {cand.name || cand.pseudonym}
                          </h5>
                          <p className="text-[11px] text-blue-600 font-semibold">{cand.role || cand.title}</p>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {isProf ? `Partner: ${cand.partnerCompany || cand.partner || 'Apex'}` : 'Independent Freelancer'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-slate-900 text-xs block">{cand.hourlyRate || '$95/hr'}</span>
                        <span className="text-[10px] text-slate-500 font-medium">Workload: {cand.workload || 0}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Assignment Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assignment Details & Allocation Justification
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detail the sprint architecture alignment, milestone assignments, and expected start date..."
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
              />
            </div>

            {/* Notice */}
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 flex items-center gap-2 text-[11px] text-blue-900">
              <ShieldCheck size={16} className="text-blue-600 shrink-0" />
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
                disabled={isSubmitting || totalCount === 0 || totalCount > 3}
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
