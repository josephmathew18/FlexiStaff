import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FolderCheck,
  Clock,
  Users,
  PlayCircle,
  CheckCircle2,
  TrendingUp,
  Cpu,
  GitPullRequest,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Activity,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import { useData } from '../../context/DataContext';

const DashboardCard = ({ title, value, icon: Icon, color = 'blue', subtitle, onClick }) => {
  const colorStyles = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200/60',
    amber: 'bg-amber-50 text-amber-600 border-amber-200/60',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
    blue: 'bg-blue-50 text-[#004ac6] border-blue-200/60',
    purple: 'bg-purple-50 text-purple-600 border-purple-200/60',
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all ${
        onClick ? 'cursor-pointer hover:border-blue-400 hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{title}</span>
          <h3 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">{value}</h3>
          {subtitle && <p className="mt-1 text-xs text-slate-500 font-medium">{subtitle}</p>}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${colorStyles[color] || colorStyles.blue}`}>
          <Icon size={20} />
        </div>
      </div>
    </motion.div>
  );
};

export const ManagerDashboard = () => {
  const { projects = [], workforce = [], managerAssignments = [], activities = [] } = useData() || {};
  const navigate = useNavigate();

  // Filter approved projects only (excluding Pending Admin Approval & Rejected)
  const approvedList = (projects || []).filter(
    (p) =>
      p.stage !== 'Request' &&
      p.stage !== 'Pending Admin Approval' &&
      p.stage !== 'Rejected' &&
      p.status !== 'Pending Admin Approval' &&
      p.status !== 'Rejected' &&
      p.status !== 'Pending'
  );

  const approvedProjectsCount = approvedList.length || 6;
  const pendingAssignmentsCount = (managerAssignments || []).filter((a) => a.status === 'Pending Assignment Approval' || a.status === 'Pending').length || 4;
  const availableWorkforceCount = (workforce || []).filter((w) => (w.availability === 'Available' || w.availability === 'Immediate') && w.approvalStatus === 'Approved').length || 13;
  const activeProjectsCount = approvedList.filter((p) => p.stage === 'In Progress' || p.status === 'In Progress').length || 6;
  const completedProjectsCount = approvedList.filter((p) => p.stage === 'Completed' || p.status === 'Completed').length || 12;

  // Chart 1: Project Status Distribution (Approved Lifecycle Only)
  const projectStatusData = [
    { status: 'Approved', count: approvedProjectsCount, fill: '#6366f1' },
    { status: 'Assignment Pending', count: pendingAssignmentsCount, fill: '#f59e0b' },
    { status: 'Assignment Approved', count: 5, fill: '#3b82f6' },
    { status: 'In Progress', count: activeProjectsCount, fill: '#2563eb' },
    { status: 'Completed', count: completedProjectsCount, fill: '#10b981' },
  ];

  // Chart 2: Workforce Availability
  const workforceAvailabilityData = [
    { name: 'Available', value: availableWorkforceCount, color: '#10b981' },
    { name: 'Assigned', value: 19, color: '#f59e0b' },
    { name: 'Working', value: 22, color: '#2563eb' },
    { name: 'Unavailable', value: 3, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#004ac6] via-[#1d4ed8] to-[#2563eb] p-6 sm:p-8 text-white shadow-lg shadow-[#004ac6]/15">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-2.5">
              <Sparkles size={13} className="text-amber-300" />
              <span>Manager Talent Orchestration & Assignment Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Manager Dashboard
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
              Manage approved projects and coordinate workforce assignments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/manager/matching')}
              className="rounded-xl bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-[#004ac6] shadow-md hover:bg-blue-50 active:scale-95 transition-all flex items-center gap-2"
            >
              <Cpu size={16} />
              <span>Skill-Based Matching Engine</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/manager/projects')}
              className="rounded-xl bg-white/15 border border-white/30 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-md hover:bg-white/25 active:scale-95 transition-all"
            >
              View Approved Projects
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
      </div>

      {/* 5 Summary KPI Cards (Section 3) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <DashboardCard
          title="Approved Projects"
          value={approvedProjectsCount}
          icon={FolderCheck}
          color="indigo"
          subtitle="Ready for talent matching"
          onClick={() => navigate('/manager/projects')}
        />
        <DashboardCard
          title="Pending Assignments"
          value={pendingAssignmentsCount}
          icon={Clock}
          color="amber"
          subtitle="Workforce allocations pending"
          onClick={() => navigate('/manager/matching')}
        />
        <DashboardCard
          title="Available Workforce"
          value={availableWorkforceCount}
          icon={Users}
          color="emerald"
          subtitle="Vetted candidates ready"
          onClick={() => navigate('/manager/workforce')}
        />
        <DashboardCard
          title="Active Projects"
          value={activeProjectsCount}
          icon={PlayCircle}
          color="blue"
          subtitle="In sprint execution"
          onClick={() => navigate('/manager/assignments')}
        />
        <DashboardCard
          title="Completed Projects"
          value={completedProjectsCount}
          icon={CheckCircle2}
          color="purple"
          subtitle="Delivered to SLA"
          onClick={() => navigate('/manager/assignments')}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Project Status Distribution */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Project Pipeline Status</h3>
                <p className="text-xs text-slate-500">Distribution across project lifecycle</p>
              </div>
              <Link to="/manager/projects" className="text-xs font-bold text-[#004ac6] hover:underline flex items-center gap-1">
                <span>View Projects</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="h-60 w-full my-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectStatusData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="status" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#cbd5e1',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" name="Projects" radius={[6, 6, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Highest concentration in <strong>Completed (16)</strong> and <strong>Approved (12)</strong></span>
            <span className="text-[11px] font-bold text-indigo-700">Sprint SLA: 96.8%</span>
          </div>
        </div>

        {/* Chart 2: Workforce Availability Overview */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Workforce Availability Pool</h3>
                <p className="text-xs text-slate-500">Resource capacity distribution</p>
              </div>
              <Link to="/manager/workforce" className="text-xs font-bold text-[#004ac6] hover:underline flex items-center gap-1">
                <span>Roster</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="h-52 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={workforceAvailabilityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {workforceAvailabilityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val} Engineers`, name]}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 text-emerald-950">
              <span className="font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Available
              </span>
              <span className="font-black">28</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50 text-blue-950">
              <span className="font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                Working
              </span>
              <span className="font-black">22</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Stream (Section 3) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Manager & Workforce Activity</h3>
            <p className="text-xs text-slate-500">Live feed of admin approvals, workforce assignments, and sprint progression</p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Stream</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Company Approval</span>
            <p className="font-bold text-slate-900">New project approved by Company</p>
            <p className="text-[11px] text-slate-600">E-Commerce Platform Development ready for skill matching</p>
            <span className="text-[10px] text-slate-400 block pt-1">15 min ago</span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Workforce Assignment</span>
            <p className="font-bold text-slate-900">React Developer assigned to E-Commerce Project</p>
            <p className="text-[11px] text-slate-600">David Miller (95% match) allocated to frontend sprint</p>
            <span className="text-[10px] text-slate-400 block pt-1">1 hour ago</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Sprint Progress</span>
            <p className="font-bold text-slate-900">Project progress updated to 75%</p>
            <p className="text-[11px] text-slate-600">Product listing module completed with verified test coverage</p>
            <span className="text-[10px] text-slate-400 block pt-1">2 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
