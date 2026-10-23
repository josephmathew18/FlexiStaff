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
  const { partnerProjects = [], partnerActivities = [], projects = [], projectMilestones = {} } = useData() || {};
  const navigate = useNavigate();

  const allPartnerProjects = React.useMemo(() => {
    const list = [...(partnerProjects || [])];
    (projects || []).forEach((p) => {
      if (!p) return;
      const idMatch = list.some((item) => String(item.id) === String(p.id) || String(item.id).toLowerCase().replace(/[\s_]/g, '-') === String(p.id).toLowerCase().replace(/[\s_]/g, '-'));
      const nameMatch = list.some((item) => String(item.name || '').toLowerCase() === String(p.title || p.name || '').toLowerCase());
      if (!idMatch && !nameMatch) {
        list.push({
          id: p.id,
          name: p.title || p.name,
          category: p.category || 'Enterprise',
          startDate: p.startDate || '2026-10-15',
          expectedEndDate: p.endDate || p.targetEndDate || '2027-02-28',
          progress: p.progress || 0,
          status: p.status || p.stage || 'In Progress',
          milestones: p.milestones || [],
          workforceAssigned: p.assignedResources?.length || 1,
          workforceRequired: p.workforceRequired || 1,
          assignedWorkforce: p.assignedResources || [],
        });
      }
    });
    return list;
  }, [partnerProjects, projects]);

  const [selectedProjectId, setSelectedProjectId] = useState('');

  const selectedProject = React.useMemo(() => {
    if (!allPartnerProjects || allPartnerProjects.length === 0) return null;
    return allPartnerProjects.find((p) => p && String(p.id) === String(selectedProjectId)) || allPartnerProjects[0];
  }, [allPartnerProjects, selectedProjectId]);

  const selectedMilestones = React.useMemo(() => {
    if (!selectedProject) return [];
    const pId = selectedProject.id;
    const normId = String(pId || '').toLowerCase().replace(/[\s_]/g, '-').trim();
    const pMsFromStore = (projectMilestones && (projectMilestones[pId] || projectMilestones[normId]));
    return (pMsFromStore && pMsFromStore.length > 0)
      ? pMsFromStore
      : (selectedProject.milestones && selectedProject.milestones.length > 0)
      ? selectedProject.milestones
      : [
          { id: 'ms-01', title: 'Requirement Analysis', status: 'Pending', dueDate: selectedProject.startDate || '2026-10-15', commits: [] },
          { id: 'ms-02', title: 'UI/UX & System Design', status: 'Pending', dueDate: selectedProject.startDate || '2026-11-01', commits: [] },
          { id: 'ms-03', title: 'Backend & Database Development', status: 'Pending', dueDate: selectedProject.expectedEndDate || '2026-12-15', commits: [] },
          { id: 'ms-04', title: 'Frontend & Integration', status: 'Pending', dueDate: selectedProject.expectedEndDate || '2027-01-20', commits: [] },
          { id: 'ms-05', title: 'Testing, Deployment & Final Delivery', status: 'Pending', dueDate: selectedProject.expectedEndDate || '2027-02-28', commits: [] },
        ];
  }, [selectedProject, projectMilestones]);

  if (!allPartnerProjects || allPartnerProjects.length === 0 || !selectedProject) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Project & Sprint Progress Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor sprint velocity, milestone completions, vertical activity timelines, and live engineering progress.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-4 max-w-2xl mx-auto my-8">
          <FolderKanban size={40} className="mx-auto text-slate-300" />
          <h2 className="text-xl font-bold text-slate-800">No Projects Assigned Yet</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your organization has no active project requirements assigned to track sprint progress and milestones.
          </p>
        </div>
      </div>
    );
  }

  // Velocity data for charts based on actual project milestones
  const sprintVelocityData = selectedMilestones.length > 0
    ? selectedMilestones.map((m, idx) => ({
        sprint: `M${idx + 1}: ${(m.title || m.name || `Milestone ${idx + 1}`).substring(0, 16)}`,
        planned: m.weightage || m.weight || 20,
        completed: (m.completed || m.status === 'Completed' || m.status === 'COMPLETED') ? (m.weightage || m.weight || 20) : (m.progressPercentage || 0),
      }))
    : [
        { sprint: 'Progress', planned: 100, completed: selectedProject.progress || 0 },
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
          className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 outline-none shadow-xs cursor-pointer"
        >
          {(allPartnerProjects || []).map((p) => (
            <option key={p.id} value={p.id}>{p.title || p.name} ({p.progress || 0}%)</option>
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
            <span className="text-2xl sm:text-3xl font-black text-[#004ac6]">{selectedProject.progress ?? 0}%</span>
            <span className="block text-[11px] font-bold text-slate-400">Total Completion</span>
          </div>
        </div>

        {/* Progress Bar & Stage Sequence */}
        <div className="space-y-3">
          <div className="w-full h-3.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${selectedProject.progress ?? 0}%` }}
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
            {(!selectedProject.assignedWorkforce || selectedProject.assignedWorkforce.length === 0) ? (
              <div className="col-span-full py-4 text-center text-slate-500 text-xs font-medium">
                No individual engineer role progress logs available for this project.
              </div>
            ) : (
              selectedProject.assignedWorkforce.map((member, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{member.role || member.name || 'Engineer'}</span>
                    <span className="font-extrabold text-blue-600">{member.progress || selectedProject.progress || 0}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#2563eb]"
                      style={{ width: `${member.progress || selectedProject.progress || 0}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">{member.name || member.pseudonym || 'Assigned Staff'} • Active</p>
                </div>
              ))
            )}
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
          {selectedMilestones?.map((milestone, idx) => {
            const isCompleted = Boolean(milestone.completed || milestone.status === 'Completed' || milestone.status === 'COMPLETED');
            const isInProgress = !isCompleted && (milestone.status === 'In Progress' || milestone.status === 'IN_PROGRESS' || (milestone.commits && milestone.commits.length > 0));
            const statusLabel = isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Pending';

            return (
              <div key={milestone.id || idx} className="relative group">
                {/* Dot */}
                <div
                  className={`absolute -left-[31px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white ${
                    isCompleted ? 'bg-emerald-500' : isInProgress ? 'bg-blue-500' : 'bg-slate-300'
                  }`}
                >
                  {isCompleted ? <Check size={12} /> : <Clock size={12} />}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h4 className={`font-bold ${isCompleted ? 'text-slate-900 font-extrabold' : 'text-slate-700'}`}>
                        {milestone.title || milestone.name}
                      </h4>
                      <span className="text-[10px] text-slate-400">Target Due: {milestone.dueDate || milestone.date || 'Sprint Target'}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                      isCompleted ? 'bg-emerald-100 text-emerald-800' : isInProgress ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {statusLabel}
                    </span>
                  </div>

                  {milestone.commits && milestone.commits.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60 pl-2 border-l-2 border-purple-300 space-y-1">
                      <span className="text-[9px] font-bold text-purple-700 uppercase">Commits ({milestone.commits.length})</span>
                      {milestone.commits.slice(0, 3).map((c) => (
                        <div key={c.id} className="text-[10px] text-slate-600 flex items-center justify-between">
                          <span className="font-mono text-purple-600">#{c.commitHash || 'cmt'} {c.commitMessage}</span>
                          <span className="text-slate-400">{c.authorName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PartnerProjectProgress;
