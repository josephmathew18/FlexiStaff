import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Briefcase,
  CheckCircle2,
  Clock,
  Mail,
  ShieldCheck,
  Star,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Award,
  Layers,
  Phone,
  X,
  Plus,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { toast } from 'react-toastify';

export const ClientWorkforce = () => {
  const { clientProfile, projects = [], managerAssignments = [], workforce = [] } = useData() || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedContractor, setSelectedContractor] = useState(null);

  // Client projects list
  const clientProjects = useMemo(() => {
    const companyName = (clientProfile?.company || '').toLowerCase();
    const clientId = clientProfile?.id;
    return projects.filter(
      (p) =>
        p &&
        ((companyName && (p.client || '').toLowerCase() === companyName) ||
          p.clientId === clientId)
    );
  }, [projects, clientProfile]);

  const clientProjectIds = useMemo(() => new Set(clientProjects.map((p) => p.id)), [clientProjects]);
  const clientProjectNames = useMemo(
    () => new Set(clientProjects.map((p) => (p.title || p.name || '').toLowerCase())),
    [clientProjects]
  );

  // Consolidate deployed workforce roster strictly for the logged-in client's projects
  const deployedWorkforce = useMemo(() => {
    // Base roster of active contractors across projects
    const baseRoster = [];

    // Filter base roster strictly to contractors doing projects for THIS client
    const clientBaseRoster = baseRoster.filter((m) => {
      const pNameLower = (m.projectName || '').toLowerCase();
      return (
        clientProjectIds.has(m.projectId) ||
        clientProjectNames.has(pNameLower) ||
        clientProjects.some(
          (p) =>
            p.id === m.projectId ||
            (p.title || p.name || '').toLowerCase() === pNameLower
        )
      );
    });

    // Merge active manager assignments for this client's projects
    const assignedFromManagerRaw = (managerAssignments || [])
      .filter((a) => {
        if (!a) return false;
        const isWorkingState =
          a.status === 'Working' || a.status === 'Accepted' || a.status === 'In Progress' || a.status === 'Assigned';
        const isClientProj =
          clientProjectIds.has(a.projectId) ||
          clientProjectNames.has((a.projectName || '').toLowerCase()) ||
          (clientProfile?.company && (a.client || '').toLowerCase() === clientProfile.company.toLowerCase());
        return isWorkingState && isClientProj;
      });

    const uniqueAssignedManager = [];
    const seenAsgKeys = new Set();
    assignedFromManagerRaw.forEach((a, idx) => {
      const normProj = (a.projectId || '').toLowerCase().replace(/[\s_]/g, '-').trim();
      const normName = (a.professionalName || '').toLowerCase().trim();
      const key = `${normProj}_${normName}`;
      if (!seenAsgKeys.has(key)) {
        seenAsgKeys.add(key);
        uniqueAssignedManager.push({
          id: `asg-${a.id || idx}`,
          name: a.professionalName || 'Specialist Candidate',
          role: a.role || 'Software Engineer',
          projectId: a.projectId,
          projectName: a.projectName || 'Client Project Pod',
          manager: a.manager || 'Assigned Manager',
          avatar: a.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
          skills: a.skills || ['React.js', 'JavaScript'],
          experience: a.experience || '3+ years',
          hourlyRate: a.hourlyRate || '$95/hr',
          weeklyHours: 40,
          status: 'Active',
          joinedDate: a.assignedDate || '2026-08-15',
          rating: 4.8,
          performance: 'Active Assigned Pod Member',
        });
      }
    });

    return [...clientBaseRoster, ...uniqueAssignedManager];
  }, [managerAssignments, clientProjects, clientProjectIds, clientProjectNames]);

  // Filter roster by user search/filters
  const filteredWorkforce = useMemo(() => {
    return deployedWorkforce.filter((member) => {
      let matchesProject = true;
      if (projectFilter !== 'all') {
        matchesProject =
          member.projectId === projectFilter ||
          member.projectName?.toLowerCase().includes(projectFilter.toLowerCase());
      }

      let matchesRole = true;
      if (roleFilter !== 'all') {
        matchesRole = member.role.toLowerCase().includes(roleFilter.toLowerCase());
      }

      let matchesSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = member.name.toLowerCase().includes(q);
        const matchesRoleText = member.role.toLowerCase().includes(q);
        const matchesSkill = member.skills.some((s) => s.toLowerCase().includes(q));
        matchesSearch = matchesName || matchesRoleText || matchesSkill;
      }

      return matchesProject && matchesRole && matchesSearch;
    });
  }, [deployedWorkforce, projectFilter, roleFilter, searchQuery]);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Users size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Professionals
              </h1>
              <p className="text-xs text-slate-500">
                Inspect assigned contractors, skill pods, weekly hours, and performance ratings across your SOW projects.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>{deployedWorkforce.length} Verified Specialists Deployed</span>
          </span>
        </div>
      </div>

      {/* KPI Stats Roster */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Active Squad</span>
            <Users size={16} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{deployedWorkforce.length} Engineers</p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">across {clientProjects.length} active projects</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Weekly Hours Logged</span>
            <Clock size={16} className="text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">185 Hours</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Average 37.0 hrs / specialist</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Squad Performance</span>
            <Star size={16} className="text-amber-500 fill-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">4.89 / 5.0</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Top 5% Talent SLA Benchmark</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Assigned Manager</span>
            <UserCheck size={16} className="text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">Assigned Manager</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Lead Client Success Manager</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search specialist name, skill, or role..."
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-emerald-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Project Filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-600"
          >
            <option value="all">All Projects</option>
            {clientProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title || p.name}
              </option>
            ))}
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-600"
          >
            <option value="all">All Roles</option>
            <option value="QA">QA & Testing</option>
            <option value="Frontend">Frontend Developer</option>
            <option value="Backend">Backend / ML</option>
            <option value="DevOps">DevOps & Cloud</option>
            <option value="UI/UX">UI/UX Designer</option>
          </select>
        </div>
      </div>

      {/* Workforce Roster Grid */}
      {filteredWorkforce.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-400">
          <Users className="mx-auto h-10 w-10 text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No assigned specialists found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Only specialists assigned to your active project pods are displayed here. Submit a project requirement to request talent.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWorkforce.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Member Header */}
              <div className="flex items-start gap-3 mb-4">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-100 shadow-xs shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-extrabold text-slate-900 text-sm truncate">{member.name}</h3>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        member.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {member.status}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700 font-bold line-clamp-1">{member.role}</p>
                  <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                    {member.projectName}
                  </p>
                </div>
              </div>

              {/* Skills Chips */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {member.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Details Row */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl text-[11px] border border-slate-100 mb-4">
                <div>
                  <span className="text-slate-400 block font-medium">Hourly Billing Rate</span>
                  <span className="font-extrabold text-slate-900">{member.hourlyRate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Weekly Capacity</span>
                  <span className="font-extrabold text-slate-900">{member.weeklyHours} hrs/wk</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Rating Score</span>
                  <span className="font-extrabold text-amber-600 flex items-center gap-1">
                    <Star size={11} className="fill-amber-500 text-amber-500" /> {member.rating} / 5.0
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Manager</span>
                  <span className="font-extrabold text-slate-900">{member.manager}</span>
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedContractor(member)}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
              >
                View Full Profile
              </button>
              <button
                type="button"
                onClick={() => toast.info(`Message request sent to Manager ${member.manager} regarding ${member.name}.`)}
                className="py-2 px-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs transition-colors"
              >
                Contact
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Specialist Details Modal */}
      {selectedContractor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <img
                  src={selectedContractor.avatar}
                  alt={selectedContractor.name}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-200"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedContractor.name}</h3>
                  <p className="text-[11px] text-emerald-700 font-bold">{selectedContractor.role}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedContractor(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-bold block">Assigned SOW Project</span>
                <p className="font-extrabold text-slate-900 text-sm">{selectedContractor.projectName}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 font-semibold block">Experience</span>
                  <span className="font-bold text-slate-900">{selectedContractor.experience}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Performance Note</span>
                  <span className="font-bold text-emerald-700">{selectedContractor.performance}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Billing Rate</span>
                  <span className="font-bold text-slate-900">{selectedContractor.hourlyRate}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Deployed Since</span>
                  <span className="font-bold text-slate-900">{selectedContractor.joinedDate}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-1.5">Core Technical Stack & Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedContractor.skills.map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedContractor(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedContractor(null);
                    toast.success(`Request logged for ${selectedContractor.name}. Manager will reach out.`);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/20"
                >
                  Request Resource Adjustment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientWorkforce;
