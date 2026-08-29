import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  FolderKanban,
  CheckCircle2,
  Clock,
  Activity,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts';
import { motion } from 'framer-motion';
import { useData } from '../../context/DataContext';

export const PartnerProjectProgress = () => {
  const { partnerProjects = [], partnerActivities = [] } = useData() || {};
  const navigate = useNavigate();

  const activeProject =
    partnerProjects.find((p) => p && p.id) ||
    partnerProjects[0] || {
      id: 'PRJ-PARTNER-101',
      name: 'E-Commerce Platform Development',
      category: 'Full-Stack Web',
      startDate: '2026-08-01',
      expectedEndDate: '2027-01-31',
      progress: 75,
      status: 'In Progress',
      workforceAssigned: 6,
      workforceRequired: 6,
      milestones: [
        { id: 'm1', name: 'Sprint 1: Architecture & DB Design', date: 'Aug 15, 2026', completed: true },
        { id: 'm2', name: 'Sprint 2: Auth & Role ACL Modules', date: 'Sep 01, 2026', completed: true },
        { id: 'm3', name: 'Sprint 3: Payment Gateway & Cart', date: 'Oct 15, 2026', completed: false },
      ],
    };

  const [selectedProjectId, setSelectedProjectId] = useState(activeProject.id);

  const selectedProject =
    partnerProjects.find((p) => p && p.id === selectedProjectId) || activeProject;

  // Velocity data for charts
  const sprintVelocityData = [
    { sprint: 'Sprint 1', planned: 20, completed: 18 },
    { sprint: 'Sprint 2', planned: 40, completed: 38 },
    { sprint: 'Sprint 3', planned: 60, completed: 55 },
    { sprint: 'Sprint 4', planned: 80, completed: 72 },
    { sprint: 'Sprint 5', planned: 100, completed: 85 },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Project & Sprint Progress Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor sprint velocity, milestone completions, vertical activity timelines, and live engineering progress.
          </p>
        </div>

        {/* Project Selector */}
        <select
          value={selectedProject.id || ''}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 outline-none shadow-xs"
        >
          {(partnerProjects || []).map((p) => (
            <option key={p.id} value={p.id}>{p.name} ({p.progress || 0}%)</option>
          ))}
        </select>
      </div>

      {/* Selected Project Overview Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
              {selectedProject.category || 'Enterprise'}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1.5">{selectedProject.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Starts: {selectedProject.startDate} • Expected End: {selectedProject.expectedEndDate}</p>
          </div>

          <div className="text-right">
            <span className="text-2xl sm:text-3xl font-black text-[#004ac6]">{selectedProject.progress || 75}%</span>
            <span className="block text-[11px] font-bold text-slate-400">Total Completion</span>
          </div>
        </div>

        {/* Progress Bar & Stage Sequence */}
        <div className="space-y-3">
          <div className="w-full h-3.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${selectedProject.progress || 75}%` }}
              transition={{ duration: 0.8 }}
              className="h-full rounded-full bg-gradient-to-r from-[#004ac6] to-[#2563eb]"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Current Status: <strong className="text-emerald-700">{selectedProject.status || 'In Progress'}</strong></span>
            <span>Allocated Workforce: <strong className="text-blue-600">{selectedProject.workforceAssigned || 6} / {selectedProject.workforceRequired || 6} Assigned</strong></span>
          </div>
        </div>

        {/* Section 16 & 25: Workforce Role Progress Breakdown */}
        <div className="pt-4 border-t border-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
            Assigned Workforce Role Progress (Read-Only)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Frontend Developer</span>
                <span className="font-extrabold text-blue-600">80%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full rounded-full bg-[#2563eb]" style={{ width: '80%' }} />
              </div>
              <p className="text-[10px] text-slate-500">David Miller • Working</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Java Developer</span>
                <span className="font-extrabold text-blue-600">70%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full rounded-full bg-[#2563eb]" style={{ width: '70%' }} />
              </div>
              <p className="text-[10px] text-slate-500">Elena Rostova • Working</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">UI/UX Designer</span>
                <span className="font-extrabold text-emerald-600">100%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: '100%' }} />
              </div>
              <p className="text-[10px] text-slate-500">Carlos Rivera • Completed</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">QA Automation</span>
                <span className="font-extrabold text-amber-600">50%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full rounded-full bg-amber-500" style={{ width: '50%' }} />
              </div>
              <p className="text-[10px] text-slate-500">Maya Lin • Working</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sprint Velocity Area Chart */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Sprint Progress Velocity</h3>
              <p className="text-xs text-slate-500">Target trajectory vs completed story points</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              On Schedule
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sprintVelocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="sprint" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="completed" name="Delivered Velocity" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#velocityGrad)" />
                <Line type="monotone" dataKey="planned" name="Planned Target" stroke="#94a3b8" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 22: Recent Activity Timeline Stream */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Real-Time Project Activity</h3>
            <p className="text-xs text-slate-500">Live task updates and milestone check-ins</p>
          </div>

          <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
            {(partnerActivities || []).map((act) => (
              <div key={act.id} className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 text-xs space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span>{act.time}</span>
                  <span className="text-blue-600">{act.project}</span>
                </div>
                <p className="text-slate-800 font-medium">
                  <strong>{act.user}</strong> {act.action}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vertical Milestone Progress Timeline (Section 21) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Project Milestone Timeline</h3>
          <p className="text-xs text-slate-500">Step-by-step deliverable progress</p>
        </div>

        <div className="relative pl-6 space-y-6 border-l-2 border-slate-200 ml-3">
          {selectedProject.milestones?.map((milestone, idx) => (
            <div key={milestone.id} className="relative group">
              {/* Dot */}
              <div
                className={`absolute -left-[31px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white ${
                  milestone.completed ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                {milestone.completed ? <Check size={12} /> : <Clock size={12} />}
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <h4 className={`font-bold ${milestone.completed ? 'text-slate-900' : 'text-slate-600'}`}>
                    {milestone.name}
                  </h4>
                  <span className="text-[10px] text-slate-400">{milestone.date}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  milestone.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {milestone.completed ? 'Completed' : 'In Progress'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartnerProjectProgress;
