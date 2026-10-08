import React, { useState, useEffect } from 'react';
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
  Code2,
  Plus,
  Trash2,
  Users,
  Award,
} from 'lucide-react';
import { toast } from 'react-toastify';
import SkillInputWithSuggestions from '../common/SkillInputWithSuggestions';

const PRESET_SKILLS = [
  'React.js',
  'Node.js',
  'Java Spring Boot',
  'Python',
  'PostgreSQL',
  'AWS Cloud',
  'Docker & Kubernetes',
  'UI/UX Figma',
  'Flutter',
  'Machine Learning',
  'TypeScript',
  'GraphQL',
  'DevOps',
  'Cybersecurity',
  'Go (Golang)',
  'Swift iOS',
  'Android Kotlin',
];

const schema = yup.object().shape({
  name: yup.string().required('Project Name is required').min(3, 'Minimum 3 characters'),
  description: yup.string().required('Project Description is required').min(10, 'Minimum 10 characters'),
  category: yup.string().required('Project Category is required'),
  priority: yup.string().required('Priority level is required'),
  startDate: yup.string().required('Start Date is required'),
  endDate: yup
    .string()
    .required('Target End Date is required')
    .test('is-after-start', 'Target End Date must be after Start Date', function (value) {
      const { startDate } = this.parent;
      if (!startDate || !value) return true;
      const start = new Date(startDate);
      const end = new Date(value);
      return end.getTime() > start.getTime();
    }),
  minExperience: yup.string().required('Minimum experience requirement is required'),
  additionalRequirements: yup.string().optional(),
});

const calculateInternalDuration = (startStr, endStr) => {
  if (!startStr || !endStr) return '6 Months';
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return '6 Months';

  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
  if (diffDays <= 0) return '1 Month';

  const months = Math.round(diffDays / 30.4375);
  if (months < 1) return `${diffDays} Days`;
  if (months === 1) return '1 Month';
  if (months < 12) return `${months} Months`;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  if (remMonths === 0) return years === 1 ? '1 Year' : `${years} Years`;
  return `${years} Yr ${remMonths} Mo`;
};

