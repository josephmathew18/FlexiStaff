import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  FilePlus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  PlayCircle,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Users,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const ClientProjects = () => {
  const { clientProfile, projects } = useData();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const clientProjects = useMemo(() => {
    return projects.filter(
      (p) =>
        p.client?.toLowerCase() === (clientProfile?.company || 'Finovate Global').toLowerCase() ||
        p.clientId === clientProfile?.id ||
        p.client?.toLowerCase().includes('finovate')
    );
  }, [projects, clientProfile]);

  const filteredProjects = useMemo(() => {
    return clientProjects.filter((prj) => {
      let matchesStatus = true;
      if (statusFilter === 'all') matchesStatus = true;
      else if (statusFilter === 'Pending Admin Approval') {
        matchesStatus = prj.status === 'Pending Admin Approval' || prj.stage === 'Pending Admin Approval';
      } else {
        matchesStatus = prj.status === statusFilter || prj.stage === statusFilter;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (prj.title || prj.name)?.toLowerCase().includes(q);
        const matchesDesc = prj.description?.toLowerCase().includes(q);
        const matchesSkills = (prj.requiredSkills || []).some((s) => s.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesSkills) return false;
      }

      return matchesStatus;
    });
  }, [clientProjects, statusFilter, searchQuery]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending Admin Approval':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock size={12} className="text-amber-600" />
            <span>Pending Company Approval</span>
          </span>
        );
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <CheckCircle2 size={12} className="text-indigo-600" />
            <span>Approved • With Manager</span>
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <PlayCircle size={12} className="text-emerald-600" />
            <span>In Progress</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={12} className="text-rose-600" />
            <span>Rejected by Company</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 size={12} className="text-blue-600" />
            <span>Completed</span>
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
              My Project Requirements
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              {clientProjects.length} Total Projects
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Track approval states, manager allocations, and staffed engineering squads across your project portfolio.
          </p>
        </div>

        <Link
          to="/client/submit-request"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#059669] to-[#10b981] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <FilePlus size={15} />
          <span>Submit Project Request</span>
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, skills, scope..."
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-[#059669]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { label: 'All', value: 'all' },
            { label: 'Pending Approval', value: 'Pending Admin Approval' },
            { label: 'Approved', value: 'Approved' },
            { label: 'In Progress', value: 'In Progress' },
            { label: 'Rejected', value: 'Rejected' },
            { label: 'Completed', value: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === tab.value
                  ? 'bg-[#059669] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Project & Category</th>
                <th className="py-3.5 px-4">Timeline & Duration</th>
                <th className="py-3.5 px-4">Target Budget</th>
                <th className="py-3.5 px-4">Manager</th>
                <th className="py-3.5 px-4">Approval & Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No project requirements found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((prj) => (
                  <tr
                    key={prj.id}
                    onClick={() => navigate(`/client/projects/${prj.id}`)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block">{prj.id}</span>
                        <h4 className="font-bold text-slate-900 line-clamp-1">{prj.title || prj.name}</h4>
                        <p className="text-[10px] text-slate-500">{prj.category || 'Software Engineering'}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{prj.duration || '6 Months'}</p>
                      <p className="text-[10px] text-slate-500">Deadline: {prj.deadline || '2026-12-31'}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{prj.budget || '$160,000'}</p>
                      <p className="text-[10px] text-emerald-600 font-semibold">{prj.priority || 'High'} Priority</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{prj.manager || 'Unassigned'}</p>
                      <span className="text-[10px] text-slate-400">
                        {prj.manager && prj.manager !== 'Unassigned' ? 'Manager' : 'Awaiting Approval'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(prj.status || prj.stage)}
                      {prj.rejectionReason && (
                        <p className="text-[10px] text-rose-600 mt-1 font-medium line-clamp-1">
                          Reason: {prj.rejectionReason}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="text-xs font-bold text-[#059669] hover:text-emerald-700">
                        View Details →
                      </span>
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

export default ClientProjects;
