import React, { useState } from 'react';
import {
  FolderKanban,
  Building2,
  User,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StatusBadge from './StatusBadge';
import RejectionReasonModal from './RejectionReasonModal';
import ConfirmationModal from './ConfirmationModal';
import { toast } from 'react-toastify';

export const AssignmentApprovalPanel = ({
  assignment,
  project,
  onApprove,
  onReject,
  className = '',
}) => {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  if (!assignment) return null;

  const isPending =
    assignment.status === 'Pending Admin Approval' ||
    assignment.status === 'Pending Assignment Approval';

  const isProf =
    assignment.roleType === 'Professional' ||
    assignment.source === 'Partner Company' ||
    Boolean(assignment.partnerName && !assignment.partnerName.toLowerCase().includes('freelancer'));

  const handleApproveConfirm = () => {
    if (onApprove) {
      onApprove(assignment.id);
    }
    setIsApproveModalOpen(false);
  };

  const handleRejectConfirm = (reason) => {
    if (onReject) {
      onReject(assignment.id, reason);
    }
    setIsRejectModalOpen(false);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${className}`}
      >
        <div className="space-y-3.5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase text-[#004ac6] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                  {assignment.id}
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  Project: <strong>{assignment.projectId || project?.id}</strong>
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mt-1.5 leading-snug">
                {assignment.projectName || project?.name || 'Enterprise Project'}
              </h3>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                <Building2 size={13} className="text-slate-400" />
                <span>Client: <strong>{assignment.client || project?.client || 'Enterprise'}</strong></span>
                <span className="text-slate-300">•</span>
                <span>Manager: <strong>{assignment.manager || 'Alex Morgan'}</strong></span>
              </p>
            </div>
            <StatusBadge status={assignment.status} />
          </div>

          {/* Candidate Card */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={
                    assignment.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
                  }
                  alt={assignment.professionalName}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white shadow-2xs shrink-0"
                />
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs">
                    {assignment.professionalName}
                  </h4>
                  <p className="text-xs font-bold text-blue-600">{assignment.role}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {isProf ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                        <Building2 size={10} />
                        <span>Partner: {assignment.partnerName || 'Apex Digital'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-100">
                        <User size={10} />
                        <span>Independent Freelancer</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="font-black text-slate-900 text-xs block">{assignment.hourlyRate || '$95/hr'}</span>
                <span className="text-[10px] text-slate-500 font-medium">Workload: {assignment.workload || 0}%</span>
              </div>
            </div>

            {assignment.notes && (
              <p className="text-[11px] text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-100">
                &ldquo;{assignment.notes}&rdquo;
              </p>
            )}
          </div>

          {/* Rejection Note */}
          {assignment.rejectionReason && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-[11px] text-rose-800 space-y-0.5">
              <span className="font-bold block">Admin Rejection Reason:</span>
              <p>{assignment.rejectionReason}</p>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400 font-medium">
            Assigned: <strong>{assignment.assignedDate || 'Today'}</strong>
          </span>

          {isPending ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsApproveModalOpen(true)}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
              >
                <CheckCircle2 size={13} />
                <span>Approve Assignment</span>
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
              {assignment.status === 'Awaiting Workforce Response'
                ? 'Offer Routed to Candidate'
                : 'Assignment Finalized'}
            </span>
          )}
        </div>
      </motion.div>

      {/* Confirmation & Rejection Modals */}
      <ConfirmationModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={handleApproveConfirm}
        title="Approve Assignment Request"
        message={`Authorize assignment of ${assignment.professionalName} for "${assignment.projectName}". Candidate will receive project offer.`}
        confirmText="Approve Assignment"
        confirmVariant="success"
      />

      <RejectionReasonModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onSubmit={handleRejectConfirm}
        title={`Reject Assignment: ${assignment.professionalName}`}
        subtitle="Explain why this assignment proposal is rejected and returned to manager"
      />
    </>
  );
};

export default AssignmentApprovalPanel;
