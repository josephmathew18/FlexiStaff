import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FolderCheck,
  Search,
  Filter,
  Users,
  Cpu,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Layers,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useData } from '../../context/DataContext';

const StatusBadge = ({ status = 'Approved' }) => {
  const normalized = String(status).toLowerCase().trim();
  let bg = 'bg-indigo-50 text-indigo-700 border-indigo-200';

  if (normalized.includes('fully') || normalized === 'approved') {
    bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (normalized.includes('partial') || normalized.includes('matching')) {
    bg = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (normalized.includes('progress')) {
    bg = 'bg-blue-50 text-blue-700 border-blue-200';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${bg}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      <span>{status}</span>
    </span>
  );
};

export const ManagerApprovedProjects = () => {
  const { projects = [], partnerProjects = [] } = useData() || {};
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Filter projects approved by Admin
  const approvedList = useMemo(() => {
    // Combine projects and partner projects
    const all = [...(projects || []), ...(partnerProjects || [])];
    const unique = [];
    const seen = new Set();
    all.forEach((p) => {
      if (p && !seen.has(p.id)) {
        seen.add(p.id);
        // Approved or in assignment stages
        if (
          p.status === 'Approved' ||
          p.status === 'Partially Assigned' ||
          p.status === 'Fully Assigned' ||
          p.status === 'In Progress' ||
          p.approvalStatus === 'Approved' ||
          p.stage?.includes('Approved') ||
          p.stage?.includes('Matching')
        ) {
          unique.push(p);
        }
      }
    });

    return unique.filter((p) => {
      if (priorityFilter !== 'all' && p.priority?.toLowerCase() !== priorityFilter.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (p.name || p.projectName || '').toLowerCase().includes(q);
        const matchesPartner = (p.client || p.partner || p.clientCompany || '').toLowerCase().includes(q);
        const matchesTech = (Array.isArray(p.skills) ? p.skills.join(' ') : (p.techStack || '')).toLowerCase().includes(q);
        if (!matchesName && !matchesPartner && !matchesTech) return false;
      }
      return true;
    });
  }, [projects, partnerProjects, searchQuery, priorityFilter]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#004ac6] to-[#2563eb] text-white flex items-center justify-center shadow-md">
              <FolderCheck size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Approved Projects
              </h1>
              <p className="text-xs text-slate-500">
                Projects reviewed and approved by FlexiStaff Company awaiting workforce matching & squad assignment.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/manager/matching')}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#004ac6] to-[#2563eb] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:from-[#003da6] hover:to-[#1d4ed8] active:scale-95 transition-all self-start md:self-auto"
        >
          <Cpu size={15} />
          <span>Launch Skill Matching</span>
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search approved projects, partner company, or required skills..."
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
          </select>
        </div>
      </div>

      {/* Approved Projects Table (Section 4) */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Project ID</th>
                <th className="py-3.5 px-4">Project Name</th>
                <th className="py-3.5 px-4">Partner Company</th>
                <th className="py-3.5 px-4">Required Workforce</th>
                <th className="py-3.5 px-4">Skills</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Start Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {approvedList.map((prj) => (
                <tr key={prj.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">{prj.id}</td>
                  <td className="py-3.5 px-4">
                    <p
                      onClick={() => navigate(`/manager/projects/${prj.id}`)}
                      className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                    >
                      {prj.name}
                    </p>
                    <p className="text-[11px] text-slate-400">{prj.category}</p>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{prj.client || prj.partner || 'Apex Digital Enterprises'}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-extrabold text-slate-900">{prj.workforceRequired || 6}</span>
                    <span className="text-[11px] text-slate-500 ml-1">({prj.workforceAssigned || 0} Assigned)</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {(prj.techStack || 'React.js, Java, MySQL, Selenium').split(',').slice(0, 3).map((s, idx) => (
                        <span key={idx} className="px-1.5 py-0.2 rounded bg-slate-100 text-[10px] font-semibold text-slate-700">
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      prj.priority === 'Critical' ? 'bg-rose-100 text-rose-800' :
                      prj.priority === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {prj.priority || 'High'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{prj.startDate || '2026-09-01'}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={prj.status === 'Approved' ? 'Approved – Awaiting Assignment' : prj.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => navigate(`/manager/projects/${prj.id}`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/manager/matching/${prj.id}`)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#004ac6] font-bold text-[11px] transition-colors flex items-center gap-1"
                      >
                        <Cpu size={12} />
                        <span>Find Workforce</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/manager/matching/${prj.id}`)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition-colors shadow-2xs"
                      >
                        Assign
                      </button>
                    </div>
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

export default ManagerApprovedProjects;
