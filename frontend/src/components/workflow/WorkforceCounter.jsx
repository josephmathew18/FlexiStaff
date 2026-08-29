import React from 'react';
import { Users, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * WorkforceCounter Component
 * Enforces the strict maximum 3 workforce members per project limit.
 * Displays: "Workforce Selected: X / 3"
 * When 3 are selected, shows: "Maximum 3 workforce members can be assigned to a project."
 */
export const WorkforceCounter = ({
  count = 0,
  max = 3,
  professionalsCount = 0,
  freelancersCount = 0,
  className = '',
}) => {
  const isMaxReached = count >= max;

  return (
    <div className={`space-y-2 ${className}`}>
      <div
        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
          isMaxReached
            ? 'bg-amber-50/80 border-amber-300 text-amber-900 shadow-xs'
            : count > 0
            ? 'bg-blue-50/80 border-blue-200 text-blue-900 shadow-xs'
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
              isMaxReached
                ? 'bg-amber-500 text-white'
                : count > 0
                ? 'bg-[#004ac6] text-white'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            <Users size={16} />
          </div>
          <div>
            <span className="text-xs font-extrabold tracking-tight">
              Workforce Selected: {count} / {max}
            </span>
            <p className="text-[11px] text-slate-500 font-medium">
              {professionalsCount} Professional{professionalsCount === 1 ? '' : 's'} +{' '}
              {freelancersCount} Freelancer{freelancersCount === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {/* Visual Dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: max }).map((_, idx) => (
            <div
              key={idx}
              className={`w-3 h-3 rounded-full transition-all ${
                idx < count
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
        {isMaxReached && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-900 text-xs font-bold"
          >
            <AlertTriangle size={15} className="text-amber-600 shrink-0" />
            <span>Maximum 3 workforce members can be assigned to a project.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkforceCounter;
