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
  } = useData() || {};
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Decision Modal States
  const [selectedAsg, setSelectedAsg] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const pendingCount = (managerAssignments || []).filter(
    (a) => a && a.status === 'Pending Assignment Approval'
  ).length;

  const filteredAssignments = useMemo(() => {
    return (managerAssignments || []).filter((a) => {
      if (!a) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (a.professionalName || '').toLowerCase().includes(q);
        const matchesRole = (a.role || '').toLowerCase().includes(q);
        const matchesProject = (a.projectName || '').toLowerCase().includes(q);
        const matchesClient = (a.client || '').toLowerCase().includes(q);
        if (!matchesName && !matchesRole && !matchesProject && !matchesClient) return false;
      }
      return true;
    });
  }, [managerAssignments, statusFilter, searchQuery]);

  const handleApprove = (asg) => {
    approveWorkforceAssignment(asg.id);
    toast.success(`Approved assignment for ${asg.professionalName}. Sent to candidate for response.`);
    setSelectedAsg(null);
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      toast.error('Please enter a rejection reason.');
      return;
    }
    rejectWorkforceAssignment(selectedAsg.id, rejectReason);
    toast.info(`Rejected assignment for ${selectedAsg.professionalName}. Returned to manager.`);
    setIsRejectModalOpen(false);
    setSelectedAsg(null);
    setRejectReason('');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending Assignment Approval':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock size={12} className="text-amber-600" />
            <span>Pending Assignment Approval</span>
          </span>
        );
      case 'Awaiting Workforce Response':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock size={12} className="text-blue-600" />
            <span>Awaiting Workforce Response</span>
          </span>
        );
      case 'Accepted':
      case 'Working':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} className="text-emerald-600" />
            <span>Accepted / Active</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={12} className="text-rose-600" />
            <span>Rejected by Admin</span>
          </span>
        );
      case 'Declined':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <XCircle size={12} className="text-slate-500" />
            <span>Declined by Candidate</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
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
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Workforce Assignment Approvals
            </h1>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold animate-pulse">
                {pendingCount} Pending Sign-off
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Review proposed candidate allocations submitted by Organization Managers. Authorize assignments before sending project invitations to talent.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center gap-2 text-xs text-indigo-900">
            <ShieldCheck size={16} className="text-indigo-600 shrink-0" />
            <span>Admin Final Authorization Gate</span>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Pending Approval</span>
          <p className="text-xl font-extrabold text-amber-600 mt-1">{pendingCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Awaiting Talent Response</span>
          <p className="text-xl font-extrabold text-blue-600 mt-1">
            {managerAssignments.filter((a) => a.status === 'Awaiting Workforce Response').length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Active / Accepted</span>
          <p className="text-xl font-extrabold text-emerald-600 mt-1">
            {managerAssignments.filter((a) => a.status === 'Accepted' || a.status === 'Working').length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Rejected / Declined</span>
          <p className="text-xl font-extrabold text-slate-700 mt-1">
            {managerAssignments.filter((a) => a.status === 'Rejected' || a.status === 'Declined').length}
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate, role, project, client..."
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { label: 'All', value: 'all' },
            { label: 'Pending Approval', value: 'Pending Assignment Approval' },
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
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Assignments Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Candidate / Specialist</th>
                <th className="py-3.5 px-4">Proposed Role</th>
                <th className="py-3.5 px-4">Target Project & Client</th>
                <th className="py-3.5 px-4">Rate & Workload</th>
                <th className="py-3.5 px-4">Assignment Status</th>
                <th className="py-3.5 px-4 text-right">Decision Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No workforce assignment proposals found.
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((asg) => (
                  <tr key={asg.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={asg.avatar}
                          alt={asg.professionalName}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{asg.professionalName}</p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            {asg.partnerName || 'Independent'} • {asg.experience || '3+ years'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-blue-600">{asg.role}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(asg.skills || []).slice(0, 2).map((s, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.2 rounded bg-slate-100 text-[10px] font-semibold text-slate-600"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 line-clamp-1">{asg.projectName}</p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Client: <strong className="text-slate-700">{asg.client || 'Enterprise'}</strong>
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{asg.hourlyRate || '$95/hr'}</p>
                      <p className="text-[10px] text-slate-500">Current Workload: {asg.workload || 0}%</p>
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(asg.status)}
                      {asg.rejectionReason && (
                        <p className="text-[10px] text-rose-600 mt-1 font-medium max-w-[220px]">
                          Reason: {asg.rejectionReason}
                        </p>
                      )}
                      {asg.declineReason && (
                        <p className="text-[10px] text-slate-500 mt-1 font-medium max-w-[220px]">
                          Reason: {asg.declineReason}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {asg.status === 'Pending Assignment Approval' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleApprove(asg)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
                          >
                            <Check size={13} />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAsg(asg);
                              setIsRejectModalOpen(true);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 active:scale-95 transition-all"
                          >
                            <X size={13} />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Decided</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
              className="relative z-10 w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-100 p-6 bg-slate-50/70">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Reject Assignment Proposal</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    For {selectedAsg.professionalName} on {selectedAsg.projectName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-200"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleRejectSubmit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rejection Reason *
                  </label>
                  <textarea
                    rows={4}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Provide detailed feedback to the Organization Manager regarding why this candidate assignment is not approved..."
                    required
                    className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-rose-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsRejectModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
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
