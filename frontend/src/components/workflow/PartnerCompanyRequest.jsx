import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Building2,
  Users,
  Calendar,
  Layers,
  Send,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Plus,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useData } from '../../context/DataContext';

const schema = yup.object().shape({
  partnerName: yup.string().required('Partner Company is required'),
  role: yup.string().required('Required Role is required'),
  required: yup
    .number()
    .typeError('Must be a number')
    .required('Number of professionals is required')
    .min(1, 'At least 1 professional required')
    .max(3, 'Maximum 3 professionals per project'),
  experience: yup.string().required('Experience requirement is required'),
  availability: yup.string().required('Availability requirement is required'),
  duration: yup.string().required('Project duration is required'),
  startDate: yup.string().required('Start date is required'),
  additionalRequirements: yup.string(),
});

export const PartnerCompanyRequest = ({ project, onClose, onRequestSent }) => {
  const { partners = [], sendPartnerWorkforceRequest } = useData() || {};
  const [skills, setSkills] = useState(
    Array.isArray(project?.requiredSkills) && project.requiredSkills.length > 0
      ? project.requiredSkills
      : ['React.js', 'Node.js', 'PostgreSQL']
  );
  const [skillInput, setSkillInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      partnerName: partners[0]?.name || 'Apex Digital Enterprises',
      role: project?.requirements?.[0]?.role || 'Senior Frontend React Developer',
      required: Math.min(3, Math.max(1, (project?.workforceRequired || 3) - (project?.workforceAssigned || 0))),
      experience: '3+ years',
      availability: 'Immediate / Available',
      duration: project?.duration || '6 Months',
      startDate: project?.startDate || '2026-09-01',
      additionalRequirements: '',
    },
  });

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      toast.info(`"${trimmed}" is already added.`);
      return;
    }
    setSkills([...skills, trimmed]);
    setSkillInput('');
  };

  const handleRemoveSkill = (sToRemove) => {
    setSkills(skills.filter((s) => s !== sToRemove));
  };

  const onFormSubmit = (data) => {
    if (skills.length === 0) {
      toast.error('Please specify at least one required skill.');
      return;
    }

    const payload = {
      ...data,
      projectId: project?.id || 'PRJ-101',
      projectName: project?.name || project?.title || 'Enterprise Project',
      skills: skills,
    };

    if (sendPartnerWorkforceRequest) {
      sendPartnerWorkforceRequest(payload);
    }

    toast.success(
      `Workforce Request sent to ${payload.partnerName}! Partner will review and select suitable professionals.`
    );

    if (onRequestSent) onRequestSent(payload);
    if (onClose) onClose();
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 text-xs text-slate-700">
      {/* Partner Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Target Partner Company *</label>
          <select
            {...register('partnerName')}
            className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-medium outline-none focus:border-[#004ac6]"
          >
            {partners.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name} ({p.location || 'Verified Partner'})
              </option>
            ))}
          </select>
          {errors.partnerName && <p className="text-rose-600 text-[10px] mt-1">{errors.partnerName.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Required Role / Designation *</label>
          <input
            type="text"
            {...register('role')}
            placeholder="e.g. Senior Java Backend Engineer"
            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
          />
          {errors.role && <p className="text-rose-600 text-[10px] mt-1">{errors.role.message}</p>}
        </div>
      </div>

      {/* Number & Experience */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Professionals Needed (Max 3) *
          </label>
          <select
            {...register('required')}
            className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-bold outline-none focus:border-[#004ac6]"
          >
            <option value={1}>1 Professional</option>
            <option value={2}>2 Professionals</option>
            <option value={3}>3 Professionals (Max)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Experience Level *</label>
          <select
            {...register('experience')}
            className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
          >
            <option value="2+ years">Junior/Mid (2+ years)</option>
            <option value="3+ years">Mid-Level (3+ years)</option>
            <option value="5+ years">Senior (5+ years)</option>
            <option value="7+ years">Lead / Principal (7+ years)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Availability Req *</label>
          <select
            {...register('availability')}
            className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
          >
            <option value="Immediate / Available">Immediate / Available</option>
            <option value="Within 2 Weeks">Within 2 Weeks</option>
            <option value="Partially Available">Partially Available</option>
          </select>
        </div>
      </div>

      {/* Skills Input */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Required Skills *</label>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSkill();
              }
            }}
            placeholder="Add required skill (e.g. Spring Boot, AWS, Docker)..."
            className="flex-1 rounded-xl border border-slate-300 p-2 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
          />
          <button
            type="button"
            onClick={handleAddSkill}
            className="px-3 py-2 rounded-xl bg-slate-100 text-slate-800 font-bold hover:bg-slate-200 text-xs"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200 min-h-[36px]">
          {skills.map((s, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-[11px] font-bold shadow-2xs"
            >
              <span>{s}</span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(s)}
                className="text-slate-400 hover:text-rose-600"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Project Duration *</label>
          <input
            type="text"
            {...register('duration')}
            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Expected Start Date *</label>
          <input
            type="date"
            {...register('startDate')}
            className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Additional Requirements / SLA</label>
        <textarea
          rows={2}
          {...register('additionalRequirements')}
          placeholder="Special security compliance, timezone overlap, or communication cadence..."
          className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
        />
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
        >
          <Send size={14} />
          <span>Send Request to Partner</span>
        </button>
      </div>
    </form>
  );
};

export default PartnerCompanyRequest;
