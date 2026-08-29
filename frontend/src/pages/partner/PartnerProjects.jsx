import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  Layers,
  MapPin,
  Calendar,
  Users,
  Eye,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useData } from '../../context/DataContext';

const StatusBadge = ({ status = 'Active', size = 'sm' }) => {
  const normalized = String(status).toLowerCase().trim();
  let bg = 'bg-blue-50 text-blue-700 border-blue-200';

  if (['completed', 'approved'].includes(normalized)) {
    bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['in progress', 'development'].includes(normalized)) {
    bg = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (['pending', 'pending approval', 'pending admin review', 'matching'].includes(normalized)) {
    bg = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (['draft'].includes(normalized)) {
    bg = 'bg-slate-100 text-slate-700 border-slate-200';
  }

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${sizeClasses} ${bg}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      <span>{status}</span>
    </span>
  );
};

export const PartnerProjects = () => {
  const { partnerProjects = [] } = useData() || {};
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('all'); // all | in_progress | pending | matching | completed | draft
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = useMemo(() => {
    return (partnerProjects || []).filter((prj) => {
      if (!prj) return false;
      // Tab filter
      if (activeTab === 'in_progress' && prj.status !== 'In Progress') return false;
      if (activeTab === 'pending' && prj.status !== 'Pending Approval') return false;
      if (activeTab === 'matching' && prj.status !== 'Matching') return false;
      if (activeTab === 'completed' && prj.status !== 'Completed') return false;
      if (activeTab === 'draft' && prj.status !== 'Draft') return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (prj.name || '').toLowerCase().includes(q);
        const matchesCat = (prj.category || '').toLowerCase().includes(q);
        const matchesTech = (prj.techStack || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCat && !matchesTech) return false;
      }

      return true;
    });
  }, [partnerProjects, activeTab, searchQuery]);

  const tabs = [
    { id: 'all', label: 'All Projects', count: (partnerProjects || []).length },
    { id: 'in_progress', label: 'In Progress', count: (partnerProjects || []).filter((p) => p && p.status === 'In Progress').length },
    { id: 'pending', label: 'Pending Approval', count: (partnerProjects || []).filter((p) => p && p.status === 'Pending Approval').length },
    { id: 'matching', label: 'Workforce Matching', count: (partnerProjects || []).filter((p) => p && p.status === 'Matching').length },
    { id: 'completed', label: 'Completed', count: (partnerProjects || []).filter((p) => p && p.status === 'Completed').length },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Partner Project Portfolio
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track allocated project scopes, milestone progression, and sprint progress velocity.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#2563eb] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full rounded-xl border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
          />
        </div>
      </div>

      {/* Projects List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredProjects.map((prj) => (
          <motion.div
            key={prj.id}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#004ac6] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                    {prj.id}
                  </span>
                  <h3
                    onClick={() => navigate(`/partner/projects/${prj.id}`)}
                    className="text-base font-bold text-slate-900 mt-2 hover:text-[#004ac6] transition-colors cursor-pointer"
                  >
                    {prj.name}
                  </h3>
                  <p className="text-xs text-blue-700 font-bold">Client: {prj.client || prj.partner || 'Finovate Global'}</p>
                  <p className="text-xs text-slate-500 font-medium">{prj.category}</p>
                </div>
                <StatusBadge status={prj.status} />
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                {prj.description}
              </p>

              {/* Tech Stack Tags */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(prj.techStack || 'React.js, Node.js, Cloud').split(',').slice(0, 4).map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-semibold text-slate-700"
                  >
                    {tech.trim()}
                  </span>
                ))}
              </div>

              {/* Metrics Grid */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Workforce</span>
                  <span className="block font-extrabold text-slate-900 mt-0.5">
                    {prj.workforceAssigned} / {prj.workforceRequired}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Stage</span>
                  <span className="block font-bold text-blue-600 truncate mt-0.5">{prj.stage}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Duration</span>
                  <span className="block font-bold text-slate-800 mt-0.5">{prj.duration}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-600">Overall Progress</span>
                  <span className="text-blue-600">{prj.progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      prj.progress === 100 ? 'bg-emerald-500' : 'bg-[#2563eb]'
                    }`}
                    style={{ width: `${prj.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Calendar size={12} />
                <span>Starts {prj.startDate}</span>
              </span>

              <button
                type="button"
                onClick={() => navigate(`/partner/projects/${prj.id}`)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-[#2563eb] text-[#004ac6] hover:text-white text-xs font-bold transition-all"
              >
                <span>View Details & Workflow</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PartnerProjects;
