import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Star,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  Award,
  ChevronRight,
  X,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Ban,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';

export const ManagerWorkforce = () => {
  const { workforce = [] } = useData() || {};
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [selectedProfessional, setSelectedProfessional] = useState(null);

  const filteredWorkforce = useMemo(() => {
    return (workforce || []).filter((emp) => {
      if (roleFilter !== 'all' && !emp.role?.toLowerCase().includes(roleFilter.toLowerCase())) return false;
      if (availabilityFilter !== 'all' && emp.availability?.toLowerCase() !== availabilityFilter.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (emp.name || '').toLowerCase().includes(q);
        const matchesRole = (emp.role || '').toLowerCase().includes(q);
        const matchesSkills = (emp.skills || []).some((s) => s?.toLowerCase().includes(q));
        if (!matchesName && !matchesRole && !matchesSkills) return false;
      }
      return true;
    });
  }, [workforce, roleFilter, availabilityFilter, searchQuery]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#004ac6] to-[#2563eb] text-white flex items-center justify-center shadow-md">
              <Users size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Workforce Talent Pool
              </h1>
              <p className="text-xs text-slate-500">
                Pre-vetted engineering professionals and domain specialists ready for project assignment.
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
          <span>Match with Projects</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search professional by name, role, or skill (e.g., React, Java)..."
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none"
          >
            <option value="all">All Roles</option>
            <option value="frontend">Frontend Developers</option>
            <option value="backend">Backend Architects</option>
            <option value="ui">UI/UX Designers</option>
            <option value="qa">QA Automation</option>
          </select>

          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none"
          >
            <option value="all">All Availability</option>
            <option value="available">Available</option>
            <option value="assigned">Assigned</option>
            <option value="partially available">Partially Available</option>
          </select>
        </div>
      </div>

      {/* Table (Section 6) */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Professional ID</th>
                <th className="py-3.5 px-4">Name & Profile</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Skills</th>
                <th className="py-3.5 px-4">Experience</th>
                <th className="py-3.5 px-4">Availability</th>
                <th className="py-3.5 px-4">Current Status</th>
                <th className="py-3.5 px-4">Assigned Project</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWorkforce.map((emp) => {
                const isAvailable = emp.availability === 'Available';
                return (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500">{emp.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="h-8 w-8 rounded-lg object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{emp.name}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{emp.pseudonym || 'Professional'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{emp.role}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {(emp.skills || []).slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="px-1.5 py-0.2 rounded bg-slate-100 text-[10px] font-semibold text-slate-700">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-semibold">{emp.experience || '3+ Years'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isAvailable ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        <span>{emp.availability}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800">{emp.workingStatus || (isAvailable ? 'Available' : 'Working')}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {emp.assignedProject ? (
                        <span className="font-semibold text-blue-700">{emp.assignedProject}</span>
                      ) : (
                        <span className="text-slate-400 italic">None (On Bench)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedProfessional(emp)}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#004ac6] font-bold text-xs transition-colors"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Professional Profile Modal (Section 7) */}
      <AnimatePresence>
        {selectedProfessional && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProfessional(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedProfessional.avatar}
                    alt={selectedProfessional.name}
                    className="h-12 w-12 rounded-2xl object-cover ring-2 ring-blue-100"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{selectedProfessional.name}</h3>
                    <p className="text-xs text-slate-500">{selectedProfessional.role} • <span className="font-mono">{selectedProfessional.id}</span></p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProfessional(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Badges Section */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Verified Skill Badges
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedProfessional.skills || ['React.js', 'JavaScript', 'HTML5', 'CSS3', 'Bootstrap']).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/70 text-xs font-bold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Profile Details Grid */}
              <div className="grid grid-cols-2 gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Experience</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedProfessional.experience || '3+ Years'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Qualification</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedProfessional.qualification || 'B.S. in Computer Science'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Availability</span>
                  <p className="font-bold text-emerald-700 mt-0.5">{selectedProfessional.availability}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Current Status</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedProfessional.workingStatus || 'Available for Project'}</p>
                </div>
              </div>

              {/* Previous Project Experience */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Previous Project Experience
                </span>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl border border-slate-100 bg-white">
                    <p className="font-bold text-slate-900">E-Commerce & Payment Integration Sprint</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Implemented checkout SDK components and dynamic product filtering.</p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 bg-white">
                    <p className="font-bold text-slate-900">FinTech Analytics Portal</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Built real-time visualization dashboards with sub-second chart response times.</p>
                  </div>
                </div>
              </div>

              {/* Availability Notice */}
              {!(
                (selectedProfessional.availability === 'Available' || selectedProfessional.availability === 'Immediate') &&
                selectedProfessional.workingStatus !== 'Working' &&
                (!selectedProfessional.assignedProject || selectedProfessional.assignedProject === 'None')
              ) && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                  <Clock size={16} className="text-amber-600 shrink-0" />
                  <span>This workforce member is currently active on a project or unavailable and cannot be assigned to a new project.</span>
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProfessional(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Close
                </button>
                {(selectedProfessional.availability === 'Available' || selectedProfessional.availability === 'Immediate') &&
                selectedProfessional.workingStatus !== 'Working' &&
                (!selectedProfessional.assignedProject || selectedProfessional.assignedProject === 'None') ? (
                  <button
                    type="button"
                    onClick={() => {
                      const prof = selectedProfessional;
                      setSelectedProfessional(null);
                      navigate(`/manager/matching?candidate=${prof.id}`);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
                  >
                    <Cpu size={14} />
                    <span>Match with Projects</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 font-bold text-xs cursor-not-allowed flex items-center gap-1.5"
                  >
                    <Ban size={14} />
                    <span>{selectedProfessional.workingStatus === 'Working' || selectedProfessional.availability === 'Assigned' ? 'Currently on Project' : 'Unavailable'}</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManagerWorkforce;
