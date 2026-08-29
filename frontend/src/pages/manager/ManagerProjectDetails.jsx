import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FolderCheck,
  ChevronLeft,
  Calendar,
  Building2,
  Cpu,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Briefcase,
  Layers,
  Activity,
  Check,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const ManagerProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, partnerProjects, workforce, managerAssignments, projectMilestones = {} } = useData();

  // Find project
  const project = useMemo(() => {
    const all = [...projects, ...partnerProjects];
    return (
      all.find((p) => p.id === id) || {
        id: id || 'PRJ-PARTNER-101',
        name: 'E-Commerce Platform Development',
        client: 'Apex Digital Enterprises',
        partner: 'Apex Digital Enterprises',
        category: 'Full-Stack Web & Mobile Architecture',
        techStack: 'React.js, Java Spring Boot, MySQL, Selenium',
        priority: 'High',
        description:
          'Comprehensive multi-tenant e-commerce platform overhaul with microservices architecture, modern checkout flow, and automated QA pipeline.',
        workforceRequired: 6,
        workforceAssigned: 3,
        startDate: '2026-08-01',
        expectedEndDate: '2027-01-31',
        duration: '6 Months',
        workType: 'Hybrid (San Francisco & Remote)',
        location: 'San Francisco, CA',
        status: 'Approved',
        requirements: [
          { role: 'Frontend React Developer', required: 2, assigned: 1, skills: 'React.js, JavaScript, HTML, CSS' },
          { role: 'Java Backend Architect', required: 2, assigned: 1, skills: 'Java, Spring Boot, MySQL' },
          { role: 'UI/UX Designer', required: 1, assigned: 1, skills: 'Figma, UI Design' },
          { role: 'QA Automation Engineer', required: 1, assigned: 0, skills: 'Testing, Selenium' },
        ],
      }
    );
  }, [id, projects, partnerProjects]);

  const requirementsList = project.requirements || [
    { role: 'Frontend React Developer', required: 2, assigned: 1, skills: 'React.js, JavaScript, HTML, CSS' },
    { role: 'Java Backend Architect', required: 2, assigned: 1, skills: 'Java, Spring Boot, MySQL' },
    { role: 'UI/UX Designer', required: 1, assigned: 1, skills: 'Figma, UI Design' },
    { role: 'QA Automation Engineer', required: 1, assigned: 0, skills: 'Testing, Selenium' },
  ];

  const totalRequired = requirementsList.reduce((sum, r) => sum + (Number(r.required) || 0), 0) || project.workforceRequired || 6;
  const totalAssigned = requirementsList.reduce((sum, r) => sum + (Number(r.assigned) || 0), 0) || project.workforceAssigned || 3;
  const totalRemaining = Math.max(0, totalRequired - totalAssigned);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Back Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/manager/projects')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Back to Approved Projects</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate(`/manager/matching/${project.id}`)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#004ac6] to-[#2563eb] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:from-[#003da6] hover:to-[#1d4ed8] active:scale-95 transition-all"
          >
            <Cpu size={15} />
            <span>Find & Match Workforce</span>
          </button>
        </div>
      </div>

      {/* Project Hero Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                {project.id}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Approved by Company
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {project.priority || 'High'} Priority
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {project.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              {project.description}
            </p>
          </div>

          {/* Progress & Headcount Widget */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="text-center px-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Required</span>
              <p className="text-2xl font-black text-slate-900">{totalRequired}</p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center px-2">
              <span className="text-[10px] font-bold uppercase text-blue-600">Assigned</span>
              <p className="text-2xl font-black text-blue-600">{totalAssigned}</p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center px-2">
              <span className="text-[10px] font-bold uppercase text-amber-600">Remaining</span>
              <p className="text-2xl font-black text-amber-600">{totalRemaining}</p>
            </div>
          </div>
        </div>

        {/* Project Meta Details (Section 5) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-6 text-xs">
          <div>
            <span className="text-slate-400 font-medium">Partner Company</span>
            <p className="font-bold text-slate-900 mt-0.5">{project.client || project.partner || 'Apex Digital'}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Category</span>
            <p className="font-bold text-slate-900 mt-0.5">{project.category || 'Full-Stack Engineering'}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Start Date</span>
            <p className="font-bold text-slate-900 mt-0.5">{project.startDate || '2026-08-01'}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Expected End Date</span>
            <p className="font-bold text-slate-900 mt-0.5">{project.expectedEndDate || '2027-01-31'}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Work Type</span>
            <p className="font-bold text-slate-900 mt-0.5">{project.workType || 'Remote'}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Location</span>
            <p className="font-bold text-slate-900 mt-0.5 truncate">{project.location || 'San Francisco, CA'}</p>
          </div>
        </div>
      </div>

      {/* Workforce Requirements Breakdown (Section 5) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Workforce Requirements & Role Allocations</h2>
            <p className="text-xs text-slate-500">Breakdown of required engineering specializations and skill criteria</p>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200">
            Fulfillment: {totalAssigned} / {totalRequired} Allocated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requirementsList.map((req, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 space-y-3 hover:border-blue-300 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{req.role}</h4>
                  <span className="text-xs font-semibold text-slate-500">
                    Required: <strong>{req.required}</strong> | Assigned: <strong className="text-blue-600">{req.assigned || 0}</strong>
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  (req.assigned || 0) >= req.required ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {(req.assigned || 0) >= req.required ? 'Fully Fulfilled' : 'Needs Matching'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Required Skill Profile
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {req.skills.split(',').map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 text-[11px] font-bold"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Ready to query vetted candidate pool</span>
                <button
                  type="button"
                  onClick={() => navigate(`/manager/matching/${project.id}`)}
                  className="text-xs font-bold text-[#004ac6] hover:underline flex items-center gap-1"
                >
                  <span>Match Candidates</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Git Milestone Commit Log & Timeline for Manager */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Live Sprint Progress & Git Milestone Commits</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review technical commit updates, milestone statuses, and overall sprint progress logged by deployed talent.
            </p>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-blue-50 border border-blue-100">
            <span className="text-xs font-bold text-slate-500">Overall Progress:</span>
            <span className="text-sm font-black text-blue-700">{project.progress || 65}%</span>
          </div>
        </div>

        <div className="space-y-4">
          {(projectMilestones[project.id || 'PRJ-2026-001'] || [
            {
              id: 'ms-01',
              title: 'Core OAuth2 & RBAC Auth Engine',
              status: 'Completed',
              dueDate: '2026-09-15',
              commits: [
                {
                  id: 'cmt-101',
                  commitHash: 'a7f3d91',
                  commitMessage: 'feat(auth): Implement JWT token rotation & session refresh handler',
                  workCompleted: 'Configured secure HttpOnly cookies, added middleware route protection, and wrote unit tests for auth flow.',
                  authorName: 'David Miller',
                  dateTime: '2026-08-28 02:45 PM',
                },
              ],
            },
            {
              id: 'ms-02',
              title: 'Real-time Analytics & Dashboard Metrics',
              status: 'In Progress',
              dueDate: '2026-10-01',
              commits: [
                {
                  id: 'cmt-201',
                  commitHash: 'c4d9e20',
                  commitMessage: 'feat(analytics): Wire WebSocket live metrics feed to dashboard UI',
                  workCompleted: 'Integrated Socket.io client listener with automatic reconnection and live chart state updates.',
                  authorName: 'David Miller',
                  dateTime: '2026-08-28 04:10 PM',
                },
              ],
            },
          ]).map((ms) => {
            const isCompleted = ms.status === 'Completed';
            const msCommits = ms.commits || [];

            return (
              <div key={ms.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className={isCompleted ? 'text-emerald-600' : 'text-slate-400'} />
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">{ms.title}</h4>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold self-start sm:self-auto ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {ms.status}
                  </span>
                </div>

                {msCommits.length > 0 && (
                  <div className="ml-6 border-l-2 border-slate-200 pl-3 space-y-2 pt-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      Talent Commit Logs ({msCommits.length})
                    </span>
                    {msCommits.map((cmt) => (
                      <div key={cmt.id} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
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
                          Author: <strong className="text-slate-700">{cmt.authorName}</strong>
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
    </div>
  );
};

export default ManagerProjectDetails;