export const ProjectRequestForm = ({ onSubmitSuccess, initialValues = {} }) => {
  const [selectedSkills, setSelectedSkills] = useState(
    initialValues.requiredSkills
      ? (Array.isArray(initialValues.requiredSkills)
          ? initialValues.requiredSkills
          : String(initialValues.requiredSkills).split(',').map((s) => s.trim()).filter(Boolean))
      : []
  );
  const [customSkillInput, setCustomSkillInput] = useState('');

  // Skill-based Role Requirements list
  const [roleRequirements, setRoleRequirements] = useState(
    initialValues.requirements || []
  );

  const [newRoleTitle, setNewRoleTitle] = useState('');
  const [newRoleSkills, setNewRoleSkills] = useState('');
  const [newRoleCount, setNewRoleCount] = useState(1);
  const [newRoleExp, setNewRoleExp] = useState('3+ Years');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: initialValues.name || '',
      description: initialValues.description || '',
      category: initialValues.category || 'Enterprise Software Engineering',
      priority: initialValues.priority || 'High',
      startDate: initialValues.startDate || '',
      endDate: initialValues.endDate || '',
      minExperience: initialValues.minExperience || '3-5 Years',
      additionalRequirements: initialValues.additionalRequirements || '',
    },
  });

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills((prev) => prev.filter((s) => s !== skill));
    } else {
      setSelectedSkills((prev) => [...prev, skill]);
    }
  };

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    const trimmed = customSkillInput.trim();
    if (!trimmed) return;
    const splitSkills = trimmed.split(',').map((s) => s.trim()).filter(Boolean);
    const newUnique = splitSkills.filter((s) => !selectedSkills.includes(s));
    if (newUnique.length > 0) {
      setSelectedSkills((prev) => [...prev, ...newUnique]);
      setCustomSkillInput('');
    }
  };

  const handleAddRoleRequirement = (e) => {
    e.preventDefault();
    if (!newRoleTitle.trim()) {
      toast.error('Enter a role title for the skill requirement');
      return;
    }
    const newRole = {
      role: newRoleTitle.trim(),
      skills: newRoleSkills.trim() || selectedSkills.slice(0, 3).join(', ') || 'Software Engineering',
      required: Number(newRoleCount) || 1,
      assigned: 0,
      minExp: newRoleExp,
    };
    setRoleRequirements((prev) => [...prev, newRole]);
    setNewRoleTitle('');
    setNewRoleSkills('');
    setNewRoleCount(1);
  };

  const handleRemoveRoleRequirement = (index) => {
    setRoleRequirements((prev) => prev.filter((_, idx) => idx !== index));
  };

  const [headcountRequired, setHeadcountRequired] = useState(
    initialValues.workforceRequired || 1
  );

  const onFormSubmit = (data) => {
    if (selectedSkills.length === 0) {
      toast.error('Please select at least one skill technology for the project requirement');
      return;
    }

    const reqs = [
      {
        role: data.category || 'Enterprise Software Engineering',
        required: Number(headcountRequired) || 1,
        assigned: 0,
        skills: selectedSkills.join(', '),
      },
    ];

    const calculatedDuration = calculateInternalDuration(data.startDate, data.endDate);

    const payload = {
      ...data,
      duration: calculatedDuration,
      deadline: data.endDate,
      expectedEndDate: data.endDate,
      requiredSkills: selectedSkills.join(', '),
      skills: selectedSkills.join(', '),
      techStack: selectedSkills.join(', '),
      requirements: reqs,
      workforceRequired: Number(headcountRequired) || 1,
      workforceAssigned: 0,
      status: 'Pending Admin Approval',
      stage: 'Pending Admin Approval',
    };

    if (onSubmitSuccess) {
      onSubmitSuccess(payload);
    }
  };

  const onFormError = (errs) => {
    const errorKeys = Object.keys(errs);
    if (errorKeys.length > 0) {
      const firstError = errs[errorKeys[0]]?.message || 'Please fill in all required fields';
      toast.error(`Form Error: ${firstError}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit, onFormError)} className="space-y-6 text-xs text-slate-700">
      {/* 1. Project Basic Overview */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#004ac6] flex items-center justify-center font-bold text-sm">
            1
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Project Scope & Classification</h3>
            <p className="text-[11px] text-slate-500">Provide basic project details and classification</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Project Name *</label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. NextGen Mobile Banking & Cloud Portal"
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
              rows={3}
              {...register('description')}
              placeholder="Describe business objectives, scope, system architecture, and expected deliverables..."
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

      {/* 2. Skill Technology Requirements (MAIN USER FEATURE) */}
      <div className="rounded-3xl border border-blue-200 bg-blue-50/20 p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 border-b border-blue-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20">
            <Code2 size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Skill & Technology Requirements</h3>
            <p className="text-[11px] text-slate-500">
              Select or specify the required technology stack and talent skill roles needed for this project
            </p>
          </div>
        </div>

        {/* Skill Selector with Autocomplete Suggestions */}
        <SkillInputWithSuggestions
          selectedSkills={selectedSkills}
          onChange={(newSkills) => setSelectedSkills(newSkills)}
          label="Select Required Skill Technologies *"
          placeholder="Type or select skill (e.g. react.js, postgresql...)"
          theme="blue"
        />

        {/* Total Professionals / Headcount Required */}
        <div className="pt-3 border-t border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Users size={15} className="text-[#004ac6]" />
              <span>Total Professionals Needed *</span>
            </label>
            <p className="text-[11px] text-slate-500">
              Specify the total number of engineering professionals required for this project
            </p>
          </div>
          <select
            value={headcountRequired}
            onChange={(e) => setHeadcountRequired(Number(e.target.value))}
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#004ac6] cursor-pointer shadow-2xs"
          >
            <option value={1}>1 Professional</option>
            <option value={2}>2 Professionals</option>
            <option value={3}>3 Professionals</option>
            <option value={4}>4 Professionals</option>
            <option value={5}>5 Professionals</option>
          </select>
        </div>
      </div>

      {/* 3. Schedule & Experience Requirements */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#004ac6] flex items-center justify-center font-bold text-sm">
            3
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Schedule & Experience Requirements</h3>
            <p className="text-[11px] text-slate-500">Select expected project start date, target end date, and seniority requirements</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Min Experience *</label>
            <select
              {...register('minExperience')}
              className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
            >
              <option value="1-2 Years (Junior)">1-2 Years (Junior)</option>
              <option value="3-5 Years (Mid-Level)">3-5 Years (Mid-Level)</option>
              <option value="5-8 Years (Senior)">5-8 Years (Senior)</option>
              <option value="8+ Years (Lead / Architect)">8+ Years (Lead / Architect)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Start Date *</label>
            <input
              type="date"
              {...register('startDate')}
              className={`w-full rounded-xl border p-2 text-xs text-slate-900 outline-none transition-all ${
                errors.startDate ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 focus:border-[#004ac6]'
              }`}
            />
            {errors.startDate && <p className="text-rose-600 text-[10px] mt-1">{errors.startDate.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target End Date *</label>
            <input
              type="date"
              {...register('endDate')}
              className={`w-full rounded-xl border p-2 text-xs text-slate-900 outline-none transition-all ${
                errors.endDate ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 focus:border-[#004ac6]'
              }`}
            />
            {errors.endDate && <p className="text-rose-600 text-[10px] mt-1">{errors.endDate.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Additional Compliance & Security Requirements (Optional)</label>
          <textarea
            rows={2}
            {...register('additionalRequirements')}
            placeholder="Special compliance needs (SOC 2, ISO 27001), timezone constraints (EST/PST/IST), or NDA requirements..."
            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
          />
        </div>
      </div>

      {/* Submission Notice & Action */}
      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <AlertCircle size={16} className="text-blue-600 shrink-0" />
          <span>
            Submitted skill requirements will be reviewed by Company Admin and matched by Organization Manager to deploy suitable talent.
          </span>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 shrink-0"
        >
          <CheckCircle2 size={16} />
          <span>{isSubmitting ? 'Submitting...' : 'Submit Skill Project Requirement'}</span>
        </button>
      </div>
    </form>
  );
};

export default ProjectRequestForm;
