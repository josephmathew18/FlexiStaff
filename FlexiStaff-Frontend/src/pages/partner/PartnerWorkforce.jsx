import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ChevronDown,
  X,
  Check,
  Eye,
  Briefcase,
  Layers,
  Sparkles,
  AlertCircle,
  FolderSearch,
  ExternalLink,
  ShieldCheck,
  Activity,
  ListTodo,
  UserPlus,
  Plus,
  GitPullRequest,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { toast } from 'react-toastify';

// Reusable Availability & Working Status Badges
const AvailabilityBadge = ({ availability = 'Available' }) => {
  const normalized = String(availability).toLowerCase().trim();
  let color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let dot = 'bg-emerald-500';

  if (normalized === 'partially available') {
    color = 'bg-amber-50 text-amber-700 border-amber-200';
    dot = 'bg-amber-500';
  } else if (normalized === 'assigned') {
    color = 'bg-blue-50 text-blue-700 border-blue-200';
    dot = 'bg-blue-500';
  } else if (normalized === 'unavailable') {
    color = 'bg-rose-50 text-rose-700 border-rose-200';
    dot = 'bg-rose-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      <span>{availability}</span>
    </span>
  );
};

const WorkingStatusBadge = ({ status = 'Working' }) => {
  const normalized = String(status).toLowerCase().trim();
  let color = 'bg-blue-50 text-blue-700 border-blue-200';

  if (normalized === 'completed') {
    color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (normalized === 'on hold') {
    color = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (normalized === 'not started') {
    color = 'bg-slate-100 text-slate-700 border-slate-200';
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${color}`}>
      <span>{status}</span>
    </span>
  );
};

const RequestStatusBadge = ({ status = 'Pending' }) => {
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

export const PartnerWorkforce = () => {
  const navigate = useNavigate();
  const {
    partnerWorkforce = [],
    partnerWorkforceRequests = [],
    partnerProjects = [],
    updatePartnerProfessionalAvailability,
    respondPartnerWorkforceRequest,
    rejectPartnerWorkforceRequest,
  } = useData() || {};

  // Top-level View Tab: 'roster' | 'requests'
  const [activeView, setActiveView] = useState('roster');

  // Workforce Roster Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected Professional Details Modal
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Workforce Requests Filters & Fulfillment Modal
  const [requestSearch, setRequestSearch] = useState('');
  const [requestStatusFilter, setRequestStatusFilter] = useState('all');
  const [fulfillingRequest, setFulfillingRequest] = useState(null);
  const [selectedProfIdsForFulfillment, setSelectedProfIdsForFulfillment] = useState([]);

  // Extract all distinct roles
  const allRoles = useMemo(() => {
    const set = new Set();
    (partnerWorkforce || []).forEach((w) => {
      if (w && (w.roleCategory || w.role)) set.add(w.roleCategory || w.role);
    });
    return ['all', ...Array.from(set)];
  }, [partnerWorkforce]);

  // Extract all distinct projects
  const allProjects = useMemo(() => {
    const set = new Set();
    (partnerWorkforce || []).forEach((w) => {
      if (w && w.assignedProject) set.add(w.assignedProject);
    });
    return ['all', ...Array.from(set)];
  }, [partnerWorkforce]);

  const filteredWorkforce = useMemo(() => {
    return (partnerWorkforce || []).filter((emp) => {
      if (!emp) return false;
      if (projectFilter !== 'all' && emp.assignedProject !== projectFilter) return false;
      if (roleFilter !== 'all' && emp.roleCategory !== roleFilter && emp.role !== roleFilter) return false;
      if (availabilityFilter !== 'all' && (emp.availability || '').toLowerCase() !== availabilityFilter.toLowerCase()) return false;
      if (statusFilter !== 'all' && (emp.workingStatus || '').toLowerCase() !== statusFilter.toLowerCase()) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (emp.name || '').toLowerCase().includes(q) || (emp.pseudonym || '').toLowerCase().includes(q);
        const matchesRole = (emp.role || '').toLowerCase().includes(q);
        const matchesSkills = Array.isArray(emp.skills)
          ? emp.skills.some((s) => String(s).toLowerCase().includes(q))
          : String(emp.skills || '').toLowerCase().includes(q);
        const matchesLocation = (emp.location || '').toLowerCase().includes(q);
        if (!matchesName && !matchesRole && !matchesSkills && !matchesLocation) return false;
      }

      return true;
    });
  }, [partnerWorkforce, projectFilter, roleFilter, availabilityFilter, statusFilter, searchQuery]);

  // Workforce Requests computations
  const filteredRequests = useMemo(() => {
    return (partnerWorkforceRequests || []).filter((req) => {
      if (!req) return false;
      if (requestStatusFilter !== 'all' && (req.status || '').toLowerCase() !== requestStatusFilter.toLowerCase()) return false;
      if (requestSearch.trim()) {
        const q = requestSearch.toLowerCase();
        const matchesRole = (req.role || '').toLowerCase().includes(q);
        const matchesProject = (req.projectName || '').toLowerCase().includes(q);
        const matchesSkills = (req.skills || '').toLowerCase().includes(q);
        if (!matchesRole && !matchesProject && !matchesSkills) return false;
      }
      return true;
    });
  }, [partnerWorkforceRequests, requestStatusFilter, requestSearch]);

  const totalRequired = useMemo(() => (partnerWorkforceRequests || []).reduce((s, r) => s + (r?.required || 0), 0), [partnerWorkforceRequests]);
  const totalAssigned = useMemo(() => (partnerWorkforceRequests || []).reduce((s, r) => s + (r?.assigned || 0), 0), [partnerWorkforceRequests]);
  const totalRemaining = Math.max(0, totalRequired - totalAssigned);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header & Primary Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Workforce & Talent Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage company talent roster, inspect staffing requests, and configure availability.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/partner/workforce/register')}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#004ac6] to-[#2563eb] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <UserPlus size={15} />
            <span>Add Professional</span>
          </button>
        </div>
      </div>

      {/* Main Mode Tabs: Workforce Roster vs Workforce Requests */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveView('roster')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeView === 'roster'
              ? 'border-[#004ac6] text-[#004ac6]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users size={16} />
          <span>Talent Roster</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
            activeView === 'roster' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
          }`}>
            {(partnerWorkforce || []).length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('requests')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeView === 'requests'
              ? 'border-[#004ac6] text-[#004ac6]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <GitPullRequest size={16} />
          <span>Staffing Requests & Fulfillment</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
            activeView === 'requests' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
          }`}>
            {(partnerWorkforceRequests || []).length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: WORKFORCE TALENT ROSTER */}
      {/* ========================================================================= */}
      {activeView === 'roster' && (
        <div className="space-y-6">
          {/* Filter Controls Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            {/* Search */}
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search workforce by ID, role, project, or technical skills..."
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-[#004ac6]"
              />
            </div>

            {/* Filters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Project</label>
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 font-medium outline-none"
                >
                  <option value="all">All Projects</option>
                  {allProjects.filter((p) => p !== 'all').map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 font-medium outline-none"
                >
                  <option value="all">All Roles</option>
                  {allRoles.filter((r) => r !== 'all').map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Availability</label>
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 font-medium outline-none"
                >
                  <option value="all">All Availability</option>
                  <option value="available">Available</option>
                  <option value="partially available">Partially Available</option>
                  <option value="assigned">Assigned</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Working Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 font-medium outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="working">Working</option>
                  <option value="on hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="not started">Not Started</option>
                </select>
              </div>
            </div>
          </div>

          {/* Workforce Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredWorkforce.map((emp) => (
              <motion.div
                key={emp.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Header: Photo + Pseudonym + Badges */}
                  <div className="flex items-start gap-3">
                    <img
                      src={emp.avatar}
                      alt={emp.pseudonym || emp.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 shadow-xs shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {emp.pseudonym || emp.name}
                        </h3>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">{emp.id}</span>
                      </div>
                      <p className="text-xs font-semibold text-blue-600 truncate">{emp.role}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <AvailabilityBadge availability={emp.availability} />
                        <WorkingStatusBadge status={emp.workingStatus} />
                      </div>
                    </div>
                  </div>

                  {/* Project & Client Metadata */}
                  <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-semibold">Working Project:</span>
                      <span className="font-bold text-slate-900 truncate max-w-[170px]">
                        {emp.assignedProject || 'E-Commerce Platform Development'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-semibold">Client Company:</span>
                      <span className="font-bold text-blue-700 truncate max-w-[170px]">
                        {emp.clientName || 'Finovate Global'}
                      </span>
                    </div>
                    {emp.currentMilestone && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-semibold">Task Deliverable:</span>
                        <span className="font-medium text-slate-600 truncate max-w-[170px]">
                          {String(emp.currentMilestone).replace(/^Milestone \d+:\s*/i, '')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Live Progress Bar & Percentage */}
                  <div className="mt-3 space-y-1 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/70">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-600">Employee Project Progress</span>
                      <span className="text-blue-700 font-extrabold">{emp.workProgress || 75}% In Progress</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#004ac6] to-[#2563eb]"
                        style={{ width: `${emp.workProgress || 75}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 pt-0.5">
                      Latest Commit: <code className="font-mono text-slate-700 font-bold">#a7f3d91</code> feat(auth): JWT Token rotation
                    </p>
                  </div>

                  {/* Skills Tags */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(Array.isArray(emp.skills) ? emp.skills : (emp.skills || '').split(',')).slice(0, 3).map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]"
                      >
                        {String(sk).trim()}
                      </span>
                    ))}
                    {(Array.isArray(emp.skills) ? emp.skills : (emp.skills || '').split(',')).length > 3 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 font-bold text-[10px]">
                        +{(Array.isArray(emp.skills) ? emp.skills : (emp.skills || '').split(',')).length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-900">{emp.hourlyRate || '$85/hr'}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedEmployee(emp)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-[#004ac6] hover:bg-blue-100 text-xs font-bold transition-colors"
                  >
                    <Eye size={13} />
                    <span>View Profile</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredWorkforce.length === 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-3">
              <Users size={32} className="mx-auto text-slate-300" />
              <h3 className="font-bold text-slate-800 text-sm">No professionals matched your filters</h3>
              <p className="text-xs text-slate-500">Try adjusting your search criteria or register new talent.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: WORKFORCE REQUESTS & ALLOCATIONS */}
      {/* ========================================================================= */}
      {activeView === 'requests' && (
        <div className="space-y-6">
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
                  {totalRequired > 0 ? Math.round((totalAssigned / totalRequired) * 100) : 0}% Fulfilled
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
                value={requestSearch}
                onChange={(e) => setRequestSearch(e.target.value)}
                placeholder="Search requested roles, skills, or projects..."
                className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={requestStatusFilter}
                onChange={(e) => setRequestStatusFilter(e.target.value)}
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

          {/* Requirements Fulfillment Table */}
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
                  {filteredRequests.map((req) => {
                    const remaining = Math.max(0, req.required - req.assigned);
                    return (
                      <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-bold text-slate-900 block">{req.role}</span>
                            <span className="text-[10px] text-slate-400">{req.skills}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-slate-800">{req.projectName}</span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{req.required}</td>
                        <td className="py-3.5 px-4 font-bold text-emerald-600">{req.assigned}</td>
                        <td className="py-3.5 px-4 font-bold text-amber-600">{remaining}</td>
                        <td className="py-3.5 px-4">
                          <RequestStatusBadge status={req.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setFulfillingRequest(req);
                                setSelectedProfIdsForFulfillment([]);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#004ac6] text-white hover:bg-[#003da6] text-xs font-bold shadow-xs active:scale-95 transition-all"
                            >
                              <Users size={12} />
                              <span>Select & Respond</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveView('roster');
                                setRoleFilter(req.role);
                                toast.info(`Filtered workforce roster for ${req.role}`);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                              title="View in Talent Roster"
                            >
                              <ArrowRight size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRequests.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No workforce requirements match the specified filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROFESSIONAL PROFILE DETAILS MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEmployee(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 p-6 bg-slate-50/70">
                <div className="flex items-center gap-3.5">
                  <img
                    src={selectedEmployee.avatar}
                    alt={selectedEmployee.pseudonym || selectedEmployee.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white shadow-sm"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{selectedEmployee.pseudonym || selectedEmployee.name}</h3>
                    <p className="text-xs font-semibold text-blue-600">{selectedEmployee.role}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <AvailabilityBadge availability={selectedEmployee.availability} />
                      <WorkingStatusBadge status={selectedEmployee.workingStatus} />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedEmployee(null)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 max-h-[72vh] overflow-y-auto space-y-5 text-xs">
                {/* Project Metadata Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Assigned Project</span>
                    <p className="font-bold text-slate-900 mt-0.5">{selectedEmployee.assignedProject || 'None'}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Current Milestone</span>
                    <p className="font-bold text-slate-900 mt-0.5">{selectedEmployee.currentMilestone || 'Sprint Active'}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-200/70 space-y-2">
                  <div className="flex items-center justify-between font-extrabold text-slate-900">
                    <span>Employee Work Progress</span>
                    <span className="text-[#004ac6] text-sm">{selectedEmployee.workProgress || 70}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-white border border-blue-200 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#004ac6] to-[#2563eb] rounded-full"
                      style={{ width: `${selectedEmployee.workProgress || 70}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 text-right">
                    Last Updated: <strong>{selectedEmployee.lastUpdated || 'Today'}</strong>
                  </p>
                </div>

                {/* Technical Skills */}
                <div>
                  <h4 className="font-bold text-slate-900 text-xs mb-2">Technical Skills & Competencies</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(selectedEmployee.skills) ? selectedEmployee.skills : (selectedEmployee.skills || '').split(',')).map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-[11px]">
                        {String(skill).trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Update Availability Controls for Partner */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">Set Professional Availability</span>
                    <span className="text-[10px] text-slate-500 font-semibold">Live Talent Pool Status</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {['Available', 'Partially Available', 'Assigned', 'Unavailable'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          if (typeof updatePartnerProfessionalAvailability === 'function') {
                            updatePartnerProfessionalAvailability(selectedEmployee.id, st);
                          }
                          setSelectedEmployee((prev) => ({ ...prev, availability: st }));
                          toast.success(`Updated availability to ${st}`);
                        }}
                        className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all ${
                          selectedEmployee.availability === st
                            ? 'bg-[#004ac6] text-white border-[#004ac6] shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compliance & Privacy Assurance Banner */}
                <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-slate-600 shrink-0" />
                  <span>Personal employee information, compensation, and attendance are strictly safeguarded under enterprise compliance policy.</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* SELECT & RESPOND WORKFORCE FULFILLMENT MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {fulfillingRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFulfillingRequest(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 p-6 bg-slate-50/70">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#004ac6] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      {fulfillingRequest.projectId || 'PRJ'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold">
                      Workforce Request Fulfillment
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">
                    Select Professionals for {fulfillingRequest.role}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Project: <strong>{fulfillingRequest.projectName}</strong> | Required Count: <strong>{fulfillingRequest.required}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setFulfillingRequest(null)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 max-h-[72vh] overflow-y-auto space-y-4 text-xs text-slate-700">
                {/* Requirements Summary */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>Required Skills: {fulfillingRequest.skills}</span>
                    <span className="text-[#004ac6]">Needed: {fulfillingRequest.required}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Select suitable active professionals from your talent roster to propose to the Organization Manager.
                  </p>
                </div>

                {/* Candidate Selection List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>Your Qualified Professionals</span>
                    <span className="text-[11px] text-slate-500">
                      Selected: {selectedProfIdsForFulfillment.length} / {fulfillingRequest.required}
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                    {partnerWorkforce.map((prof) => {
                      const isSelected = selectedProfIdsForFulfillment.includes(prof.id);
                      return (
                        <div
                          key={prof.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedProfIdsForFulfillment(
                                selectedProfIdsForFulfillment.filter((id) => id !== prof.id)
                              );
                            } else {
                              if (selectedProfIdsForFulfillment.length >= fulfillingRequest.required) {
                                toast.warning(`You can select up to ${fulfillingRequest.required} professional(s).`);
                                return;
                              }
                              setSelectedProfIdsForFulfillment([...selectedProfIdsForFulfillment, prof.id]);
                            }
                          }}
                          className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-blue-50/60 border-[#004ac6] shadow-2xs'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded-md border-slate-300 text-[#004ac6] focus:ring-0"
                            />
                            <img
                              src={prof.avatar}
                              alt={prof.name}
                              className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                            />
                            <div>
                              <h5 className="font-bold text-slate-900 text-xs">
                                {prof.name || prof.pseudonym}
                              </h5>
                              <p className="text-[11px] text-blue-600 font-semibold">{prof.role}</p>
                              <span className="text-[10px] text-slate-400">
                                Status: <strong>{prof.availability}</strong>
                              </span>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof rejectPartnerWorkforceRequest === 'function') {
                        rejectPartnerWorkforceRequest(fulfillingRequest.id, 'Talent currently unavailable on requested dates');
                      }
                      toast.info(`Declined workforce request for ${fulfillingRequest.role}.`);
                      setFulfillingRequest(null);
                    }}
                    className="px-3.5 py-2 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-colors"
                  >
                    Decline Request
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFulfillingRequest(null)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={selectedProfIdsForFulfillment.length === 0}
                      onClick={() => {
                        if (typeof respondPartnerWorkforceRequest === 'function') {
                          respondPartnerWorkforceRequest(fulfillingRequest.id, selectedProfIdsForFulfillment);
                        }
                        toast.success(`Responded to Manager with ${selectedProfIdsForFulfillment.length} selected professional(s)!`);
                        setFulfillingRequest(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <CheckCircle2 size={13} />
                      <span>Submit Selection to Manager</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PartnerWorkforce;
