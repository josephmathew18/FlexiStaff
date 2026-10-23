import React, { useState, useMemo } from 'react';
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
  Plus,
  X,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { toast } from 'react-toastify';

export const ManagerProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, partnerProjects, workforce, managerAssignments, projectMilestones = {}, updateProjectHeadcount, addMilestone } = useData();

  // Add Milestone Modal State
  const [isAddMilestoneModalOpen, setIsAddMilestoneModalOpen] = useState(false);
  const [newMilestoneData, setNewMilestoneData] = useState({
    title: '',
    dueDate: '',
    weightage: 20,
    description: '',
  });
  const [isSubmittingMilestone, setIsSubmittingMilestone] = useState(false);

  // Find project
  const project = useMemo(() => {
    const all = [...(projects || []), ...(partnerProjects || [])];
    const rawIdStr = String(id || '').trim();
    const cleanNumId = rawIdStr.replace(/\D/g, '');

    const matched = all.find((p) => {
      if (!p) return false;
      const pIdStr = String(p.id || '').trim();
      const pNumId = pIdStr.replace(/\D/g, '');
      if (pIdStr.toLowerCase() === rawIdStr.toLowerCase()) return true;
      if (cleanNumId && pNumId === cleanNumId) return true;
      if (p.name && p.name.toLowerCase() === rawIdStr.toLowerCase()) return true;
      if (p.title && p.title.toLowerCase() === rawIdStr.toLowerCase()) return true;
      return false;
    });

    if (matched) return matched;
    return all[0] || null;
  }, [id, projects, partnerProjects]);

  const activeProject = project;

  if (!activeProject) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-4 max-w-xl mx-auto my-8 shadow-xs">
          <FolderKanban size={40} className="mx-auto text-slate-300" />
          <h2 className="text-xl font-bold text-slate-800">Project Not Found</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            The requested project details could not be found or has not been assigned yet.
          </p>
          <button
            onClick={() => navigate('/manager/projects')}
            className="rounded-xl bg-[#004ac6] px-4 py-2 text-xs font-bold text-white hover:bg-[#003da6] transition-all"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const isCompletedProject =
    activeProject.status === 'Completed' ||
    activeProject.stage === 'Completed' ||
    Number(activeProject.progress) >= 100;

  const requirementsList = useMemo(() => {
    const raw = activeProject.requirements && activeProject.requirements.length > 0 ? activeProject.requirements : [
      {
        role: activeProject.category || 'Software Engineer',
        required: Number(activeProject.workforceRequired) || 1,
        assigned: isCompletedProject ? (Number(activeProject.workforceRequired) || 1) : (Number(activeProject.workforceAssigned) || 0),
        skills: Array.isArray(activeProject.skills) ? activeProject.skills.join(', ') : (activeProject.techStack || 'Engineering'),
      },
    ];
    return raw.map((r) => ({
      ...r,
      required: Number(r.required) || 1,
      assigned: isCompletedProject ? (Number(r.required) || 1) : (Number(r.assigned) || 0),
    }));
  }, [activeProject, isCompletedProject]);

  const totalRequired = requirementsList.reduce((sum, r) => sum + (Number(r.required) || 0), 0) || Number(activeProject.workforceRequired) || 1;
  const totalAssigned = isCompletedProject
    ? totalRequired
    : (requirementsList.reduce((sum, r) => sum + (Number(r.assigned) || 0), 0) || activeProject.workforceAssigned || 0);
  const totalRemaining = Math.max(0, totalRequired - totalAssigned);

  const handleAddMilestoneSubmit = async (e) => {
    e.preventDefault();
    if (!newMilestoneData.title.trim()) {
      toast.error('Please enter a milestone title');
      return;
    }
    try {
      setIsSubmittingMilestone(true);
      if (addMilestone) {
        await addMilestone(activeProject.id, {
          title: newMilestoneData.title.trim(),
          dueDate: newMilestoneData.dueDate || activeProject.expectedEndDate || new Date().toISOString().split('T')[0],
          weightage: Number(newMilestoneData.weightage) || 20,
          description: newMilestoneData.description || '',
          status: 'PENDING',
        });
      }
      toast.success(`Milestone "${newMilestoneData.title}" added successfully!`);
      setNewMilestoneData({ title: '', dueDate: '', weightage: 20, description: '' });
      setIsAddMilestoneModalOpen(false);
    } catch (err) {
      console.error('Failed to add milestone from manager:', err);
      toast.error('Failed to add milestone: ' + (err.message || 'Error'));
    } finally {
      setIsSubmittingMilestone(false);
    }
  };

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
          {!isCompletedProject ? (
            <button
              type="button"
              onClick={() => navigate(`/manager/matching/${activeProject.id}`)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#004ac6] to-[#2563eb] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:from-[#003da6] hover:to-[#1d4ed8] active:scale-95 transition-all"
            >
              <Cpu size={15} />
              <span>Find & Match Workforce</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-extrabold">
              <CheckCircle2 size={15} />
              <span>Project Completed & Delivered</span>
            </span>
          )}
        </div>
      </div>

      {/* Project Hero Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                {activeProject.id}
              </span>
              {isCompletedProject ? (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                  <CheckCircle2 size={12} /> Project Completed
                </span>
              ) : (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Approved by Company
                </span>
              )}
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Project #{typeof activeProject.id === 'number' ? activeProject.id : (String(activeProject.id).replace(/\D/g, '') || activeProject.id)}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {activeProject.priority || 'High'} Priority
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {activeProject.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              {activeProject.description}
            </p>
          </div>
        </div>

        {/* Project Meta Details (Section 5) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-6 text-xs">
          <div>
            <span className="text-slate-400 font-medium">Client Organization</span>
            <p className="font-bold text-slate-900 mt-0.5">{activeProject.client || activeProject.partner || ''}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Category</span>
            <p className="font-bold text-slate-900 mt-0.5">{activeProject.category || 'Full-Stack Engineering'}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Start Date</span>
            <p className="font-bold text-slate-900 mt-0.5">{activeProject.startDate || '2026-08-01'}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Expected End Date</span>
            <p className="font-bold text-slate-900 mt-0.5">{activeProject.expectedEndDate || '2027-01-31'}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Work Type</span>
            <p className="font-bold text-slate-900 mt-0.5">{activeProject.workType || 'Remote'}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Location</span>
            <p className="font-bold text-slate-900 mt-0.5 truncate">{activeProject.location || 'Bengaluru, India'}</p>
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
                <span className="text-[11px] text-slate-500">
                  {isCompletedProject ? 'Project is completed & delivered' : 'Ready to query vetted candidate pool'}
                </span>
                {!isCompletedProject && (
                  <button
                    type="button"
                    onClick={() => navigate(`/manager/matching/${project.id}`)}
                    className="text-xs font-bold text-[#004ac6] hover:underline flex items-center gap-1"
                  >
                    <span>Match Candidates</span>
                    <ArrowRight size={13} />
                  </button>
                )}
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

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAddMilestoneModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              <span>Add Milestone</span>
            </button>
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-blue-50 border border-blue-100">
              <span className="text-xs font-bold text-slate-500">Overall Progress:</span>
              <span className="text-sm font-black text-blue-700">{project.progress || 0}%</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {(() => {
            const pId = project?.id;
            const normId = String(pId || '').toLowerCase().replace(/[\s_]/g, '-').trim();
            const pMsList = (projectMilestones && (projectMilestones[pId] || projectMilestones[normId] || projectMilestones[String(pId)]));
            const msList = (pMsList && pMsList.length > 0)
              ? pMsList
              : (project?.milestones && project.milestones.length > 0)
              ? project.milestones
              : [
                  { id: 'ms-01', title: 'Requirement Analysis', status: 'Pending', dueDate: 'Sprint 1', weight: 10, commits: [] },
                  { id: 'ms-02', title: 'UI/UX & System Design', status: 'Pending', dueDate: 'Sprint 2', weight: 20, commits: [] },
                  { id: 'ms-03', title: 'Backend & Database Development', status: 'Pending', dueDate: 'Sprint 3', weight: 25, commits: [] },
                  { id: 'ms-04', title: 'Frontend & Integration', status: 'Pending', dueDate: 'Sprint 4', weight: 25, commits: [] },
                  { id: 'ms-05', title: 'Testing, Deployment & Final Delivery', status: 'Pending', dueDate: 'Sprint 5', weight: 20, commits: [] },
                ];

            return msList.map((ms) => {
              const isCompleted = Boolean(ms.status === 'Completed' || ms.status === 'COMPLETED' || ms.completed);
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
                      {isCompleted ? 'Completed' : (ms.status || 'Pending')}
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
            });
          })()}
        </div>
      </div>

      {/* Add Project Milestone Modal */}
      {isAddMilestoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/10 text-white">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Add Project Milestone</h3>
                  <p className="text-[11px] text-blue-100">
                    Add milestone deliverable to {project.title || project.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddMilestoneModalOpen(false)}
                className="rounded-xl p-2 text-white/70 hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddMilestoneSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Milestone Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newMilestoneData.title}
                  onChange={(e) => setNewMilestoneData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. End-to-End Testing & Security Compliance"
                  required
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Target Due Date
                  </label>
                  <input
                    type="date"
                    value={newMilestoneData.dueDate}
                    onChange={(e) => setNewMilestoneData((prev) => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Weightage (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newMilestoneData.weightage}
                    onChange={(e) => setNewMilestoneData((prev) => ({ ...prev, weightage: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Description / Deliverables
                </label>
                <textarea
                  rows={3}
                  value={newMilestoneData.description}
                  onChange={(e) => setNewMilestoneData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Technical checklist, scope, QA requirements..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddMilestoneModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMilestone}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={15} />
                  <span>{isSubmittingMilestone ? 'Adding...' : 'Add Milestone'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerProjectDetails;
