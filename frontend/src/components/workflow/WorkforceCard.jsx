import React from 'react';
import {
  Users,
  Building2,
  User,
  Star,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  Sparkles,
  Eye,
  Plus,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import StatusBadge from './StatusBadge';

export const WorkforceCard = ({
  candidate,
  isSelected = false,
  onToggleSelect,
  onViewProfile,
  disableSelection = false,
  className = '',
}) => {
  if (!candidate) return null;

  const isProfessional =
    candidate.roleType === 'Professional' ||
    candidate.source === 'Partner Company' ||
    Boolean(candidate.partnerCompany || candidate.partner);

  const partnerName = candidate.partnerCompany || candidate.partner || candidate.partnerName;

  const skillsList = Array.isArray(candidate.skills)
    ? candidate.skills
    : String(candidate.skills || '')
        .split(/[,+]/)
        .map((s) => s.trim())
        .filter(Boolean);

  const availabilityLower = (candidate.availability || 'available').toLowerCase();
  const isAvailable = availabilityLower === 'available' || availabilityLower === 'immediate';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl border p-5 transition-all flex flex-col justify-between space-y-4 ${
        isSelected
          ? 'bg-blue-50/40 border-[#004ac6] shadow-sm'
          : 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-xs'
      } ${className}`}
    >
      <div className="space-y-3">
        {/* Top: Avatar + Name + Type Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <img
              src={
                candidate.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
              }
              alt={candidate.name || candidate.pseudonym}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 shrink-0"
            />
            <div className="min-w-0">
              <h4 className="font-extrabold text-slate-900 text-sm truncate">
                {candidate.name || candidate.pseudonym}
              </h4>
              <p className="text-xs font-bold text-blue-600 truncate">{candidate.role || candidate.title}</p>
              
              {/* Type Badge */}
              <div className="flex items-center gap-1.5 mt-1">
                {isProfessional ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100 truncate max-w-[200px]">
                    <Building2 size={10} className="shrink-0" />
                    <span>{partnerName || 'Partner Professional'}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-100">
                    <User size={10} className="shrink-0" />
                    <span>Independent Freelancer</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <StatusBadge status={candidate.availability || 'Available'} size="sm" />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Exp</span>
            <span className="block font-bold text-slate-800 mt-0.5">{candidate.experience || '3+ yrs'}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Rate</span>
            <span className="block font-bold text-slate-800 mt-0.5">{candidate.hourlyRate || '$95/hr'}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Workload</span>
            <span
              className={`block font-bold mt-0.5 ${
                (candidate.workload || 0) > 70 ? 'text-amber-600' : 'text-emerald-600'
              }`}
            >
              {candidate.workload || 0}%
            </span>
          </div>
        </div>

        {/* Skills Tags */}
        <div className="flex flex-wrap gap-1">
          {skillsList.slice(0, 3).map((sk, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]"
            >
              {sk}
            </span>
          ))}
          {skillsList.length > 3 && (
            <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 font-bold text-[10px]">
              +{skillsList.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {onViewProfile && (
          <button
            type="button"
            onClick={() => onViewProfile(candidate)}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <Eye size={13} />
            <span>Profile</span>
          </button>
        )}

        {onToggleSelect && (
          <button
            type="button"
            onClick={() => onToggleSelect(candidate)}
            disabled={!isSelected && disableSelection}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
              isSelected
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-blue-50 hover:bg-blue-100 text-[#004ac6]'
            }`}
          >
            {isSelected ? (
              <>
                <Check size={13} />
                <span>Selected</span>
              </>
            ) : (
              <>
                <Plus size={13} />
                <span>Select for Project</span>
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default WorkforceCard;
