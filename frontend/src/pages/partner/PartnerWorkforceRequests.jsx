import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitPullRequest,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useData } from '../../context/DataContext';

const StatusBadge = ({ status = 'Pending' }) => {
  const normalized = String(status).toLowerCase().trim();
  let bg = 'bg-amber-50 text-amber-700 border-amber-200';

  if (normalized === 'fully assigned' || normalized === 'completed') {
    bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (normalized === 'partially assigned') {
    bg = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (normalized === 'matching') {
    bg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${bg}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      <span>{status}</span>
    </span>
  );
};

export const PartnerWorkforceRequests = () => {
  const { partnerWorkforceRequests = [] } = useData() || {};
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    return (partnerWorkforceRequests || []).filter((req) => {
      if (!req) return false;
      if (statusFilter !== 'all' && (req.status || '').toLowerCase() !== statusFilter.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRole = (req.role || '').toLowerCase().includes(q);
        const matchesProject = (req.projectName || '').toLowerCase().includes(q);
        const matchesSkills = (req.skills || '').toLowerCase().includes(q);
        if (!matchesRole && !matchesProject && !matchesSkills) return false;
      }
      return true;
    });
  }, [partnerWorkforceRequests, statusFilter, searchQuery]);

  const totalRequired = useMemo(() => (partnerWorkforceRequests || []).reduce((s, r) => s + (r?.required || 0), 0), [partnerWorkforceRequests]);
  const totalAssigned = useMemo(() => (partnerWorkforceRequests || []).reduce((s, r) => s + (r?.assigned || 0), 0), [partnerWorkforceRequests]);
  const totalRemaining = Math.max(0, totalRequired - totalAssigned);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Workforce Requirements & Fulfillment
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track fulfillment ratios, requested engineering headcounts, and remaining matching allocations per role.
          </p>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Required Talent</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalRequired}</span>
            <span className="text-xs text-slate-400">Engineers requested</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Allocated & Assigned</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">{totalAssigned}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {Math.round((totalAssigned / totalRequired) * 100)}% Fulfilled
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Remaining Matching Allocation</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">{totalRemaining}</span>
            <span className="text-xs text-slate-400">Engineers in matching</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search requested roles, skills, or projects..."
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none"
          >
            <option value="all">All Fulfillment Statuses</option>
            <option value="fully assigned">Fully Assigned</option>
            <option value="partially assigned">Partially Assigned</option>
            <option value="matching">Matching</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Requirements Table (Section 19) */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Role Required</th>
                <th className="py-3.5 px-4">Related Project</th>
                <th className="py-3.5 px-4">Required</th>
                <th className="py-3.5 px-4">Assigned</th>
                <th className="py-3.5 px-4">Remaining</th>
                <th className="py-3.5 px-4">Fulfillment Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div>
                      <p className="font-bold text-slate-900">{req.role}</p>
                      <p className="text-[11px] text-slate-400">{req.skills}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{req.projectName}</td>
                  <td className="py-3.5 px-4 font-black text-slate-900">{req.required}</td>
                  <td className="py-3.5 px-4 font-bold text-blue-600">{req.assigned}</td>
                  <td className="py-3.5 px-4 font-bold text-amber-600">{req.remaining}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => navigate(`/partner/projects/${req.projectId}`)}
                      className="text-xs font-bold text-[#004ac6] hover:underline"
                    >
                      View Project →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PartnerWorkforceRequests;
