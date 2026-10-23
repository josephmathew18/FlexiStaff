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

  // Find any active project assignment
  const activeAssignment = React.useMemo(() => {
    // 1. Direct profile assignment
    if (
      workforceUserProfile?.isCurrentlyWorking &&
      workforceUserProfile?.currentProject &&
      workforceUserProfile?.currentProject !== 'None' &&
      workforceUserProfile?.currentProject !== 'none'
    ) {
      return {
        projectName: workforceUserProfile.currentProjectName || workforceUserProfile.currentProject,
        role: workforceUserProfile.currentProjectRole || workforceUserProfile.role || 'Specialist',
        progress: workforceUserProfile.currentAssignment?.progress || 45,
      };
    }
    if (workforceUserProfile?.currentAssignment?.projectName) {
      return {
        projectName: workforceUserProfile.currentAssignment.projectName,
        role: workforceUserProfile.currentAssignment.role || 'Specialist',
        progress: workforceUserProfile.currentAssignment.progress || 45,
      };
    }

    // 2. From managerAssignments
    const asgMatch = (managerAssignments || []).find((a) => {
      if (!a) return false;
      const aName = (a.professionalName || '').toLowerCase().trim();
      const aId = String(a.professionalId || '').trim();
      const matches =
        (wfName && aName && (aName === wfName || aName.includes(wfName) || wfName.includes(aName))) ||
        (wfId && aId && wfId === aId);
      const st = String(a.status || '').toLowerCase().trim();
      const isActive =
        st === 'accepted' ||
        st === 'working' ||
        st === 'in progress' ||
        st === 'approved' ||
        st === 'assigned';
      return matches && isActive;
    });
    if (asgMatch) {
      return {
        projectName: asgMatch.projectName || asgMatch.title || 'Enterprise Project',
        role: asgMatch.role || asgMatch.roleInProject || 'Specialist',
        progress: asgMatch.progress || 40,
      };
    }

    // 3. From projects assignedResources
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
        p.status !== 'Completed' &&
        p.stage !== 'Completed' &&
        p.status !== 'Rejected' &&
        p.status !== 'Cancelled'
      ) {
        return {
          projectName: p.title || p.name || 'Enterprise Project',
          role: p.requiredSkills?.[0] ? `${p.requiredSkills[0]} Developer` : 'Specialist Software Engineer',
          progress: p.progress || 50,
        };
      }
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
      return {
        projectName: wfMatch.currentProjectName || wfMatch.currentProject || 'Assigned Enterprise Project',
        role: wfMatch.currentProjectRole || wfMatch.role || 'Specialist',
        progress: 45,
      };
    }

    return null;
  }, [workforceUserProfile, managerAssignments, projects, workforce, wfName, wfEmail, wfId]);

  const hasAssignedProject = Boolean(activeAssignment);

  const rawStatus = workforceUserProfile?.availabilityStatus || workforceUserProfile?.availability || 'Available';

  // If user is assigned to an active project, their status is Currently Assigned unless they explicitly chose Temporarily Unavailable
  const currentAvailability =
    hasAssignedProject && rawStatus !== 'Temporarily Unavailable'
      ? 'Currently Assigned'
      : rawStatus;

  const isAvailable = currentAvailability === 'Available' || currentAvailability === 'Immediate';
  const isAssigned =
    currentAvailability === 'Currently Assigned' ||
    currentAvailability === 'Assigned' ||
    currentAvailability === 'Working';
  const isUnavailable =
    currentAvailability === 'Temporarily Unavailable' ||
    currentAvailability === 'Unavailable' ||
    currentAvailability === 'On Leave';

  // Auto-sync status on mount if project is assigned but state still held Available
  React.useEffect(() => {
    if (hasAssignedProject && rawStatus !== 'Currently Assigned' && rawStatus !== 'Temporarily Unavailable') {
      const targetId = workforceUserProfile?.numericId || workforceUserProfile?.id || workforceUserProfile?.userId;
      if (updateProfessionalAvailability && targetId) {
        updateProfessionalAvailability(targetId, 'Currently Assigned').catch(() => {});
      } else if (updateWorkforceUserProfile) {
        updateWorkforceUserProfile({
          availability: 'Currently Assigned',
          availabilityStatus: 'Currently Assigned',
          isCurrentlyWorking: true,
          currentProject: activeAssignment?.projectName,
        });
      }
    }
  }, [hasAssignedProject, rawStatus, activeAssignment]);

  const handleAvailabilityChange = async (newStatus) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const targetId = workforceUserProfile?.numericId || workforceUserProfile?.id || workforceUserProfile?.userId;
      if (updateProfessionalAvailability) {
        await updateProfessionalAvailability(targetId || workforceUserProfile, newStatus);
      } else if (updateWorkforceUserProfile) {
        await updateWorkforceUserProfile({ availability: newStatus, availabilityStatus: newStatus });
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

            {isAssigned && activeAssignment?.projectName && (
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
                  <span className="truncate max-w-[140px] text-blue-600">{activeAssignment.projectName}</span>
                  <span>{activeAssignment.progress || 50}%</span>
                </div>
              )}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2563eb] rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(15, activeAssignment?.progress || 60)}%` }}
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
