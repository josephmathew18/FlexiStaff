import React, { useState, useEffect, useMemo } from 'react';
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
  Star,
  Sparkles,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { StatusBadge, ProjectProgress } from '../../components/workflow';
import RatingFeedbackModal from '../../components/feedback/RatingFeedbackModal';

export const ClientProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects = [], managerAssignments = [], toggleMilestone } = useData() || {};
  const [isFeedbackOpen, setIsFeedbackOpen] = React.useState(false);

  const decodedId = decodeURIComponent(projectId || '').trim();
  const normalizedId = decodedId.toLowerCase().replace(/[\s_]/g, '-');
  const targetNumId = decodedId.replace(/\D/g, '');

  const project = (projects || []).find((p) => {
    if (!p || p.id === undefined || p.id === null) return false;
    const pidLower = String(p.id).toLowerCase().trim();
    const pidNormalized = pidLower.replace(/[\s_]/g, '-');
    const pNumId = pidLower.replace(/\D/g, '');

    const isDirectMatch = pidLower === decodedId.toLowerCase() || pidNormalized === normalizedId;
    const isNumMatch = Boolean(targetNumId && pNumId && targetNumId === pNumId);

    return isDirectMatch || isNumMatch;
  });

  const assignedSquad = React.useMemo(() => {
    if (!project) return [];
    const rosterMap = new Map();

    const makeKey = (name, profId) => {
      const id = profId ? String(profId).trim().toLowerCase() : '';
      const n = (name || '').toLowerCase().trim();
      return `${id || n}`;
    };

    // 1. From project.assignedResources
    (project.assignedResources || []).forEach((r) => {
      if (!r) return;
      const st = String(r.status || '').toLowerCase();
      if (st.includes('declined') || st.includes('reject') || st.includes('cancel')) return;

      const isWorking =
        st === 'active' || st === 'working' || st === 'accepted' || st === 'in progress' || st === 'assigned' || st === 'approved';

      const pComp = r.partnerCompanyName || r.partnerCompany || r.partnerName || null;
      const wfType = r.workforceType || (pComp || r.partnerCompanyId ? 'Partner Company' : 'Independent Freelancer');

      const key = makeKey(r.name || r.professionalName, r.id || r.professionalId);
      rosterMap.set(key, {
        id: r.id || r.professionalId,
        professionalId: r.professionalId || r.id,
        name: r.name || r.professionalName || 'Specialist Engineer',
        role: r.role || r.roleInProject || 'Software Specialist',
        avatar: r.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
        skills: Array.isArray(r.skills) ? r.skills : (r.skills || '').split(',').map((s) => s.trim()).filter(Boolean),
        hourlyRate: r.hourlyRate || '$95/hr',
        weeklyHours: r.weeklyHours || r.hoursPerWeek || 40,
        status: isWorking ? 'Active' : 'Pending Sign-off',
        rawStatus: r.status,
        workforceType: wfType,
        partnerCompany: pComp,
        experience: r.experience || '3+ years',
      });
    });

    // 2. From managerAssignments matching this project
    const pNormId = String(project.id || '').toLowerCase().replace(/[\s_]/g, '-').trim();
    const pNumId = String(project.id || '').replace(/\D/g, '');
    const pTitle = String(project.title || project.name || '').toLowerCase().trim();

    (managerAssignments || []).forEach((a) => {
      if (!a) return;
      const st = String(a.status || '').toLowerCase();
      if (st.includes('declined') || st.includes('reject') || st.includes('cancel')) return;

      const aProj = String(a.projectId || '').toLowerCase().replace(/[\s_]/g, '-').trim();
      const aNum = String(a.projectId || '').replace(/\D/g, '');
      const aTitle = String(a.projectName || '').toLowerCase().trim();

      const isSame = (pNormId && aProj === pNormId) || (pNumId && aNum === pNumId) || (pTitle && aTitle === pTitle);
      if (isSame) {
        const isWorking =
          st === 'active' || st === 'working' || st === 'accepted' || st === 'in progress' || st === 'assigned' || st === 'approved';

        const pComp = a.partnerCompanyName || a.partnerCompany || a.partnerName || null;
        const wfType = a.workforceType || (pComp || a.partnerCompanyId || a.source === 'Partner Company' ? 'Partner Company' : 'Independent Freelancer');

        const key = makeKey(a.professionalName || a.name, a.professionalId || a.id);
        const existing = rosterMap.get(key);

        if (!existing || (existing.status !== 'Active' && isWorking)) {
          rosterMap.set(key, {
            id: a.professionalId || a.id,
            professionalId: a.professionalId || a.id,
            name: a.professionalName || a.name || 'Specialist Candidate',
            role: a.role || a.roleInProject || 'Software Engineer',
            avatar: a.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
            skills: Array.isArray(a.skills) ? a.skills : (a.skills || '').split(',').map((s) => s.trim()).filter(Boolean),
            hourlyRate: a.hourlyRate || '$95/hr',
            weeklyHours: a.workload || a.weeklyHours || 40,
            status: isWorking ? 'Active' : 'Pending Sign-off',
            rawStatus: a.status,
            workforceType: wfType,
            partnerCompany: pComp,
            experience: a.experience || '3+ years',
          });
        }
      }
    });

    return Array.from(rosterMap.values());
  }, [project, managerAssignments]);

  const activeSquad = useMemo(() => {
    return (assignedSquad || []).filter((m) => {
      const st = String(m.rawStatus || m.status || '').toUpperCase().trim();
      return st === 'ACTIVE' || st === 'ACCEPTED' || st === 'WORKING' || st === 'APPROVED';
    });
  }, [assignedSquad]);

  const pendingSquad = useMemo(() => {
    return (assignedSquad || []).filter((m) => {
      const st = String(m.rawStatus || m.status || '').toUpperCase().trim();
      return st !== 'ACTIVE' && st !== 'ACCEPTED' && st !== 'WORKING' && st !== 'APPROVED';
    });
  }, [assignedSquad]);

  const requiredHeadcount = useMemo(() => {
    if (!project) return 2;
    const req = Number(
      project.workforceRequired ||
      project.headcount ||
      project.teamHeadcount ||
      project.requiredHeadcount ||
      project.requiredProfessionals ||
      project.workforceCount
    );
    if (req && req > 0) return req;
    if (Array.isArray(project.requirements) && project.requirements.length > 0) {
      const sum = project.requirements.reduce((acc, r) => acc + (Number(r.required || r.count || r.quantity) || 0), 0);
      if (sum > 0) return sum;
    }
    if ((assignedSquad || []).length > 0) return assignedSquad.length;
    return 2;
  }, [project, assignedSquad]);

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
  const progressVal = project.progress ?? project.progressPercentage ?? 0;
  const isApproved = project.status === 'Approved' || project.stage === 'Approved';
  const isInProgress = project.status === 'In Progress' || project.stage === 'In Progress';
  const isRejected = project.status === 'Rejected' || project.stage === 'Rejected';
  const isCompleted = (project.status === 'Completed' || project.stage === 'Completed') && Number(progressVal) === 100;

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
              <span className="font-mono text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                Project #{typeof project.id === 'number' ? project.id : (String(project.id).replace(/\D/g, '') || project.id)}
              </span>
              <StatusBadge status={project.status || project.stage} />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              {project.title || project.name}
            </h1>
            <p className="text-xs text-slate-500">{project.category || 'Enterprise Software Engineering'}</p>
          </div>

          <div className="flex items-center gap-3">
            {isCompleted && (
              <button
                type="button"
                onClick={() => setIsFeedbackOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Star size={14} className="fill-white" />
                <span>Rate & Review Project</span>
              </button>
            )}
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Workforce Squad</span>
              <p className="text-sm font-extrabold text-slate-900">
                {activeSquad.length} / {requiredHeadcount} Staffed
              </p>
              {pendingSquad.length > 0 && (
                <span className="text-[10px] font-bold text-amber-600 block mt-0.5">
                  {pendingSquad.length} Staged Pending Sign-off
                </span>
              )}
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
                : Array.isArray(project.techStack)
                ? project.techStack
                : String(project.requiredSkills || project.techStack || project.skills || '')
                    .split(/[,+]/)
                    .map((s) => s.trim())
                    .filter(Boolean)
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
              <span className="font-bold text-slate-900">{(project.manager && project.manager !== 'Unassigned') ? project.manager : (project.managerName && project.managerName !== 'Unassigned') ? project.managerName : 'Thomas Mathew'}</span>
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

      {/* Assigned Engineering Squad Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-[#004ac6]" />
            <h3 className="font-extrabold text-slate-900 text-sm">
              Assigned Engineering Squad
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-[#004ac6] border border-blue-200">
              {activeSquad.length} / {requiredHeadcount} Staffed
            </span>
            {pendingSquad.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                {pendingSquad.length} Staged Pending Sign-off
              </span>
            )}
          </div>
          <Link
            to="/client/workforce"
            className="text-xs font-bold text-[#004ac6] hover:underline flex items-center gap-1"
          >
            <span>View All Workforce</span>
          </Link>
        </div>

        {assignedSquad.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-2xl">
            <Users size={32} className="mx-auto text-slate-300" />
            <p className="text-xs font-bold text-slate-700">No specialists deployed yet</p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Your assigned manager is currently evaluating verified partner professionals and freelancers for this project pod.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedSquad.map((member, idx) => (
              <div
                key={member.id || idx}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-100 shadow-2xs shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-extrabold text-slate-900 text-xs truncate">{member.name}</h4>
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                            member.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {member.status === 'Active' ? 'Active' : 'Pending Sign-off'}
                        </span>
                      </div>
                      <p className="text-[11px] text-blue-700 font-bold truncate mt-0.5">{member.role}</p>
                      <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {member.workforceType === 'Partner Company'
                          ? member.partnerCompany || 'Partner Company'
                          : 'Independent Freelancer'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {(member.skills || []).slice(0, 3).map((s, sIdx) => (
                      <span key={sIdx} className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                        {s}
                      </span>
                    ))}
                    {(member.skills || []).length > 3 && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-white text-slate-400 border border-slate-200">
                        +{(member.skills || []).length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px] text-slate-500">
                  <span className="font-bold text-slate-900">{member.hourlyRate}</span>
                  <span>{member.weeklyHours}h / week</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Rating & Feedback Modal */}
      {isFeedbackOpen && (
        <RatingFeedbackModal
          isOpen={isFeedbackOpen}
          onClose={() => setIsFeedbackOpen(false)}
          project={project}
        />
      )}
    </div>
  );
};

export default ClientProjectDetails;
