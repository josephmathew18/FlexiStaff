import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitPullRequest,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  PlayCircle,
  XCircle,
  TrendingUp,
  Cpu,
  ChevronRight,
  Eye,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const ManagerAssignments = () => {
  const { managerAssignments = [] } = useData() || {};
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const pendingAdminCount = (managerAssignments || []).filter(
    (a) => a.status === 'Pending Assignment Approval'
  ).length;

  const filteredAssignments = useMemo(() => {
    return (managerAssignments || []).filter((asg) => {
      if (statusFilter !== 'all') {
        if (statusFilter === 'Pending Assignment Approval' && asg.status !== 'Pending Assignment Approval') return false;
        if (statusFilter === 'Awaiting Workforce Response' && asg.status !== 'Awaiting Workforce Response') return false;
        if (statusFilter === 'Accepted' && asg.status !== 'Accepted' && asg.status !== 'Working') return false;
        if (statusFilter === 'Rejected' && asg.status !== 'Rejected') return false;
        if (statusFilter === 'Declined' && asg.status !== 'Declined') return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesProf = asg.professionalName?.toLowerCase().includes(q);
        const matchesRole = asg.role?.toLowerCase().includes(q);
        const matchesProject = asg.projectName?.toLowerCase().includes(q);
        if (!matchesProf && !matchesRole && !matchesProject) return false;
      }
      return true;
    });
  }, [managerAssignments, statusFilter, searchQuery]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending Assignment Approval':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock size={12} className="text-amber-600" />
            <span>Pending Company Sign-off</span>
          </span>
        );
      case 'Awaiting Workforce Response':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock size={12} className="text-blue-600" />
            <span>Awaiting Talent Response</span>
          </span>
        );
      case 'Accepted':
      case 'Working':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} className="text-emerald-600" />
            <span>Accepted / Active</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={12} className="text-rose-600" />
            <span>Rejected by Company</span>
          </span>
        );
      case 'Declined':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <XCircle size={12} className="text-slate-500" />
            <span>Declined by Candidate</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#004ac6] to-[#2563eb] text-white flex items-center justify-center shadow-md">
              <GitPullRequest size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Workforce Assignment Requests
              </h1>
              <p className="text-xs text-slate-500">
                Track candidate proposals submitted to Company for sign-off and monitor candidate acceptance.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/manager/matching')}
          className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#1d4ed8] active:scale-95 transition-all self-start md:self-auto"
        >
          <Cpu size={15} />
          <span>Match New Workforce</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search specialist, project, or role..."
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { label: 'All', value: 'all' },
            { label: 'Pending Company Sign-off', value: 'Pending Assignment Approval' },
            { label: 'Awaiting Talent', value: 'Awaiting Workforce Response' },
            { label: 'Accepted / Active', value: 'Accepted' },
            { label: 'Rejected by Company', value: 'Rejected' },
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
                <th className="py-3.5 px-4">Specialist / Candidate</th>
                <th className="py-3.5 px-4">Target Role</th>
                <th className="py-3.5 px-4">Project & Client</th>
                <th className="py-3.5 px-4">Assignment Status</th>
                <th className="py-3.5 px-4">Progress / Feedback</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No workforce assignments found matching this filter.
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((asg) => (
                  <tr key={asg.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={asg.avatar}
                          alt={asg.professionalName}
                          className="h-9 w-9 rounded-xl object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{asg.professionalName}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{asg.professionalId}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-blue-600">{asg.role}</td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 line-clamp-1">{asg.projectName}</p>
                      <span className="text-[10px] text-slate-500">{asg.client || asg.partnerName}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(asg.status)}
                    </td>

                    <td className="py-3.5 px-4 max-w-[220px]">
                      {asg.rejectionReason ? (
                        <div className="text-[10px] text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200">
                          <strong className="block font-bold">Company Rejection Feedback:</strong>
                          <span>{asg.rejectionReason}</span>
                        </div>
                      ) : asg.declineReason ? (
                        <div className="text-[10px] text-slate-600 bg-slate-100 p-2 rounded-xl">
                          <strong className="block font-bold">Candidate Decline:</strong>
                          <span>{asg.declineReason}</span>
                        </div>
                      ) : asg.status === 'Accepted' || asg.status === 'Working' ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{ width: `${asg.progress || 0}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-900 text-[10px]">{asg.progress || 0}%</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Awaiting workflow transition</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {asg.status === 'Rejected' || asg.status === 'Declined' ? (
                        <button
                          type="button"
                          onClick={() => navigate(`/manager/matching/${asg.projectId}`)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#004ac6] font-bold text-xs border border-indigo-200 transition-all ml-auto"
                        >
                          <RotateCcw size={12} />
                          <span>Rematch Candidate</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => navigate(`/manager/matching/${asg.projectId}`)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors inline-block"
                          title="View Project in Matching Engine"
                        >
                          <Eye size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerAssignments;
