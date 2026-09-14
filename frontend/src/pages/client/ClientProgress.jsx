import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  PlayCircle,
  Calendar,
  FileCheck,
  Award,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { toast } from 'react-toastify';

// Large SVG Circular Progress Ring Component
const CircularProgress = ({ value, size = 68, strokeWidth = 6 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100 dark:text-slate-700"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-emerald-500 transition-all duration-700 ease-out"
          fill="transparent"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-black text-slate-900 dark:text-white leading-none">{value}%</span>
      </div>
    </div>
  );
};

export const ClientProgress = () => {
  const { clientProfile, projects = [], updateProjectProgress } = useData() || {};

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

  const [selectedProjectId, setSelectedProjectId] = useState('all');

  const selectedProject = useMemo(() => {
    if (selectedProjectId === 'all') return null;
    return clientProjects.find((p) => String(p.id) === String(selectedProjectId)) || null;
  }, [clientProjects, selectedProjectId]);

  // Aggregate stats across client projects
  const totalMilestonesCount = useMemo(() => {
    return clientProjects.reduce((sum, p) => sum + (p.milestones ? p.milestones.length : 0), 0);
  }, [clientProjects]);

  const completedMilestonesCount = useMemo(() => {
    return clientProjects.reduce((sum, p) => {
      const completed = p.milestones ? p.milestones.filter((m) => m.completed).length : 0;
      return sum + completed;
    }, 0);
  }, [clientProjects]);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <TrendingUp size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Progress & Milestone Deliverables
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track completion status, approve sprint sign-offs, and monitor velocity timelines.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span>{clientProjects.length > 0 ? "94.8% SLA Velocity" : "0% SLA Velocity"}</span>
          </span>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#14132b] rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total SOW Milestones</span>
            <FolderKanban size={16} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{totalMilestonesCount} Milestones</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">across {clientProjects.length} active projects</p>
        </div>

        <div className="bg-white dark:bg-[#14132b] rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completed Sign-offs</span>
            <CheckCircle2 size={16} className="text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{completedMilestonesCount} / {totalMilestonesCount}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Approved by client lead</p>
        </div>

        <div className="bg-white dark:bg-[#14132b] rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Upcoming Deadline</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {clientProjects.length > 0 ? 'Sprint Sign-off' : 'No Deadlines'}
          </p>
          <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-1">
            {clientProjects.length > 0 ? 'Due in 5 business days' : 'No active sprints'}
          </p>
        </div>

        <div className="bg-white dark:bg-[#14132b] rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">On-Time Completion</span>
            <FileCheck size={16} className="text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {clientProjects.length > 0 ? "98.2% On-Time" : "0% On-Time"}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">Strict quality SLA benchmark</p>
        </div>
      </div>

      {/* Project Selector Bar */}
      <div className="bg-white dark:bg-[#14132b] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Filter Milestone View:</span>
        </div>
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="w-full sm:w-80 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#1c1a36] p-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-600"
        >
          <option value="all">All Portfolio Projects ({clientProjects.length})</option>
          {clientProjects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title || p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Project Milestone Detailed Breakdown */}
      {clientProjects.length === 0 ? (
        <div className="bg-white dark:bg-[#14132b] rounded-3xl border border-dashed border-slate-300 dark:border-white/10 p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Active Projects to Display</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-6 leading-relaxed">
            You currently have no project requirement requests submitted. Create a new requirement request to begin tracking deliverables and sprint velocity.
          </p>
          <a
            href="/client/submit-request"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-emerald-700 hover:to-teal-700 transition-all"
          >
            <span>+ Submit Project Request</span>
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {(selectedProject ? [selectedProject] : clientProjects).map((project) => {
            const progressVal = project.progress || 0;
            const milestonesList = project.milestones || [
              { id: 'm-1', title: 'Architecture Blueprint & Tech Stack Validation', dueDate: '2026-09-30', completed: false },
              { id: 'm-2', title: 'Core Feature Engineering & Sprint Reviews', dueDate: '2026-11-30', completed: false },
              { id: 'm-3', title: 'Production Pen-testing, UAT & Final Deployment', dueDate: '2027-02-28', completed: false },
            ];

            return (
              <div key={project.id} className="bg-white dark:bg-[#14132b] rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-xs space-y-6">
                {/* Project Title & Large Circular Progress Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-white/10 pb-5">
                  {/* Left: Project Title & Metadata */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono font-extrabold">
                        Project #{typeof project.id === 'number' ? project.id : (String(project.id).replace(/\D/g, '') || project.id)}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">{project.title || project.name}</h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Manager: <strong className="text-slate-800 dark:text-slate-200">{project.manager || 'Unassigned'}</strong> • Category: {project.category || 'Software Engineering'}
                    </p>
                  </div>

                  {/* Right: Large Circular Progress Bar */}
                  <div className="flex items-center gap-3 shrink-0 px-4 py-2.5 bg-slate-50 dark:bg-[#1c1a36] rounded-2xl border border-slate-100 dark:border-white/10">
                    <CircularProgress value={progressVal} size={68} strokeWidth={6} />
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Sprint Completion</span>
                      <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                        {progressVal === 100 ? '100% Completed' : `${progressVal}% In Progress`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Milestone Timeline Checklist */}
                <div className="divide-y divide-slate-100 dark:divide-white/10 rounded-2xl border border-slate-100 dark:border-white/10 overflow-hidden bg-slate-50/50 dark:bg-[#1c1a36]/50">
                  {milestonesList.map((m, idx) => {
                    const isDone = m.completed || m.status === 'Completed';
                    const msCommits = m.commits || [];

                    return (
                      <div key={m.id || idx} className="p-4 space-y-3 hover:bg-white dark:hover:bg-[#14132b] transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                isDone
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                              }`}
                            >
                              <CheckCircle2 size={16} />
                            </div>
                            <div>
                              <h5 className={`text-xs font-bold ${isDone ? 'text-emerald-900 dark:text-emerald-300 font-extrabold' : 'text-slate-900 dark:text-white'}`}>
                                {(m.title || m.name || '').replace(/^Milestone \d+:\s*/i, '')}
                              </h5>
                              <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Calendar size={12} className="text-slate-400" /> Target Due: {m.dueDate || m.date || 'Q4 2026'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                              isDone
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40'
                            }`}
                          >
                            {isDone ? 'Completed / Approved' : 'In Progress'}
                          </span>
                        </div>

                        {/* Git Commit Log Timeline Feed for Client View */}
                        {msCommits.length > 0 && (
                          <div className="ml-9 border-l-2 border-slate-200 dark:border-slate-700 pl-3.5 space-y-2 pt-1">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                              Verified Git Commit Updates ({msCommits.length})
                            </span>
                            {msCommits.map((cmt) => (
                              <div key={cmt.id} className="p-2.5 rounded-xl bg-white dark:bg-[#14132b] border border-slate-200/80 dark:border-white/10 text-xs space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-[9px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                      #{cmt.commitHash}
                                    </span>
                                    <h6 className="font-bold text-slate-900 dark:text-white">{cmt.commitMessage}</h6>
                                  </div>
                                  <span className="text-[10px] text-slate-400">{cmt.dateTime}</span>
                                </div>
                                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-sans leading-relaxed">{cmt.workCompleted}</p>
                                <div className="text-[10px] text-slate-400 pt-0.5">
                                  Submitted by: <strong className="text-slate-700 dark:text-slate-200">{cmt.authorName}</strong>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientProgress;
