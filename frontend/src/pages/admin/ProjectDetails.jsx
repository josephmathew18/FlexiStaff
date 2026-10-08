import React, { useState, useMemo } from 'react';
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
  Check,
  Flame,
  User,
  Eye,
  Star,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { useData, getPartnerCompanyName, mapBackendProjectToFrontend } from '../../context/DataContext';
import api from '../../services/api';
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
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`relative z-10 w-full ${maxWidth} rounded-2xl bg-white dark:bg-[#14132b] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden my-8`}>
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-white/10 px-6 py-4 bg-slate-50/50 dark:bg-[#1c1a36]/50">
              <div>
                {title && <h3 className="text-base font-bold text-[#191b23] dark:text-white">{title}</h3>}
                {subtitle && <p className="mt-0.5 text-xs text-[#737686] dark:text-slate-400">{subtitle}</p>}
              </div>
              {showCloseButton && (
                <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors">
                  <X size={18} />
                </button>
              )}
            </div>
          )}
          <div className="px-6 py-5 max-h-[75vh] overflow-y-auto text-slate-800 dark:text-slate-200">{children}</div>
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
    partnerWorkforce = [],
    partners = [],
    clients = [],
    managers = [],
    managerAssignments = [],
    projectMilestones = {},
    updateProjectStage,
    toggleMilestone,
    refreshProjects,
    updateProject,
    approveProject,
    rejectProject,
    approveWorkforceAssignment,
    rejectWorkforceAssignment,
  } = useData() || {};

  React.useEffect(() => {
    if (refreshProjects) {
      refreshProjects();
    }
  }, []);

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [selectedManagerName, setSelectedManagerName] = useState(managers[0]?.name || '');

  React.useEffect(() => {
    if (!selectedManagerName && managers.length > 0) {
      setSelectedManagerName(managers[0].name);
    }
  }, [managers, selectedManagerName]);

  // Rejection modal state for candidate squad proposals
  const [rejectSquadModal, setRejectSquadModal] = useState({ isOpen: false, member: null, reason: '' });

  // Candidate Details View Modal State
  const [selectedCandidateDetails, setSelectedCandidateDetails] = useState(null);

  const getEnrichedCandidate = (member) => {
    if (!member) return null;
    const candIdStr = String(member.professionalId || member.id || '').toLowerCase().trim();
    const candNameLower = String(member.professionalName || member.name || '').toLowerCase().trim();
    const candEmailLower = String(member.email || '').toLowerCase().trim();

    const masterCandidate =
      (workforce || []).find((w) => {
        if (!w) return false;
        const wId = String(w.id || '').toLowerCase().trim();
        const wName = String(w.name || w.pseudonym || '').toLowerCase().trim();
        const wEmail = String(w.email || '').toLowerCase().trim();
        return (candIdStr && wId === candIdStr) || (candNameLower && wName === candNameLower) || (candEmailLower && wEmail === candEmailLower);
      }) ||
      (partnerWorkforce || []).find((w) => {
        if (!w) return false;
        const wId = String(w.id || '').toLowerCase().trim();
        const wName = String(w.name || w.pseudonym || '').toLowerCase().trim();
        const wEmail = String(w.email || '').toLowerCase().trim();
        return (candIdStr && wId === candIdStr) || (candNameLower && wName === candNameLower) || (candEmailLower && wEmail === candEmailLower);
      });

    const rawSkills = member.skills || masterCandidate?.skills || [];
    const skillsArr = Array.isArray(rawSkills)
      ? rawSkills
      : String(rawSkills).split(/[,+]/).map((s) => s.trim()).filter(Boolean);

    const resolvedPartnerName = getPartnerCompanyName(member, partners, clients);

    return {
      ...member,
      professionalName: member.professionalName || member.name || masterCandidate?.name || masterCandidate?.pseudonym || '',
      avatar: member.avatar || masterCandidate?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      email: member.email || masterCandidate?.email || '',
      phone: member.phone || masterCandidate?.phone || '',
      location: member.location || masterCandidate?.location || '',
      bio: member.bio || masterCandidate?.bio || masterCandidate?.summary || member.notes || '',
      experience: member.experience || masterCandidate?.experience || '',
      hourlyRate: member.hourlyRate || masterCandidate?.hourlyRate || '',
      rating: member.rating || masterCandidate?.rating || null,
      skills: skillsArr,
      partnerName: member.partnerCompanyName || resolvedPartnerName || (member.partnerName && member.partnerName !== 'FlexiStaff Partner' && member.partnerName !== 'Partner Organization' ? member.partnerName : ''),
      roleType: member.roleType || (member.workforceType === 'Partner Company' ? 'Professional' : 'Freelancer'),
    };
  };

  const decodedId = decodeURIComponent(id || '').trim();
  const normalizedId = decodedId.toLowerCase().replace(/[\s_]/g, '-');
  const targetNumId = decodedId.replace(/\D/g, '');

  const [dbProject, setDbProject] = useState(null);
  const [loadingDb, setLoadingDb] = useState(false);

  const fetchProjectDetails = React.useCallback(async () => {
    const projId = targetNumId || decodedId;
    if (!projId) return;
    try {
      setLoadingDb(true);
      const res = await api.projects.getById(projId);
      if (res && res.success && res.data) {
        setDbProject(mapBackendProjectToFrontend(res.data));
      }
    } catch (err) {
      console.warn('Failed to fetch project details from backend API:', err);
    } finally {
      setLoadingDb(false);
    }
  }, [targetNumId, decodedId]);

  React.useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  const contextProject = useMemo(() => {
    return (projects || []).find((p) => {
      if (!p || p.id === undefined || p.id === null) return false;
      const pidLower = String(p.id).toLowerCase().trim();
      const pidNormalized = pidLower.replace(/[\s_]/g, '-');
      const pNumId = pidLower.replace(/\D/g, '');

      const isDirectMatch = pidLower === decodedId.toLowerCase() || pidNormalized === normalizedId;
      const isNumMatch = Boolean(targetNumId && pNumId && targetNumId === pNumId);

      return isDirectMatch || isNumMatch;
    });
  }, [projects, decodedId, normalizedId, targetNumId]);

  const project = dbProject || contextProject;

  // Real Database-backed Project Workforce Allocations
  const projectAllocations = useMemo(() => {
    if (!project) return [];
    const list = [];
    const seen = new Set();

    const addAlloc = (a) => {
      if (!a) return;
      const aName = (a.professionalName || a.name || '').toLowerCase();
      const aEmail = (a.email || a.professionalEmail || '').toLowerCase();
      if (aName.includes('sharon') || aEmail.includes('sharon')) return;

      const key = `${a.id || a.allocationId || ''}_${a.professionalId || a.id || ''}_${a.professionalName || a.name || ''}`;
      if (!seen.has(key)) {
        seen.add(key);
        list.push(a);
      }
    };

    // 1. Allocations directly attached to project entity from PostgreSQL
    (project.allocations || []).forEach(addAlloc);
    (project.assignedResources || []).forEach(addAlloc);

    // 2. Also check managerAssignments if staged in current session
    const normProjId = (val) => String(val || '').toLowerCase().replace(/[\s_]/g, '-').trim();
    const targetNormId = normProjId(project.id);
    const targetTitle = (project.title || project.name || '').toLowerCase().trim();

    (managerAssignments || []).forEach((a) => {
      if (!a) return;
      const aProjId = normProjId(a.projectId);
      const aProjName = (a.projectName || '').toLowerCase().trim();
      const isIdMatch = targetNormId && (aProjId === targetNormId || aProjId.replace(/-/g, '') === targetNormId.replace(/-/g, ''));
      const isTitleMatch = targetTitle && (aProjName === targetTitle || aProjName.includes(targetTitle) || targetTitle.includes(aProjName));
      if (isIdMatch || isTitleMatch) {
        addAlloc(a);
      }
    });

    return list;
  }, [project, managerAssignments]);

  const pendingSquadMembers = useMemo(() => {
    return projectAllocations.filter((a) => {
      const st = String(a.status || '').toUpperCase().trim();
      return (
        st === 'PENDING' ||
        st === 'PENDING_ADMIN_APPROVAL' ||
        st === 'PROPOSED' ||
        st.includes('AWAITING') ||
        st.includes('PENDING')
      ) && st !== 'ACTIVE' && st !== 'ACCEPTED' && st !== 'REJECTED' && st !== 'DECLINED';
    });
  }, [projectAllocations]);

  const activeSquad = useMemo(() => {
    return projectAllocations.filter((a) => {
      const st = String(a.status || '').toUpperCase().trim();
      return st === 'ACTIVE' || st === 'ACCEPTED' || st === 'WORKING' || st === 'APPROVED';
    });
  }, [projectAllocations]);

  const combinedActiveResources = activeSquad;

  const displayMilestones = useMemo(() => {
    if (!project) return [];
    const default5 = [
      { id: 'ms-01', title: 'Requirement Analysis', status: 'Pending', dueDate: project.startDate || '2026-10-15' },
      { id: 'ms-02', title: 'UI/UX & System Design', status: 'Pending', dueDate: project.startDate || '2026-11-01' },
      { id: 'ms-03', title: 'Backend & Database Development', status: 'Pending', dueDate: project.endDate || '2026-12-15' },
      { id: 'ms-04', title: 'Frontend & Integration', status: 'Pending', dueDate: project.endDate || '2027-01-20' },
      { id: 'ms-05', title: 'Testing, Deployment & Final Delivery', status: 'Pending', dueDate: project.endDate || '2027-02-28' },
    ];

    const rawMsList = project.milestones || [];
    const cleanMsList = rawMsList.filter((m) => {
      if (!m || !m.title) return false;
      const t = String(m.title).toLowerCase();
      return !t.includes('kickoff') && !t.includes('feature engineering') && !t.includes('handover') && !t.includes('blueprint') && !t.includes('uat');
    });

    return default5.map((def, idx) => {
      const match = cleanMsList.find((m) => m.title && m.title.toLowerCase().trim() === def.title.toLowerCase().trim()) || cleanMsList[idx];
      if (match) {
        const isCompleted = Boolean(match.completed || match.status === 'Completed' || match.status === 'COMPLETED' || match.progressPercentage === 100);
        const isStarted = !isCompleted && Boolean(match.status === 'In Progress' || match.status === 'IN_PROGRESS' || (match.progressPercentage > 0 && match.progressPercentage < 100));
        const statusText = isCompleted ? 'Completed' : isStarted ? 'In Progress' : 'Pending';
        return {
          ...def,
          ...match,
          id: match.id || def.id,
          title: def.title,
          completed: isCompleted,
          status: statusText,
        };
      }
      return def;
    });
  }, [project]);

  const completedMilestonesCount = useMemo(() => {
    return displayMilestones.filter((m) => m.completed || m.status === 'Completed' || m.status === 'COMPLETED').length;
  }, [displayMilestones]);

  const overallCompletionPercentage = useMemo(() => {
    if (completedMilestonesCount === 1) return 10;
    if (completedMilestonesCount === 2) return 30;
    if (completedMilestonesCount === 3) return 55;
    if (completedMilestonesCount === 4) return 80;
    if (completedMilestonesCount >= 5) return 100;
    return 0;
  }, [completedMilestonesCount]);

  if (!project) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14132b] p-12 text-center">
        <h3 className="text-lg font-bold text-[#191b23] dark:text-white">Project not found</h3>
        <p className="mt-1 text-xs text-[#737686] dark:text-slate-400">
          The project ID <code className="font-mono">{id}</code> does not exist.
        </p>
        <Link
          to="/admin/projects"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-4 py-2 text-xs font-semibold text-white"
        >
          <ArrowLeft size={14} />
          <span>Back to Projects</span>
        </Link>
      </div>
    );
  }

  const isPendingApproval =
    project.status === 'Pending Admin Approval' ||
    project.stage === 'Pending Admin Approval' ||
    project.status === 'Pending Approval' ||
    project.stage === 'Request' ||
    project.status === 'Pending';

  const pendingSquadApprovalCount = pendingSquadMembers.length;

  const handleApproveProject = (e) => {
    e.preventDefault();
    if (!selectedManagerName) {
      toast.error('Please select an HR Manager to assign.');
      return;
    }

    approveProject(project.id, selectedManagerName);
    toast.success(`Project "${project.title}" approved and assigned to HR Manager ${selectedManagerName}! Forwarded for workforce matching.`);
    setIsApproveModalOpen(false);
  };

  const handleMilestoneToggle = (milestoneId) => {
    toggleMilestone(project.id, milestoneId);
    toast.info('Milestone status updated.');
  };

  const handleApproveCandidate = async (assignmentId, candidateName) => {
    const numId = typeof assignmentId === 'number' ? assignmentId : parseInt(String(assignmentId).replace(/\D/g, ''), 10);
    if (!isNaN(numId) && numId > 0) {
      try {
        await api.workforce.updateStatus(numId, 'ACTIVE');
      } catch (err) {
        console.warn('Backend workforce status update error:', err);
      }
    }
    approveWorkforceAssignment(assignmentId);
    toast.success(`Approved squad member "${candidateName}". Project status updated to In Progress!`);
    fetchProjectDetails();
  };

  const handleApproveAllPendingSquad = async () => {
    for (const mem of pendingSquadMembers) {
      const targetId = mem.id || mem.allocationId;
      const numId = typeof targetId === 'number' ? targetId : parseInt(String(targetId).replace(/\D/g, ''), 10);
      if (!isNaN(numId) && numId > 0) {
        try {
          await api.workforce.updateStatus(numId, 'ACTIVE');
        } catch (err) {
          console.warn('Backend workforce status update error:', err);
        }
      }
      approveWorkforceAssignment(targetId);
    }
    toast.success(`Approved all ${pendingSquadMembers.length} proposed squad member(s)! Project status updated to In Progress.`);
    fetchProjectDetails();
  };

  const handleRejectCandidateSubmit = async (e) => {
    e.preventDefault();
    if (!rejectSquadModal.member) return;
    if (!rejectSquadModal.reason.trim()) {
      toast.error('Please enter a reason for rejecting this candidate proposal.');
      return;
    }
    const memId = rejectSquadModal.member.id || rejectSquadModal.member.allocationId;
    const numId = typeof memId === 'number' ? memId : parseInt(String(memId).replace(/\D/g, ''), 10);
    if (!isNaN(numId) && numId > 0) {
      try {
        await api.workforce.updateStatus(numId, 'REJECTED');
      } catch (err) {
        console.warn('Backend workforce rejection error:', err);
      }
    }
    rejectWorkforceAssignment(memId, rejectSquadModal.reason);
    toast.info(`Rejected candidate proposal for "${rejectSquadModal.member.professionalName || rejectSquadModal.member.name}".`);
    setRejectSquadModal({ isOpen: false, member: null, reason: '' });
    fetchProjectDetails();
  };

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#004ac6] dark:text-blue-400 hover:underline"
        >
          <ArrowLeft size={14} />
          <span>Back to Projects & Requests</span>
        </Link>
      </div>

      {/* Pending Approval Banner */}
      {isPendingApproval && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-amber-50/70 dark:bg-amber-950/30 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 font-bold">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                Client Project Request Pending Admin Approval
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-0.5 max-w-2xl leading-relaxed">
                This project request was submitted by <strong>{project.client}</strong> and requires Admin approval. Upon approval, an HR Manager will be assigned to match Partner and Freelance workforce talent.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsApproveModalOpen(true)}
            className="rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs font-bold text-slate-900 shadow-md active:scale-95 transition-all shrink-0 flex items-center gap-1.5"
          >
            <CheckCircle2 size={15} />
            <span>Approve & Assign HR Manager</span>
          </button>
        </div>
      )}

      {/* Project Overview Card */}
      <div className="rounded-2xl border border-[#c3c6d7]/70 dark:border-white/10 bg-white dark:bg-[#14132b] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="font-mono text-xs font-bold text-[#737686] dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                Project #{typeof project.id === 'number' ? project.id : (String(project.id).replace(/\D/g, '') || project.id)}
              </span>
              <StatusBadge status={project.stage || project.status} size="md" />
              <StatusBadge status={project.priority} type="priority" size="md" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[#191b23] dark:text-white tracking-tight">
              {project.title || project.name}
            </h2>
            <p className="text-xs sm:text-sm text-[#565e74] dark:text-slate-400 mt-0.5 font-medium">
              Client: <strong className="text-[#191b23] dark:text-white">{project.clientCompanyName || project.clientName || project.client}</strong> • Manager:{' '}
              <strong className="text-[#191b23] dark:text-white">{(project.manager && project.manager !== 'System Administrator' && project.manager !== 'System Admin') ? project.manager : (project.managerName && project.managerName !== 'System Administrator' && project.managerName !== 'System Admin') ? project.managerName : 'Unassigned'}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isPendingApproval ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsApproveModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
                >
                  <CheckCircle2 size={15} />
                  <span>Approve & Assign HR Manager</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    rejectProject(project.id, 'Scope needs adjustment');
                    toast.warn(`Project "${project.name || project.title}" rejected.`);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/50 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 active:scale-95 transition-all"
                >
                  <X size={15} />
                  <span>Reject Request</span>
                </button>
              </>
            ) : pendingSquadApprovalCount > 0 ? (
              <button
                type="button"
                onClick={handleApproveAllPendingSquad}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm active:scale-95 transition-all animate-pulse"
              >
                <ShieldCheck size={15} />
                <span>Approve All {pendingSquadApprovalCount} Pending Squad Member(s)</span>
              </button>
            ) : (
              <Link
                to="/admin/assignment-approvals"
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-[#004ac6] dark:text-blue-400 border border-indigo-200 dark:border-indigo-800/40 px-3.5 py-2.5 text-xs font-bold hover:bg-indigo-100 transition-all"
              >
                <ShieldCheck size={15} />
                <span>Squad Approvals Gate</span>
              </Link>
            )}
          </div>
        </div>

        {/* Progress Bar & Financials */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4 border-t border-slate-100 dark:border-white/10 pt-5">
          <div className="rounded-xl bg-slate-50 dark:bg-[#1c1a36] p-3.5 border border-slate-100 dark:border-white/10">
            <span className="text-[10px] uppercase font-bold text-[#737686] dark:text-slate-400 block">
              Overall Completion
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold text-[#191b23] dark:text-white">{overallCompletionPercentage}%</span>
              <span className="text-[11px] text-[#565e74] dark:text-slate-400">
                {completedMilestonesCount} / 5 Milestones
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  overallCompletionPercentage === 100
                    ? 'bg-emerald-500'
                    : overallCompletionPercentage > 40
                    ? 'bg-[#2563eb]'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${overallCompletionPercentage}%` }}
              />
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-[#1c1a36] p-3.5 border border-slate-100 dark:border-white/10">
            <span className="text-[10px] uppercase font-bold text-[#737686] dark:text-slate-400 block">
              Budget Allocated
            </span>
            <span className="text-xl font-bold font-mono text-[#004ac6] dark:text-blue-400 mt-1 block">
              {project.budget}
            </span>
            <span className="text-[11px] text-[#565e74] dark:text-slate-400 mt-1 block">
              Spent: {project.spent || '$0'}
            </span>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-[#1c1a36] p-3.5 border border-slate-100 dark:border-white/10">
            <span className="text-[10px] uppercase font-bold text-[#737686] dark:text-slate-400 block">
              Target Deadline
            </span>
            <span className="text-base font-bold text-[#191b23] dark:text-white mt-1 block">
              {project.deadline}
            </span>
            <span className="text-[11px] text-[#565e74] dark:text-slate-400 mt-1 block">
              Start: {project.startDate || '2026-01-10'}
            </span>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-[#1c1a36] p-3.5 border border-slate-100 dark:border-white/10">
            <span className="text-[10px] uppercase font-bold text-[#737686] dark:text-slate-400 block">
              Team Headcount
            </span>
            <span className="text-xl font-bold text-[#191b23] dark:text-white mt-1 block">
              {combinedActiveResources.length} Active / {combinedActiveResources.length + pendingSquadMembers.length} Total
            </span>
            {pendingSquadMembers.length > 0 ? (
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold mt-1 block">
                {pendingSquadMembers.length} Staged Pending Sign-off
              </span>
            ) : (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">
                ✓ Active Engagement
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Scope & Milestones / Team */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Description & Milestones Tracker */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Description */}
          <div className="rounded-2xl border border-[#c3c6d7]/70 dark:border-white/10 bg-white dark:bg-[#14132b] p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#191b23] dark:text-white tracking-tight mb-2">
              Scope & Staffing Deliverables
            </h3>
            <p className="text-xs sm:text-sm text-[#434655] dark:text-slate-300 leading-relaxed">
              {project.description}
            </p>

            <div className="mt-4 border-t border-slate-100 dark:border-white/10 pt-3">
              <span className="text-[10px] font-bold text-[#737686] dark:text-slate-400 uppercase block mb-1.5">
                Required Technology Stack
              </span>
              <div className="flex flex-wrap gap-1.5">
                {project.requiredSkills?.map((s, idx) => (
                  <span
                    key={idx}
                    className="rounded-md bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 text-xs font-semibold text-[#004ac6] dark:text-blue-300 border border-blue-100 dark:border-blue-800/50"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Milestones Tracker */}
          <div className="rounded-2xl border border-[#c3c6d7]/70 dark:border-white/10 bg-white dark:bg-[#14132b] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#191b23] dark:text-white tracking-tight">
                  Milestones & Task Checklist
                </h3>
                <p className="text-xs text-[#737686] dark:text-slate-400">
                  Click items to mark complete and automatically update overall project progress.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/10 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-[#1c1a36]/50">
              {displayMilestones.map((m) => {
                const pId = project?.id || 'PRJ-2026-001';
                const pMsList = (projectMilestones && (projectMilestones[pId] || projectMilestones[String(pId)])) ? (projectMilestones[pId] || projectMilestones[String(pId)]) : [];
                const matchedMs = pMsList.find((item) => item?.title?.toLowerCase() === m.title?.toLowerCase() || item?.id === m.id) || m;
                const msCommits = matchedMs.commits || m.commits || [];

                const isCompleted = Boolean(m.completed || m.status === 'Completed' || m.status === 'COMPLETED' || matchedMs.status === 'Completed' || matchedMs.status === 'COMPLETED');
                const isStarted = !isCompleted && (m.status === 'In Progress' || m.status === 'IN_PROGRESS' || matchedMs.status === 'In Progress' || msCommits.length > 0);
                const statusText = isCompleted ? 'Completed' : isStarted ? 'In Progress' : 'Pending';

                  return (
                    <div key={m.id || m.title} className="p-4 space-y-2 hover:bg-white dark:hover:bg-[#14132b] transition-colors">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isCompleted}
                          onChange={() => handleMilestoneToggle(m.id)}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-[#2563eb] focus:ring-[#2563eb]"
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-xs sm:text-sm font-bold ${
                              isCompleted ? 'text-emerald-950 dark:text-emerald-300 font-bold' : 'text-[#191b23] dark:text-white'
                            }`}
                          >
                            {String(m.title || '').replace(/^Milestone \d+:\s*/i, '').replace(/\s*\(\d+%\)/g, '').replace(/\s*-\s*\d+%/g, '').trim()}
                          </p>
                          <span className="text-[11px] text-[#737686] dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar size={12} className="text-slate-400 dark:text-slate-500" />
                            <span>Target: {m.dueDate || m.deadline || project.endDate || '2027-02-28'}</span>
                          </span>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            isCompleted
                              ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                              : isStarted
                              ? 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300'
                              : 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {statusText}
                        </span>
                      </div>

                      {/* Git Commit Log Timeline for Admin */}
                      {msCommits.length > 0 && (
                        <div className="ml-7 border-l-2 border-slate-200 dark:border-white/10 pl-3 space-y-2 pt-1">
                          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                            Technical Commit Progress ({msCommits.length} commits)
                          </span>
                          {msCommits.map((cmt) => (
                            <div key={cmt.id} className="p-2.5 rounded-xl bg-white dark:bg-[#14132b] border border-slate-200 dark:border-white/10 text-xs space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-[9px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10">
                                    #{cmt.commitHash}
                                  </span>
                                  <h6 className="font-bold text-slate-900 dark:text-white">{cmt.commitMessage}</h6>
                                </div>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500">{cmt.dateTime}</span>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-sans leading-relaxed">{cmt.workCompleted}</p>
                              <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-0.5">
                                <span>
                                  Submitted by: <strong className="text-slate-700 dark:text-slate-200">{cmt.authorName}</strong>
                                  {(cmt.role || cmt.authorRole) && <span className="text-purple-600 dark:text-purple-400 font-semibold ml-1">({cmt.role || cmt.authorRole})</span>}
                                </span>
                                {(cmt.assignedSkill || cmt.authorSkills) && (
                                  <span className="bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800/40 text-[9px] font-mono">
                                    {Array.isArray(cmt.assignedSkill || cmt.authorSkills) ? (cmt.assignedSkill || cmt.authorSkills).join(', ') : String(cmt.assignedSkill || cmt.authorSkills)}
                                  </span>
                                )}
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

        {/* Right Column: Proposed & Staffed Engineering Squad Details */}
        <div className="space-y-6">
          {/* Pending Sign-off Proposed Squad */}
          {pendingSquadMembers.length > 0 && (
            <div className="rounded-2xl border border-amber-300 dark:border-amber-700/50 bg-amber-50/60 dark:bg-amber-950/20 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Clock size={16} className="text-amber-600 dark:text-amber-400" />
                    <span>Proposed Workforce Squad</span>
                  </h3>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                    Staged by HR Manager. Pending Admin authorization.
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-[10px] font-extrabold border border-amber-300 dark:border-amber-800/40 animate-pulse">
                  {pendingSquadMembers.length} Pending Sign-off
                </span>
              </div>

              <div className="space-y-3">
                {pendingSquadMembers.map((member) => {
                  const resolvedP = getPartnerCompanyName(member, partners, clients);
                  const isPartner =
                    Boolean(resolvedP) ||
                    member.source === 'Partner Company' ||
                    (member.roleType && member.roleType !== 'Freelancer') ||
                    (member.partnerName && member.partnerName !== 'Independent Freelancer');
                  const partnerLabel =
                    resolvedP ||
                    (member.partnerName && member.partnerName !== 'Independent Freelancer' && member.partnerName !== 'Partner Organization'
                      ? member.partnerName
                      : isPartner
                      ? 'Partner Employee'
                      : 'Independent Freelancer');

                  return (
                    <div
                      key={member.id}
                      className="rounded-xl border border-amber-200 dark:border-amber-800/40 bg-white dark:bg-[#14132b] p-4 shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                            alt={member.professionalName || member.name}
                            className="h-11 w-11 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-white/10"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                              {member.professionalName || member.name}
                            </h4>
                            <p className="text-[11px] font-semibold text-[#004ac6] dark:text-blue-400">
                              {member.role}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              {isPartner ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800/40">
                                  <Building2 size={10} />
                                  <span>{partnerLabel}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                                  <Users size={10} />
                                  <span>Freelancer Pool</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold border border-amber-200 dark:border-amber-800/40 shrink-0">
                          Pending Sign-off
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 dark:bg-[#1c1a36] p-2.5 rounded-xl border border-slate-100 dark:border-white/5">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Billing Rate</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{member.hourlyRate || '$95/hr'}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Experience</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{member.experience || '3+ years'}</span>
                        </div>
                      </div>

                      {member.skills && (Array.isArray(member.skills) ? member.skills.length > 0 : String(member.skills).trim().length > 0) && (
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(member.skills) ? member.skills : String(member.skills).split(/[,+]/)).slice(0, 3).map((s, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                              {String(s).trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      {member.notes && (
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 italic bg-amber-50/50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200/50 dark:border-amber-900/30">
                          Manager Note: "{member.notes}"
                        </p>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-white/5">
                        <button
                          type="button"
                          onClick={() => handleApproveCandidate(member.id, member.professionalName || member.name)}
                          className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 shadow-xs active:scale-95 transition-all"
                        >
                          <Check size={14} />
                          <span>Approve Squad Member</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectSquadModal({ isOpen: true, member, reason: '' })}
                          className="inline-flex items-center justify-center gap-1 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40 text-xs font-bold px-3 py-2 active:scale-95 transition-all"
                        >
                          <X size={14} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Staffed Engineering Squad Card */}
          <div className="rounded-2xl border border-[#c3c6d7]/70 dark:border-white/10 bg-white dark:bg-[#14132b] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#191b23] dark:text-white tracking-tight">
                  Staffed Engineering Squad
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Active authorized team members assigned to project execution.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#004ac6] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/40">
                {combinedActiveResources.length} Staffed
              </span>
            </div>

            <div className="space-y-3">
              {combinedActiveResources.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-[#1c1a36] rounded-xl border border-dashed border-slate-200 dark:border-white/10 leading-relaxed">
                  {pendingSquadMembers.length > 0
                    ? 'Workforce squad is selected by HR Manager and pending Admin approval above.'
                    : 'No resources assigned yet. HR Manager will stage workforce squad and submit for Admin approval.'}
                </div>
              ) : (
                combinedActiveResources.map((rawMember) => {
                  const member = getEnrichedCandidate(rawMember);
                  const isPartner =
                    Boolean(member.partnerCompanyName) ||
                    (Boolean(member.partnerName) &&
                      member.partnerName !== 'Independent Freelancer' &&
                      member.partnerName !== 'Partner Organization' &&
                      member.partnerName !== 'FlexiStaff Partner' &&
                      member.partnerName.toLowerCase() !== String(project.clientCompanyName || '').toLowerCase() &&
                      member.partnerName.toLowerCase() !== String(project.client || '').toLowerCase());
                  const partnerLabel =
                    member.partnerCompanyName ||
                    (isPartner ? member.partnerName : 'Independent Freelancer');

                  return (
                    <div
                      key={member.id || member.professionalId || member.allocationId}
                      className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-[#1c1a36]/70 p-3.5 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                            alt={member.professionalName || member.name}
                            className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-[#191b23] dark:text-white">
                              {member.professionalName || member.name}
                            </h4>
                            <p className="text-[11px] font-semibold text-[#004ac6] dark:text-blue-400">{member.role || member.roleInProject}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {isPartner ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800/40">
                                  <Building2 size={10} />
                                  <span>{partnerLabel}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                                  <Users size={10} />
                                  <span>Independent Freelancer</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                          <CheckCircle2 size={10} />
                          <span>Active</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200/60 dark:border-white/5 font-medium">
                        <span>Rate: <strong>{member.hourlyRate || ''}</strong></span>
                        <span>Workload: <strong>{member.workload || ''}</strong></span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Approve & Assign HR Manager Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Approve Client Project & Assign HR Manager"
        subtitle={`Approve ${project.title} and select the HR Manager responsible for partner & freelance workforce matching.`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleApproveProject} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#434655] dark:text-slate-300 mb-1.5">
              Select HR Manager
            </label>
            <select
              value={selectedManagerName}
              onChange={(e) => setSelectedManagerName(e.target.value)}
              className="w-full rounded-lg border border-[#c3c6d7] dark:border-white/10 bg-white dark:bg-[#1c1a36] p-2.5 text-xs text-[#191b23] dark:text-white focus:border-[#004ac6] focus:outline-none"
              required
            >
              {(managers || []).map((m) => (
                <option key={m.id || m.name} value={m.name}>
                  {m.name} (ID: #{m.id || m.numericId || m.employeeId}) - {m.role || m.jobTitle || 'HR Manager'}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 p-3.5 text-[#004ac6] dark:text-blue-300">
            <p className="text-[11px] font-medium leading-relaxed">
              Upon approval, this project will be assigned to <strong>{selectedManagerName}</strong>. The HR Manager will request Partner employees and Freelancers to fulfill the required engineering squad.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => setIsApproveModalOpen(false)}
              className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-emerald-700 flex items-center gap-1.5"
            >
              <CheckCircle2 size={14} />
              <span>Approve & Dispatch to HR Manager</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Reject Candidate Squad Proposal Modal */}
      <Modal
        isOpen={rejectSquadModal.isOpen}
        onClose={() => setRejectSquadModal({ isOpen: false, member: null, reason: '' })}
        title="Reject Proposed Squad Candidate"
        subtitle={rejectSquadModal.member ? `Reject assignment proposal for ${rejectSquadModal.member.professionalName || rejectSquadModal.member.name}` : ''}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleRejectCandidateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Rejection Reason *
            </label>
            <textarea
              rows={4}
              value={rejectSquadModal.reason}
              onChange={(e) => setRejectSquadModal((prev) => ({ ...prev, reason: e.target.value }))}
              placeholder="Provide detailed feedback to the HR Manager regarding why this candidate assignment is not approved..."
              required
              className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setRejectSquadModal({ isOpen: false, member: null, reason: '' })}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 active:scale-95 transition-all"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetails;
