import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  ChevronLeft,
  Calendar,
  MapPin,
  Users,
  Briefcase,
  Layers,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  FileCheck,
  Check,
  TrendingUp,
  Activity,
  UserCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useData } from '../../context/DataContext';

const StatusBadge = ({ status = 'Active', size = 'md' }) => {
  const normalized = String(status).toLowerCase().trim();
  let bg = 'bg-blue-50 text-blue-700 border-blue-200';

  if (['completed', 'approved'].includes(normalized)) {
    bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['in progress', 'development'].includes(normalized)) {
    bg = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (['pending', 'pending approval', 'pending admin review', 'matching'].includes(normalized)) {
    bg = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (['draft'].includes(normalized)) {
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

export const PartnerProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { partnerProjects = [], partnerWorkforce = [] } = useData() || {};

  const project = useMemo(() => {
    return (
      (partnerProjects || []).find((p) => p && p.id === id) ||
      (partnerProjects || [])[0] || {
        id: id || 'PRJ-PARTNER-101',
        name: 'E-Commerce Platform Development',
        category: 'Full-Stack Web',
        priority: 'High',
        stage: 'Development',
        status: 'In Progress',
        progress: 75,
        startDate: '2026-08-01',
        expectedEndDate: '2027-01-31',
        description: 'Enterprise scalable multi-tenant e-commerce platform with automated payment workflows.',
        techStack: 'React.js, Node.js, PostgreSQL, AWS',
        workforceAssigned: 6,
        workforceRequired: 6,
        budget: '$180,000',
        spent: '$135,000',
        workflowSteps: [
          { name: 'Partner Project Request', status: 'Completed', date: 'Aug 01, 2026' },
          { name: 'Company Requirement Review', status: 'Completed', date: 'Aug 05, 2026' },
          { name: 'Scope & Architecture Sign-Off', status: 'Completed', date: 'Aug 10, 2026' },
          { name: 'Workforce Matching', status: 'Completed', date: 'Aug 15, 2026' },
          { name: 'Squad Assignment Sign-Off', status: 'Completed', date: 'Aug 20, 2026' },
          { name: 'Sprint Execution', status: 'Active', date: 'Current' },
          { name: 'QA Testing', status: 'Pending', date: 'Nov 2026' },
          { name: 'Client Acceptance', status: 'Pending', date: 'Dec 2026' },
          { name: 'Final Delivery', status: 'Pending', date: 'Jan 2027' },
        ],
      }
    );
  }, [partnerProjects, id]);

  const assignedEmployees = useMemo(() => {
    return (partnerWorkforce || []).filter(
      (w) =>
        w &&
        (w.projectId === project.id ||
          (w.assignedProject && (w.assignedProject || '').toLowerCase().includes((project.name || '').toLowerCase().slice(0, 8))))
    );
  }, [partnerWorkforce, project]);

  const stagesList = [
    'Requirement',
    'Workforce Matching',
    'Workforce Assigned',
    'Development',
    'Testing',
    'Deployment',
    'Completed',
  ];

  const currentStageIndex = stagesList.indexOf(project.stage) !== -1 ? stagesList.indexOf(project.stage) : 3;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/partner/projects')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Back to Projects List</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Project ID:</span>
          <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200 font-mono font-bold text-xs text-slate-800">
            {project.id}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. PROJECT HEADER SUMMARY CARD */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100 uppercase">
                {project.category}
              </span>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-100">
                Priority: {project.priority}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {project.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-3xl leading-relaxed">
              {project.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-2">
            <StatusBadge status={project.status} size="md" />
            <span className="text-xs text-slate-500 font-medium">
              Created: <strong>{project.createdDate}</strong>
            </span>
          </div>
        </div>

        {/* 4 Metadata Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Duration</span>
            <span className="font-extrabold text-slate-900 mt-0.5 block">{project.duration}</span>
            <span className="text-[11px] text-slate-500">Starts {project.startDate}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Workforce Allocation</span>
            <span className="font-extrabold text-blue-600 mt-0.5 block">
              {project.workforceAssigned} / {project.workforceRequired} Assigned
            </span>
            <span className="text-[11px] text-slate-500">{project.workforceRequired - project.workforceAssigned} remaining</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Work Model</span>
            <span className="font-extrabold text-slate-900 mt-0.5 block">{project.workType}</span>
            <span className="text-[11px] text-slate-500 truncate block">{project.location}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Expected Completion</span>
            <span className="font-extrabold text-emerald-700 mt-0.5 block">{project.expectedEndDate}</span>
            <span className="text-[11px] text-slate-500">Managed to SLA</span>
          </div>
        </div>

        {/* Overall Project Progress (Section 11) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/60 to-indigo-50/60 border border-blue-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-slate-900">
            <span className="flex items-center gap-2">
              <TrendingUp size={16} className="text-[#004ac6]" />
              <span>Overall Project Progress</span>
            </span>
            <span className="text-[#004ac6] text-base sm:text-lg">{project.progress}%</span>
          </div>

          <div className="w-full h-3 rounded-full bg-white border border-blue-200 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${project.progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                project.progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#004ac6] to-[#2563eb]'
              }`}
            />
          </div>

          {/* Project Stages Bar (Requirement -> Completed) */}
          <div className="pt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Project Stage Track
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 text-center text-[10px]">
              {stagesList.map((stageName, idx) => {
                const isPassed = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                return (
                  <div
                    key={stageName}
                    className={`py-1.5 px-2 rounded-lg font-bold transition-all ${
                      isCurrent
                        ? 'bg-[#2563eb] text-white shadow-xs'
                        : isPassed
                        ? 'bg-emerald-100/90 text-emerald-800'
                        : 'bg-white text-slate-400 border border-slate-200'
                    }`}
                  >
                    {stageName}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SECTION 9: VISUAL 9-STEP APPROVAL & WORKFLOW */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              FlexiStaff Project Approval & Workflow
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete transparent lifecycle from partner submission, FlexiStaff Company approval, Manager workforce matching, to project execution.
          </p>
        </div>

        {/* 9-Step Horizontal / Flow Sequence */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-9 gap-2.5">
          {project.workflowSteps.map((stepItem, idx) => {
            const isCompleted = stepItem.status === 'Completed';
            const isActive = stepItem.status === 'Active';

            return (
              <div
                key={idx}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between space-y-2 transition-all ${
                  isCompleted
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : isActive
                    ? 'bg-blue-50 border-[#2563eb] text-[#004ac6] ring-2 ring-blue-500/20'
                    : 'bg-slate-50/50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black rounded-full px-1.5 py-0.2 ${
                    isCompleted ? 'bg-emerald-200 text-emerald-900' : isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    Step {stepItem.step}
                  </span>
                  {isCompleted && <CheckCircle2 size={14} className="text-emerald-600" />}
                  {isActive && <Clock size={14} className="text-blue-600 animate-pulse" />}
                </div>

                <div>
                  <p className="text-xs font-bold leading-tight">{stepItem.label}</p>
                  <span className="text-[10px] opacity-80 mt-1 block font-medium">{stepItem.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ASSIGNED WORKFORCE ROSTER (READ-ONLY MONITORING) */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Assigned Project Workforce</h3>
            <p className="text-xs text-slate-500">
              Assigned by FlexiStaff Manager • Partner monitoring view (No salary or private PII data)
            </p>
          </div>
          <Link
            to="/partner/workforce"
            className="text-xs font-bold text-[#004ac6] hover:underline"
          >
            Explore All Assigned Staff ({partnerWorkforce.length}) →
          </Link>
        </div>

        {assignedEmployees.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Clock size={28} className="text-slate-400 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-800">Workforce Matching in Progress</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              FlexiStaff Manager is currently matching suitable engineering profiles to this project requirement.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedEmployees.map((emp) => (
              <div
                key={emp.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all space-y-3"
              >
                <div className="flex items-center gap-3">
                  <img src={emp.avatar} alt={emp.pseudonym} className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{emp.pseudonym}</h4>
                    <p className="text-[11px] font-semibold text-blue-600">{emp.role}</p>
                    <span className="text-[10px] text-slate-400">{emp.workingStatus} • {emp.availability}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-500">Task Velocity</span>
                    <span className="text-blue-600">{emp.workProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${emp.workProgress}%` }} />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-100 text-[11px] space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Current Task:</span>
                  <p className="font-semibold text-slate-800 line-clamp-1">{emp.currentTask}</p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/partner/workforce')}
                  className="w-full py-1.5 text-center text-xs font-bold text-[#004ac6] bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                >
                  View Work Progress
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. MILESTONES & REQUIREMENTS SPECIFICATION */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestones Checklist */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Project Milestones
            </h3>
            <p className="text-xs text-slate-500">Target deliverables tracking</p>
          </div>

          <div className="space-y-2.5">
            {project.milestones?.map((m) => (
              <div
                key={m.id}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                  m.completed ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${m.completed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    {m.completed ? <Check size={12} /> : <Clock size={12} />}
                  </div>
                  <span className={`font-semibold ${m.completed ? 'text-emerald-950 font-bold' : 'text-slate-700'}`}>
                    {m.name}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">{m.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Workforce Requirements Roster */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Required vs Fulfilled Roles
            </h3>
            <p className="text-xs text-slate-500">Fulfillment tracking per requirement</p>
          </div>

          <div className="space-y-2.5">
            {project.requirements?.map((req, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{req.role}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    req.assigned >= req.required ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {req.assigned} / {req.required} Fulfilled
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Skills: {req.skills} • {req.experience}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerProjectDetails;
