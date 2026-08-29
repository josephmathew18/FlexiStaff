import React, { useState } from 'react';
import {
  FolderKanban,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  Briefcase,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import StatusBadge from './StatusBadge';
import ConfirmationModal from './ConfirmationModal';
import RejectionReasonModal from './RejectionReasonModal';
import { toast } from 'react-toastify';

export const AssignmentResponseCard = ({
  assignment,
  project,
  onAccept,
  onDecline,
  className = '',
}) => {
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);

  if (!assignment) return null;

  const isAwaitingResponse =
    assignment.status === 'Awaiting Workforce Response' ||
    assignment.status === 'Pending Assignment Approval';

  const handleAcceptConfirm = () => {
    if (onAccept) {
      onAccept(assignment.id);
    }
    setIsAcceptModalOpen(false);
  };

  const handleDeclineConfirm = (reason) => {
    if (onDecline) {
      onDecline(assignment.id, reason);
    }
    setIsDeclineModalOpen(false);
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
                  {assignment.projectId || 'PRJ-101'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                  Admin Authorized
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mt-1.5 leading-snug">
                {assignment.projectName || project?.name || 'Enterprise Project'}
              </h3>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                <Building2 size={13} className="text-slate-400" />
                <span>Client: <strong>{assignment.client || 'Enterprise Client'}</strong></span>
                <span className="text-slate-300">•</span>
                <span>Manager: <strong>{assignment.manager || 'Alex Morgan'}</strong></span>
              </p>
            </div>
            <StatusBadge status={assignment.status} />
          </div>

          {/* Role & Rate Badge */}
          <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-bold text-blue-500 uppercase">Offered Role</span>
              <h4 className="font-extrabold text-slate-900 text-xs mt-0.5">{assignment.role}</h4>
            </div>
            <div className="text-right">
              <span className="block text-[10px] font-bold text-blue-500 uppercase">Compensation</span>
              <span className="font-black text-slate-900 text-xs">{assignment.hourlyRate || '$110/hr'}</span>
            </div>
          </div>

          {/* Timeline & Duration */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Duration</span>
              <span className="block font-bold text-slate-800 truncate mt-0.5">{assignment.duration || '6 Months'}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Start Date</span>
              <span className="block font-bold text-slate-800 truncate mt-0.5">{assignment.startDate || '2026-09-01'}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Expected End</span>
              <span className="block font-bold text-slate-800 truncate mt-0.5">{assignment.expectedEndDate || '2027-02-28'}</span>
            </div>
          </div>

          {/* Assignment Notes */}
          {assignment.notes && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <span className="font-bold text-slate-900 block mb-0.5">Manager Instructions:</span>
              <p>{assignment.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400">
            {assignment.status === 'Accepted' ? 'Active on Sprint' : 'Awaiting your response'}
          </span>

          {isAwaitingResponse ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAcceptModalOpen(true)}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <CheckCircle2 size={13} />
                <span>Accept Assignment</span>
              </button>
              <button
                type="button"
                onClick={() => setIsDeclineModalOpen(true)}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold active:scale-95 transition-all"
              >
                <XCircle size={13} />
                <span>Reject</span>
              </button>
            </div>
          ) : (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              Assignment Accepted
            </span>
          )}
        </div>
      </motion.div>

      {/* Confirmation & Decline Modals */}
      <ConfirmationModal
        isOpen={isAcceptModalOpen}
        onClose={() => setIsAcceptModalOpen(false)}
        onConfirm={handleAcceptConfirm}
        title="Accept Project Assignment"
        message={`Confirm acceptance of assignment for "${assignment.projectName}" as ${assignment.role}. Your status will update to Assigned and project execution will begin.`}
        confirmText="Accept & Start Project"
        confirmVariant="success"
      />

      <RejectionReasonModal
        isOpen={isDeclineModalOpen}
        onClose={() => setIsDeclineModalOpen(false)}
        onSubmit={handleDeclineConfirm}
        title={`Decline Assignment Offer`}
        subtitle="Please specify reason for declining (e.g. scheduling conflict, bandwidth)"
        submitText="Decline Offer"
      />
    </>
  );
};

export default AssignmentResponseCard;
