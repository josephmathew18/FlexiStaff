import React, { useState } from 'react';
import {
  FolderKanban,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Tag,
  UserCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import StatusBadge from './StatusBadge';
import RejectionReasonModal from './RejectionReasonModal';
import ConfirmationModal from './ConfirmationModal';
import { toast } from 'react-toastify';

export const ProjectApprovalCard = ({
  project,
  onApprove,
  onReject,
  className = '',
}) => {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  if (!project) return null;

  const isPending =
    project.status === 'Pending Admin Approval' ||
    project.status === 'Pending Approval' ||
    project.status === 'Pending Review';

  const skillsList = Array.isArray(project.requiredSkills)
    ? project.requiredSkills
    : String(project.techStack || project.skills || '')
        .split(/[,+]/)
        .map((s) => s.trim())
        .filter(Boolean);

  const handleApproveConfirm = () => {
    if (onApprove) {
      onApprove(project.id);
    }
    setIsApproveModalOpen(false);
  };

  const handleRejectConfirm = (reason) => {
    if (onReject) {
      onReject(project.id, reason);
    }
    setIsRejectModalOpen(false);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${className}`}
      >
        <div className="space-y-3.5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#004ac6] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                  {project.id}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                  {project.priority || 'High'} Priority
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mt-1.5 leading-snug">
                {project.name || project.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                <Building2 size={13} className="text-slate-400" />
                <span>Client: <strong>{project.client || 'Enterprise Client'}</strong></span>
              </p>
            </div>
            <StatusBadge status={project.status} />
          </div>

          {/* Description */}
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
            {project.description}
          </p>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Workforce Req</span>
              <span className="block font-black text-slate-900 text-sm mt-0.5">
                {project.workforceRequired || 3} Members
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Duration</span>
              <span className="block font-bold text-slate-800 truncate mt-0.5">
                {project.duration || '6 Months'}
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Category</span>
              <span className="block font-semibold text-blue-600 truncate mt-0.5">
                {project.category || 'Engineering'}
              </span>
            </div>
          </div>

          {/* Skills Tokens */}
          <div className="flex flex-wrap gap-1.5">
            {skillsList.slice(0, 5).map((sk, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[10px]"
              >
                {sk}
              </span>
            ))}
            {skillsList.length > 5 && (
              <span className="px-1.5 py-0.5 rounded-lg bg-blue-50 text-blue-600 font-bold text-[10px]">
                +{skillsList.length - 5}
              </span>
            )}
          </div>

          {/* Rejection Note if Rejected */}
          {project.rejectionReason && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-[11px] text-rose-800 space-y-0.5">
              <span className="font-bold block">Rejection Feedback:</span>
              <p>{project.rejectionReason}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400 font-medium">
            Start: <strong>{project.startDate || '2026-09-01'}</strong>
          </span>

          {isPending ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsApproveModalOpen(true)}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
              >
                <CheckCircle2 size={13} />
                <span>Approve Project</span>
              </button>
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(true)}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold active:scale-95 transition-all"
              >
                <XCircle size={13} />
                <span>Reject</span>
              </button>
            </div>
          ) : (
            <span className="text-xs font-bold text-slate-500">
              {project.status === 'Approved' ? 'Ready for Manager Matching' : 'Project Evaluated'}
            </span>
          )}
        </div>
      </motion.div>

      {/* Confirmation & Rejection Modals */}
      <ConfirmationModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={handleApproveConfirm}
        title="Approve Client Project"
        message={`Authorize project "${project.name || project.title}" for organization manager workforce allocation and resource matching?`}
        confirmText="Approve Project"
        confirmVariant="success"
      />

      <RejectionReasonModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onSubmit={handleRejectConfirm}
        title={`Reject Requirement: ${project.name || project.title}`}
        subtitle="Explain why this project cannot be approved at this time"
      />
    </>
  );
};

export default ProjectApprovalCard;
