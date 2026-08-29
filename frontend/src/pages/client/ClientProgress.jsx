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
          className="text-slate-100"
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
        <span className="text-sm font-black text-slate-900 leading-none">{value}%</span>
      </div>
    </div>
  );
};

export const ClientProgress = () => {
  const { clientProfile, projects = [], updateProjectProgress } = useData() || {};

  // Client projects list
  const clientProjects = useMemo(() => {
    const companyName = (clientProfile?.company || 'Finovate Global').toLowerCase();
    const clientId = clientProfile?.id;
    return projects.filter(
      (p) =>
        p &&
        ((p.client || '').toLowerCase().includes('finovate') ||
          (p.client || '').toLowerCase() === companyName ||
          p.clientId === clientId)
    );
  }, [projects, clientProfile]);

  const [selectedProjectId, setSelectedProjectId] = useState(clientProjects[0]?.id || 'all');

  const selectedProject = useMemo(() => {
    if (selectedProjectId === 'all') return null;
    return clientProjects.find((p) => p.id === selectedProjectId) || clientProjects[0];
  }, [clientProjects, selectedProjectId]);

  // Aggregate stats across client projects
  const totalMilestonesCount = useMemo(() => {
    return clientProjects.reduce((sum, p) => sum + (p.milestones ? p.milestones.length : 3), 0);
  }, [clientProjects]);

  const completedMilestonesCount = useMemo(() => {
    return clientProjects.reduce((sum, p) => {
      const completed = p.milestones ? p.milestones.filter((m) => m.completed).length : 1;
      return sum + completed;
    }, 0);
  }, [clientProjects]);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <TrendingUp size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Progress
              </h1>
              <p className="text-xs text-slate-500">
                Track completion status, approve sprint sign-offs, and monitor velocity timelines.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>94.8% SLA Velocity</span>
          </span>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total SOW Milestones</span>
            <FolderKanban size={16} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalMilestonesCount} Milestones</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">across {clientProjects.length} active projects</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completed Sign-offs</span>
            <CheckCircle2 size={16} className="text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{completedMilestonesCount} / {totalMilestonesCount}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Approved by client lead</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Upcoming Deadline</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">Sprint 4 Sign-off</p>
          <p className="text-[11px] text-amber-700 font-semibold mt-1">Due in 5 business days</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">On-Time Completion</span>
            <FileCheck size={16} className="text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">98.2% On-Time</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Strict quality SLA benchmark</p>
        </div>
      </div>

      {/* Project Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Filter Milestone View:</span>
        </div>
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="w-full sm:w-80 rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-emerald-600"
        >
          <option value="all">All Portfolio Projects</option>
          {clientProjects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title || p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Project Milestone Detailed Breakdown */}
      <div className="space-y-6">
        {(selectedProject ? [selectedProject] : clientProjects).map((project) => {
          const progressVal = project.progress || 50;
          const milestonesList = project.milestones || [
            { id: 'm-1', title: 'Architecture Blueprint & Tech Stack Validation', dueDate: '2026-09-30', completed: true },
            { id: 'm-2', title: 'Core Feature Engineering & Sprint Reviews', dueDate: '2026-11-30', completed: false },
            { id: 'm-3', title: 'Production Pen-testing, UAT & Final Deployment', dueDate: '2027-02-28', completed: false },
          ];

          return (
            <div key={project.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
              {/* Project Title & Large Circular Progress Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-5">
                {/* Left: Project Title & Metadata */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                      {project.id}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 truncate">{project.title || project.name}</h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    Manager: <strong className="text-slate-800">{project.manager || 'Alex Morgan'}</strong> • Category: {project.category || 'Software Engineering'}
                  </p>
                </div>

                {/* In Between / Right: Large Circular Progress Bar */}
                <div className="flex items-center gap-3 shrink-0 px-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <CircularProgress value={progressVal} size={68} strokeWidth={6} />
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Sprint Completion</span>
                    <span className="text-xs font-black text-emerald-700">
                      {progressVal === 100 ? '100% Completed' : `${progressVal}% In Progress`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Milestone Timeline Checklist & Commit Logs */}
              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100 overflow-hidden bg-slate-50/50">
                {milestonesList.map((m, idx) => {
                  const isDone = m.completed || m.status === 'Completed';
                  const msCommits = m.commits || [];

                  return (
                    <div key={m.id || idx} className="p-4 space-y-3 hover:bg-white transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              isDone
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-200 text-slate-400'
                            }`}
                          >
                            <CheckCircle2 size={16} />
                          </div>
                          <div>
                            <h5 className={`text-xs font-bold ${isDone ? 'text-emerald-900 font-extrabold' : 'text-slate-900'}`}>
                              {(m.title || m.name || '').replace(/^Milestone \d+:\s*/i, '')}
                            </h5>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} className="text-slate-400" /> Target Due: {m.dueDate || m.date || 'Q4 2026'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                            isDone
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {isDone ? 'Completed / Approved' : 'In Progress'}
                        </span>
                      </div>

                      {/* Git Commit Log Timeline Feed for Client View */}
                      {msCommits.length > 0 && (
                        <div className="ml-9 border-l-2 border-slate-200 pl-3.5 space-y-2 pt-1">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                            Verified Git Commit Updates ({msCommits.length})
                          </span>
                          {msCommits.map((cmt) => (
                            <div key={cmt.id} className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-[9px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                    #{cmt.commitHash}
                                  </span>
                                  <h6 className="font-bold text-slate-900">{cmt.commitMessage}</h6>
                                </div>
                                <span className="text-[10px] text-slate-400">{cmt.dateTime}</span>
                              </div>
                              <p className="text-[11px] text-slate-600 font-sans leading-relaxed">{cmt.workCompleted}</p>
                              <div className="text-[10px] text-slate-400 pt-0.5">
                                Submitted by: <strong className="text-slate-700">{cmt.authorName}</strong>
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
    </div>
  );
};

export default ClientProgress;
