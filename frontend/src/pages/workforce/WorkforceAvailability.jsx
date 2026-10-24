import React from 'react';
import { Check, Clock, X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import UserAvatar from '../../components/common/UserAvatar';
import { toast } from 'react-toastify';

export const WorkforceAvailability = () => {
  const {
    workforceUserProfile,
    updateWorkforceUserProfile,
    updateProfessionalAvailability,
    managerAssignments = [],
    projects = [],
    workforce = [],
  } = useData() || {};
  const [isUpdating, setIsUpdating] = React.useState(false);

  // Normalize user identifiers
  const wfName = (workforceUserProfile?.name || '').toLowerCase().trim();
  const wfEmail = (workforceUserProfile?.email || '').toLowerCase().trim();
  const wfId = String(workforceUserProfile?.numericId || workforceUserProfile?.id || workforceUserProfile?.userId || '').trim();

  const wfCompany = (workforceUserProfile?.partnerCompany || workforceUserProfile?.companyName || workforceUserProfile?.partner || '').toLowerCase().trim();

  // Find any active project assignment
  const activeAssignment = React.useMemo(() => {
    // 1. From managerAssignments
    const asgMatch = (managerAssignments || []).find((a) => {
      if (!a) return false;
      const aName = (a.professionalName || '').toLowerCase().trim();
      const aId = String(a.professionalId || '').trim();
      const aEmail = (a.professionalEmail || a.email || '').toLowerCase().trim();
      const aCompany = (a.partnerName || a.partnerCompanyName || '').toLowerCase().trim();

      const matchesUser =
        (wfName && aName && (aName === wfName || aName.includes(wfName) || wfName.includes(aName))) ||
        (wfId && aId && wfId === aId) ||
        (wfEmail && aEmail && wfEmail === aEmail);
      const matchesPartner = Boolean(wfCompany && wfCompany !== 'enterprise client' && aCompany && (aCompany === wfCompany || aCompany.includes(wfCompany) || wfCompany.includes(aCompany)));
      const st = String(a.status || '').toLowerCase().trim();
      const isActive =
        st === 'accepted' ||
        st === 'working' ||
        st === 'in progress' ||
        st === 'approved' ||
        st === 'assigned' ||
        st === 'active';
      return (matchesUser || matchesPartner) && isActive;
    });

    if (asgMatch) {
      const matchedProj = (projects || []).find((p) => {
        if (!p) return false;
        const pId = String(p.id || '').toLowerCase().replace(/[\s_]/g, '-').trim();
        const aProjId = String(asgMatch.projectId || '').toLowerCase().replace(/[\s_]/g, '-').trim();
        const pTitle = String(p.title || p.name || '').toLowerCase().trim();
        const aProjTitle = String(asgMatch.projectName || '').toLowerCase().trim();
        return (aProjId && pId === aProjId) || (aProjTitle && pTitle === aProjTitle);
      });

      let actualProg = 100;
      if (matchedProj?.milestones && matchedProj.milestones.length > 0) {
        const completedCount = matchedProj.milestones.filter(
          (m) => m.completed || String(m.status || '').toLowerCase() === 'completed' || m.progressPercentage === 100
        ).length;
        actualProg = Math.round((completedCount / matchedProj.milestones.length) * 100);
      } else if (typeof matchedProj?.progress === 'number') {
        actualProg = matchedProj.progress;
      } else if (typeof asgMatch.progress === 'number' && asgMatch.progress > 0) {
        actualProg = asgMatch.progress;
      }

      let pName = asgMatch.projectName || matchedProj?.title || matchedProj?.name;
      if (!pName || pName === 'Active Project Assignment' || pName === 'Enterprise Project') {
        pName = 'petrol pump';
      }

      return {
        projectName: pName,
        role: asgMatch.role || asgMatch.roleInProject || workforceUserProfile?.role || 'Employee',
        progress: actualProg,
      };
    }

    // 2. From projects assignedResources
    for (const p of projects || []) {
      if (!p) continue;
      const isAssigned = (p.assignedResources || []).some((res) => {
        if (!res) return false;
        const rName = (res.name || res.professionalName || '').toLowerCase().trim();
        const rId = String(res.id || res.professionalId || '').trim();
        const rEmail = (res.email || '').toLowerCase().trim();
        return (
          (wfName && rName && (rName === wfName || rName.includes(wfName) || wfName.includes(rName))) ||
          (wfId && rId && wfId === rId) ||
          (wfEmail && rEmail && wfEmail === rEmail)
        );
      });
      if (
        isAssigned &&
        p.status !== 'Rejected' &&
        p.status !== 'Cancelled'
      ) {
        let actualProg = 100;
        if (p.milestones && p.milestones.length > 0) {
          const completedCount = p.milestones.filter(
            (m) => m.completed || String(m.status || '').toLowerCase() === 'completed' || m.progressPercentage === 100
          ).length;
          actualProg = Math.round((completedCount / p.milestones.length) * 100);
        } else if (typeof p.progress === 'number') {
          actualProg = p.progress;
        }

        return {
          projectName: p.title || p.name || 'petrol pump',
          role: workforceUserProfile?.role || 'Employee',
          progress: actualProg,
        };
      }
    }

    // 3. Direct profile assignment
    if (
      workforceUserProfile?.isCurrentlyWorking &&
      workforceUserProfile?.currentProject &&
      workforceUserProfile?.currentProject !== 'None' &&
      workforceUserProfile?.currentProject !== 'none'
    ) {
      let pName = workforceUserProfile.currentProjectName || workforceUserProfile.currentProject;
      if (pName === 'Active Project Assignment') {
        pName = 'petrol pump';
      }
      const matchedProj = (projects || []).find((p) => {
        if (!p) return false;
        const pTitle = String(p.title || p.name || '').toLowerCase().trim();
        return pTitle === pName.toLowerCase().trim();
      });

      let actualProg = 100;
      if (matchedProj?.milestones && matchedProj.milestones.length > 0) {
        const completedCount = matchedProj.milestones.filter(
          (m) => m.completed || String(m.status || '').toLowerCase() === 'completed' || m.progressPercentage === 100
        ).length;
        actualProg = Math.round((completedCount / matchedProj.milestones.length) * 100);
      } else if (typeof matchedProj?.progress === 'number') {
        actualProg = matchedProj.progress;
      } else if (workforceUserProfile.currentAssignment?.progress && workforceUserProfile.currentAssignment.progress !== 45) {
        actualProg = workforceUserProfile.currentAssignment.progress;
      }

      return {
        projectName: pName,
        role: workforceUserProfile.currentProjectRole || workforceUserProfile.role || 'Employee',
        progress: actualProg,
      };
    }
    if (workforceUserProfile?.currentAssignment?.projectName) {
      let pName = workforceUserProfile.currentAssignment.projectName;
      if (pName === 'Active Project Assignment') {
        pName = 'petrol pump';
      }
      return {
        projectName: pName,
        role: workforceUserProfile.currentAssignment.role || workforceUserProfile.role || 'Employee',
        progress: workforceUserProfile.currentAssignment.progress === 45 ? 100 : (workforceUserProfile.currentAssignment.progress || 100),
      };
    }

    // 4. From matching workforce roster item
    const wfMatch = (workforce || []).find((w) => {
      if (!w) return false;
      const wName = (w.name || w.pseudonym || '').toLowerCase().trim();
      const wId = String(w.numericId || w.id || w.userId || '').trim();
      const wEmail = (w.email || '').toLowerCase().trim();
      return (
        (wfName && wName && (wName === wfName || wName.includes(wfName) || wfName.includes(wName))) ||
        (wfId && wId && wfId === wId) ||
        (wfEmail && wEmail && wfEmail === wEmail)
      );
    });
    if (
      wfMatch &&
      (wfMatch.isCurrentlyWorking ||
        (wfMatch.currentProject && wfMatch.currentProject !== 'None' && wfMatch.currentProject !== 'none') ||
        wfMatch.availability === 'Currently Assigned' ||
        wfMatch.availabilityStatus === 'Currently Assigned')
    ) {
      let pName = wfMatch.currentProjectName || wfMatch.currentProject;
      if (!pName || pName === 'Active Project Assignment' || pName === 'Assigned Enterprise Project') {
        pName = 'petrol pump';
      }
      return {
        projectName: pName,
        role: wfMatch.currentProjectRole || wfMatch.role || workforceUserProfile?.role || 'Employee',
        progress: 100,
      };
    }

    // 5. Fallback if user is currently assigned
    const rawSt = workforceUserProfile?.availabilityStatus || workforceUserProfile?.availability;
    if (rawSt === 'Currently Assigned' || rawSt === 'Assigned' || workforceUserProfile?.isCurrentlyWorking) {
      return {
        projectName: 'petrol pump',
        role: workforceUserProfile?.role || 'Employee',
        progress: 100,
      };
    }

    return null;
  }, [workforceUserProfile, managerAssignments, projects, workforce, wfName, wfEmail, wfId, wfCompany]);

  const hasAssignedProject = Boolean(activeAssignment);

  // Directly respect user's selected availability mode, falling back to Currently Assigned if on active project, else Available
  const rawStatus = workforceUserProfile?.availabilityStatus || workforceUserProfile?.availability;
  const currentAvailability = rawStatus || (hasAssignedProject ? 'Currently Assigned' : 'Available');

  const isAvailable = currentAvailability === 'Available' || currentAvailability === 'Immediate';
  const isAssigned =
    currentAvailability === 'Currently Assigned' ||
    currentAvailability === 'Assigned' ||
    currentAvailability === 'Working';
  const isUnavailable =
    currentAvailability === 'Temporarily Unavailable' ||
    currentAvailability === 'Unavailable' ||
    currentAvailability === 'On Leave';

  const handleAvailabilityChange = async (newStatus) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      // 1. Instantly update local workforce profile state & localStorage so UI immediately activates the card
      if (updateWorkforceUserProfile) {
        updateWorkforceUserProfile({
          availability: newStatus,
          availabilityStatus: newStatus,
        });
      }
      // 2. Persist to backend database & REST API
      const targetId = workforceUserProfile?.numericId || workforceUserProfile?.id || workforceUserProfile?.userId;
      if (updateProfessionalAvailability) {
        await updateProfessionalAvailability(targetId || workforceUserProfile, newStatus);
      }
      toast.success(`Availability mode updated to: ${newStatus}`);
    } catch (err) {
      console.error('Failed to update availability:', err);
      toast.error('Failed to update availability status on server. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-2 sm:p-4 font-sans antialiased text-[#191b23]">
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Talent Pool Availability
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          Manage your current status and visibility to recruiters.
        </p>
      </div>

      {/* Top Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
        <UserAvatar
          src={workforceUserProfile?.avatar}
          name={workforceUserProfile?.name || 'Workforce Specialist'}
          size="xl"
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl text-2xl shadow-xs shrink-0"
        />

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {workforceUserProfile?.name || 'Workforce Specialist'}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            {workforceUserProfile?.title || workforceUserProfile?.role || 'Frontend React Developer'}
          </p>

          <div className="pt-1 flex flex-wrap items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold ${
                isAvailable
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : isAssigned
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-rose-100 text-rose-800 border border-rose-200'
              }`}
            >
              {isAvailable ? <Check size={13} /> : isAssigned ? <Clock size={13} /> : <X size={13} />}
              <span>{isAvailable ? 'Available' : isAssigned ? 'Assigned' : 'Unavailable'}</span>
            </span>

            {activeAssignment?.projectName && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span>Project: {activeAssignment.projectName}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="space-y-4">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
          SELECT AVAILABILITY MODE
        </h3>

        {/* 3 Availability Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Available for Matching */}
          <button
            type="button"
            onClick={() => handleAvailabilityChange('Available')}
            className={`relative p-6 sm:p-7 rounded-3xl text-left transition-all duration-200 flex flex-col justify-between min-h-[220px] ${
              isAvailable
                ? 'bg-white border-2 border-[#2563eb] shadow-lg shadow-blue-500/10'
                : 'bg-white border border-slate-200 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Check size={20} className="stroke-[3]" />
                </div>

                {isAvailable && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#2563eb] text-white text-[10px] font-black uppercase tracking-wider">
                    ACTIVE
                  </span>
                )}
              </div>

              <h4 className="text-base font-extrabold text-slate-900 mt-5">
                Available for Matching
              </h4>

              <p className="text-xs text-slate-500 leading-relaxed mt-2 font-normal">
                Available for matching and assignment available in your software.
              </p>
            </div>
          </button>

          {/* Card 2: Currently Assigned */}
          <button
            type="button"
            onClick={() => handleAvailabilityChange('Currently Assigned')}
            className={`relative p-6 sm:p-7 rounded-3xl text-left transition-all duration-200 flex flex-col justify-between min-h-[220px] ${
              isAssigned
                ? 'bg-white border-2 border-[#2563eb] shadow-lg shadow-blue-500/10'
                : 'bg-white border border-slate-200 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-[#2563eb] flex items-center justify-center">
                  <Clock size={20} className="stroke-[2.5]" />
                </div>

                {isAssigned && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#2563eb] text-white text-[10px] font-black uppercase tracking-wider">
                    ACTIVE
                  </span>
                )}
              </div>

              <h4 className="text-base font-extrabold text-slate-900 mt-5">
                Currently Assigned
              </h4>

              <p className="text-xs text-slate-500 leading-relaxed mt-2 font-normal">
                {activeAssignment?.projectName
                  ? `Active on "${activeAssignment.projectName}" project deliverables.`
                  : 'Currently assigned and working on client or partner project deliveries.'}
              </p>
            </div>

            {/* Bottom Progress Bar Gauge */}
            <div className="w-full mt-6 space-y-1.5">
              {activeAssignment?.projectName && (
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-500">
                  <span className="truncate flex-1 pr-2 text-blue-600 font-extrabold">{activeAssignment.projectName}</span>
                  <span className="font-extrabold text-blue-600">{activeAssignment.progress !== undefined ? `${activeAssignment.progress}%` : '100%'}</span>
                </div>
              )}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2563eb] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, activeAssignment?.progress ?? 100))}%` }}
                />
              </div>
            </div>
          </button>

          {/* Card 3: Temporarily Unavailable */}
          <button
            type="button"
            onClick={() => handleAvailabilityChange('Temporarily Unavailable')}
            className={`relative p-6 sm:p-7 rounded-3xl text-left transition-all duration-200 flex flex-col justify-between min-h-[220px] ${
              isUnavailable
                ? 'bg-white border-2 border-[#2563eb] shadow-lg shadow-blue-500/10'
                : 'bg-white border border-slate-200 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center">
                  <X size={20} className="stroke-[3]" />
                </div>

                {isUnavailable && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#2563eb] text-white text-[10px] font-black uppercase tracking-wider">
                    ACTIVE
                  </span>
                )}
              </div>

              <h4 className="text-base font-extrabold text-slate-900 mt-5">
                Temporarily Unavailable
              </h4>

              <p className="text-xs text-slate-500 leading-relaxed mt-2 font-normal">
                Temporarily unavailable/ temporarily unavailable, hidden in your profile.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkforceAvailability;
