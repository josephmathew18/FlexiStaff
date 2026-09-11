import React, { useState, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  ShieldCheck,
  KeyRound,
  Bell,
  Save,
  Camera,
  Eye,
  EyeOff,
  Upload,
  Briefcase,
  Clock,
  FolderKanban,
  X,
  Plus,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { toast } from 'react-toastify';
import UserAvatar from '../../components/common/UserAvatar';

const formatCapitalizedName = (str) => {
  if (!str) return '';
  return String(str)
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const WorkforceProfile = () => {
  const { workforceUserProfile, updateWorkforceUserProfile } = useData() || {};

  const isCompanyEmployee =
    Boolean(workforceUserProfile?.partnerCompany) ||
    Boolean(workforceUserProfile?.partnerName) ||
    Boolean(workforceUserProfile?.partner) ||
    (Boolean(workforceUserProfile?.companyName) && workforceUserProfile?.companyName !== 'Enterprise Client') ||
    workforceUserProfile?.roleType === 'Professional' ||
    workforceUserProfile?.professionalType === 'PARTNER_EMPLOYEE' ||
    workforceUserProfile?.userType === 'PARTNER_EMPLOYEE' ||
    workforceUserProfile?.employmentType?.includes('Partner') ||
    workforceUserProfile?.employmentType?.includes('Company');

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security'
  const [formData, setFormData] = useState({
    name: formatCapitalizedName(workforceUserProfile?.name || 'Technical Specialist'),
    email: workforceUserProfile?.email || '',
    phone: workforceUserProfile?.phone || '+91 98765 00000',
    title: workforceUserProfile?.title || workforceUserProfile?.role || 'Senior Full-Stack Engineer',
    role: workforceUserProfile?.role || 'Senior Full-Stack Engineer',
    location: workforceUserProfile?.location || 'Bengaluru, India',
    experience: workforceUserProfile?.experience || '5+ Years',
    availability: workforceUserProfile?.availability || 'Available',
    preferredWorkType: workforceUserProfile?.preferredWorkType || 'Remote',
    portfolioUrl: workforceUserProfile?.portfolioUrl || '',
    bio:
      workforceUserProfile?.bio ||
      'Specialized engineering professional experienced in building enterprise cloud architectures and scalable web platforms.',
    avatar: workforceUserProfile?.avatar || '',
    skills: workforceUserProfile?.skills || ['React', 'Node.js', 'TypeScript', 'Tailwind CSS', 'Docker'],
  });

  React.useEffect(() => {
    if (workforceUserProfile) {
      setFormData({
        name: formatCapitalizedName(workforceUserProfile.name || 'Technical Specialist'),
        email: workforceUserProfile.email || '',
        phone: workforceUserProfile.phone || '+91 98765 00000',
        title: workforceUserProfile.title || workforceUserProfile.role || 'Senior Full-Stack Engineer',
        role: workforceUserProfile.role || 'Senior Full-Stack Engineer',
        location: workforceUserProfile.location || 'Bengaluru, India',
        experience: workforceUserProfile.experience || '5+ Years',
        availability: workforceUserProfile.availability || 'Available',
        preferredWorkType: workforceUserProfile.preferredWorkType || 'Remote',
        portfolioUrl: workforceUserProfile.portfolioUrl || '',
        bio: workforceUserProfile.bio || 'Specialized engineering professional experienced in building enterprise cloud architectures and scalable web platforms.',
        avatar: workforceUserProfile.avatar || '',
        skills: workforceUserProfile.skills || ['React', 'Node.js', 'TypeScript', 'Tailwind CSS', 'Docker'],
      });
    }
  }, [workforceUserProfile]);

  const [newSkillInput, setNewSkillInput] = useState('');

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({ ...prev, avatar: event.target.result }));
      toast.success('Profile photo uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    if (formData.skills.includes(trimmed)) {
      toast.info('Skill already added to your profile.');
      return;
    }
    setFormData((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      if (updateWorkforceUserProfile) {
        updateWorkforceUserProfile({
          ...formData,
        });
      }
      setIsSaving(false);
      toast.success(
        isCompanyEmployee
          ? 'Partner Professional profile updated successfully!'
          : 'Freelancer profile updated successfully!'
      );
    }, 400);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword) {
      toast.error('Please enter your current password.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully!');
    }, 400);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
              <User size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {isCompanyEmployee ? 'Partner Professional Profile' : 'Independent Freelancer Profile'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isCompanyEmployee
                  ? `Technical professional represented by ${workforceUserProfile?.partnerCompany || 'Partner Organization'}.`
                  : 'Manage your direct technical profile, verified skills, and project matching settings.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 ${
              isCompanyEmployee
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isCompanyEmployee ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
            <span>
              {isCompanyEmployee
                ? `Partner Employee • ${workforceUserProfile?.partnerCompany || 'Partner Organization'}`
                : 'Independent Freelancer'}
            </span>
          </span>
        </div>
      </div>

      {/* Profile Overview Header Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14132b] p-6 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <div
          className="relative group cursor-pointer shrink-0"
          onClick={() => fileInputRef.current?.click()}
        >
          <UserAvatar
            src={formData.avatar}
            name={formData.name}
            size="xl"
            className="w-24 h-24 rounded-3xl ring-4 ring-purple-50 dark:ring-white/10 shadow-md"
          />
          <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white p-1.5 rounded-xl shadow-xs">
            <Camera size={14} />
          </div>
        </div>

        <div className="text-center sm:text-left flex-1 space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white capitalize">{formatCapitalizedName(formData.name)}</h2>
          </div>
          <p className="text-xs text-purple-700 dark:text-purple-400 font-extrabold">{formData.title}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <MapPin size={12} className="text-slate-400 dark:text-slate-500" />
              {formData.location}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Mail size={12} className="text-slate-400 dark:text-slate-500" />
              {formData.email}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-slate-400 dark:text-slate-500" />
              {formData.experience}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'profile'
              ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
          }`}
        >
          <Briefcase size={14} />
          <span>Professional Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'security'
              ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
          }`}
        >
          <KeyRound size={14} />
          <span>Change Password</span>
        </button>
      </div>

      {/* Tab 1: Profile Details */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Partner Company Association Box */}
          {isCompanyEmployee && (
            <div className="rounded-3xl border border-indigo-200 dark:border-indigo-800/40 bg-indigo-50/50 dark:bg-indigo-950/30 p-6 shadow-xs space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
                  <Building2 size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-extrabold text-indigo-950 dark:text-indigo-200">
                    Partner Company Affiliation & Governance
                  </h3>
                  <p className="text-xs text-indigo-900/80 dark:text-indigo-300/80 mt-0.5">
                    You are registered under <strong>{workforceUserProfile?.partnerCompany || 'Partner Organization'}</strong>. Your corporate employment terms, bench allocation, and billing rates are managed directly by your partner company.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="bg-white/80 dark:bg-[#1c1a36] p-3 rounded-xl border border-indigo-100 dark:border-white/10">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Affiliated Company</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{workforceUserProfile?.partnerCompany || 'Partner Organization'}</p>
                </div>
                <div className="bg-white/80 dark:bg-[#1c1a36] p-3 rounded-xl border border-indigo-100 dark:border-white/10">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Employment Model</span>
                  <p className="font-extrabold text-indigo-700 dark:text-indigo-400">Partner Bench / Full-Time</p>
                </div>
                <div className="bg-white/80 dark:bg-[#1c1a36] p-3 rounded-xl border border-indigo-100 dark:border-white/10">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Verification Status</span>
                  <p className="font-extrabold text-emerald-700 dark:text-emerald-400">Company Verified</p>
                </div>
              </div>
            </div>
          )}

          {/* Current Assignment Card */}
          {workforceUserProfile?.currentAssignment && (
            <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14132b] p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <FolderKanban size={18} className="text-purple-600 dark:text-purple-400" />
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Current Project Assignment</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 text-[10px] font-bold">
                  {workforceUserProfile.currentAssignment.status || 'Active'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-[#1c1a36] p-3 rounded-xl border border-slate-100 dark:border-white/10">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Project Title</span>
                  <p className="font-extrabold text-slate-900 dark:text-white truncate">
                    {workforceUserProfile.currentAssignment.projectName}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-[#1c1a36] p-3 rounded-xl border border-slate-100 dark:border-white/10">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Assigned Role</span>
                  <p className="font-extrabold text-purple-700 dark:text-purple-400 truncate">
                    {workforceUserProfile.currentAssignment.role}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-[#1c1a36] p-3 rounded-xl border border-slate-100 dark:border-white/10">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Sprint Period</span>
                  <p className="font-bold text-slate-900 dark:text-white truncate">
                    {workforceUserProfile.currentAssignment.startDate} to {workforceUserProfile.currentAssignment.expectedEndDate}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-[#1c1a36] p-3 rounded-xl border border-slate-100 dark:border-white/10">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Sprint Completion</span>
                  <p className="font-black text-emerald-700 dark:text-emerald-400">
                    {workforceUserProfile.currentAssignment.progress || 75}% Completed
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Edit Form */}
          <form onSubmit={handleProfileSubmit} className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14132b] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 dark:border-white/10 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Personal & Technical Information</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Update your contact details, specialty title, skills inventory, and live availability.
              </p>
            </div>

            {/* Profile Photo Selector with Upload */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Member Profile Photo</label>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">JPG, PNG, WEBP</span>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative group shrink-0">
                  <UserAvatar
                    src={formData.avatar}
                    name={formData.name}
                    size="lg"
                    className="w-20 h-20 rounded-2xl ring-2 ring-slate-200 dark:ring-white/15 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-slate-900/60 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-bold gap-1"
                  >
                    <Camera size={18} />
                    <span>Upload</span>
                  </button>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 w-full rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/15 hover:border-purple-600 dark:hover:border-purple-400 bg-slate-50/50 dark:bg-[#1c1a36]/50 hover:bg-purple-50/20 dark:hover:bg-purple-950/20 p-3.5 text-center cursor-pointer transition-all"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleMediaUpload}
                  />
                  <div className="flex flex-col items-center justify-center gap-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                      <Upload size={15} />
                      <span>Upload Photo from Media / Device</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Click to browse or drag and drop image file (PNG, JPG, WEBP)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Location (City, State) *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Professional Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value, role: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Years of Experience *</label>
                <select
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-purple-600"
                >
                  <option value="1-2 Years">1-2 Years (Junior Specialist)</option>
                  <option value="3+ Years">3-5 Years (Mid-Senior Engineer)</option>
                  <option value="5+ Years">5-8 Years (Senior Specialist)</option>
                  <option value="8+ Years">8+ Years (Principal / Lead)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Live Availability Status *</label>
                <select
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-purple-600 font-bold"
                >
                  <option value="Available">Available for Matching</option>
                  <option value="Assigned">Assigned on Active Project</option>
                  <option value="Unavailable">Temporarily Unavailable</option>
                </select>
              </div>

              {!isCompanyEmployee && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Preferred Work Type *</label>
                  <select
                    value={formData.preferredWorkType}
                    onChange={(e) => setFormData({ ...formData, preferredWorkType: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-purple-600"
                  >
                    <option value="Remote">100% Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-Site">On-Site</option>
                    <option value="Contract">Contract / Project-Based</option>
                    <option value="Full-Time">Full-Time Direct</option>
                  </select>
                </div>
              )}

              {!isCompanyEmployee && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Portfolio / LinkedIn URL</label>
                  <input
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/... or https://github.com/..."
                    className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-purple-600"
                  />
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Professional Bio</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Summarize your key achievements, architecture experience, and technical focus..."
                  className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-purple-600"
                />
              </div>
            </div>

            {/* Skills Chip Manager */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/10">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Verified Technical Skills</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/40 text-xs font-bold text-purple-800 dark:text-purple-300 shadow-xs"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-purple-400 hover:text-purple-700 dark:hover:text-purple-200"
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  placeholder="Add skill"
                  className="flex-1 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-purple-600"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 font-extrabold text-xs hover:bg-purple-200 dark:hover:bg-purple-900/80 transition-colors flex items-center gap-1"
                >
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-white/10">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-purple-500/20 active:scale-95 transition-all"
              >
                <Save size={15} />
                <span>{isSaving ? 'Saving Changes...' : 'Save Profile Details'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Change Password */}
      {activeTab === 'security' && (
        <form onSubmit={handlePasswordSubmit} className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14132b] p-6 sm:p-8 shadow-xs space-y-6 max-w-2xl">
          <div className="border-b border-slate-100 dark:border-white/10 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Change Password</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Secure your workforce talent access credentials.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Current Password *</label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] p-3 pr-10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 outline-none focus:border-purple-600"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">New Password *</label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Min. 6 characters"
                  className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] p-3 pr-10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 outline-none focus:border-purple-600"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password *</label>
              <div className="relative">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password"
                  className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] p-3 pr-10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 outline-none focus:border-purple-600"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-white/10">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-500/20 active:scale-95 transition-all"
            >
              <KeyRound size={15} />
              <span>{isSaving ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default WorkforceProfile;
