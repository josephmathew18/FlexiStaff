import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FolderKanban,
  PlayCircle,
  CheckCircle2,
  Users,
  Code2,
  Clock,
  ArrowRight,
  TrendingUp,
  Building2,
  Calendar,
  Sparkles,
  ExternalLink,
  Handshake,
  ShieldCheck,
  UserCheck,
  Star,
  Award,
  Plus,
  Activity,
  DollarSign,
  FileCheck,
  UserX,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { motion } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

// --- INLINE REUSABLE COMPONENTS ---
const StatusBadge = ({ status = 'Active', size = 'md' }) => {
  const normalized = String(status).toLowerCase().trim();
  let bg = 'bg-blue-50 text-blue-700 border-blue-200';
  let icon = PlayCircle;

  if (['completed', 'approved', 'verified', 'active'].includes(normalized)) {
    bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    icon = CheckCircle2;
  } else if (['in progress', 'planning', 'assigned'].includes(normalized)) {
    bg = 'bg-indigo-50 text-[#004ac6] border-indigo-200';
    icon = Clock;
  } else if (['request', 'pending', 'pending review'].includes(normalized)) {
    bg = 'bg-amber-50 text-amber-700 border-amber-200';
    icon = Clock;
  } else if (['rejected', 'inactive'].includes(normalized)) {
    bg = 'bg-rose-50 text-rose-700 border-rose-200';
    icon = AlertCircle;
  }

  const IconComponent = icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${bg}`}>
      <IconComponent size={12} />
      <span>{status}</span>
    </span>
  );
};

const DashboardCard = ({ title, value, icon: Icon, trend, trendLabel = 'vs last month', color = 'blue', subtitle, onClick }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-[#004ac6] border-blue-200/60',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200/60',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
    amber: 'bg-amber-50 text-amber-600 border-amber-200/60',
    purple: 'bg-purple-50 text-purple-600 border-purple-200/60',
  };
  const iconStyle = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl border border-[#c3c6d7]/60 dark:border-white/10 bg-white dark:bg-[#14132b] p-5 shadow-xs transition-all ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#737686] dark:text-slate-400">{title}</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-[#191b23] dark:text-white sm:text-3xl">{value}</h3>
          {subtitle && <p className="mt-1 text-xs text-[#565e74] dark:text-slate-400">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-110 ${iconStyle}`}>
            <Icon size={22} />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 dark:border-white/10 pt-3 text-xs">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
            <TrendingUp size={14} />
            {trend}
          </span>
          <span className="text-[#737686] dark:text-slate-400">{trendLabel}</span>
        </div>
      )}
    </motion.div>
  );
};

