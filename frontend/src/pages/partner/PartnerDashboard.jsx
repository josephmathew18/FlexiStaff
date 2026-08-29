import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FolderKanban,
  PlayCircle,
  Clock,
  CheckCircle2,
  Users,
  UserCheck,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Activity,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  GitPullRequest,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { motion } from 'framer-motion';
import { useData } from '../../context/DataContext';

// Reusable Inline StatusBadge for Partner
const StatusBadge = ({ status = 'Active', size = 'sm' }) => {
  const normalized = String(status).toLowerCase().trim();
  let bg = 'bg-blue-50 text-blue-700 border-blue-200';

  if (['completed', 'approved', 'fully assigned'].includes(normalized)) {
    bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['in progress', 'working', 'development'].includes(normalized)) {
    bg = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (['pending', 'pending approval', 'pending admin review', 'matching', 'partially assigned'].includes(normalized)) {
    bg = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (['draft', 'inactive'].includes(normalized)) {
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

const DashboardCard = ({ title, value, icon: Icon, color = 'blue', subtitle, onClick, trend }) => {
  const colorStyles = {
    blue: 'bg-blue-50 text-[#004ac6] border-blue-200/60',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200/60',
    amber: 'bg-amber-50 text-amber-600 border-amber-200/60',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
    purple: 'bg-purple-50 text-purple-600 border-purple-200/60',
    sky: 'bg-sky-50 text-sky-600 border-sky-200/60',
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
      {trend && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="font-semibold text-emerald-600 flex items-center gap-1">
            <TrendingUp size={12} />
            {trend}
          </span>
          <span className="text-slate-400">Live Metric</span>
        </div>
      )}
    </motion.div>
  );
};

export const PartnerDashboard = () => {
  const { partnerProfile, partnerProjects, partnerWorkforce, partnerWorkforceRequests } = useData();
  const navigate = useNavigate();

  // 6 Metric Summaries (per Section 5)
  const totalProjectsCount = 24; // aggregate partner historical + active
  const activeProjectsCount = 8;
  const pendingApprovalCount = 3;
  const completedProjectsCount = 13;
  const assignedWorkforceCount = 26;
  const availableWorkforceCount = 8;

  // Workforce Availability Breakdown (per Section 6)
  const availabilityBreakdown = [
    { name: 'Available', value: 8, color: '#10b981', label: '8 Ready for Allocation' },
    { name: 'Currently Working', value: 14, color: '#2563eb', label: '14 Active on Tasks' },
    { name: 'Assigned / Sprinted', value: 26, color: '#f59e0b', label: '26 Allocated' },
    { name: 'Unavailable', value: 4, color: '#ef4444', label: '4 On Leave / Bench' },
  ];

  // Monthly velocity sample data for partner project fulfillment
  const fulfillmentData = [
    { month: 'Apr', required: 18, assigned: 16 },
    { month: 'May', required: 22, assigned: 20 },
    { month: 'Jun', required: 28, assigned: 25 },
    { month: 'Jul', required: 32, assigned: 30 },
    { month: 'Aug', required: 34, assigned: 32 },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ========================================================================= */}
      {/* 1. WELCOME BANNER */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#004ac6] via-[#1d4ed8] to-[#2563eb] p-6 sm:p-8 text-white shadow-lg shadow-[#004ac6]/15">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-2.5">
              <Sparkles size={13} className="text-amber-300" />
              <span>Partner Enterprise Workspace • {partnerProfile.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome to FlexiStaff Partner Portal
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
              Monitor your projects, workforce availability, and project progress in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/partner/projects')}
              className="rounded-xl bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-[#004ac6] shadow-md hover:bg-blue-50 active:scale-95 transition-all flex items-center gap-2"
            >
              <FolderKanban size={16} />
              <span>View All Projects</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/partner/workforce')}
              className="rounded-xl bg-white/15 border border-white/30 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-md hover:bg-white/25 active:scale-95 transition-all"
            >
              Explore Assigned Talent
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute right-1/3 -bottom-16 h-48 w-48 rounded-full bg-blue-300/10 blur-xl" />
      </div>

      {/* ========================================================================= */}
      {/* 2. SUMMARY KPI CARDS (6 CARDS PER SECTION 5) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        <DashboardCard
          title="Total Projects"
          value={totalProjectsCount}
          icon={FolderKanban}
          color="blue"
          subtitle="All engagements"
          onClick={() => navigate('/partner/projects')}
        />
        <DashboardCard
          title="Active Projects"
          value={activeProjectsCount}
          icon={PlayCircle}
          color="indigo"
          subtitle="In progress"
          onClick={() => navigate('/partner/projects')}
        />
        <DashboardCard
          title="Pending Approval"
          value={pendingApprovalCount}
          icon={Clock}
          color="amber"
          subtitle="Under Company review"
          onClick={() => navigate('/partner/projects')}
        />
        <DashboardCard
          title="Completed"
          value={completedProjectsCount}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Delivered to SLA"
          onClick={() => navigate('/partner/projects')}
        />
        <DashboardCard
          title="Assigned Workforce"
          value={assignedWorkforceCount}
          icon={UserCheck}
          color="purple"
          subtitle="Engineers deployed"
          onClick={() => navigate('/partner/workforce')}
        />
        <DashboardCard
          title="Available Talent"
          value={availableWorkforceCount}
          icon={Users}
          color="sky"
          subtitle="Ready for matching"
          onClick={() => navigate('/partner/availability')}
        />
      </div>

      {/* ========================================================================= */}
      {/* 3. WORKFORCE AVAILABILITY OVERVIEW & FULFILLMENT VELOCITY */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section 6: Workforce Availability Visual */}
        <div className="lg:col-span-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Workforce Availability Overview</h3>
                <p className="text-xs text-slate-500">Real-time capacity distribution for partner projects</p>
              </div>
              <Link to="/partner/availability" className="text-xs font-bold text-[#004ac6] hover:underline flex items-center gap-1">
                <span>Full Matrix</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Donut Chart */}
            <div className="h-56 w-full my-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={availabilityBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {availabilityBreakdown.map((entry, index) => (
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

          {/* 4 Status Badges breakdown */}
          <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100 text-xs">
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="font-bold text-emerald-950">Available</span>
              </div>
              <span className="font-black text-emerald-700 text-sm">8</span>
            </div>

            <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span className="font-bold text-blue-950">Currently Working</span>
              </div>
              <span className="font-black text-blue-700 text-sm">14</span>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="font-bold text-amber-950">Assigned</span>
              </div>
              <span className="font-black text-amber-700 text-sm">26</span>
            </div>

            <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span className="font-bold text-rose-950">Unavailable</span>
              </div>
              <span className="font-black text-rose-700 text-sm">4</span>
            </div>
          </div>
        </div>

        {/* Section 25: Workforce Fulfillment Velocity Chart */}
        <div className="lg:col-span-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Workforce Requirement Fulfillment</h3>
                <p className="text-xs text-slate-500">Monthly staffing request fulfillment vs assigned workforce</p>
              </div>
              <Link to="/partner/workforce-requests" className="text-xs font-bold text-[#004ac6] hover:underline flex items-center gap-1">
                <span>View Requests</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="h-56 w-full my-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fulfillmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#cbd5e1',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="required" name="Required Staff" fill="#93c5fd" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="assigned" name="Assigned Staff" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-indigo-600" />
              <span className="text-indigo-900 font-semibold">Overall Fulfillment SLA: <strong>94.1%</strong></span>
            </div>
            <span className="text-[11px] font-bold text-indigo-700">Managed by FlexiStaff Team</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. RECENT PROJECTS TABLE (PER SECTION 7) */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Project Requirements</h3>
            <p className="text-xs text-slate-500">Live project status, assigned workforce headcounts, and progress</p>
          </div>
          <Link
            to="/partner/projects"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#004ac6] hover:underline"
          >
            <span>View All Projects</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Project & Client</th>
                <th className="py-3 px-4">Workforce Required</th>
                <th className="py-3 px-4">Workforce Assigned</th>
                <th className="py-3 px-4">Project Status</th>
                <th className="py-3 px-4">Live Progress</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {partnerProjects.slice(0, 4).map((prj) => (
                <tr key={prj.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div>
                      <p className="font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer" onClick={() => navigate(`/partner/projects/${prj.id}`)}>
                        {prj.name}
                      </p>
                      <p className="text-[11px] text-blue-700 font-bold">Client: {prj.client || prj.partner || 'Finovate Global'}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{prj.category}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900">{prj.workforceRequired} Engineers</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`font-bold ${prj.workforceAssigned === prj.workforceRequired ? 'text-emerald-600' : 'text-blue-600'}`}>
                      {prj.workforceAssigned} Assigned
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={prj.status} />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="w-32 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span>{prj.progress}%</span>
                        <span className="text-slate-400">{prj.stage}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${prj.progress === 100 ? 'bg-emerald-500' : 'bg-[#2563eb]'}`}
                          style={{ width: `${prj.progress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => navigate(`/partner/projects/${prj.id}`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
                      >
                        View Project
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/partner/workforce')}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#004ac6] font-bold text-[11px] transition-colors"
                      >
                        Workforce
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/partner/project-progress')}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors"
                      >
                        Progress
                      </button>
                    </div>
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

export default PartnerDashboard;
