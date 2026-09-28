import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitPullRequest,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Users,
  Building2,
  Briefcase,
  Layers,
  AlertCircle,
  X,
  Check,
  ChevronRight,
  ShieldCheck,
  FolderKanban,
  DollarSign,
  Calendar,
  Eye,
  Mail,
  Phone,
  MapPin,
  Star,
  Award,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { toast } from 'react-toastify';

export const AdminAssignmentApprovals = () => {
  const {
    managerAssignments = [],
    approveWorkforceAssignment,
    rejectWorkforceAssignment,
    projects = [],
    workforce = [],
    partnerWorkforce = [],
  } = useData() || {};
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal States
  const [selectedAsg, setSelectedAsg] = useState(null);
  const [selectedCandidateDetails, setSelectedCandidateDetails] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const isPendingStatus = (st) => {
    const s = String(st || '').toLowerCase();
    return s.includes('pending') || s.includes('staged') || s.includes('review');
  };

  // Helper to enrich assignment records with master candidate data
  const enrichAssignment = (asg) => {
    if (!asg) return asg;
    const candIdStr = String(asg.professionalId || asg.id || '').toLowerCase().trim();
    const candNameLower = String(asg.professionalName || asg.name || '').toLowerCase().trim();
    const candEmailLower = String(asg.email || asg.professionalEmail || '').toLowerCase().trim();

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

    const projectObj = (projects || []).find(
      (p) =>
        String(p.id).toLowerCase() === String(asg.projectId).toLowerCase() ||
        (p.title || p.name || '').toLowerCase() === (asg.projectName || '').toLowerCase()
    );

    const rawSkills = asg.skills || masterCandidate?.skills || ['React.js', 'PostgreSQL', 'Node.js'];
    const skillsArr = Array.isArray(rawSkills)
      ? rawSkills
      : String(rawSkills).split(/[,+]/).map((s) => s.trim()).filter(Boolean);

    return {
      ...asg,
      professionalName: asg.professionalName || masterCandidate?.name || masterCandidate?.pseudonym || 'Specialist Candidate',
      avatar: asg.avatar || masterCandidate?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      email: asg.email || masterCandidate?.email || 'candidate@flexistaff.ai',
      phone: asg.phone || masterCandidate?.phone || '+91 98765 43210',
      location: asg.location || masterCandidate?.location || 'Bengaluru, India',
      bio: masterCandidate?.bio || masterCandidate?.summary || asg.notes || 'Experienced software engineer specialized in enterprise cloud and web platforms.',
      experience: asg.experience || masterCandidate?.experience || '3+ Years',
      hourlyRate: asg.hourlyRate || masterCandidate?.hourlyRate || '$95/hr',
      rating: masterCandidate?.rating || 4.9,
      skills: skillsArr,
      partnerName: asg.partnerName || masterCandidate?.partnerName || masterCandidate?.partnerCompany || (asg.source === 'Partner Company' ? 'Partner Enterprise Company' : 'Independent Freelancer Pool'),
      roleType: asg.roleType || masterCandidate?.roleType || (asg.source === 'Partner Company' ? 'Professional' : 'Freelancer'),
      client: asg.client || projectObj?.client || 'Enterprise Client',
      manager: asg.manager || projectObj?.manager || 'Organization Manager',
    };
  };

  const enrichedAssignmentsList = useMemo(() => {
    return (managerAssignments || []).map(enrichAssignment);
  }, [managerAssignments, workforce, partnerWorkforce, projects]);

  const pendingCount = useMemo(() => {
    return enrichedAssignmentsList.filter((a) => a && isPendingStatus(a.status)).length;
  }, [enrichedAssignmentsList]);

  const filteredAssignments = useMemo(() => {
    return enrichedAssignmentsList.filter((a) => {
      if (!a) return false;
      if (statusFilter !== 'all') {
        const isFilterPending = isPendingStatus(statusFilter);
        const isAsgPending = isPendingStatus(a.status);
        if (isFilterPending) {
          if (!isAsgPending) return false;
        } else if (a.status !== statusFilter) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (a.professionalName || '').toLowerCase().includes(q);
        const matchesRole = (a.role || '').toLowerCase().includes(q);
        const matchesProject = (a.projectName || '').toLowerCase().includes(q);
        const matchesClient = (a.client || '').toLowerCase().includes(q);
        const matchesEmail = (a.email || '').toLowerCase().includes(q);
        const matchesPartner = (a.partnerName || '').toLowerCase().includes(q);

        if (!matchesName && !matchesRole && !matchesProject && !matchesClient && !matchesEmail && !matchesPartner) {
          return false;
        }
      }
      return true;
    });
  }, [enrichedAssignmentsList, statusFilter, searchQuery]);

  const handleApprove = (asg) => {
    approveWorkforceAssignment(asg.id);
    toast.success(`Approved assignment for ${asg.professionalName}. Candidate authorized and project set to In Progress!`);
    if (selectedCandidateDetails?.id === asg.id) {
      setSelectedCandidateDetails(null);
    }
    setSelectedAsg(null);
  };

  const handleOpenRejectModal = (asg) => {
    setSelectedAsg(asg);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!selectedAsg) return;
    if (!rejectReason.trim()) {
      toast.error('Please enter a rejection reason.');
      return;
    }
    rejectWorkforceAssignment(selectedAsg.id, rejectReason);
    toast.info(`Rejected assignment proposal for ${selectedAsg.professionalName}. Returned to manager.`);
    setIsRejectModalOpen(false);
    if (selectedCandidateDetails?.id === selectedAsg.id) {
      setSelectedCandidateDetails(null);
    }
    setSelectedAsg(null);
    setRejectReason('');
  };

  const getStatusBadge = (status) => {
    const isPending = isPendingStatus(status);
    if (isPending) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
          <Clock size={12} className="text-amber-600 dark:text-amber-400" />
          <span>Pending Admin Approval</span>
        </span>
      );
    }

    switch (status) {
      case 'Awaiting Workforce Response':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
            <Clock size={12} className="text-blue-600 dark:text-blue-400" />
            <span>Awaiting Talent Response</span>
          </span>
        );
      case 'Accepted':
      case 'Working':
      case 'Approved':
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
            <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
            <span>Accepted / Active</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40">
            <XCircle size={12} className="text-rose-600 dark:text-rose-400" />
            <span>Rejected</span>
          </span>
        );
      case 'Declined':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <XCircle size={12} className="text-slate-500 dark:text-slate-400" />
            <span>Declined by Candidate</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Squad & Workforce Assignment Approvals
            </h1>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 text-xs font-bold animate-pulse">
                {pendingCount} Pending Sign-off
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Review proposed candidate allocations submitted by Organization Managers. Inspect candidate profile details and authorize assignments before project activation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center gap-2 text-xs text-indigo-900 dark:text-indigo-300">
            <ShieldCheck size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>Admin Final Authorization Gate</span>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#14132b] border border-slate-200 dark:border-white/10 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Pending Approval</span>
          <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#14132b] border border-slate-200 dark:border-white/10 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Awaiting Talent Response</span>
          <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            {enrichedAssignmentsList.filter((a) => a.status === 'Awaiting Workforce Response').length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#14132b] border border-slate-200 dark:border-white/10 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Active / Accepted</span>
          <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {enrichedAssignmentsList.filter((a) => a.status === 'Accepted' || a.status === 'Working' || a.status === 'Approved').length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#14132b] border border-slate-200 dark:border-white/10 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Rejected / Declined</span>
          <p className="text-xl font-extrabold text-slate-700 dark:text-slate-300 mt-1">
            {enrichedAssignmentsList.filter((a) => a.status === 'Rejected' || a.status === 'Declined').length}
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#14132b] p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate, role, project, client, email..."
            className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-[#004ac6]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { label: 'All Proposals', value: 'all' },
            { label: 'Pending Sign-off', value: 'Pending Assignment Approval' },
            { label: 'Awaiting Talent', value: 'Awaiting Workforce Response' },
            { label: 'Accepted', value: 'Accepted' },
            { label: 'Rejected', value: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === tab.value
                  ? 'bg-[#004ac6] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Assignments Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14132b] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50/75 dark:bg-[#1a1835] text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3.5 px-4">Candidate / Specialist</th>
                <th className="py-3.5 px-4">Proposed Role & Skills</th>
                <th className="py-3.5 px-4">Target Project & Client</th>
                <th className="py-3.5 px-4">Rate & Workload</th>
                <th className="py-3.5 px-4">Assignment Status</th>
                <th className="py-3.5 px-4 text-right">Actions & Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No workforce assignment proposals found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((asg) => {
                  const isPending = isPendingStatus(asg.status);
                  return (
                    <tr
                      key={asg.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => setSelectedCandidateDetails(asg)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={asg.avatar}
                            alt={asg.professionalName}
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-white/10"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{asg.professionalName}</span>
                              <span className="text-[10px] text-amber-500 flex items-center gap-0.5">
                                <Star size={11} className="fill-amber-400" />
                                {asg.rating || 4.9}
                              </span>
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                              {asg.partnerName || 'Independent'} • {asg.experience || '3+ years'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-blue-600 dark:text-blue-400">{asg.role}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(asg.skills || []).slice(0, 3).map((s, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#1c1a36] text-[10px] font-semibold text-slate-600 dark:text-slate-300"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{asg.projectName}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          Client: <strong className="text-slate-700 dark:text-slate-200">{asg.client || 'Enterprise'}</strong>
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">{asg.hourlyRate || '$95/hr'}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Workload: {asg.workload || 40}h/wk</p>
                      </td>

                      <td className="py-3.5 px-4">{getStatusBadge(asg.status)}</td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedCandidateDetails(asg)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#004ac6] dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-xs font-bold transition-all"
                            title="View Employee Details"
                          >
                            <Eye size={14} />
                            <span>Details</span>
                          </button>

                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(asg)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                                title="Approve Assignment"
                              >
                                <Check size={14} />
                                <span>Approve</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenRejectModal(asg)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40 text-xs font-bold active:scale-95 transition-all"
                                title="Reject Assignment"
                              >
                                <X size={14} />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate / Employee Details Modal */}
      <AnimatePresence>
        {selectedCandidateDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCandidateDetails(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-2xl rounded-3xl bg-white dark:bg-[#14132b] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden my-8"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-white/10 p-6 bg-slate-50/70 dark:bg-[#1c1a36]/50">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedCandidateDetails.avatar}
                    alt={selectedCandidateDetails.professionalName}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#004ac6]/20 shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                        {selectedCandidateDetails.professionalName}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#004ac6] dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800/40">
                        {selectedCandidateDetails.roleType || 'Professional'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#004ac6] dark:text-blue-400 mt-0.5">
                      {selectedCandidateDetails.role}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star size={12} className="fill-amber-400" />
                        {selectedCandidateDetails.rating || 4.9}
                      </span>
                      <span>•</span>
                      <span>{selectedCandidateDetails.experience} Experience</span>
                      <span>•</span>
                      <span>{selectedCandidateDetails.partnerName}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCandidateDetails(null)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs text-slate-700 dark:text-slate-300">
                {/* Contact & Professional Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1c1a36] border border-slate-100 dark:border-white/5 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Email Contact</span>
                    <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                      <Mail size={13} className="text-[#004ac6] shrink-0" />
                      <span className="truncate">{selectedCandidateDetails.email}</span>
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1c1a36] border border-slate-100 dark:border-white/5 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Phone Number</span>
                    <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Phone size={13} className="text-emerald-600 shrink-0" />
                      <span>{selectedCandidateDetails.phone}</span>
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1c1a36] border border-slate-100 dark:border-white/5 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Location</span>
                    <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <MapPin size={13} className="text-rose-500 shrink-0" />
                      <span>{selectedCandidateDetails.location}</span>
                    </p>
                  </div>
                </div>

                {/* Target Project Assignment Engagement Card */}
                <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                      Target Project Assignment Proposal
                    </span>
                    {getStatusBadge(selectedCandidateDetails.status)}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Project Title</span>
                      <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {selectedCandidateDetails.projectName}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Client Organization</span>
                      <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {selectedCandidateDetails.client}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-indigo-100 dark:border-indigo-900/40">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Billing Rate</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">
                        {selectedCandidateDetails.hourlyRate}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Weekly Commitment</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {selectedCandidateDetails.workload || 40} Hours/week
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Assigned HR Manager</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {selectedCandidateDetails.manager}
                      </span>
                    </div>
                  </div>

                  {selectedCandidateDetails.notes && (
                    <div className="p-3 rounded-xl bg-white dark:bg-[#14132b] border border-indigo-100 dark:border-indigo-900/30">
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Manager Allocation Note</span>
                      <p className="italic text-slate-700 dark:text-slate-300 font-sans">
                        "{selectedCandidateDetails.notes}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Candidate Tech Stack & Skills */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                    Verified Technical Skills & Stack
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedCandidateDetails.skills || []).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#1c1a36] text-xs font-semibold text-[#004ac6] dark:text-blue-300 border border-slate-200 dark:border-white/10"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Candidate Bio Summary */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                    Candidate Profile Summary
                  </h4>
                  <p className="leading-relaxed text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#1c1a36] p-3.5 rounded-2xl border border-slate-100 dark:border-white/5">
                    {selectedCandidateDetails.bio}
                  </p>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-6 border-t border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-[#1c1a36]/50 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedCandidateDetails(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  Close Details
                </button>

                {isPendingStatus(selectedCandidateDetails.status) && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenRejectModal(selectedCandidateDetails)}
                      className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40 text-xs font-bold hover:bg-rose-100 transition-all"
                    >
                      Reject Proposal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(selectedCandidateDetails)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <Check size={15} />
                      <span>Authorize & Approve Candidate</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reject Assignment Modal */}
      <AnimatePresence>
        {isRejectModalOpen && selectedAsg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRejectModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-md rounded-3xl bg-white dark:bg-[#14132b] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 p-6 bg-slate-50/70 dark:bg-[#1c1a36]/50">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Reject Assignment Proposal</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    For {selectedAsg.professionalName} on {selectedAsg.projectName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleRejectSubmit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Rejection Reason *
                  </label>
                  <textarea
                    rows={4}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Provide detailed feedback to the Organization Manager regarding why this candidate assignment is not approved..."
                    required
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1c1a36] p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsRejectModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 active:scale-95 transition-all"
                  >
                    Confirm Rejection
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

export default AdminAssignmentApprovals;
