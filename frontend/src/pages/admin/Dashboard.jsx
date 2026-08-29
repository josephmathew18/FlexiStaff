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
import { chartAnalyticsData } from '../../data/mockData';

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
      className={`group relative overflow-hidden rounded-xl border border-[#c3c6d7]/60 bg-white p-5 shadow-xs transition-all ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#737686]">{title}</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-[#191b23] sm:text-3xl">{value}</h3>
          {subtitle && <p className="mt-1 text-xs text-[#565e74]">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-110 ${iconStyle}`}>
            <Icon size={22} />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
            <TrendingUp size={14} />
            {trend}
          </span>
          <span className="text-[#737686]">{trendLabel}</span>
        </div>
      )}
    </motion.div>
  );
};

export const Dashboard = () => {
  const { user } = useAuth();
  const { projects = [], workforce = [], partners = [], clients = [], managers = [], activities = [] } = useData();
  const navigate = useNavigate();

  // General Metrics calculation for Admin
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.stage === 'In Progress').length;
  const completedProjects = projects.filter((p) => p.stage === 'Completed').length;
  const pendingRequests = projects.filter((p) => p.stage === 'Request').length;
  const pendingTalentApprovals = workforce.filter((w) => w.approvalStatus === 'Pending Review').length;

  // Manager Lifecycle & Reassignment Metrics
  const totalManagers = managers.length;
  const activeManagers = managers.filter((m) => m.status === 'Active').length;
  const suspendedManagers = managers.filter((m) => m.status === 'Suspended').length;
  const resignedManagers = managers.filter((m) => m.status === 'Resigned').length;
  const terminatedManagers = managers.filter((m) => m.status === 'Terminated').length;

  const projectsNeedingReassignment = projects.filter((p) => {
    const isProjectActive =
      p.stage === 'In Progress' ||
      p.stage === 'Approved' ||
      p.status === 'In Progress' ||
      p.status === 'Approved' ||
      p.status === 'Partially Assigned' ||
      p.status === 'Active';
    const assignedMgr = managers.find((m) => m.name === p.manager);
    return isProjectActive && assignedMgr && assignedMgr.status !== 'Active';
  });

  const totalProfessionals = workforce.filter((w) => w.roleType === 'Professional' && w.approvalStatus === 'Approved').length;
  const availableProfessionals = workforce.filter(
    (w) => w.roleType === 'Professional' && w.availability === 'Immediate' && w.approvalStatus === 'Approved'
  ).length;

  const totalFreelancers = workforce.filter((w) => w.roleType === 'Freelancer' && w.approvalStatus === 'Approved').length;
  const availableFreelancers = workforce.filter(
    (w) => w.roleType === 'Freelancer' && w.availability === 'Immediate' && w.approvalStatus === 'Approved'
  ).length;

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

  // Skill Demands (Mock aggregate)
  const skillDemands = [
    { name: 'Cloud & DevOps', value: 35, color: '#3b82f6' },
    { name: 'AI & Data Science', value: 28, color: '#2563eb' },
    { name: 'Full Stack & Web', value: 22, color: '#0ea5e9' },
    { name: 'Cybersecurity', value: 15, color: '#6366f1' },
  ];

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
              Welcome, {user?.name || 'Sarah Jenkins'}
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
                onClick={() => navigate('/workforce')}
                className="rounded-xl bg-amber-400 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 shadow-md hover:bg-amber-300 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <span>Review Talent ({pendingTalentApprovals})</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/workforce')}
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
          trend="+14%"
          trendLabel="vs last month"
          onClick={() => navigate('/projects')}
        />

        <DashboardCard
          title="Active Projects"
          value={activeProjects}
          icon={PlayCircle}
          color="indigo"
          trend="+8%"
          trendLabel="on track"
          onClick={() => navigate('/projects')}
        />

        <DashboardCard
          title="Completed"
          value={completedProjects}
          icon={CheckCircle2}
          color="emerald"
          trend="+2"
          trendLabel="this quarter"
          onClick={() => navigate('/projects')}
        />

        <DashboardCard
          title="Available Pros"
          value={`${availableProfessionals} / ${totalProfessionals}`}
          icon={Users}
          color="blue"
          subtitle="Full-time staff"
          onClick={() => navigate('/workforce')}
        />

        <DashboardCard
          title="Freelancers"
          value={`${availableFreelancers} / ${totalFreelancers}`}
          icon={Code2}
          color="purple"
          subtitle="Contract network"
          onClick={() => navigate('/workforce')}
        />

        <DashboardCard
          title="Pending Requests"
          value={pendingRequests}
          icon={Clock}
          color="amber"
          trend={pendingRequests > 0 ? 'Requires Action' : 'All clear'}
          trendLabel=""
          onClick={() => navigate('/projects')}
        />
      </div>

      {/* Organization Manager Lead Overview Strip */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                Organization Manager
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Dedicated Enterprise Lead
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
              Enterprise Delivery Operations Lead
            </h3>
          </div>
          <Link
            to="/managers"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-bold text-[#004ac6] hover:bg-blue-50 transition-colors self-start sm:self-auto"
          >
            <span>Manage Organization Manager</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3.5 text-xs">
          <div
            onClick={() => navigate('/managers')}
            className="rounded-xl bg-blue-50/60 border border-blue-200/70 p-3.5 cursor-pointer hover:bg-blue-50 transition-all flex items-center gap-3"
          >
            <div className="h-10 w-10 rounded-xl bg-blue-100 text-[#004ac6] flex items-center justify-center font-bold">
              <UserCheck size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-900">{managers[0]?.name || 'Sarah Jenkins'}</p>
              <p className="text-[11px] text-[#004ac6] font-semibold">{managers[0]?.employeeId || 'MNG-001'}</p>
            </div>
          </div>

          <div
            onClick={() => navigate('/managers')}
            className="rounded-xl bg-emerald-50/60 border border-emerald-200/70 p-3.5 cursor-pointer hover:bg-emerald-50 transition-all"
          >
            <div className="flex items-center justify-between text-emerald-700">
              <span className="text-[10px] font-bold uppercase tracking-wider">Account Status</span>
              <CheckCircle2 size={14} />
            </div>
            <p className="mt-1 text-base font-extrabold text-emerald-950">{managers[0]?.status || 'Active'}</p>
            <span className="text-[10px] text-emerald-700 font-medium">Orchestrating squads</span>
          </div>

          <div
            onClick={() => navigate('/projects')}
            className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 cursor-pointer hover:bg-slate-100 transition-all"
          >
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-[10px] font-bold uppercase tracking-wider">Supervised Projects</span>
              <FolderKanban size={14} className="text-[#004ac6]" />
            </div>
            <p className="mt-1 text-base font-extrabold text-slate-900">{totalProjects} Projects</p>
            <span className="text-[10px] text-slate-500 font-medium">100% Portfolio coverage</span>
          </div>

          <div
            onClick={() => navigate('/workforce')}
            className="rounded-xl bg-purple-50/60 border border-purple-200/70 p-3.5 cursor-pointer hover:bg-purple-50 transition-all"
          >
            <div className="flex items-center justify-between text-purple-700">
              <span className="text-[10px] font-bold uppercase tracking-wider">Supervised Talent</span>
              <Users size={14} />
            </div>
            <p className="mt-1 text-base font-extrabold text-purple-950">{workforce.length} Members</p>
            <span className="text-[10px] text-purple-700 font-medium">Vetted engineers</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Status Bar Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-[#c3c6d7]/70 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-bold text-[#191b23] tracking-tight">
                Project Pipeline by Stage
              </h3>
              <p className="text-xs text-[#737686]">
                Distribution of client staffing engagements across project phases
              </p>
            </div>
            <Link
              to="/projects"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#004ac6] hover:underline"
            >
              <span>View All Projects</span>
              <ArrowRight size={13} />
            </Link>
          </div>

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
        </div>

        {/* Workforce Skill Distribution Pie Chart */}
        <div className="rounded-2xl border border-[#c3c6d7]/70 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#191b23] tracking-tight">
              Workforce Specializations
            </h3>
            <p className="text-xs text-[#737686]">
              Domain allocation across vetted talent
            </p>
          </div>

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

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
            {skillDemands.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[#565e74] truncate text-[11px]">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
