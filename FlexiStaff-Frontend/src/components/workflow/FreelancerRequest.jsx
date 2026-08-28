import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  User,
  Star,
  Send,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  Sparkles,
  AlertCircle,
  Eye,
  DollarSign,
  Activity,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { toast } from 'react-toastify';

export const FreelancerRequest = ({ project, onDirectRequestSent, onSelectCandidate }) => {
  const { workforce = [], sendFreelancerWorkforceRequest } = useData() || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [maxWorkload, setMaxWorkload] = useState(100);

  // Request Confirmation Modal for a specific freelancer
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [requestNotes, setRequestNotes] = useState('');

  // Filter only independent Freelancers
  const freelancerPool = useMemo(() => {
    return (workforce || []).filter((w) => {
      if (!w) return false;
      const isFreelancer =
        w.roleType === 'Freelancer' ||
        w.source === 'Freelancer' ||
        (w.partnerName && w.partnerName.toLowerCase().includes('freelancer')) ||
        !w.partnerCompany;
      return isFreelancer;
    });
  }, [workforce]);

  // Distinct roles in freelancer pool
  const allRoles = useMemo(() => {
    const set = new Set();
    freelancerPool.forEach((f) => {
      if (f.role || f.title) set.add(f.role || f.title);
    });
    return ['all', ...Array.from(set)];
  }, [freelancerPool]);

  // Filtered Freelancers
  const filteredFreelancers = useMemo(() => {
    return freelancerPool.filter((fl) => {
      if (roleFilter !== 'all' && fl.role !== roleFilter && fl.title !== roleFilter) return false;
      if (availabilityFilter !== 'all' && (fl.availability || '').toLowerCase() !== availabilityFilter.toLowerCase()) return false;
      if ((fl.workload || 0) > maxWorkload) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (fl.name || '').toLowerCase().includes(q) || (fl.pseudonym || '').toLowerCase().includes(q);
        const matchesRole = (fl.role || '').toLowerCase().includes(q) || (fl.title || '').toLowerCase().includes(q);
        const matchesSkills = Array.isArray(fl.skills)
          ? fl.skills.some((s) => String(s).toLowerCase().includes(q))
          : String(fl.skills || '').toLowerCase().includes(q);
        if (!matchesName && !matchesRole && !matchesSkills) return false;
      }
      return true;
    });
  }, [freelancerPool, roleFilter, availabilityFilter, maxWorkload, searchQuery]);

  const handleSendRequest = (e) => {
    e.preventDefault();
    if (!selectedFreelancer) return;

    const payload = {
      freelancerId: selectedFreelancer.id,
      freelancerName: selectedFreelancer.name || selectedFreelancer.pseudonym,
      projectId: project?.id || 'PRJ-101',
      projectName: project?.name || project?.title || 'Enterprise Project',
      client: project?.client || 'Enterprise Client',
      role: selectedFreelancer.role || 'Senior Specialist',
      skills: selectedFreelancer.skills || [],
      experience: selectedFreelancer.experience || '3+ years',
      notes: requestNotes,
    };

    if (sendFreelancerWorkforceRequest) {
      sendFreelancerWorkforceRequest(payload);
    }

    toast.success(
      `Workforce Request sent to ${selectedFreelancer.name || 'Freelancer'}! Freelancer will review and respond.`
    );

    if (onDirectRequestSent) onDirectRequestSent(payload);
    setSelectedFreelancer(null);
    setRequestNotes('');
  };

  return (
    <div className="space-y-4 text-xs text-slate-700">
      {/* Filter Bar */}
      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search independent freelancers by name, skill (e.g. Python, React), or role..."
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Role Filter</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-800 font-medium outline-none"
            >
              <option value="all">All Freelancer Roles</option>
              {allRoles.filter((r) => r !== 'all').map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Availability</label>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-800 font-medium outline-none"
            >
              <option value="all">All Availability</option>
              <option value="available">Available Now</option>
              <option value="immediate">Immediate</option>
              <option value="partially available">Partially Available</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Max Workload: {maxWorkload}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={10}
              value={maxWorkload}
              onChange={(e) => setMaxWorkload(Number(e.target.value))}
              className="w-full h-2 rounded-lg bg-slate-200 accent-[#004ac6] cursor-pointer mt-2"
            />
          </div>
        </div>
      </div>

      {/* Freelancers List */}
      <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
        {filteredFreelancers.map((fl) => (
          <div
            key={fl.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all"
          >
            <div className="flex items-start gap-3 min-w-0">
              <img
                src={fl.avatar}
                alt={fl.name}
                className="w-11 h-11 rounded-2xl object-cover ring-1 ring-slate-200 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-xs truncate">{fl.name || fl.pseudonym}</h4>
                  <span className="px-2 py-0.2 rounded-md bg-purple-50 text-purple-700 text-[10px] font-extrabold border border-purple-100">
                    Independent Freelancer
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-blue-600 truncate">{fl.role || fl.title}</p>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                  <span>Exp: <strong>{fl.experience || '3+ yrs'}</strong></span>
                  <span>Rate: <strong>{fl.hourlyRate || '$95/hr'}</strong></span>
                  <span>Workload: <strong className={fl.workload > 70 ? 'text-amber-600' : 'text-emerald-600'}>{fl.workload || 0}%</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {onSelectCandidate && (
                <button
                  type="button"
                  onClick={() => onSelectCandidate(fl)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors"
                >
                  Select for Roster
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedFreelancer(fl)}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-blue-50 text-[#004ac6] hover:bg-blue-100 font-bold text-xs transition-colors"
              >
                <Send size={12} />
                <span>Send Request</span>
              </button>
            </div>
          </div>
        ))}

        {filteredFreelancers.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            No independent freelancers matched your search filters.
          </div>
        )}
      </div>

      {/* Send Request Modal */}
      {selectedFreelancer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Send Workforce Request to {selectedFreelancer.name}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Project: {project?.name || 'Enterprise Project'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFreelancer(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendRequest} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Project Assignment Notes</label>
                <textarea
                  rows={3}
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  placeholder="Outline key deliverables, codebase architecture, and expected sprint commitment..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFreelancer(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  <Send size={13} />
                  <span>Send Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerRequest;