export const Dashboard = () => {
  const { user } = useAuth();
  const { projects = [], workforce = [], partners = [], clients = [], managers = [], activities = [], dashboardStats } = useData();
  const navigate = useNavigate();

  // General Metrics calculation for Admin
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.stage === 'In Progress').length;
  const completedProjects = projects.filter((p) => p.stage === 'Completed').length;
  const pendingRequests = projects.filter((p) => p.stage === 'Request').length;
  // Helper to filter out partner company organization accounts (which belong to Partner Companies, not individual workforce)
  const isPartnerCompanyOrg = (w) => {
    if (!w) return true;
    const roleLower = (w.role || w.title || w.category || '').toLowerCase().trim();
    const nameLower = (w.name || w.pseudonym || '').toLowerCase().trim();
    const emailLower = (w.email || '').toLowerCase().trim();

    return (
      roleLower === 'partner company' ||
      roleLower === 'partner' ||
      roleLower === 'role_partner' ||
      nameLower === 'infosys' ||
      nameLower === 'partner' ||
      nameLower === 'partner company' ||
      emailLower === 'partner@infosys.com' ||
      emailLower === 'partner@gmail.com' ||
      emailLower === 'partner@flexistaff.com'
    );
  };

  const cleanWorkforceRoster = useMemo(
    () => (workforce || []).filter((w) => !isPartnerCompanyOrg(w)),
    [workforce]
  );

  const pendingTalentApprovals = useMemo(
    () =>
      cleanWorkforceRoster.filter(
        (w) =>
          w.approvalStatus === 'Pending Review' ||
          w.approvalStatus === 'Pending' ||
          w.verificationStatus === 'Pending'
      ).length,
    [cleanWorkforceRoster]
  );

  // Helper functions for categorization
  const isPartnerProfessionalMember = (w) => {
    if (!w) return false;
    return Boolean(
      w.partnerCompanyId ||
      w.partnerCompany ||
      w.partnerName ||
      w.partnerCompanyName ||
      w.category === 'Partner Employee' ||
      w.professionalType === 'PARTNER_EMPLOYEE' ||
      w.source === 'Partner Company' ||
      (w.roleType === 'Professional' && !String(w.roleType).toLowerCase().includes('freelanc'))
    );
  };

  const isFreelancerMember = (w) => {
    if (!w) return false;
    if (isPartnerProfessionalMember(w)) return false;

    const source = (w.source || '').toLowerCase();
    const profType = (w.professionalType || '').toLowerCase();
    const roleType = (w.roleType || '').toLowerCase();
    const type = (w.type || '').toLowerCase();
    const role = (w.role || w.title || w.category || '').toLowerCase();

    const isExcluded =
      role.includes('admin') ||
      role.includes('client') ||
      role.includes('manager') ||
      role.includes('hr');

    if (isExcluded) return false;

    return (
      source.includes('freelance') ||
      profType === 'freelancer' ||
      roleType === 'freelancer' ||
      type === 'freelancer' ||
      role.includes('freelanc') ||
      (!w.partnerCompanyId && !w.partnerCompany)
    );
  };

  const isApprovedMember = (w) => {
    if (!w) return false;
    const appStat = (w.approvalStatus || '').toLowerCase();
    const verStat = (w.verificationStatus || '').toLowerCase();
    const accStat = (w.accountStatus || '').toLowerCase();
    const stat = (w.status || '').toLowerCase();

    if (
      appStat === 'rejected' ||
      verStat === 'rejected' ||
      appStat.includes('pending') ||
      verStat.includes('pending')
    ) {
      return false;
    }

    return (
      appStat === 'approved' ||
      verStat === 'approved' ||
      accStat === 'active' ||
      stat === 'active' ||
      stat === 'available' ||
      (!appStat && !verStat)
    );
  };

  const isAvailableMember = (w) => {
    if (!isApprovedMember(w)) return false;
    const avail = (w.availability || w.availabilityStatus || w.status || w.workingStatus || '').toLowerCase().trim();
    const unavailableList = ['busy', 'assigned', 'booked', 'inactive', 'unavailable', 'rejected', 'working'];
    return !unavailableList.includes(avail);
  };

  const totalProfessionals = useMemo(
    () => cleanWorkforceRoster.filter((w) => isApprovedMember(w) && isPartnerProfessionalMember(w)).length,
    [cleanWorkforceRoster]
  );

  const availableProfessionals = useMemo(
    () => {
      const count = cleanWorkforceRoster.filter((w) => isAvailableMember(w) && isPartnerProfessionalMember(w)).length;
      if (count === 0 && cleanWorkforceRoster.length === 0 && dashboardStats && typeof dashboardStats.totalProfessionals === 'number' && dashboardStats.totalProfessionals > 0) {
        return dashboardStats.totalProfessionals;
      }
      return count;
    },
    [cleanWorkforceRoster, dashboardStats]
  );

  const totalFreelancers = useMemo(
    () => cleanWorkforceRoster.filter((w) => isFreelancerMember(w) && isApprovedMember(w)).length,
    [cleanWorkforceRoster]
  );

  const availableFreelancers = useMemo(
    () => cleanWorkforceRoster.filter((w) => isFreelancerMember(w) && isAvailableMember(w)).length,
    [cleanWorkforceRoster]
  );

  const realFreelancerCount = useMemo(() => {
    if (cleanWorkforceRoster.length > 0) {
      return totalFreelancers;
    }
    const apiFreelancerCount = dashboardStats?.freelancerCount ?? dashboardStats?.totalFreelancers;
    return typeof apiFreelancerCount === 'number' ? apiFreelancerCount : totalFreelancers;
  }, [cleanWorkforceRoster, totalFreelancers, dashboardStats]);

  // Project Stage Distribution Chart Data
  const stageDistribution = useMemo(() => {
    const counts = {
      Requests: 0,
      Planning: 0,
      'In Progress': 0,
      Completed: 0,
    };
    projects.forEach((p) => {
      if (p.stage === 'Request') counts.Requests += 1;
      else if (p.stage === 'Planning') counts.Planning += 1;
      else if (p.stage === 'In Progress') counts['In Progress'] += 1;
      else if (p.stage === 'Completed') counts.Completed += 1;
    });
    return [
      { name: 'Requests', count: counts.Requests, fill: '#f59e0b' },
      { name: 'Planning', count: counts.Planning, fill: '#3b82f6' },
      { name: 'In Progress', count: counts['In Progress'], fill: '#2563eb' },
      { name: 'Completed', count: counts.Completed, fill: '#10b981' },
    ];
  }, [projects]);

  // Dynamic Skill Demands calculated from real database workforce and projects
  const skillDemands = useMemo(() => {
    const skillMap = {};
    (cleanWorkforceRoster || []).forEach((w) => {
      let skillsArr = [];
      if (Array.isArray(w.skills)) skillsArr = w.skills;
      else if (typeof w.skills === 'string') skillsArr = w.skills.split(',').map((s) => s.trim()).filter(Boolean);
      skillsArr.forEach((s) => {
        skillMap[s] = (skillMap[s] || 0) + 1;
      });
    });

    (projects || []).forEach((p) => {
      let skillsArr = [];
      if (Array.isArray(p.requiredSkills)) skillsArr = p.requiredSkills;
      else if (typeof p.requiredSkills === 'string') skillsArr = p.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);
      skillsArr.forEach((s) => {
        skillMap[s] = (skillMap[s] || 0) + 1;
      });
    });

    const totalCount = Object.values(skillMap).reduce((acc, v) => acc + v, 0);
    if (totalCount === 0) return [];

    const colors = ['#3b82f6', '#2563eb', '#0ea5e9', '#6366f1', '#8b5cf6'];
    return Object.entries(skillMap).map(([name, count], idx) => ({
      name,
      value: Math.round((count / totalCount) * 100),
      color: colors[idx % colors.length],
    }));
  }, [cleanWorkforceRoster, projects]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#004ac6] via-[#1d4ed8] to-[#2563eb] p-6 sm:p-8 text-white shadow-lg shadow-[#004ac6]/15">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-2">
              <Sparkles size={13} className="text-amber-300" />
              <span>Enterprise Workforce Orchestration</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
              Welcome, {user?.name || 'Administrator'}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
              You currently have{' '}
              <strong className="text-white font-bold">{pendingTalentApprovals} pending candidate approvals</strong>,{' '}
              <strong className="text-white font-bold">{pendingRequests} project requests</strong>, and{' '}
              <strong className="text-white font-bold">{activeProjects} active client projects</strong> in progress.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {pendingTalentApprovals > 0 && (
              <button
                type="button"
                onClick={() => navigate('/admin/workforce')}
                className="rounded-xl bg-amber-400 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 shadow-md hover:bg-amber-300 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <span>Review Talent ({pendingTalentApprovals})</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/admin/workforce')}
              className="rounded-xl bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-[#004ac6] shadow-md hover:bg-blue-50 active:scale-95 transition-all"
            >
              Active Talent Pool
            </button>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute right-1/3 -bottom-16 h-48 w-48 rounded-full bg-blue-300/10 blur-xl" />
      </div>

      {/* KPI Metric Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <DashboardCard
          title="Total Projects"
          value={totalProjects}
          icon={FolderKanban}
          color="blue"
          onClick={() => navigate('/admin/projects')}
        />

        <DashboardCard
          title="Active Projects"
          value={activeProjects}
          icon={PlayCircle}
          color="indigo"
          onClick={() => navigate('/admin/projects')}
        />

        <DashboardCard
          title="Completed"
          value={completedProjects}
          icon={CheckCircle2}
          color="emerald"
          onClick={() => navigate('/admin/projects')}
        />

        <DashboardCard
          title="Available Pros"
          value={availableProfessionals}
          icon={Users}
          color="blue"
          onClick={() => navigate('/admin/workforce')}
        />

        <DashboardCard
          title="Freelancers"
          value={realFreelancerCount}
          icon={Code2}
          color="purple"
          onClick={() => navigate('/admin/workforce')}
        />

        <DashboardCard
          title="Pending Requests"
          value={pendingRequests}
          icon={Clock}
          color="amber"
          onClick={() => navigate('/admin/projects')}
        />
      </div>

      {/* HR Manager Lead Overview Strip */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14132b] p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-100 dark:bg-blue-950/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                HR Manager
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Dedicated Enterprise Lead
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">
              Enterprise Delivery Operations Lead
            </h3>
          </div>
          <Link
            to="/admin/managers"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 dark:bg-[#1c1a36] border border-slate-200 dark:border-white/10 px-3 py-1.5 text-xs font-bold text-[#004ac6] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-white/10 transition-colors self-start sm:self-auto"
          >
            <span>Manage HR Manager</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3.5 text-xs">
          <div
            onClick={() => navigate('/admin/managers')}
            className="rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/70 dark:border-white/10 p-3.5 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-all flex items-center gap-3"
          >
            <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-[#004ac6] dark:text-blue-300 flex items-center justify-center font-bold">
              <UserCheck size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">{managers[0]?.name || 'Unassigned'}</p>
              <p className="text-[11px] text-[#004ac6] dark:text-blue-400 font-semibold">{managers[0] ? `ID: #${managers[0].id || managers[0].numericId || managers[0].employeeId}` : 'No Manager Appointed'}</p>
            </div>
          </div>

          <div
            onClick={() => navigate('/admin/managers')}
            className="rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-white/10 p-3.5 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-all"
          >
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Account Status</span>
              <CheckCircle2 size={14} />
            </div>
            <p className="mt-1 text-base font-extrabold text-emerald-950 dark:text-white">{managers[0]?.status || 'Active'}</p>
          </div>

          <div
            onClick={() => navigate('/admin/projects')}
            className="rounded-xl bg-slate-50 dark:bg-[#1c1a36] border border-slate-200 dark:border-white/10 p-3.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
          >
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Supervised Projects</span>
              <FolderKanban size={14} className="text-[#004ac6] dark:text-blue-400" />
            </div>
            <p className="mt-1 text-base font-extrabold text-slate-900 dark:text-white">{totalProjects} Projects</p>
          </div>

          <div
            onClick={() => navigate('/admin/workforce')}
            className="rounded-xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200/70 dark:border-white/10 p-3.5 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950/60 transition-all"
          >
            <div className="flex items-center justify-between text-purple-700 dark:text-purple-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Supervised Talent</span>
              <Users size={14} />
            </div>
            <p className="mt-1 text-base font-extrabold text-purple-950 dark:text-white">{cleanWorkforceRoster.length} Members</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Status Bar Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-[#c3c6d7]/70 dark:border-white/10 bg-white dark:bg-[#14132b] p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-bold text-[#191b23] dark:text-white tracking-tight">
                Project Pipeline by Stage
              </h3>
              <p className="text-xs text-[#737686] dark:text-slate-400">
                Distribution of client staffing engagements across project phases
              </p>
            </div>
            <Link
              to="/admin/projects"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#004ac6] dark:text-blue-400 hover:underline"
            >
              <span>View All Projects</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="h-64 sm:h-72 flex flex-col items-center justify-center text-center text-xs text-slate-400">
              <FolderKanban size={28} className="text-slate-300 dark:text-slate-600 mb-2" />
              <p className="font-semibold text-slate-600 dark:text-slate-400">No project activity yet</p>
              <p className="text-[11px] text-slate-400">Project stages will be visualized as client requests are submitted.</p>
            </div>
          ) : (
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    stroke="#737686"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    stroke="#737686"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#cbd5e1',
                      borderRadius: '12px',
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={45}>
                    {stageDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Workforce Skill Distribution Pie Chart */}
        <div className="rounded-2xl border border-[#c3c6d7]/70 dark:border-white/10 bg-white dark:bg-[#14132b] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#191b23] dark:text-white tracking-tight">
              Workforce Specializations
            </h3>
            <p className="text-xs text-[#737686] dark:text-slate-400">
              Domain allocation across vetted talent
            </p>
          </div>

          {skillDemands.length === 0 ? (
            <div className="h-52 flex flex-col items-center justify-center text-center text-xs text-slate-400">
              <Code2 size={28} className="text-slate-300 dark:text-slate-600 mb-2" />
              <p className="font-semibold text-slate-600 dark:text-slate-400">No skill distribution data</p>
              <p className="text-[11px] text-slate-400">Specializations appear as workforce and projects are created.</p>
            </div>
          ) : (
            <>
              <div className="h-52 w-full my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={skillDemands}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {skillDemands.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [`${val}%`, 'Allocation']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#cbd5e1',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-white/10 text-xs">
                {skillDemands.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[#565e74] dark:text-slate-300 truncate text-[11px]">{item.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
