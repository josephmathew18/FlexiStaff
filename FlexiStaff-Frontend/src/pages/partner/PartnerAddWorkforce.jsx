import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
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
  Building2,
  Trash2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { toast } from 'react-toastify';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';

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
  const { addPartnerProfessional, partnerProfile } = useData() || {};
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    pseudonym: '',
    email: '',
    phone: '',
    location: 'Remote (US/EU)',
    roleCategory: 'Frontend Development',
    title: '',
    experienceLevel: 'Senior (5-8 yrs)',
    experience: '5+ years',
    hourlyRate: '95',
    preferredWorkType: 'Remote',
    availability: 'Available',
    weeklyHours: '40 hrs/week',
    bio: '',
    github: '',
    linkedin: '',
    portfolio: '',
    certifications: 'AWS Certified Solutions Architect',
    isBackgroundChecked: true,
    isNdaSigned: true,
    avatar: DEFAULT_AVATAR,
  });

  const [skills, setSkills] = useState(['React.js', 'TypeScript', 'TailwindCSS', 'Next.js']);
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

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
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
      toast.error('Please enter the primary job title (e.g. Senior Frontend Engineer).');
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
        pseudonym: formData.pseudonym.trim() || formData.name.trim(),
        email: formData.email.trim() || `${formData.name.trim().toLowerCase().replace(/\s+/g, '.')}@apexdigital.com`,
        phone: formData.phone.trim() || '+1 (555) 234-5678',
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
        avatar: formData.avatar || DEFAULT_AVATAR,
        certifications: formData.certifications ? [formData.certifications] : [],
        github: formData.github.trim(),
        linkedin: formData.linkedin.trim(),
        portfolio: formData.portfolio.trim(),
        partner: partnerProfile?.name || 'Apex Digital Enterprises Inc.',
        partnerCompany: partnerProfile?.name || 'Apex Digital Enterprises Inc.',
      };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1.5">
            <Link to="/partner/workforce" className="hover:text-[#004ac6] flex items-center gap-1">
              <ChevronLeft size={14} />
              <span>Workforce Portal</span>
            </Link>
            <span>/</span>
            <span className="text-slate-900">Employee Registration</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Register Professional Talent
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enroll certified full-time or specialist engineering talent from{' '}
            <strong className="text-slate-800">{partnerProfile?.name || 'Apex Digital Enterprises'}</strong> into the FlexiStaff verified talent matching pool.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => navigate('/partner/workforce')}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
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
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#004ac6] flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Profile Photo & Headshot</h3>
                <p className="text-[11px] text-slate-500">Upload a professional employee headshot or team portrait (PNG, JPG, WebP)</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Current Selected Photo Display */}
              <div className="relative group shrink-0">
                <img
                  src={formData.avatar}
                  alt="Employee Preview"
                  className="w-28 h-28 rounded-3xl object-cover ring-4 ring-blue-50 shadow-md border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-900/60 rounded-3xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity cursor-pointer"
                >
                  <Camera size={20} className="mb-1" />
                  <span>Change Photo</span>
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

                <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/60 transition-colors text-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={22} className="mx-auto text-blue-600 mb-1.5" />
                  <p className="text-xs font-bold text-slate-800">
                    Click to browse or drag & drop photo
                  </p>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    High resolution JPG, PNG, WebP up to 5MB
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#004ac6] text-xs font-bold transition-colors"
                  >
                    <Upload size={14} />
                    <span>Upload New Photo</span>
                  </button>

                  {customAvatarPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomAvatarPreview(null);
                        setFormData((prev) => ({ ...prev, avatar: DEFAULT_AVATAR }));
                        toast.info('Custom photo removed, restored default');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors text-xs font-semibold"
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
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#004ac6] flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Personal & Contact Details</h3>
                <p className="text-[11px] text-slate-500">Official employee identity and communication channels</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      name: val,
                      pseudonym: prev.pseudonym ? prev.pseudonym : val,
                    }));
                  }}
                  placeholder="e.g. Jessica Sterling"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6]"
                />
              </div>

              {/* Display / Pseudonym */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Display Code / Masked Name
                </label>
                <input
                  type="text"
                  value={formData.pseudonym}
                  onChange={(e) => setFormData((prev) => ({ ...prev, pseudonym: e.target.value }))}
                  placeholder="e.g. Jessica S. (Sr. Fullstack)"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6]"
                />
              </div>

              {/* Work Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="jessica.sterling@apexdigital.com"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-900 outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6]"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Direct Phone / Mobile
                </label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (415) 555-0192"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-900 outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6]"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Location & Timezone
                </label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="San Francisco, CA (PST / UTC-8)"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-900 outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 3: ROLE, SENIORITY & HOURLY RATE */}
          {/* ========================================================================= */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#004ac6] flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Role & Professional Classification</h3>
                <p className="text-[11px] text-slate-500">Domain specialization, job title, and billing parameters</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Role Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Role Specialization Category
                </label>
                <select
                  value={formData.roleCategory}
                  onChange={(e) => setFormData((prev) => ({ ...prev, roleCategory: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#004ac6]"
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Job Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Lead Full-Stack Architect"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6]"
                />
              </div>

              {/* Seniority Level */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Seniority Level
                </label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData((prev) => ({ ...prev, experienceLevel: e.target.value, experience: e.target.value.split(' ')[0] }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#004ac6]"
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
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
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-900 outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6]"
                  />
                </div>
              </div>

              {/* Availability Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Initial Pool Availability
                </label>
                <select
                  value={formData.availability}
                  onChange={(e) => setFormData((prev) => ({ ...prev, availability: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#004ac6]"
                >
                  <option value="Available">Available (Immediate Placement)</option>
                  <option value="Partially Available">Partially Available (20h/wk)</option>
                  <option value="Assigned">Currently Assigned</option>
                  <option value="Unavailable">Unavailable / On Hold</option>
                </select>
              </div>

              {/* Preferred Work Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preferred Work Model
                </label>
                <select
                  value={formData.preferredWorkType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, preferredWorkType: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#004ac6]"
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
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#004ac6] flex items-center justify-center font-bold text-sm">
                4
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Technical Skills & Tech Stack</h3>
                <p className="text-[11px] text-slate-500">Skills utilized by managers during automated AI workforce matching</p>
              </div>
            </div>

            {/* Current Selected Skills Chips */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2">
                Selected Skills ({skills.length}):
              </span>
              <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 min-h-[50px] items-center">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-[#004ac6] text-xs font-bold shadow-2xs"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {skills.length === 0 && (
                  <span className="text-xs text-slate-400 italic">No skills added yet. Choose from below or type custom skill.</span>
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
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#004ac6]"
              />
              <button
                type="button"
                onClick={() => handleAddSkill(newSkillInput)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
              >
                Add Skill
              </button>
            </div>

            {/* Preset Suggested Skills */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
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
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
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
          {/* SECTION 5: CERTIFICATIONS & BIO */}
          {/* ========================================================================= */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#004ac6] flex items-center justify-center font-bold text-sm">
                5
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Bio, Certifications & Links</h3>
                <p className="text-[11px] text-slate-500">Summary, credentials, and verification links</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Certifications & Accreditations
                </label>
                <div className="relative">
                  <Award size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.certifications}
                    onChange={(e) => setFormData((prev) => ({ ...prev, certifications: e.target.value }))}
                    placeholder="e.g. AWS Solutions Architect, GCP Professional, CKA"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-900 outline-none focus:border-[#004ac6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    GitHub Profile URL
                  </label>
                  <input
                    type="url"
                    value={formData.github}
                    onChange={(e) => setFormData((prev) => ({ ...prev, github: e.target.value }))}
                    placeholder="https://github.com/username"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#004ac6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    LinkedIn / Portfolio URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData((prev) => ({ ...prev, linkedin: e.target.value }))}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#004ac6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Professional Bio / Executive Summary
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Dedicated engineering specialist with deep expertise in scalable architecture and high-performance microservices..."
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-medium text-slate-900 outline-none focus:border-[#004ac6]"
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 6: ENTERPRISE COMPLIANCE & VERIFICATION */}
          {/* ========================================================================= */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                <ShieldCheck size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Partner Compliance & Verification</h3>
                <p className="text-[11px] text-slate-500">Corporate affiliate vetting for enterprise client security</p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isBackgroundChecked}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isBackgroundChecked: e.target.checked }))}
                  className="mt-0.5 rounded text-[#004ac6] focus:ring-0"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">Verified Partner Background Check</span>
                  <span className="text-slate-500 text-[11px]">
                    Employee identity, criminal record, and employment credentials have been verified by {partnerProfile?.name || 'Apex Digital Enterprises Inc.'}
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isNdaSigned}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isNdaSigned: e.target.checked }))}
                  className="mt-0.5 rounded text-[#004ac6] focus:ring-0"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">Enterprise NDA & Security Protocol Signed</span>
                  <span className="text-slate-500 text-[11px]">
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
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
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
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Live Roster Card Preview
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Preview
              </span>
            </div>

            {/* Candidate Card Component Preview */}
            <div className="rounded-3xl border-2 border-blue-200 bg-white p-6 shadow-xl space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/60 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

              {/* Card Header */}
              <div className="flex items-start gap-4">
                <img
                  src={formData.avatar}
                  alt={formData.name || 'Preview'}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-100 shadow-sm border border-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-base text-slate-900 truncate">
                      {formData.name || 'Candidate Name'}
                    </h4>
                    <ShieldCheck size={16} className="text-blue-600 shrink-0" title="Verified Partner Talent" />
                  </div>
                  <p className="text-xs font-bold text-[#004ac6] truncate mt-0.5">
                    {formData.title || 'Job Title (e.g. Lead Engineer)'}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                    <Building2 size={12} className="text-slate-400" />
                    <span className="truncate font-semibold text-slate-700">
                      {partnerProfile?.name || 'Apex Digital Enterprises'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metadata Badges */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Availability</span>
                  <span className="font-bold text-emerald-700 mt-0.5 block">{formData.availability}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Rate & Model</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">
                    ${formData.hourlyRate || '95'}/hr • {formData.preferredWorkType}
                  </span>
                </div>
              </div>

              {/* Skills Preview */}
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                  Technical Competencies ({skills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {skills.slice(0, 6).map((sk) => (
                    <span
                      key={sk}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200"
                    >
                      {sk}
                    </span>
                  ))}
                  {skills.length > 6 && (
                    <span className="px-2 py-1 rounded-xl bg-blue-50 text-[#004ac6] text-[11px] font-bold border border-blue-100">
                      +{skills.length - 6} more
                    </span>
                  )}
                </div>
              </div>

              {/* Bio snippet */}
              <div className="p-3 rounded-2xl bg-blue-50/40 border border-blue-100 text-[11px] text-slate-600 line-clamp-3">
                {formData.bio || 'Comprehensive engineering specialist profile registered under Apex Digital Enterprises partner roster.'}
              </div>

              {/* Bottom Verification Seal */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-3">
                <span className="flex items-center gap-1 font-bold text-emerald-700">
                  <CheckCircle2 size={12} />
                  <span>Background & NDA Signed</span>
                </span>
                <span className="font-mono font-bold text-slate-500">ID: EMP-APEX-NEW</span>
              </div>
            </div>

            {/* Helpful Notice Card */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/70 text-xs text-slate-600 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#004ac6]">
                <Sparkles size={16} />
                <span>Instant Talent Pool Integration</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Registered professionals immediately appear in the <strong>Partner Workforce Roster</strong>, the <strong>Manager Skill Matching Engine</strong>, and the <strong>Company Talent Pool</strong> ready for project assignment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerAddWorkforce;
