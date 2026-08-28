import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, User, X, Sparkles, Send } from 'lucide-react';
import PartnerCompanyRequest from './PartnerCompanyRequest';
import FreelancerRequest from './FreelancerRequest';

export const WorkforceRequestModal = ({
  isOpen = false,
  onClose,
  project,
  onCandidateSelected,
  defaultTab = 'partner', // 'partner' | 'freelancer'
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  if (!isOpen || !project) return null;

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
          className="relative z-10 w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8"
        >
          {/* Modal Header */}
          <div className="flex items-start justify-between border-b border-slate-100 p-6 bg-slate-50/70">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase text-[#004ac6] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                  {project.id}
                </span>
                <span className="text-xs font-bold text-slate-500">Request Workforce</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mt-1">
                {project.name || project.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Request certified talent from partner companies or independent freelancers.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tab Selection */}
          <div className="flex border-b border-slate-200 px-6 pt-2 bg-white">
            <button
              type="button"
              onClick={() => setActiveTab('partner')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'partner'
                  ? 'border-[#004ac6] text-[#004ac6]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Building2 size={15} />
              <span>Partner Company Professionals</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('freelancer')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'freelancer'
                  ? 'border-[#004ac6] text-[#004ac6]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <User size={15} />
              <span>Independent Freelancer Pool</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {activeTab === 'partner' ? (
              <PartnerCompanyRequest project={project} onClose={onClose} />
            ) : (
              <FreelancerRequest
                project={project}
                onSelectCandidate={(cand) => {
                  if (onCandidateSelected) onCandidateSelected(cand);
                }}
              />
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WorkforceRequestModal;
