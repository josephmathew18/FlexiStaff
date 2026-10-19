import React from 'react';
import { Users, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * WorkforceCounter Component
 * Dynamically enforces the project-specific workforce capacity.
 * Displays staged count vs available slots, total project requirements, and already assigned members.
 */
export const WorkforceCounter = ({
  count = 0,
  max = 1,
  totalRequired = 1,
  alreadyAssigned = 0,
  professionalsCount = 0,
  freelancersCount = 0,
  className = '',
}) => {
  const isFullyStaffed = alreadyAssigned >= totalRequired;
  const effectiveMax = Math.max(0, max);
  const isMaxReached = !isFullyStaffed && count >= effectiveMax;

  return (
    <div className={`space-y-2 ${className}`}>
      <div
        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
          isFullyStaffed
            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 shadow-xs'
            : isMaxReached
            ? 'bg-amber-50/80 border-amber-300 text-amber-900 shadow-xs'
            : count > 0
            ? 'bg-blue-50/80 border-blue-200 text-blue-900 shadow-xs'
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
              isFullyStaffed
                ? 'bg-emerald-600 text-white'
                : isMaxReached
                ? 'bg-amber-500 text-white'
                : count > 0
                ? 'bg-[#004ac6] text-white'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {isFullyStaffed ? <CheckCircle2 size={16} /> : <Users size={16} />}
          </div>
          <div>
            <span className="text-xs font-extrabold tracking-tight">
              {isFullyStaffed
                ? `Workforce Complete: ${alreadyAssigned} / ${totalRequired} Assigned`
                : `Workforce Squad Staged: ${count} / ${effectiveMax} Available Slot${effectiveMax !== 1 ? 's' : ''} (Requires ${totalRequired})`}
            </span>
            <p className="text-[11px] text-slate-500 font-medium">
              {isFullyStaffed
                ? 'All required workforce positions for this project have already been filled.'
                : `${professionalsCount} Partner + ${freelancersCount} Freelancer staged • ${alreadyAssigned}/${totalRequired} assigned`}
            </p>
          </div>
        </div>

        {/* Visual Dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: Math.min(10, Math.max(1, isFullyStaffed ? totalRequired : effectiveMax)) }).map((_, idx) => (
            <div
              key={idx}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                isFullyStaffed
                  ? 'bg-emerald-500 ring-2 ring-emerald-200'
                  : idx < count
                  ? isMaxReached
                    ? 'bg-amber-500 ring-2 ring-amber-200'
                    : 'bg-[#004ac6] ring-2 ring-blue-200'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {!isFullyStaffed && isMaxReached && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-900 text-xs font-bold"
          >
            <AlertTriangle size={15} className="text-amber-600 shrink-0" />
            <span>Available project slots filled ({count}/{effectiveMax} staged for total required workforce of {totalRequired}).</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkforceCounter;
