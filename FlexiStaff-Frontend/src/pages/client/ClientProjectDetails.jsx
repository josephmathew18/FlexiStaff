import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FolderKanban,
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  PlayCircle,
  XCircle,
  Users,
  ShieldCheck,
  Briefcase,
  Layers,
  FileText,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { StatusBadge, ProjectProgress } from '../../components/workflow';

export const ClientProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects = [], toggleMilestone } = useData() || {};

  const project = projects.find((p) => p.id === projectId) || projects[0];

  if (!project) {
    return (
      <div className="p-10 text-center text-slate-500">
        <p>Project not found.</p>
        <button
          onClick={() => navigate('/client/projects')}
          className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const isPending = project.status === 'Pending Admin Approval' || project.stage === 'Pending Admin Approval';
  const isApproved = project.status === 'Approved' || project.stage === 'Approved';
  const isInProgress = project.status === 'In Progress' || project.stage === 'In Progress';
  const isRejected = project.status === 'Rejected' || project.stage === 'Rejected';
  const isCompleted = project.status === 'Completed' || project.stage === 'Completed';

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 pb-16">
      {/* Back Button & Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/client/projects')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-3"
        >
          <ArrowLeft size={14} />
          <span>Back to Projects</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400">{project.id}</span>
              <StatusBadge status={project.status || project.stage} />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              {project.title || project.name}
            </h1>
            <p className="text-xs text-slate-500">{project.category || 'Enterprise Software Engineering'}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Workforce Limit</span>
              <p className="text-sm font-extrabold text-slate-900">
                {project.workforceAssigned || 0} / {Math.min(3, project.workforceRequired || 3)} Assigned
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Notice Banner */}
      {isRejected && (
        <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 flex items-start gap-3.5 text-xs text-rose-900">
          <XCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-rose-950">Project Requirement Not Approved by Company Admin</h4>
            <p className="text-rose-800 leading-relaxed">
              <strong>Reason:</strong> {project.rejectionReason || 'Project timeframe or technical scope requires adjustment.'}
            </p>
            <p className="text-[11px] text-rose-700 mt-2">
              You can modify project parameters and submit a revised requirement from your client portal.
            </p>
          </div>
        </div>
      )}

      {/* Workflow Stage Tracker */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Enterprise Staffing Workflow Status
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div
            className={`p-3.5 rounded-2xl border ${
              isPending
                ? 'bg-amber-50/80 border-amber-300 text-amber-900 font-bold'
                : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-current text-white flex items-center justify-center text-[10px] font-black">
                1
              </span>
              <span className="font-bold">Client Requirement</span>
            </div>
            <p className="text-[11px] mt-1 text-slate-600">Created & Submitted</p>
          </div>

          <div
            className={`p-3.5 rounded-2xl border ${
              isPending
                ? 'bg-slate-50 border-slate-200 text-slate-400'
                : isRejected
                ? 'bg-rose-50 border-rose-200 text-rose-800 font-bold'
                : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-current text-white flex items-center justify-center text-[10px] font-black">
                2
              </span>
              <span className="font-bold">Admin Project Review</span>
            </div>
            <p className="text-[11px] mt-1 text-slate-600">
              {isRejected ? 'Rejected by Admin' : isPending ? 'Under Admin Review' : 'Approved by Admin'}
            </p>
          </div>

          <div
            className={`p-3.5 rounded-2xl border ${
              isApproved
                ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
                : isInProgress || isCompleted
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-current text-white flex items-center justify-center text-[10px] font-black">
                3
              </span>
              <span className="font-bold">Manager Workforce Req</span>
            </div>
            <p className="text-[11px] mt-1 text-slate-600">
              {isInProgress || isCompleted
                ? 'Workforce Assigned'
                : isApproved
                ? 'Manager Requesting Talent'
                : 'Awaiting Step 2'}
            </p>
          </div>

          <div
            className={`p-3.5 rounded-2xl border ${
              isInProgress
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 font-bold'
                : isCompleted
                ? 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-current text-white flex items-center justify-center text-[10px] font-black">
                4
              </span>
              <span className="font-bold">Project Execution</span>
            </div>
            <p className="text-[11px] mt-1 text-slate-600">
              {isCompleted ? 'Project Completed' : isInProgress ? 'Sprint Active' : 'Pending Allocation'}
            </p>
          </div>
        </div>
      </div>

      {/* Project Execution Progress UI (If Approved, In Progress, or Completed) */}
      {(isInProgress || isCompleted || isApproved) && (
        <ProjectProgress
          project={project}
          onToggleMilestone={toggleMilestone}
          isEditable={false}
        />
      )}

      {/* Project Overview Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Scope & Required Technical Skills
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">{project.description}</p>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">
              Required Technical Stack
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(Array.isArray(project.requiredSkills)
                ? project.requiredSkills
                : (project.techStack || '').split(',')
              ).map((sk, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-xs"
                >
                  {String(sk).trim()}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-3 text-xs">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Timeline & Allocation Specs
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
              <span className="text-slate-500 font-medium">Assigned Manager:</span>
              <span className="font-bold text-slate-900">{project.manager || 'Alex Morgan'}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
              <span className="text-slate-500 font-medium">Project Duration:</span>
              <span className="font-bold text-slate-900">{project.duration || '6 Months'}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
              <span className="text-slate-500 font-medium">Start Date:</span>
              <span className="font-bold text-slate-900">{project.startDate || '2026-09-01'}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
              <span className="text-slate-500 font-medium">Expected Deadline:</span>
              <span className="font-bold text-slate-900">{project.deadline || '2027-02-28'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProjectDetails;
