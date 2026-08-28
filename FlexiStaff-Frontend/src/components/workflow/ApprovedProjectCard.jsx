import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Building2,
  Calendar,
  Users,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Briefcase,
} from 'lucide-react';
import { motion } from 'framer-motion';
import StatusBadge from './StatusBadge';

export const ApprovedProjectCard = ({ project, onRequestWorkforce, className = '' }) => {
  const navigate = useNavigate();

  if (!project) return null;

  const skillsList = Array.isArray(project.requiredSkills)
    ? project.requiredSkills
    : String(project.techStack || project.skills || '')
        .split(/[,+]/)
        .map((s) => s.trim())
        .filter(Boolean);

  const handleRequestClick = () => {
    if (onRequestWorkforce) {
      onRequestWorkforce(project);
    } else {
      navigate(`/manager/matching/${project.id}`);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${className}`}
    >
      <div className="space-y-3.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#004ac6] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                {project.id}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold">
                Admin Approved
              </span>
            </div>
            <h3
              onClick={() => navigate(`/manager/projects/${project.id}`)}
              className="text-base font-extrabold text-slate-900 mt-1.5 hover:text-[#004ac6] cursor-pointer transition-colors"
            >
              {project.name || project.title}
            </h3>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
              <Building2 size={13} className="text-slate-400" />
              <span>Client: <strong className="text-slate-800">{project.client || 'Enterprise Client'}</strong></span>
            </p>
          </div>
          <StatusBadge status={project.status} />
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {project.description}
        </p>

        {/* Requirements & Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-2xl bg-blue-50/60 border border-blue-100">
            <span className="block text-[10px] font-bold text-blue-500 uppercase">Workforce Limit</span>
            <span className="block font-black text-slate-900 text-sm mt-0.5">
              {project.workforceAssigned || 0} / {Math.min(3, project.workforceRequired || 3)}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Duration</span>
            <span className="block font-bold text-slate-800 truncate mt-0.5">
              {project.duration || '6 Months'}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Start Date</span>
            <span className="block font-semibold text-slate-700 truncate mt-0.5">
              {project.startDate || '2026-09-01'}
            </span>
          </div>
        </div>

        {/* Required Technical Skills */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Required Technical Stack
          </span>
          <div className="flex flex-wrap gap-1.5">
            {skillsList.slice(0, 4).map((sk, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[10px]"
              >
                {sk}
              </span>
            ))}
            {skillsList.length > 4 && (
              <span className="px-1.5 py-0.5 rounded-lg bg-blue-50 text-blue-600 font-bold text-[10px]">
                +{skillsList.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => navigate(`/manager/projects/${project.id}`)}
          className="text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          View Details
        </button>

        <button
          type="button"
          onClick={handleRequestClick}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:brightness-110 active:scale-95 transition-all"
        >
          <Users size={14} />
          <span>Request Workforce</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </motion.div>
  );
};

export default ApprovedProjectCard;
