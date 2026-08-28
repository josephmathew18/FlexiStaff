import React from 'react';
import { Check, Clock, X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { toast } from 'react-toastify';

export const WorkforceAvailability = () => {
  const { workforceUserProfile, updateWorkforceUserProfile, updateProfessionalAvailability } = useData() || {};

  const handleAvailabilityChange = (newStatus) => {
    updateWorkforceUserProfile({ availability: newStatus });
    if (updateProfessionalAvailability) {
      updateProfessionalAvailability(workforceUserProfile?.id || 'prof-apex-01', newStatus);
    }
    toast.success(`Availability mode updated to: ${newStatus}`);
  };

  const currentAvailability = workforceUserProfile?.availability || 'Assigned';

  const isAvailable = currentAvailability === 'Available' || currentAvailability === 'Immediate';
  const isAssigned = currentAvailability === 'Assigned' || currentAvailability === 'Currently Assigned';
  const isUnavailable = currentAvailability === 'Unavailable' || currentAvailability === 'Temporarily Unavailable';

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
        <img
          src={workforceUserProfile?.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80'}
          alt={workforceUserProfile?.name || 'David Miller'}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shadow-xs shrink-0"
        />

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {workforceUserProfile?.name || 'David Miller'}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            {workforceUserProfile?.role || 'Frontend React Developer'}
          </p>

          <div className="pt-1">
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold ${
                isAvailable
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : isAssigned
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-rose-100 text-rose-800 border border-rose-200'
              }`}
            >
              {isAvailable ? <Check size={13} /> : isAssigned ? <Check size={13} /> : <X size={13} />}
              <span>{isAvailable ? 'Available' : isAssigned ? 'Assigned' : 'Unavailable'}</span>
            </span>
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
            onClick={() => handleAvailabilityChange('Assigned')}
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
                Currently assigned and currently assigned, working in your current role.
              </p>
            </div>

            {/* Bottom Progress Bar Gauge */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-6">
              <div className="h-full bg-[#2563eb] rounded-full w-2/3" />
            </div>
          </button>

          {/* Card 3: Temporarily Unavailable */}
          <button
            type="button"
            onClick={() => handleAvailabilityChange('Unavailable')}
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
