import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  Briefcase,
  Plus,
  PlayCircle,
  FolderKanban,
  Edit3,
  ShieldCheck,
  Building2,
  X,
  Flame,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

// --- INLINE REUSABLE COMPONENTS ---
const StatusBadge = ({ status = 'Active', type = 'status', size = 'sm' }) => {
  const normalized = String(status).toLowerCase().trim();
  let bg = 'bg-blue-50 text-blue-700 border-blue-200';

  if (type === 'priority') {
    if (['critical', 'urgent'].includes(normalized)) {
      bg = 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
    } else if (['high'].includes(normalized)) {
      bg = 'bg-orange-50 text-orange-700 border-orange-200 font-semibold';
    } else {
      bg = 'bg-slate-50 text-slate-600 border-slate-200';
    }
  } else {
    if (['completed', 'approved'].includes(normalized)) {
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (['in progress', 'planning'].includes(normalized)) {
      bg = 'bg-indigo-50 text-[#004ac6] border-indigo-200';
    } else if (['request', 'pending'].includes(normalized)) {
      bg = 'bg-amber-50 text-amber-700 border-amber-200';
    }
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${bg}`}>
      <span>{status}</span>
    </span>
  );
};

const Modal = ({ isOpen = false, onClose, title, subtitle, children, maxWidth = 'max-w-lg', showCloseButton = true }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`relative z-10 w-full ${maxWidth} rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8`}>
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <div>
                {title && <h3 className="text-base font-bold text-[#191b23]">{title}</h3>}
                {subtitle && <p className="mt-0.5 text-xs text-[#737686]">{subtitle}</p>}
              </div>
              {showCloseButton && (
                <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 transition-colors">
                  <X size={18} />
                </button>
              )}
            </div>
          )}
          <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">{children}</div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    projects = [],
    workforce = [],
    updateProjectStage,
    toggleMilestone,
    updateProject,
    approveProject,
    rejectProject,
    projectMilestones = {},
  } = useData() || {};

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTalentId, setSelectedTalentId] = useState('');
  const [talentRole, setTalentRole] = useState('Senior Engineer');

  const project = (projects || []).find((p) => p && p.id === id);

  if (!project) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <h3 className="text-lg font-bold text-[#191b23]">Project not found</h3>
        <p className="mt-1 text-xs text-[#737686]">
          The project ID <code className="font-mono">{id}</code> does not exist.
        </p>
        <Link
          to="/projects"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-4 py-2 text-xs font-semibold text-white"
        >
          <ArrowLeft size={14} />
          <span>Back to Projects</span>
        </Link>
      </div>
    );
  }

  // Available talent to assign (not already in team)
  const availableToAssign = workforce.filter(
    (w) => !project.assignedResources?.some((r) => r.id === w.id)
  );

  const handleAssignResource = (e) => {
    e.preventDefault();
    if (!selectedTalentId) {
      toast.error('Please select a talent member');
      return;
    }

    const talentObj = workforce.find((w) => w.id === selectedTalentId);
    if (!talentObj) return;

    const newResource = {
      id: talentObj.id,
      name: talentObj.name,
      role: talentRole,
      avatar: talentObj.avatar,
      roleType: talentObj.roleType,
      hoursPerWeek: 40,
    };

    const updatedResources = [...(project.assignedResources || []), newResource];
    updateProject(project.id, { assignedResources: updatedResources });

    toast.success(`Assigned ${talentObj.name} to ${project.title}!`);
    setIsAssignModalOpen(false);
    setSelectedTalentId('');
  };

  const handleMilestoneToggle = (milestoneId) => {
    toggleMilestone(project.id, milestoneId);
    toast.info('Milestone status updated.');
  };

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#004ac6] hover:underline"
        >
          <ArrowLeft size={14} />
          <span>Back to Projects & Requests</span>
        </Link>

        {/* Stage quick transitions */}
        <div className="flex items-center gap-2">
          {project.stage === 'Request' && (
            <button
              type="button"
              onClick={() => {
                updateProjectStage(project.id, 'In Progress');
                toast.success('Project request approved & moved to In Progress!');
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition-all"
            >
              <CheckCircle2 size={14} />
              <span>Approve & Launch</span>
            </button>
          )}

          {project.stage !== 'Completed' && (
            <button
              type="button"
              onClick={() => {
                updateProjectStage(project.id, 'Completed');
                toast.success('Project marked as completed!');
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#1d4ed8] active:scale-95 transition-all"
            >
              <CheckCircle2 size={14} />
              <span>Mark Completed</span>
            </button>
          )}
        </div>
      </div>

      {/* Project Overview Card */}
      <div className="rounded-2xl border border-[#c3c6d7]/70 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="font-mono text-xs font-bold text-[#737686] bg-slate-100 px-2 py-0.5 rounded-md">
                {project.id}
              </span>
              <StatusBadge status={project.stage || project.status} size="md" />
              <StatusBadge status={project.priority} type="priority" size="md" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[#191b23] tracking-tight">
              {project.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#565e74] mt-0.5 font-medium">
              Client: <strong className="text-[#191b23]">{project.client}</strong> • Manager:{' '}
              <strong className="text-[#191b23]">{project.manager}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {(project.status === 'Pending Approval' || project.approvalStatus === 'Pending Admin Review' || project.stage?.includes('Review') || project.stage === 'Request') && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    approveProject(project.id);
                    toast.success(`Project "${project.name || project.title}" approved! Forwarded to Manager.`);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
                >
                  <CheckCircle2 size={15} />
                  <span>Approve Project</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    rejectProject(project.id, 'Scope needs adjustment');
                    toast.warn(`Project "${project.name || project.title}" rejected.`);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-rose-700 hover:bg-rose-100 active:scale-95 transition-all"
                >
                  <X size={15} />
                  <span>Reject</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setIsAssignModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563eb] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#1d4ed8] active:scale-95 transition-all"
            >
              <Plus size={15} />
              <span>Assign Talent</span>
            </button>
          </div>
        </div>

        {/* Progress Bar & Financials */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4 border-t border-slate-100 pt-5">
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-[#737686] block">
              Overall Completion
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold text-[#191b23]">{project.progress}%</span>
              <span className="text-[11px] text-[#565e74]">
                {project.milestones?.filter((m) => m.completed).length} /{' '}
                {project.milestones?.length} Milestones
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  project.progress === 100
                    ? 'bg-emerald-500'
                    : project.progress > 40
                    ? 'bg-[#2563eb]'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-[#737686] block">
              Budget Allocated
            </span>
            <span className="text-xl font-bold font-mono text-[#004ac6] mt-1 block">
              {project.budget}
            </span>
            <span className="text-[11px] text-[#565e74] mt-1 block">
              Spent: {project.spent || '$0'}
            </span>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-[#737686] block">
              Target Deadline
            </span>
            <span className="text-base font-bold text-[#191b23] mt-1 block">
              {project.deadline}
            </span>
            <span className="text-[11px] text-[#565e74] mt-1 block">
              Start: {project.startDate || '2026-01-10'}
            </span>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-[#737686] block">
              Team Headcount
            </span>
            <span className="text-xl font-bold text-[#191b23] mt-1 block">
              {project.assignedResources?.length || 0} Staffed
            </span>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
              ✓ Active Engagement
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Scope & Milestones / Team */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Description & Milestones Tracker */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Description */}
          <div className="rounded-2xl border border-[#c3c6d7]/70 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#191b23] tracking-tight mb-2">
              Scope & Staffing Deliverables
            </h3>
            <p className="text-xs sm:text-sm text-[#434655] leading-relaxed">
              {project.description}
            </p>

            <div className="mt-4 border-t border-slate-100 pt-3">
              <span className="text-[10px] font-bold text-[#737686] uppercase block mb-1.5">
                Required Technology Stack
              </span>
              <div className="flex flex-wrap gap-1.5">
                {project.requiredSkills?.map((s, idx) => (
                  <span
                    key={idx}
                    className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#004ac6] border border-blue-100"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Milestones Tracker */}
          <div className="rounded-2xl border border-[#c3c6d7]/70 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#191b23] tracking-tight">
                  Milestones & Task Checklist
                </h3>
                <p className="text-xs text-[#737686]">
                  Click items to mark complete and automatically update overall project progress.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-slate-50/50">
              {(project.milestones || []).map((m) => {
                const pId = project.id || 'PRJ-2026-001';
                const pMsList = projectMilestones[pId] || [];
                const matchedMs = pMsList.find((item) => item.title?.includes(m.title) || item.id === m.id) || m;
                const msCommits = matchedMs.commits || [];

                return (
                  <div key={m.id} className="p-4 space-y-2 hover:bg-white transition-colors">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={Boolean(m.completed || matchedMs.status === 'Completed')}
                        onChange={() => handleMilestoneToggle(m.id)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#2563eb] focus:ring-[#2563eb]"
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs sm:text-sm font-bold ${
                            m.completed || matchedMs.status === 'Completed' ? 'text-emerald-950 font-bold' : 'text-[#191b23]'
                          }`}
                        >
                          {String(m.title || '').replace(/^Milestone \d+:\s*/i, '')}
                        </p>
                        <span className="text-[11px] text-[#737686] flex items-center gap-1 mt-0.5">
                          <Calendar size={12} className="text-slate-400" />
                          <span>Target: {m.dueDate}</span>
                        </span>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          m.completed || matchedMs.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {m.completed || matchedMs.status === 'Completed' ? 'Completed' : 'In Progress'}
                      </span>
                    </div>

                    {/* Git Commit Log Timeline for Admin */}
                    {msCommits.length > 0 && (
                      <div className="ml-7 border-l-2 border-slate-200 pl-3 space-y-2 pt-1">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          Technical Commit Progress ({msCommits.length} commits)
                        </span>
                        {msCommits.map((cmt) => (
                          <div key={cmt.id} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[9px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                  #{cmt.commitHash}
                                </span>
                                <h6 className="font-bold text-slate-900">{cmt.commitMessage}</h6>
                              </div>
                              <span className="text-[10px] text-slate-400">{cmt.dateTime}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 font-sans leading-relaxed">{cmt.workCompleted}</p>
                            <div className="text-[10px] text-slate-400 pt-0.5">
                              Submitted by: <strong className="text-slate-700">{cmt.authorName}</strong>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Assigned Team Resources */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#c3c6d7]/70 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#191b23] tracking-tight">
                Staffed Engineering Squad
              </h3>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(true)}
                className="text-xs font-semibold text-[#004ac6] hover:underline flex items-center gap-1"
              >
                <Plus size={13} />
                <span>Add</span>
              </button>
            </div>

            <div className="space-y-3">
              {project.assignedResources?.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No resources assigned yet. Click "Assign Talent" to staff this project.
                </div>
              ) : (
                project.assignedResources?.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3"
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#191b23] truncate">
                        {member.name}
                      </h4>
                      <p className="text-[11px] text-[#565e74] truncate">{member.role}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={member.roleType} type="role" size="sm" />
                        <span className="text-[10px] text-[#737686]">
                          {member.hoursPerWeek}h/wk
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assign Resource Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Talent to Project"
        subtitle={`Select an available professional or freelancer for ${project.title}.`}
        size="md"
      >
        <form onSubmit={handleAssignResource} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#434655] mb-1.5">
              Select Talent Resource
            </label>
            <select
              value={selectedTalentId}
              onChange={(e) => setSelectedTalentId(e.target.value)}
              className="w-full rounded-lg border border-[#c3c6d7] bg-white p-2.5 text-xs text-[#191b23] focus:border-[#004ac6] focus:outline-none"
              required
            >
              <option value="">-- Choose talent from workforce pool --</option>
              {availableToAssign.map((talent) => (
                <option key={talent.id} value={talent.id}>
                  {talent.name} ({talent.title} • {talent.roleType} • {talent.availability})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#434655] mb-1.5">
              Assigned Project Role / Title
            </label>
            <input
              type="text"
              value={talentRole}
              onChange={(e) => setTalentRole(e.target.value)}
              placeholder="e.g. Lead Cloud Architect"
              className="w-full rounded-lg border border-[#c3c6d7] bg-white p-2.5 text-xs text-[#191b23] focus:border-[#004ac6] focus:outline-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#2563eb] px-4 py-2 font-semibold text-white shadow-sm hover:bg-[#1d4ed8]"
            >
              Assign to Squad
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetails;
