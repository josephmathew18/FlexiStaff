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
  FileText,
  Download,
  Eye,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { toast } from 'react-toastify';

export const ClientWorkforce = () => {
  const { clientProfile, projects = [], managerAssignments = [], workforce = [] } = useData() || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [previewResumeModal, setPreviewResumeModal] = useState(null);

  // Client projects list with comprehensive matching (ID, email, company)
  const clientProjects = useMemo(() => {
    let authClientId = clientProfile?.id;
    let authEmail = clientProfile?.email;
    try {
      const savedUserStr = localStorage.getItem('flexistaff_user');
      if (savedUserStr) {
        const u = JSON.parse(savedUserStr);
        if (u) {
          if (u.id) authClientId = u.id;
          if (u.email) authEmail = u.email;
        }
      }
    } catch {}

    const companyName = (clientProfile?.company || clientProfile?.companyName || '').toLowerCase().trim();
    const clientName = (clientProfile?.name || clientProfile?.contactPerson || '').toLowerCase().trim();
    const normAuthEmail = String(authEmail || '').toLowerCase().trim();

    return (projects || []).filter((p) => {
      if (!p) return false;
      const pClientIdStr = String(p.clientId || '').toLowerCase().trim();
      const pClientIdNum = Number(String(p.clientId || '').replace(/\D/g, ''));

      const authClientIdStr = String(authClientId || '').toLowerCase().trim();
      const authClientIdNum = Number(String(authClientId || '').replace(/\D/g, ''));

      const profileIdStr = String(clientProfile?.id || '').toLowerCase().trim();
      const profileIdNum = Number(String(clientProfile?.id || '').replace(/\D/g, ''));

      const isIdMatch = Boolean(
        (authClientIdStr && pClientIdStr === authClientIdStr) ||
        (authClientIdNum && pClientIdNum && authClientIdNum === pClientIdNum) ||
        (profileIdStr && pClientIdStr === profileIdStr) ||
        (profileIdNum && pClientIdNum && profileIdNum === profileIdNum)
      );

      const pEmail = String(p.clientEmail || p.email || '').toLowerCase().trim();
      const isEmailMatch = Boolean(
        normAuthEmail && pEmail && (pEmail === normAuthEmail || pEmail.includes(normAuthEmail) || normAuthEmail.includes(pEmail))
      );

      const pCompany = String(p.client || p.clientCompanyName || p.companyName || p.clientName || '').toLowerCase().trim();
      const isCompanyMatch = Boolean(
        (companyName && pCompany && (pCompany === companyName || pCompany.includes(companyName) || companyName.includes(pCompany))) ||
        (clientName && pCompany && (pCompany === clientName || pCompany.includes(clientName) || clientName.includes(pCompany)))
      );

      return isIdMatch || isEmailMatch || isCompanyMatch;
    });
  }, [projects, clientProfile]);

  const clientProjectIds = useMemo(() => {
    const s = new Set();
    clientProjects.forEach((p) => {
      if (p.id !== undefined && p.id !== null) {
        s.add(String(p.id).toLowerCase().trim());
        const num = String(p.id).replace(/\D/g, '');
        if (num) s.add(num);
      }
    });
    return s;
  }, [clientProjects]);

  const clientProjectNames = useMemo(() => {
    const s = new Set();
    clientProjects.forEach((p) => {
      const name = (p.title || p.name || '').toLowerCase().trim();
      if (name) s.add(name);
    });
    return s;
  }, [clientProjects]);

  // Consolidate deployed workforce roster strictly for the logged-in client's projects
  const deployedWorkforce = useMemo(() => {
    const rosterMap = new Map();

    const makeKey = (projId, name, profId) => {
      const p = String(projId || '').toLowerCase().replace(/[\s_]/g, '-').trim();
      const id = profId ? String(profId).trim().toLowerCase() : '';
      const n = (name || '').toLowerCase().trim();
      return `${p}__${id || n}`;
    };

    // 1. From client projects' assignedResources
    clientProjects.forEach((p) => {
      (p.assignedResources || []).forEach((res) => {
        if (!res) return;
        const st = String(res.status || '').toLowerCase().trim();
        if (st.includes('declined') || st.includes('reject') || st.includes('cancel')) return;

        const isWorking =
          st === 'active' || st === 'working' || st === 'accepted' || st === 'in progress' || st === 'assigned' || st === 'approved';

        const pComp = res.partnerCompanyName || res.partnerCompany || res.partnerName || null;
        const wfType = res.workforceType || (pComp || res.partnerCompanyId ? 'Partner Company' : 'Independent Freelancer');

        const key = makeKey(p.id, res.name || res.professionalName, res.id || res.professionalId);
        rosterMap.set(key, {
          id: `res-${res.id || res.professionalId || Math.random()}`,
          professionalId: res.professionalId || res.id,
          name: res.name || res.professionalName || 'Specialist Engineer',
          role: res.role || res.roleInProject || 'Software Specialist',
          projectId: p.id,
          projectName: p.title || p.name || 'Client Project Pod',
          manager: p.manager || p.managerName || 'Assigned Manager',
          avatar: res.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
          skills: Array.isArray(res.skills) ? res.skills : (res.skills || '').split(',').map((s) => s.trim()).filter(Boolean),
          experience: res.experience || '3+ years',
          hourlyRate: res.hourlyRate || '$95/hr',
          weeklyHours: res.weeklyHours || res.hoursPerWeek || 40,
          status: isWorking ? 'Active' : 'Staged',
          rawStatus: res.status || (isWorking ? 'Active' : 'Staged'),
          joinedDate: res.joinedDate || res.assignedDate || p.startDate || new Date().toISOString().split('T')[0],
          rating: res.rating || 5.0,
          performance: isWorking ? 'Active Assigned Pod Member' : 'Staged for Squad Onboarding',
          workforceType: wfType,
          partnerCompany: pComp,
          phone: res.phone || '',
          email: res.email || res.professionalEmail || '',
        });
      });
    });

    // 2. From managerAssignments
    (managerAssignments || []).forEach((a) => {
      if (!a) return;
      const st = String(a.status || '').toLowerCase().trim();
      if (st.includes('declined') || st.includes('reject') || st.includes('cancel')) return;

      const normAProj = String(a.projectId || '').toLowerCase().replace(/[\s_]/g, '-').trim();
      const numAProj = String(a.projectId || '').replace(/\D/g, '');
      const aProjTitle = (a.projectName || '').toLowerCase().trim();
      const aClient = (a.client || a.clientCompanyName || '').toLowerCase().trim();

      const isForClientProj =
        clientProjectIds.has(normAProj) ||
        (numAProj && clientProjectIds.has(numAProj)) ||
        clientProjectNames.has(aProjTitle) ||
        clientProjects.some((p) => {
          const normPId = String(p.id || '').toLowerCase().replace(/[\s_]/g, '-').trim();
          const numPId = String(p.id || '').replace(/\D/g, '');
          const pTitle = (p.title || p.name || '').toLowerCase().trim();
          const pComp = (p.client || p.clientCompanyName || '').toLowerCase().trim();

          const idMatch = (normAProj && normPId && normAProj === normPId) || (numAProj && numPId && numAProj === numPId);
          const titleMatch = aProjTitle && pTitle && (aProjTitle === pTitle || aProjTitle.includes(pTitle) || pTitle.includes(aProjTitle));
          const clientMatch = aClient && pComp && (aClient === pComp || aClient.includes(pComp) || pComp.includes(aClient));

          return idMatch || titleMatch || clientMatch;
        });

      if (!isForClientProj) return;

      const isWorking =
        st === 'active' || st === 'working' || st === 'accepted' || st === 'in progress' || st === 'assigned' || st === 'approved';

      const key = makeKey(a.projectId, a.professionalName || a.name, a.professionalId || a.id);
      const existing = rosterMap.get(key);

      const pComp = a.partnerCompanyName || a.partnerCompany || a.partnerName || null;
      const wfType = a.workforceType || (pComp || a.partnerCompanyId || a.source === 'Partner Company' ? 'Partner Company' : 'Independent Freelancer');

      if (!existing || (!existing.status === 'Active' && isWorking)) {
        rosterMap.set(key, {
          id: `asg-${a.id || Math.random()}`,
          professionalId: a.professionalId || a.id,
          name: a.professionalName || a.name || 'Specialist Candidate',
          role: a.role || a.roleInProject || 'Software Engineer',
          projectId: a.projectId,
          projectName: a.projectName || 'Client Project Pod',
          manager: a.manager || 'Assigned Manager',
          avatar: a.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
          skills: Array.isArray(a.skills) ? a.skills : (a.skills || '').split(',').map((s) => s.trim()).filter(Boolean),
          experience: a.experience || '3+ years',
          hourlyRate: a.hourlyRate || '$95/hr',
          weeklyHours: a.workload || a.weeklyHours || 40,
          status: isWorking ? 'Active' : 'Staged',
          rawStatus: a.status || (isWorking ? 'Active' : 'Staged'),
          joinedDate: a.assignedDate || new Date().toISOString().split('T')[0],
          rating: a.rating || 5.0,
          performance: isWorking ? 'Active Assigned Pod Member' : 'Staged for Squad Onboarding',
          workforceType: wfType,
          partnerCompany: pComp,
          phone: a.phone || '',
          email: a.email || a.professionalEmail || '',
        });
      }
    });

    return Array.from(rosterMap.values());
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
          <p className="text-2xl font-black text-slate-900">
            {deployedWorkforce.length > 0 ? `${deployedWorkforce.length * 40} Hours` : "0 Hours"}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            {deployedWorkforce.length > 0 ? "Average 40.0 hrs / specialist" : "No hours logged"}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Squad Performance</span>
            <Star size={16} className="text-amber-500 fill-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {deployedWorkforce.length > 0 ? "4.89 / 5.0" : "N/A"}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            {deployedWorkforce.length > 0 ? "Top 5% Talent SLA Benchmark" : "No active squad ratings"}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Assigned Manager</span>
            <UserCheck size={16} className="text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {clientProjects.find((p) => p.manager && p.manager !== 'Unassigned')?.manager || "Thomas Mathew"}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Lead Staffing Manager
          </p>
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
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {member.workforceType === 'Partner Company' ? (member.partnerCompany || 'Partner Company') : 'Independent Freelancer'}
                    </span>
                  </div>
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
                  <span className="text-slate-400 font-semibold block">Workforce Source</span>
                  <span className="font-bold text-slate-900">
                    {selectedContractor.workforceType === 'Partner Company'
                      ? selectedContractor.partnerCompany || 'Partner Company'
                      : 'Independent Freelancer'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Billing Rate</span>
                  <span className="font-bold text-slate-900">{selectedContractor.hourlyRate}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Deployed Since</span>
                  <span className="font-bold text-slate-900">{selectedContractor.joinedDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Supervising Manager</span>
                  <span className="font-bold text-slate-900">{selectedContractor.manager || 'Assigned Manager'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Deployment Status</span>
                  <span className="font-bold text-emerald-700">{selectedContractor.status} ({selectedContractor.rawStatus || 'Assigned'})</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-1.5">Core Technical Stack & Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedContractor.skills || []).map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Work History & Projects */}
              {Array.isArray(selectedContractor.experiences) && selectedContractor.experiences.length > 0 && (
                <div className="space-y-2">
                  <span className="text-slate-400 font-bold block">Verified Commercial Projects & Work History</span>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {selectedContractor.experiences.map((exp, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                        <div className="flex justify-between items-center">
                          <p className="font-bold text-slate-900">{exp.title}</p>
                          {exp.period && <span className="text-[10px] text-slate-500 font-mono">{exp.period}</span>}
                        </div>
                        <p className="text-[11px] text-emerald-700 font-semibold">{exp.company}</p>
                        {exp.description && <p className="text-[11px] text-slate-600 mt-0.5">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Academic Education */}
              {Array.isArray(selectedContractor.educations) && selectedContractor.educations.length > 0 && (
                <div className="space-y-2">
                  <span className="text-slate-400 font-bold block">Academic Qualifications</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedContractor.educations.map((edu, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                        <p className="font-bold text-slate-900 text-[11px]">{edu.degree}</p>
                        <p className="text-[10px] text-slate-600">{edu.school}</p>
                        {(edu.year || edu.dates) && (
                          <span className="text-[9px] text-slate-400 font-mono block">{edu.year || edu.dates}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Professional Certifications */}
              {Array.isArray(selectedContractor.certifications) && selectedContractor.certifications.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-slate-400 font-bold block">Verified Certifications</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedContractor.certifications.map((cert, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold flex items-center gap-1">
                        <CheckCircle2 size={11} className="text-amber-600" />
                        <span>{cert}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Attached Resume Document Card */}
              {selectedContractor.resumeUrl && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 truncate max-w-[180px]">
                        {selectedContractor.resumeName || `${selectedContractor.name}_Resume.pdf`}
                      </p>
                      <span className="text-[10px] text-emerald-800 font-bold block">
                        Verified Attached PDF Document
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewResumeModal({
                          url: selectedContractor.resumeUrl,
                          name: selectedContractor.resumeName || `${selectedContractor.name}_Resume.pdf`,
                          title: `${selectedContractor.name} — Resume Document`,
                        });
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs flex items-center gap-1 transition-all"
                    >
                      <Eye size={12} />
                      <span>Preview</span>
                    </button>
                    <a
                      href={selectedContractor.resumeUrl}
                      download={selectedContractor.resumeName || `${selectedContractor.name}_Resume.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-bold flex items-center gap-1 transition-colors"
                    >
                      <Download size={12} />
                      <span>PDF</span>
                    </a>
                  </div>
                </div>
              )}

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

      {/* EMBEDDED RESUME DOCUMENT VIEWER MODAL */}
      {previewResumeModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div
            onClick={() => setPreviewResumeModal(null)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs"
          />
          <div className="relative z-10 w-full max-w-4xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {previewResumeModal.title || 'Candidate Resume'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {previewResumeModal.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewResumeModal.url}
                  download={previewResumeModal.name || 'Resume.pdf'}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all"
                >
                  <Download size={13} />
                  <span>Download PDF</span>
                </a>
                <a
                  href={previewResumeModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  <ExternalLink size={13} />
                  <span>Open in Tab</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewResumeModal(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg ml-1"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="w-full h-[640px] bg-slate-900 border-0">
              <iframe
                src={previewResumeModal.url}
                title={previewResumeModal.title || 'Resume Document'}
                className="w-full h-full bg-white border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientWorkforce;
