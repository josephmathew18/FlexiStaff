import React, { useState } from 'react';
import {
  Users,
  Building2,
  User,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Send,
  X,
  Plus,
  Eye,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WorkforceCounter from './WorkforceCounter';
import WorkforceCard from './WorkforceCard';
import WorkforceProfile from './WorkforceProfile';
import AssignmentRequestModal from './AssignmentRequestModal';
import { toast } from 'react-toastify';

export const WorkforceSelectionPanel = ({
  project,
  availableWorkforce = [],
  selectedWorkforce = [],
  onToggleSelect,
  onSubmitAssignment,
}) => {
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [profileModalCandidate, setProfileModalCandidate] = useState(null);

  const selectedCount = selectedWorkforce.length;
  const isMaxReached = selectedCount >= 3;

  const profCount = selectedWorkforce.filter(
    (w) => w.roleType === 'Professional' || w.source === 'Partner Company' || Boolean(w.partnerCompany || w.partner)
  ).length;
  const freeCount = selectedWorkforce.filter(
    (w) => w.roleType === 'Freelancer' || w.source === 'Freelancer' || (!w.partnerCompany && !w.partner)
  ).length;

  const handleOpenAssignmentModal = () => {
    if (selectedCount === 0) {
      toast.error('Please select at least 1 workforce member to create an assignment request.');
      return;
    }
    if (selectedCount > 3) {
      toast.error('Maximum 3 workforce members can be assigned to a project.');
      return;
    }
    setIsAssignmentModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Dynamic Counter */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">
                Workforce Selection & Assignment Staging
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                Project: {project?.id || 'Active'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Select proposed talent (Professionals & Freelancers). Then generate an Assignment Request for Admin approval.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAssignmentModal}
            disabled={selectedCount === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={14} />
            <span>Create Assignment Request ({selectedCount})</span>
          </button>
        </div>

        {/* Dynamic Counter with Exact Wording */}
        <WorkforceCounter
          count={selectedCount}
          max={3}
          professionalsCount={profCount}
          freelancersCount={freeCount}
        />
      </div>

      {/* Selected Workforce Strip */}
      {selectedCount > 0 && (
        <div className="p-4 rounded-3xl bg-blue-50/50 border border-blue-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-blue-950">
              Selected Team ({selectedCount} / 3)
            </span>
            <span className="text-[11px] text-blue-700 font-semibold">
              Ready for Assignment Request
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {selectedWorkforce.map((cand) => (
              <div
                key={cand.id}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-blue-200 shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={cand.avatar}
                    alt={cand.name}
                    className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <h5 className="font-bold text-slate-900 text-xs truncate">
                      {cand.name || cand.pseudonym}
                    </h5>
                    <p className="text-[10px] text-blue-600 truncate font-semibold">
                      {cand.role || cand.title}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleSelect(cand)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Remove from selection"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available & Proposed Talent Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Available Candidate Pool ({availableWorkforce.length})
          </h4>
          <span className="text-xs text-slate-500 font-medium">
            Click &quot;Select for Project&quot; to stage
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableWorkforce.map((candidate) => {
            const isSelected = selectedWorkforce.some((s) => s.id === candidate.id);
            return (
              <WorkforceCard
                key={candidate.id}
                candidate={candidate}
                isSelected={isSelected}
                onToggleSelect={onToggleSelect}
                onViewProfile={(c) => setProfileModalCandidate(c)}
                disableSelection={isMaxReached}
              />
            );
          })}
        </div>
      </div>

      {/* Profile Modal */}
      <WorkforceProfile
        isOpen={Boolean(profileModalCandidate)}
        onClose={() => setProfileModalCandidate(null)}
        candidate={profileModalCandidate}
      />

      {/* Assignment Request Submission Modal */}
      <AssignmentRequestModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        project={project}
        selectedWorkforce={selectedWorkforce}
        onSubmit={(notes) => {
          if (onSubmitAssignment) {
            onSubmitAssignment(notes);
          }
          setIsAssignmentModalOpen(false);
        }}
      />
    </div>
  );
};

export default WorkforceSelectionPanel;
