import React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  FolderPlus,
  Calendar,
  Layers,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Clock,
  Tag,
  Briefcase,
} from 'lucide-react';
import { toast } from 'react-toastify';

const schema = yup.object().shape({
  name: yup.string().required('Project Name is required').min(3, 'Minimum 3 characters'),
  description: yup.string().required('Project Description is required').min(10, 'Minimum 10 characters'),
  category: yup.string().required('Project Category is required'),
  priority: yup.string().required('Priority level is required'),
  duration: yup.string().required('Project Duration is required'),
  startDate: yup.string().required('Start Date is required'),
  endDate: yup.string().required('End Date is required'),
  additionalRequirements: yup.string(),
});

export const ProjectRequestForm = ({ onSubmitSuccess, initialValues = {} }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: initialValues.name || '',
      description: initialValues.description || '',
      category: initialValues.category || 'Enterprise Software Engineering',
      priority: initialValues.priority || 'High',
      duration: initialValues.duration || '6 Months',
      startDate: initialValues.startDate || '2026-09-01',
      endDate: initialValues.endDate || '2027-02-28',
      additionalRequirements: initialValues.additionalRequirements || '',
    },
  });

  const onFormSubmit = (data) => {
    const payload = {
      ...data,
      workforceRequired: 3,
      workforceAssigned: 0,
      status: 'Pending Admin Approval',
      stage: 'Pending Admin Approval',
    };

    if (onSubmitSuccess) {
      onSubmitSuccess(payload);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 text-xs text-slate-700">
      {/* 1. Project Basic Overview */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#004ac6] flex items-center justify-center font-bold text-sm">
            1
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Project Scope & Classification</h3>
            <p className="text-[11px] text-slate-500">Provide basic project requirements and classification</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Project Name *</label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. AI Smart Credit Scoring Engine"
              className={`w-full rounded-xl border p-2.5 text-xs text-slate-900 outline-none transition-all ${
                errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 focus:border-[#004ac6]'
              }`}
            />
            {errors.name && <p className="text-rose-600 text-[10px] mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
              <select
                {...register('category')}
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
              >
                <option value="Enterprise Software Engineering">Enterprise Software Engineering</option>
                <option value="Financial Engineering & Machine Learning">Financial Engineering & Machine Learning</option>
                <option value="Cloud Architecture & DevOps">Cloud Architecture & DevOps</option>
                <option value="Healthcare & Telemetry IoT">Healthcare & Telemetry IoT</option>
                <option value="Mobile App Development">Mobile App Development</option>
                <option value="Cybersecurity & Zero Trust">Cybersecurity & Zero Trust</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Priority *</label>
              <select
                {...register('priority')}
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Project Description *</label>
            <textarea
              rows={4}
              {...register('description')}
              placeholder="Describe business objectives, scope, architecture, and expected deliverables..."
              className={`w-full rounded-xl border p-2.5 text-xs text-slate-900 outline-none transition-all ${
                errors.description ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 focus:border-[#004ac6]'
              }`}
            />
            {errors.description && (
              <p className="text-rose-600 text-[10px] mt-1">{errors.description.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Schedule & Duration */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#004ac6] flex items-center justify-center font-bold text-sm">
            2
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Duration & Timeline</h3>
            <p className="text-[11px] text-slate-500">Specify expected sprint timeline and execution window</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Project Duration *</label>
            <input
              type="text"
              {...register('duration')}
              placeholder="e.g. 6 Months"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
            />
            {errors.duration && <p className="text-rose-600 text-[10px] mt-1">{errors.duration.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Start Date *</label>
            <input
              type="date"
              {...register('startDate')}
              className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">End Date *</label>
            <input
              type="date"
              {...register('endDate')}
              className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Additional Requirements (Optional)</label>
          <textarea
            rows={2}
            {...register('additionalRequirements')}
            placeholder="Special compliance needs, timezone constraints, or NDA requirements..."
            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
          />
        </div>
      </div>

      {/* Submission Notice & Action */}
      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <AlertCircle size={16} className="text-blue-600 shrink-0" />
          <span>
            Submitted project requirements will be reviewed by Company Admin. Organization Manager will assess and request suitable workforce.
          </span>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
        >
          <CheckCircle2 size={16} />
          <span>{isSubmitting ? 'Submitting...' : 'Submit Project Requirement'}</span>
        </button>
      </div>
    </form>
  );
};

export default ProjectRequestForm;
