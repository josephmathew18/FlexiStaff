import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  User,
  Upload,
  Camera,
  X,
  Plus,
  CheckCircle2,
  ChevronLeft,
  Briefcase,
  Layers,
  Sparkles,
  ShieldCheck,
  Award,
  Globe,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Clock,
  FileCheck,
  UserCheck,
  Check,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  Building2,
  Trash2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { toast } from 'react-toastify';

const DEFAULT_AVATAR = '';

const PRESET_SKILLS = [
  'React.js',
  'TypeScript',
  'Next.js',
  'Node.js',
  'Python',
  'Java',
  'Spring Boot',
  'PostgreSQL',
  'MongoDB',
  'Docker',
  'Kubernetes',
  'AWS',
  'GraphQL',
  'TailwindCSS',
  'Figma',
  'Selenium',
  'FastAPI',
  'Redis',
  'CI/CD',
];

export const PartnerAddWorkforce = () => {
  const { addPartnerProfessional, partnerProfile, workforce = [] } = useData() || {};
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    location: '',
    roleCategory: 'Frontend Development',
    title: '',
    experienceLevel: 'Senior (5-8 yrs)',
    experience: '5+ years',
    hourlyRate: '',
    preferredWorkType: 'Remote',
    availability: 'Available',
    weeklyHours: '',
    bio: '',
    github: '',
    linkedin: '',
    portfolio: '',
    certifications: '',
    isBackgroundChecked: true,
    isNdaSigned: true,
    avatar: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const [skills, setSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [customAvatarPreview, setCustomAvatarPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Photo File Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, JPEG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result;
      setCustomAvatarPreview(result);
      setFormData((prev) => ({ ...prev, avatar: result }));
      toast.success('Profile photo uploaded successfully');
    };
    reader.readAsDataURL(file);
  };

  // Add Skill Tag
  const handleAddSkill = (skillToAdd) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;
    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      toast.info(`"${trimmed}" is already added.`);
      return;
    }
    setSkills((prev) => [...prev, trimmed]);
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  // Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter the employee full name.');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter the primary job title.');
      return;
    }

    if (skills.length === 0) {
      toast.error('Please select or add at least one technical skill.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        pseudonym: formData.name.trim(),
        email: formData.email.trim() || `${formData.name.trim().toLowerCase().replace(/\s+/g, '.')}@apexdigital.com`,
        password: formData.password.trim() || 'Workforce@123',
        tempPassword: formData.password.trim() || 'Workforce@123',
        phone: formData.phone.trim() || '+91 98765 43210',
        location: formData.location,
        role: formData.title.trim(),
        title: formData.title.trim(),
        roleCategory: formData.roleCategory,
        experience: formData.experience,
        experienceLevel: formData.experienceLevel,
        hourlyRate: `$${formData.hourlyRate.replace('$', '')}/hr`,
        preferredWorkType: formData.preferredWorkType,
        availability: formData.availability,
        skills: skills,
        bio: formData.bio.trim() || `Enterprise ${formData.title} with proven proficiency in ${skills.slice(0, 3).join(', ')}.`,
        avatar: formData.avatar || '',
        certifications: formData.certifications ? [formData.certifications] : [],
        github: formData.github.trim(),
        linkedin: formData.linkedin.trim(),
        portfolio: formData.portfolio.trim(),
        partner: partnerProfile?.name || 'Partner Organization',
        partnerCompany: partnerProfile?.name || 'Partner Organization',
      };

      const partnerEmployees = (workforce || []).filter(
        (w) => w.roleType === 'Professional' || w.source === 'Partner Company' || w.professionalType === 'PARTNER_EMPLOYEE'
      );
      if (partnerEmployees.length >= 5) {
        toast.error('Maximum limit of 5 Partner Employee workforce members reached (5/5 allowed). Registration is blocked.');
        setIsSubmitting(false);
        return;
      }

      if (typeof addPartnerProfessional === 'function') {
        addPartnerProfessional(payload);
      }

      toast.success(`Professional "${payload.name}" successfully registered and added to talent pool!`);
      navigate('/partner/workforce');
    } catch (err) {
      toast.error('Failed to register employee. Please check required fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
            <Link to="/partner/workforce" className="hover:text-[#004ac6] dark:hover:text-blue-400 flex items-center gap-1">
              <ChevronLeft size={14} />
              <span>Workforce Portal</span>
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white">Employee Registration</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Register Professional Talent
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enroll certified full-time or specialist engineering talent from{' '}
            <strong className="text-slate-800 dark:text-slate-200">{partnerProfile?.name || 'Partner Organization'}</strong> into the FlexiStaff verified talent matching pool.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => navigate('/partner/workforce')}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#1c1a36] text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            <CheckCircle2 size={16} />
            <span>{isSubmitting ? 'Registering...' : 'Register Employee'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form Left (7 Cols), Live Preview Right (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Container */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          {/* ========================================================================= */}
          {/* SECTION 1: PHOTO UPLOAD */}
          {/* ========================================================================= */}
          <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14132b] p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-white/10 pb-3.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-[#004ac6] dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Profile Photo & Headshot</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Upload a professional employee headshot or team portrait (PNG, JPG, WebP)</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Current Selected Photo Display */}
              <div className="relative group shrink-0">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt="Employee Preview"
                    className="w-28 h-28 rounded-3xl object-cover ring-4 ring-blue-50 dark:ring-blue-900/30 shadow-md border border-slate-200 dark:border-white/15"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-3xl bg-slate-100 dark:bg-[#1c1a36] border border-slate-200 dark:border-white/15 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 ring-4 ring-slate-50 dark:ring-white/5">
                    <User size={36} />
                    <span className="text-[10px] font-bold mt-1 text-slate-400 dark:text-slate-500">No Photo</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-900/60 rounded-3xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity cursor-pointer"
                >
                  <Camera size={20} className="mb-1" />
                  <span>Upload Photo</span>
                </button>
              </div>

              {/* Upload Action */}
              <div className="flex-1 space-y-3 w-full">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/15 hover:border-blue-400 dark:hover:border-blue-400 bg-slate-50/60 dark:bg-[#1c1a36]/50 transition-colors text-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={22} className="mx-auto text-blue-600 dark:text-blue-400 mb-1.5" />
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Click to browse or drag & drop photo
                  </p>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    High resolution JPG, PNG, WebP
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-[#004ac6] dark:text-blue-400 text-xs font-bold transition-colors"
                  >
                    <Upload size={14} />
                    <span>Upload New Photo</span>
                  </button>

                  {formData.avatar && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomAvatarPreview(null);
                        setFormData((prev) => ({ ...prev, avatar: '' }));
                        toast.info('Custom photo removed');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-xs font-semibold"
                    >
                      <Trash2 size={13} />
                      <span>Remove Photo</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 2: PERSONAL & CONTACT INFORMATION */}
          {/* ========================================================================= */}
          <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14132b] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-white/10 pb-3.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-[#004ac6] dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Personal & Contact Details</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Official employee identity and communication channels</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                  className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#004ac6]"
                />
              </div>

              {/* Workforce Login Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Employee Login Password
                </label>
                <div className="relative">
                  <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password for workforce login"
                    className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] py-2 pl-9 pr-9 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#004ac6]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Work Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="jessica.sterling@apexdigital.com"
                    className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] py-2 pl-9 pr-3 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#004ac6]"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Direct Phone / Mobile
                </label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] py-2 pl-9 pr-3 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#004ac6]"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Location & Timezone
                </label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="Bengaluru, India (IST / UTC+5:30)"
                    className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] py-2 pl-9 pr-3 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#004ac6]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 3: ROLE, SENIORITY & HOURLY RATE */}
          {/* ========================================================================= */}
          <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14132b] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-white/10 pb-3.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-[#004ac6] dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Role & Professional Classification</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Domain specialization, job title, and billing parameters</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Role Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Role Specialization Category
                </label>
                <select
                  value={formData.roleCategory}
                  onChange={(e) => setFormData((prev) => ({ ...prev, roleCategory: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] px-3 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-[#004ac6]"
                >
                  <option value="Frontend Development">Frontend Development</option>
                  <option value="Backend Architecture">Backend Architecture</option>
                  <option value="Full-Stack Engineering">Full-Stack Engineering</option>
                  <option value="Mobile Development">Mobile App Development</option>
                  <option value="DevOps & Cloud">DevOps & Cloud Infrastructure</option>
                  <option value="QA & Testing Automation">QA & Testing Automation</option>
                  <option value="UI/UX Product Design">UI/UX Product Design</option>
                  <option value="Data Engineering & AI">Data Engineering & AI</option>
                </select>
              </div>

              {/* Exact Job Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Job Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter primary job title"
                  className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#004ac6]"
                />
              </div>

              {/* Seniority Level */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Seniority Level
                </label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData((prev) => ({ ...prev, experienceLevel: e.target.value, experience: e.target.value.split(' ')[0] }))}
                  className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] px-3 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-[#004ac6]"
                >
                  <option value="Junior (1-2 yrs)">Junior (1-2 yrs)</option>
                  <option value="Mid-Level (3-5 yrs)">Mid-Level (3-5 yrs)</option>
                  <option value="Senior (5-8 yrs)">Senior (5-8 yrs)</option>
                  <option value="Staff / Lead (8-10 yrs)">Staff / Lead (8-10 yrs)</option>
                  <option value="Principal Architect (10+ yrs)">Principal Architect (10+ yrs)</option>
                </select>
              </div>

              {/* Hourly Rate */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Partner Hourly Billing Rate ($/hr)
                </label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min="20"
                    max="500"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, hourlyRate: e.target.value }))}
                    placeholder="95"
                    className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] py-2 pl-9 pr-3 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#004ac6]"
                  />
                </div>
              </div>

              {/* Availability Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Initial Pool Availability
                </label>
                <select
                  value={formData.availability}
                  onChange={(e) => setFormData((prev) => ({ ...prev, availability: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] px-3 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-[#004ac6]"
                >
                  <option value="Available">Available (Immediate Placement)</option>
                  <option value="Partially Available">Partially Available (20h/wk)</option>
                  <option value="Assigned">Currently Assigned</option>
                  <option value="Unavailable">Unavailable / On Hold</option>
                </select>
              </div>

              {/* Preferred Work Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Work Model
                </label>
                <select
                  value={formData.preferredWorkType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, preferredWorkType: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] px-3 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-[#004ac6]"
                >
                  <option value="Remote">100% Remote</option>
                  <option value="Hybrid">Hybrid (2-3 days on-site)</option>
                  <option value="On-site">On-site Dedicated</option>
                </select>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 4: TECHNICAL SKILLS & COMPETENCIES */}
          {/* ========================================================================= */}
          <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14132b] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-white/10 pb-3.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-[#004ac6] dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Technical Skills & Tech Stack</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Skills utilized by managers during automated AI workforce matching</p>
              </div>
            </div>

            {/* Current Selected Skills Chips */}
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Selected Skills ({skills.length}):
              </span>
              <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-[#1c1a36] border border-slate-200 dark:border-white/10 min-h-[50px] items-center">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800/40 text-[#004ac6] dark:text-blue-300 text-xs font-bold shadow-2xs"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:bg-blue-200 dark:hover:bg-blue-800/60 rounded-full p-0.5 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {skills.length === 0 && (
                  <span className="text-xs text-slate-400 dark:text-slate-500 italic">No skills added yet. Choose from below or type custom skill.</span>
                )}
              </div>
            </div>

            {/* Custom Skill Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(newSkillInput);
                  }
                }}
                placeholder="Type a skill and press Enter..."
                className="flex-1 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#004ac6]"
              />
              <button
                type="button"
                onClick={() => handleAddSkill(newSkillInput)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-xs font-bold transition-colors"
              >
                Add Skill
              </button>
            </div>

            {/* Preset Suggested Skills */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block mb-1.5">
                Popular industry skills (click to toggle):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_SKILLS.map((sk) => {
                  const isSelected = skills.includes(sk);
                  return (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => (isSelected ? handleRemoveSkill(sk) : handleAddSkill(sk))}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                        isSelected
                          ? 'bg-[#004ac6] text-white border-[#004ac6]'
                          : 'bg-white dark:bg-[#1c1a36] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10'
                      }`}
                    >
                      {isSelected ? `✓ ${sk}` : `+ ${sk}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>



          {/* ========================================================================= */}
          {/* SECTION 5: ENTERPRISE COMPLIANCE & VERIFICATION */}
          {/* ========================================================================= */}
          <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14132b] p-6 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-white/10 pb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                <ShieldCheck size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Partner Compliance & Verification</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Corporate affiliate vetting for enterprise client security</p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-[#1c1a36] border border-slate-200 dark:border-white/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isBackgroundChecked}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isBackgroundChecked: e.target.checked }))}
                  className="mt-0.5 rounded text-[#004ac6] focus:ring-0"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 dark:text-white block">Verified Partner Background Check</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Employee identity, criminal record, and employment credentials have been verified by {partnerProfile?.name || 'Partner Organization'}
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-[#1c1a36] border border-slate-200 dark:border-white/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isNdaSigned}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isNdaSigned: e.target.checked }))}
                  className="mt-0.5 rounded text-[#004ac6] focus:ring-0"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 dark:text-white block">Enterprise NDA & Security Protocol Signed</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Professional is bound by strict enterprise IP protection, client confidentiality, and data safety agreements.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Form Action Buttons Bottom */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/partner/workforce')}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#1c1a36] text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#004ac6] hover:bg-[#003da6] text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
            >
              <UserCheck size={16} />
              <span>{isSubmitting ? 'Registering...' : 'Complete Registration'}</span>
            </button>
          </div>
        </form>

        {/* ========================================================================= */}
        {/* RIGHT SIDE: STICKY LIVE TALENT CARD PREVIEW */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-5">
          <div className="sticky top-20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Live Roster Card Preview
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 text-[10px] font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Preview
              </span>
            </div>

            {/* Candidate Card Component Preview */}
            <div className="rounded-3xl border-2 border-blue-200 dark:border-blue-500/40 bg-white dark:bg-[#14132b] p-6 shadow-xl space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/60 dark:bg-blue-900/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

              {/* Card Header */}
              <div className="flex items-start gap-4">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt={formData.name || 'Preview'}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-100 dark:ring-blue-900/40 shadow-sm border border-slate-200 dark:border-white/10 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-[#1c1a36] border border-slate-200 dark:border-white/15 flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0">
                    <User size={28} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white truncate">
                      {formData.name || 'Candidate Name'}
                    </h4>
                    <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400 shrink-0" title="Verified Partner Talent" />
                  </div>
                  <p className="text-xs font-bold text-[#004ac6] dark:text-blue-400 truncate mt-0.5">
                    {formData.title || 'Job Title'}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    <Building2 size={12} className="text-slate-400" />
                    <span className="truncate font-semibold text-slate-700 dark:text-slate-300">
                      {partnerProfile?.name || 'Partner Organization'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metadata Badges */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1c1a36] border border-slate-100 dark:border-white/10 text-xs">
                  <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Availability</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 block">{formData.availability}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1c1a36] border border-slate-100 dark:border-white/10 text-xs">
                  <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Rate & Model</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                    ${formData.hourlyRate || '95'}/hr • {formData.preferredWorkType}
                  </span>
                </div>
              </div>

              {/* Skills Preview */}
              <div>
                <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">
                  Technical Competencies ({skills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {skills.slice(0, 6).map((sk) => (
                    <span
                      key={sk}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 text-[11px] font-bold border border-slate-200 dark:border-white/10"
                    >
                      {sk}
                    </span>
                  ))}
                  {skills.length > 6 && (
                    <span className="px-2 py-1 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-[#004ac6] dark:text-blue-300 text-[11px] font-bold border border-blue-100 dark:border-blue-800/40">
                      +{skills.length - 6} more
                    </span>
                  )}
                </div>
              </div>

              {/* Bio snippet */}
              <div className="p-3 rounded-2xl bg-blue-50/40 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 text-[11px] text-slate-600 dark:text-slate-300 line-clamp-3">
                {formData.bio || 'Comprehensive engineering specialist profile registered under partner roster.'}
              </div>

              {/* Bottom Verification Seal */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-white/10 pt-3">
                <span className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 size={12} />
                  <span>Background & NDA Signed</span>
                </span>
                <span className="font-mono font-bold text-slate-500 dark:text-slate-400">ID: EMP-APEX-NEW</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerAddWorkforce;
