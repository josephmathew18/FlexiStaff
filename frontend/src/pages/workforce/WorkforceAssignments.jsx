import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Check,
  X,
  TrendingUp,
  ShieldCheck,
  FolderKanban,
  DollarSign,
  Calendar,
  AlertCircle,
  PlayCircle,
  GitCommit,
  GitBranch,
  GitPullRequest,
  Plus,
  Send,
  Sparkles,
  Code2,
  FileCode,
  Tag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { toast } from 'react-toastify';

export const WorkforceAssignments = () => {
  const {
    workforceUserProfile,
    projects = [],
    managerAssignments = [],
    freelancerRequests = [],
    partnerWorkforceRequests = [],
    acceptWorkforceAssignment,
    declineWorkforceAssignment,
    respondFreelancerWorkforceRequest,
    respondPartnerWorkforceRequest,
    updateWorkforceProgress,
    projectMilestones = {},
    addMilestoneCommit,
    updateMilestoneStatus,
  } = useData() || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Decline Modal states
  const [selectedAsgForDecline, setSelectedAsgForDecline] = useState(null);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  // Commit Modal states
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);
  const [selectedAssignmentForCommit, setSelectedAssignmentForCommit] = useState(null);
  const [commitFormData, setCommitFormData] = useState({
    milestoneId: 'ms-01',
    commitMessage: '',
    workCompleted: '',
    milestoneStatus: 'In Progress',
  });
  const [isSubmittingCommit, setIsSubmittingCommit] = useState(false);

  // Find all assignments & requests for this talent
  const myAssignments = useMemo(() => {
    const savedUserStr = localStorage.getItem('flexistaff_user');
    let savedUser = null;
    if (savedUserStr) {
      try { savedUser = JSON.parse(savedUserStr); } catch {}
    }

    const wfName = (workforceUserProfile?.name || savedUser?.name || savedUser?.fullName || '').toLowerCase().trim();
    const wfEmail = (workforceUserProfile?.email || savedUser?.email || '').toLowerCase().trim();
    const wfId = String(workforceUserProfile?.id || savedUser?.id || '').trim();
    const wfCompany = (
      workforceUserProfile?.partnerCompany ||
      workforceUserProfile?.partnerName ||
      workforceUserProfile?.companyName ||
      workforceUserProfile?.company ||
      savedUser?.partnerCompany ||
      savedUser?.partnerName ||
      savedUser?.companyName ||
      savedUser?.company ||
      ''
    ).toLowerCase().trim();

    const results = [];
    const seenKeys = new Set();

    // 1. From managerAssignments
    (managerAssignments || []).forEach((a) => {
      if (!a) return;
      const aName = (a.professionalName || '').toLowerCase().trim();
      const aId = String(a.professionalId || '').trim();
      const aCompany = (a.partnerName || '').toLowerCase().trim();

      const isDirectMatch = (wfName && aName && (aName === wfName || aName.includes(wfName) || wfName.includes(aName))) || (wfId && aId && wfId === aId);
      const isPartnerMatch = Boolean(wfCompany && wfCompany !== 'enterprise client' && aCompany && (aCompany === wfCompany || aCompany.includes(wfCompany) || wfCompany.includes(aCompany)));

      if (isDirectMatch || isPartnerMatch) {
        const normProj = String(a.projectId || '').toLowerCase().replace(/[\s_]/g, '-').trim();
        const key = `asg_${normProj}_${a.id || aName}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          results.push(a);
        }
      }
    });

    // 2. From projects array (assignedResources & active project allocations)
    (projects || []).forEach((p) => {
      if (!p) return;
      const assignedList = p.assignedResources || [];
      const isAssignedToUser = assignedList.some((res) => {
        if (!res) return false;
        const rName = (res.name || res.professionalName || '').toLowerCase().trim();
        const rId = String(res.id || res.professionalId || '').trim();
        return (
          (wfName && rName && (rName === wfName || rName.includes(wfName) || wfName.includes(rName))) ||
          (wfId && rId && wfId === rId) ||
          (wfEmail && res.email && res.email.toLowerCase() === wfEmail)
        );
      });

      const pClient = (p.client || '').toLowerCase().trim();
      const isCompanyProj = wfCompany && wfCompany !== 'enterprise client' && (pClient === wfCompany || pClient.includes(wfCompany) || wfCompany.includes(pClient));

      if (isAssignedToUser || (isCompanyProj && p.status !== 'Rejected' && p.stage !== 'Rejected')) {
        const normProj = String(p.id || '').toLowerCase().replace(/[\s_]/g, '-').trim();
        const key = `prj_${normProj}_${p.id}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          results.push({
            id: `prj-asg-${p.id}`,
            projectId: p.id,
            projectName: p.title || p.name || 'Enterprise Project',
            client: p.client || 'Client Organization',
            role: p.requiredSkills?.[0] ? `${p.requiredSkills[0]} Developer` : 'Specialist Software Engineer',
            hourlyRate: '$95/hr',
            workload: 40,
            skills: p.requiredSkills || ['React.js', 'JavaScript'],
            status: p.status === 'Completed' || p.stage === 'Completed' ? 'Completed' : 'Working',
            assignedDate: p.startDate || new Date().toISOString().split('T')[0],
            notes: p.description || 'Assigned to active enterprise project squad.',
            currentTask: p.recentUpdate || 'Active project milestone deliverables in progress.',
            progress: p.progress || 0,
          });
        }
      }
    });

    // 3. From freelancerRequests
    (freelancerRequests || []).forEach((r) => {
      if (!r) return;
      const rName = (r.freelancerName || '').toLowerCase().trim();
      const rId = String(r.freelancerId || '').trim();

      const isMatch = (wfName && rName && (rName === wfName || rName.includes(wfName) || wfName.includes(rName))) || (wfId && rId && wfId === rId);

      if (isMatch) {
        const normProj = String(r.projectId || '').toLowerCase().replace(/[\s_]/g, '-').trim();
        const key = `fl_${normProj}_${r.id || rName}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          results.push({
            id: r.id,
            projectId: r.projectId || 'PRJ-REQ-7142',
            projectName: r.projectName || 'Enterprise Project',
            client: r.client || 'Client Organization',
            role: r.role || 'Specialist',
            hourlyRate: r.hourlyRate || '$95/hr',
            workload: 40,
            skills: Array.isArray(r.skills) ? r.skills : (r.skills || '').split(',').map((s) => s.trim()).filter(Boolean),
            status: r.status === 'Pending' ? 'Awaiting Workforce Response' : r.status,
            assignedDate: r.requestedDate || new Date().toISOString().split('T')[0],
            notes: r.notes || 'Direct Workforce Request submitted by Organization Manager.',
            currentTask: 'Direct request submitted by Manager. Review and respond.',
          });
        }
      }
    });

    // 4. From partnerWorkforceRequests (for Partner Employees)
    if (wfCompany && wfCompany !== 'enterprise client') {
      (partnerWorkforceRequests || []).forEach((pr) => {
        if (!pr) return;
        const prCompany = (pr.partnerName || '').toLowerCase().trim();
        if (prCompany === wfCompany || prCompany.includes(wfCompany) || wfCompany.includes(prCompany)) {
          const normProj = String(pr.projectId || '').toLowerCase().replace(/[\s_]/g, '-').trim();
          const key = `prt_${normProj}_${pr.id}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            results.push({
              id: pr.id,
              projectId: pr.projectId || 'PRJ-REQ-7142',
              projectName: pr.projectName || 'Enterprise Project',
              client: pr.client || 'Partner Client',
              role: pr.role || 'Partner Specialist',
              hourlyRate: pr.hourlyRate || '$95/hr',
              workload: 40,
              skills: (pr.skills || '').split(',').map((s) => s.trim()).filter(Boolean),
              status: pr.status === 'Pending' ? 'Awaiting Workforce Response' : pr.status,
              assignedDate: pr.createdDate || new Date().toISOString().split('T')[0],
              notes: pr.additionalRequirements || 'Partner Company Allocation Request.',
              currentTask: 'Partner Workforce Request assigned to your company. Awaiting response.',
            });
          }
        }
      });
    }

    return results;
  }, [managerAssignments, projects, freelancerRequests, partnerWorkforceRequests, workforceUserProfile]);

  const isPendingStatus = (st) => {
    const s = String(st || '').toLowerCase();
    return s.includes('pending') || s.includes('awaiting');
  };

  const pendingInvitations = useMemo(() => {
    return myAssignments.filter((a) => isPendingStatus(a.status));
  }, [myAssignments]);

  const activeAssignments = useMemo(() => {
    return myAssignments.filter((a) => a.status === 'Accepted' || a.status === 'Working' || a.status === 'In Progress');
  }, [myAssignments]);

  const filteredAssignments = useMemo(() => {
    return myAssignments.filter((asg) => {
      if (statusFilter !== 'all') {
        if (statusFilter === 'invitations' && !isPendingStatus(asg.status)) return false;
        if (statusFilter === 'active' && asg.status !== 'Accepted' && asg.status !== 'Working' && asg.status !== 'In Progress') return false;
        if (statusFilter === 'completed' && asg.status !== 'Completed') return false;
        if (statusFilter === 'declined' && asg.status !== 'Declined' && asg.status !== 'Rejected') return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesProject = asg.projectName?.toLowerCase().includes(q);
        const matchesRole = asg.role?.toLowerCase().includes(q);
        const matchesClient = asg.client?.toLowerCase().includes(q);
        if (!matchesProject && !matchesRole && !matchesClient) return false;
      }
      return true;
    });
  }, [myAssignments, statusFilter, searchQuery]);

  const handleAccept = (asg) => {
    if (asg.id && String(asg.id).startsWith('fl-')) {
      if (respondFreelancerWorkforceRequest) respondFreelancerWorkforceRequest(asg.id, true);
    } else if (asg.id && (String(asg.id).startsWith('pr-') || String(asg.id).startsWith('prt-'))) {
      if (respondPartnerWorkforceRequest) respondPartnerWorkforceRequest(asg.id, [workforceUserProfile?.id]);
    } else {
      if (acceptWorkforceAssignment) acceptWorkforceAssignment(asg.id);
    }
    toast.success(`You have accepted the assignment for "${asg.projectName}". Project is active!`);
  };

  const handleDeclineSubmit = (e) => {
    e.preventDefault();
    if (!selectedAsgForDecline) return;
    if (!declineReason.trim()) {
      toast.error('Please enter a reason for declining.');
      return;
    }

    declineWorkforceAssignment(selectedAsgForDecline.id, declineReason);
    toast.info(`You have declined the assignment for "${selectedAsgForDecline.projectName}". Manager has been notified.`);
    setIsDeclineModalOpen(false);
    setSelectedAsgForDecline(null);
    setDeclineReason('');
  };

  const handleOpenCommitModal = (asg, milestoneId = 'ms-01') => {
    setSelectedAssignmentForCommit(asg);
    setCommitFormData({
      milestoneId: milestoneId || 'ms-01',
      commitMessage: '',
      workCompleted: '',
      milestoneStatus: 'In Progress',
    });
    setIsCommitModalOpen(true);
  };

  const handleCommitSubmit = (e) => {
    e.preventDefault();

    if (!commitFormData.commitMessage.trim()) {
      toast.error('Please enter a commit message title.');
      return;
    }
    if (!commitFormData.workCompleted.trim()) {
      toast.error('Please describe the work completed.');
      return;
    }

    setIsSubmittingCommit(true);

    setTimeout(() => {
      const pId = selectedAssignmentForCommit?.projectId || 7142;

      if (addMilestoneCommit) {
        addMilestoneCommit(pId, commitFormData.milestoneId, {
          commitMessage: commitFormData.commitMessage,
          workCompleted: commitFormData.workCompleted,
          authorName: workforceUserProfile?.name || 'Workforce Specialist',
        });
      }

      if (updateMilestoneStatus) {
        updateMilestoneStatus(pId, commitFormData.milestoneId, commitFormData.milestoneStatus);
      }

      setIsSubmittingCommit(false);
      setIsCommitModalOpen(false);
      toast.success(`GitHub-style Commit Update submitted for ${commitFormData.milestoneId}! Timeline updated.`);
    }, 400);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto font-sans antialiased text-[#191b23]">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7c3aed] to-[#8b5cf6] text-white flex items-center justify-center shadow-md">
              <Briefcase size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Project Assignments & Milestone Commits
              </h1>
              <p className="text-xs text-slate-500">
                Accept invitations, log GitHub-style milestone commits, and update sprint deliverables.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1.5">
            <GitCommit size={14} className="text-purple-600" />
            <span>{myAssignments.length} Total Assignments</span>
          </span>
        </div>
      </div>

      {/* Pending Invitations Section */}
      {pendingInvitations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900">
              Project Recruitment Offers ({pendingInvitations.length})
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold animate-pulse">
              Action Required – Accept or Decline Offer
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingInvitations.map((inv) => (
              <div
                key={inv.id}
                className="p-6 rounded-3xl bg-gradient-to-br from-purple-50/70 via-indigo-50/50 to-white border-2 border-purple-300 shadow-md flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-200">
                      {inv.projectId}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 size={11} className="text-emerald-600" />
                      <span>Company Authorized</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block mb-0.5">
                      Project Recruitment Offer
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900">{inv.projectName}</h3>
                    <p className="text-xs font-bold text-purple-700 mt-0.5">Offered Role: {inv.role}</p>
                    <p className="text-xs text-slate-500 mt-1">Client Organization: {inv.client || 'Enterprise Client'}</p>
                  </div>

                  {/* Availability Verification Box */}
                  <div className="p-3 rounded-2xl bg-white border border-purple-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Rate</span>
                      <p className="font-extrabold text-slate-900">{inv.hourlyRate || '$95/hr'}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Workload Capacity</span>
                      <p className="font-extrabold text-slate-900">{inv.workload || 40}% Allocation (40h/wk)</p>
                    </div>
                    <div className="pt-2 border-t border-purple-100 flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold">
                      <CheckCircle2 size={13} className="shrink-0 text-emerald-600" />
                      <span>Availability Status: Verified Available for Project Execution</span>
                    </div>
                  </div>

                  {inv.notes && (
                    <p className="text-[11px] text-slate-600 italic bg-purple-50/60 p-2.5 rounded-xl border border-purple-100">
                      Manager Note: "{inv.notes}"
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(inv.skills) ? inv.skills : (inv.skills || '').split(/[,+]/)).map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-purple-100/70 text-purple-800 text-[10px] font-semibold"
                      >
                        {String(s).trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-purple-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAsgForDecline(inv);
                      setIsDeclineModalOpen(true);
                    }}
                    className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
                  >
                    <X size={13} />
                    <span>Decline Offer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAccept(inv)}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                  >
                    <Check size={14} />
                    <span>Accept Assignment</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GITHUB-STYLE MILESTONE COMMIT TIMELINE FOR ACTIVE ASSIGNMENTS */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <GitBranch size={18} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">GitHub-Style Milestone Commit System</h2>
              <p className="text-xs text-slate-500">
                Log technical commits, track milestone completion, and view chronological delivery timelines.
              </p>
            </div>
          </div>

          {myAssignments.length > 0 && (
            <button
              type="button"
              onClick={() => handleOpenCommitModal(myAssignments[0])}
              className="px-4 py-2 rounded-xl bg-[#7c3aed] hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 active:scale-95 transition-all flex items-center gap-2 self-start sm:self-auto"
            >
              <GitCommit size={15} />
              <span>+ Submit Commit Update</span>
            </button>
          )}
        </div>

        {/* Milestone Cards for Active Assignments */}
        {myAssignments.map((asg) => {
          const pId = asg.projectId;
          const msList = (projectMilestones && projectMilestones[pId]) || asg.milestones || [];

          return (
            <div key={asg.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
              {/* Project Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      {asg.projectId}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900">{asg.projectName}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Assigned Role: <strong className="text-purple-700">{asg.role}</strong> • Client: {asg.client || 'Enterprise Client'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenCommitModal(asg)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus size={14} />
                  <span>Commit Work</span>
                </button>
              </div>

              {/* Milestones & Commit Timelines */}
              <div className="space-y-6">
                {msList.map((ms) => {
                  const isCompleted = ms.status === 'Completed';
                  const isInProgress = ms.status === 'In Progress';
                  const isPending = ms.status === 'Pending';

                  return (
                    <div key={ms.id} className="rounded-2xl border border-slate-200/80 p-5 bg-slate-50/40 space-y-4">
                      {/* Milestone Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-extrabold text-slate-900">{ms.title}</h4>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                isCompleted
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  : isInProgress
                                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                                  : 'bg-amber-100 text-amber-800 border-amber-200'
                              }`}
                            >
                              {ms.status}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium">Target Date: {ms.dueDate || 'Sprint Target'}</span>
                        </div>

                        {/* Status Fast-Switcher Buttons */}
                        <div className="flex items-center gap-1.5 self-start sm:self-auto">
                          <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Set Status:</span>
                          {['Pending', 'In Progress', 'Completed'].map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => {
                                if (updateMilestoneStatus) {
                                  updateMilestoneStatus(pId, ms.id, st);
                                  toast.info(`Updated "${ms.title}" status to ${st}`);
                                }
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                ms.status === st
                                  ? 'bg-slate-900 text-white shadow-2xs'
                                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Commit Timeline Feed (GitHub Style) */}
                      <div className="space-y-3 pl-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <GitCommit size={14} className="text-purple-600" />
                            <span>Chronological Commits ({ms.commits?.length || 0})</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenCommitModal(asg, ms.id)}
                            className="text-[#7c3aed] font-bold hover:underline"
                          >
                            + Add Commit Log
                          </button>
                        </div>

                        {(!ms.commits || ms.commits.length === 0) ? (
                          <div className="p-4 rounded-xl bg-white border border-dashed border-slate-200 text-center text-xs text-slate-400 space-y-1">
                            <Code2 size={18} className="mx-auto text-slate-300" />
                            <p>No commits logged for this milestone yet.</p>
                            <p className="text-[10px]">Click "+ Add Commit Log" to submit your work progress.</p>
                          </div>
                        ) : (
                          <div className="relative border-l-2 border-slate-200 pl-4 ml-2 space-y-4 py-1">
                            {ms.commits.map((cmt) => (
                              <div key={cmt.id} className="relative group">
                                {/* Git Commit Node Dot */}
                                <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-[#7c3aed] ring-4 ring-purple-100" />

                                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2 hover:border-purple-300 transition-colors">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-[10px] font-extrabold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                        #{cmt.commitHash}
                                      </span>
                                      <h5 className="text-xs font-extrabold text-slate-900">{cmt.commitMessage}</h5>
                                    </div>
                                    <span className="text-[10px] font-semibold text-slate-400">{cmt.dateTime}</span>
                                  </div>

                                  <p className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                    {cmt.workCompleted}
                                  </p>

                                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                                    <span>Author: <strong className="text-slate-700">{cmt.authorName}</strong></span>
                                    <span className="text-purple-600 font-bold">Verified Commit</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search my projects, roles, client..."
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-purple-600"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { label: 'All', value: 'all' },
            { label: 'Active Sprints', value: 'active' },
            { label: 'Invitations', value: 'invitations' },
            { label: 'Completed', value: 'completed' },
            { label: 'Declined', value: 'declined' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === tab.value
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Assignments Table / List */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Project & Client</th>
                <th className="py-3.5 px-4">Your Role</th>
                <th className="py-3.5 px-4">Current Sprint Task</th>
                <th className="py-3.5 px-4">Rate & Workload</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Progress Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No project assignments found matching this filter.
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((asg) => {
                  const isActive = asg.status === 'Accepted' || asg.status === 'Working';

                  return (
                    <tr key={asg.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 block">{asg.projectId}</span>
                          <h4 className="font-bold text-slate-900 line-clamp-1">{asg.projectName}</h4>
                          <span className="text-[10px] text-slate-500">{asg.client || asg.partnerName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-purple-700">{asg.role}</p>
                      </td>

                      <td className="py-3.5 px-4 max-w-[200px]">
                        <p className="text-slate-700 font-medium truncate">
                          {asg.currentTask || 'Sprint execution & milestone deliverables'}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{asg.hourlyRate || '$95/hr'}</p>
                        <span className="text-[10px] text-slate-400">{asg.workload || 0}% workload</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            asg.status === 'Awaiting Workforce Response'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : asg.status === 'Completed'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {asg.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 min-w-[150px]">
                        {isActive ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={5}
                              value={asg.progress || 0}
                              onChange={(e) => updateWorkforceProgress(asg.id, Number(e.target.value))}
                              className="w-24 accent-purple-600 cursor-pointer"
                            />
                            <span className="font-bold text-slate-900 text-xs">{asg.progress || 0}%</span>
                          </div>
                        ) : asg.status === 'Awaiting Workforce Response' ? (
                          <button
                            type="button"
                            onClick={() => handleAccept(asg)}
                            className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold shadow-2xs hover:bg-emerald-700"
                          >
                            Accept Offer
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">{asg.progress || 0}%</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decline Modal */}
      <AnimatePresence>
        {isDeclineModalOpen && selectedAsgForDecline && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeclineModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-100 p-6 bg-slate-50/70">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Decline Project Invitation</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    For {selectedAsgForDecline.projectName} ({selectedAsgForDecline.role})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDeclineModalOpen(false)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-200"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleDeclineSubmit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Reason for Declining *
                  </label>
                  <textarea
                    rows={4}
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    placeholder="Specify reason for declining..."
                    required
                    className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-rose-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsDeclineModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 active:scale-95 transition-all"
                  >
                    Confirm Decline
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GitHub-Style Commit Submission Modal */}
      <AnimatePresence>
        {isCommitModalOpen && selectedAssignmentForCommit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCommitModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-100 p-6 bg-slate-900 text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                    <GitCommit size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold">Submit Commit Update</h3>
                    <p className="text-xs text-slate-400">
                      {selectedAssignmentForCommit.projectName} ({selectedAssignmentForCommit.projectId})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCommitModalOpen(false)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCommitSubmit} className="p-6 space-y-4 text-xs">
                {/* Milestone Select */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Target Project Milestone <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={commitFormData.milestoneId}
                    onChange={(e) => setCommitFormData({ ...commitFormData, milestoneId: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#7c3aed]"
                  >
                    <option value="ms-01">Core OAuth2 & RBAC Auth Engine</option>
                    <option value="ms-02">Real-time Analytics & Dashboard Metrics</option>
                    <option value="ms-03">Billing Gateway & Webhook Integration</option>
                  </select>
                </div>

                {/* Commit Message */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Commit Message / Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={commitFormData.commitMessage}
                    onChange={(e) => setCommitFormData({ ...commitFormData, commitMessage: e.target.value })}
                    placeholder="Deliverable title / summary"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-[#7c3aed] font-mono"
                    required
                  />
                </div>

                {/* Work Completed Details */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Work Completed Summary <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={commitFormData.workCompleted}
                    onChange={(e) => setCommitFormData({ ...commitFormData, workCompleted: e.target.value })}
                    placeholder="Describe technical implementation details, pull request notes, API changes, unit tests..."
                    className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-[#7c3aed] resize-none"
                    required
                  />
                </div>

                {/* Milestone Status Update */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Update Milestone Status</label>
                  <select
                    value={commitFormData.milestoneStatus}
                    onChange={(e) => setCommitFormData({ ...commitFormData, milestoneStatus: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#7c3aed]"
                  >
                    <option value="In Progress">In Progress </option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsCommitModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCommit}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] hover:from-purple-700 hover:to-purple-600 text-white text-xs font-bold shadow-md shadow-purple-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <GitCommit size={15} />
                    <span>{isSubmittingCommit ? 'Recording Commit...' : 'Submit Commit Update'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkforceAssignments;
