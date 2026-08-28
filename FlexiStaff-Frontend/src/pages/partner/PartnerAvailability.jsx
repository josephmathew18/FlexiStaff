import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ChevronDown,
  Activity,
  Layers,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { toast } from 'react-toastify';

export const PartnerAvailability = () => {
  const { partnerWorkforce = [], updatePartnerProfessionalAvailability } = useData() || {};
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  const filtered = useMemo(() => {
    return (partnerWorkforce || []).filter((emp) => {
      if (!emp) return false;
      if (availabilityFilter !== 'all' && (emp.availability || '').toLowerCase() !== availabilityFilter.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (emp.name || '').toLowerCase().includes(q) || (emp.pseudonym || '').toLowerCase().includes(q);
        const matchesRole = (emp.role || '').toLowerCase().includes(q);
        const matchesProject = (emp.assignedProject || '').toLowerCase().includes(q);
        if (!matchesName && !matchesRole && !matchesProject) return false;
      }
      return true;
    });
  }, [partnerWorkforce, availabilityFilter, searchQuery]);

  const handleAvailabilityChange = (id, newAvailability) => {
    if (typeof updatePartnerProfessionalAvailability === 'function') {
      updatePartnerProfessionalAvailability(id, newAvailability);
    }
    toast.success(`Updated availability to ${newAvailability}`);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Workforce Availability Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time availability status, bench allocations, and task activity across all talent assigned to your partner portfolio.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/partner/support')}
          className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#1d4ed8] active:scale-95 transition-all self-start md:self-auto"
        >
          <span>Request Additional Staffing</span>
        </button>
      </div>

      {/* 4 Availability Indicators Legend Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div
          onClick={() => setAvailabilityFilter('available')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            availabilityFilter === 'available' ? 'bg-emerald-100/70 border-emerald-400 ring-2 ring-emerald-500/20' : 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Available
            </span>
            <span className="text-xs font-black text-emerald-700">8</span>
          </div>
          <p className="text-[11px] text-emerald-800 mt-1 font-medium">Ready for immediate project sprint allocation</p>
        </div>

        <div
          onClick={() => setAvailabilityFilter('partially available')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            availabilityFilter === 'partially available' ? 'bg-amber-100/70 border-amber-400 ring-2 ring-amber-500/20' : 'bg-amber-50/50 border-amber-200 hover:bg-amber-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              Partially Available
            </span>
            <span className="text-xs font-black text-amber-700">6</span>
          </div>
          <p className="text-[11px] text-amber-800 mt-1 font-medium">50% bandwidth available for new assignments</p>
        </div>

        <div
          onClick={() => setAvailabilityFilter('assigned')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            availabilityFilter === 'assigned' ? 'bg-blue-100/70 border-blue-400 ring-2 ring-blue-500/20' : 'bg-blue-50/50 border-blue-200 hover:bg-blue-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              Assigned
            </span>
            <span className="text-xs font-black text-blue-700">26</span>
          </div>
          <p className="text-[11px] text-blue-800 mt-1 font-medium">Fully allocated on active project sprints</p>
        </div>

        <div
          onClick={() => setAvailabilityFilter('unavailable')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            availabilityFilter === 'unavailable' ? 'bg-rose-100/70 border-rose-400 ring-2 ring-rose-500/20' : 'bg-rose-50/50 border-rose-200 hover:bg-rose-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              Unavailable
            </span>
            <span className="text-xs font-black text-rose-700">4</span>
          </div>
          <p className="text-[11px] text-rose-800 mt-1 font-medium">Bench rotation, leave, or security onboarding</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter workforce availability..."
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
          />
        </div>

        <div className="flex items-center gap-2">
          {availabilityFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setAvailabilityFilter('all')}
              className="text-xs font-bold text-blue-600 hover:underline px-2 py-1"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Availability Table (Section 18) */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Project</th>
                <th className="py-3.5 px-4">Availability</th>
                <th className="py-3.5 px-4">Working Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img src={emp.avatar} alt={emp.pseudonym} className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200" />
                      <div>
                        <p className="font-bold text-slate-900">{emp.pseudonym}</p>
                        <p className="text-[10px] text-slate-400 font-mono">ID: {emp.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-blue-600">{emp.role}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{emp.assignedProject}</td>
                  <td className="py-3.5 px-4">
                    <select
                      value={emp.availability}
                      onChange={(e) => handleAvailabilityChange(emp.id, e.target.value)}
                      className={`text-xs font-bold rounded-xl px-2.5 py-1 border outline-none cursor-pointer ${
                        emp.availability === 'Available'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : emp.availability === 'Partially Available'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : emp.availability === 'Assigned'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      <option value="Available">Available</option>
                      <option value="Partially Available">Partially Available</option>
                      <option value="Assigned">Assigned</option>
                      <option value="Unavailable">Unavailable</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-700">
                      {emp.workingStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => navigate('/partner/workforce')}
                      className="text-xs font-bold text-[#004ac6] hover:underline"
                    >
                      View Details
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

export default PartnerAvailability;
