import React, { useState } from 'react';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Calendar,
  Users,
  Building2,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  CheckSquare,
  Square,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import StatusBadge from './StatusBadge';
import { toast } from 'react-toastify';

export const ProjectProgress = ({
  project,
  onToggleMilestone,
  onUpdateProgress,
  isEditable = false,
  className = '',
}) => {
  if (!project) return null;

  const milestones = project.milestones || [
    { id: 'm-1', title: 'Architecture Blueprint & Security Audit', completed: true, dueDate: '2026-09-15' },
    { id: 'm-2', title: 'Core Microservices & API Gateway', completed: true, dueDate: '2026-10-30' },
    { id: 'm-3', title: 'Client Integration & Testing', completed: false, dueDate: '2026-12-15' },
    { id: 'm-4', title: 'Production Zero-Downtime Deployment', completed: false, dueDate: '2027-01-31' },
  ];

  const assignedResources = project.assignedResources || [
    {
      id: 'wf-01',
      name: 'David Miller',
      role: 'Frontend Developer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      roleType: 'Freelancer',
      hoursPerWeek: 40,
    },
    {
      id: 'wf-02',
      name: 'Elena Rostova',
      role: 'Kubernetes SRE',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
      roleType: 'Professional',
      hoursPerWeek: 40,
    },
  ];

  const progress = project.progress !== undefined ? project.progress : 50;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-[#004ac6] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                {project.id}
              </span>
              <StatusBadge status={project.status || 'In Progress'} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mt-2">
              {project.name || project.title}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Client: <strong className="text-slate-800">{project.client || 'Enterprise Client'}</strong> | Manager: <strong className="text-slate-800">{project.manager || 'Alex Morgan'}</strong>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Overall Progress</span>
              <span className="text-2xl font-black text-[#004ac6]">{progress}%</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                progress === 100
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-[#004ac6] via-[#2563eb] to-[#3b82f6]'
              }`}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Start: <strong>{project.startDate || '2026-09-01'}</strong></span>
            <span>Deadline: <strong>{project.deadline || project.expectedEndDate || '2027-02-28'}</strong></span>
          </div>
        </div>

        {/* Recent Updates */}
        <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center gap-3 text-xs text-blue-900">
          <Activity size={16} className="text-blue-600 shrink-0" />
          <span>
            {project.recentUpdate ||
              `Sprint velocity on schedule. ${assignedResources.length} workforce specialist(s) active on codebase architecture.`}
          </span>
        </div>
      </div>

      {/* Grid: Milestones Left (7 Cols), Active Workforce Right (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Milestones Checklist */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <CheckSquare size={16} className="text-[#004ac6]" />
              <span>Project Milestones & Deliverables</span>
            </h4>
            <span className="text-[11px] font-bold text-slate-500">
              {milestones.filter((m) => m.completed).length} of {milestones.length} Completed
            </span>
          </div>

          <div className="space-y-2.5">
            {milestones.map((m) => (
              <div
                key={m.id}
                onClick={() => isEditable && onToggleMilestone && onToggleMilestone(m.id)}
                className={`flex items-start justify-between gap-3 p-3.5 rounded-2xl border transition-all ${
                  m.completed
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                    : 'bg-slate-50/60 border-slate-200 text-slate-700'
                } ${isEditable ? 'cursor-pointer hover:border-blue-300' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {m.completed ? (
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    ) : (
                      <Clock size={16} className="text-slate-400 shrink-0" />
                    )}
                  </div>
                  <div>
                    <h5
                      className={`font-bold text-xs ${
                        m.completed ? 'text-emerald-700 font-extrabold' : 'text-slate-900'
                      }`}
                    >
                      {m.title || m.name}
                    </h5>
                    <span className="text-[10px] text-slate-400">Due Date: {m.dueDate || m.date || 'TBD'}</span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    m.completed
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {m.completed ? 'Completed' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Workforce Squad */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Users size={16} className="text-[#004ac6]" />
              <span>Assigned Workforce ({assignedResources.length} / 3)</span>
            </h4>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
              Max 3 Limit
            </span>
          </div>

          <div className="space-y-3">
            {assignedResources.map((res) => (
              <div
                key={res.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      res.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
                    }
                    alt={res.name}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                  />
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">{res.name}</h5>
                    <p className="text-[11px] text-blue-600 font-semibold">{res.role}</p>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {res.roleType === 'Freelancer' ? 'Freelancer' : 'Partner Specialist'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Active
                  </span>
                </div>
              </div>
            ))}

            {assignedResources.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-xs">
                No workforce members assigned yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectProgress;
