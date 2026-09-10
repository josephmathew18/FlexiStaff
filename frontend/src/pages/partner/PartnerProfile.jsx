import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  ShieldCheck,
  KeyRound,
  Bell,
  Save,
  Camera,
  Eye,
  EyeOff,
  User,
  Upload,
  Award,
  Sparkles,
  Briefcase,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { toast } from 'react-toastify';
import UserAvatar from '../../components/common/UserAvatar';

export const PartnerProfile = () => {
  const { partnerProfile, updatePartnerProfile } = useData();

  const [activeTab, setActiveTab] = useState('company'); // 'company' | 'security' | 'notifications'
  const [formData, setFormData] = useState({
    name: partnerProfile?.name || 'Partner Organization',
    email: partnerProfile?.email || '',
    contactPerson: partnerProfile?.contactPerson || '',
    phone: partnerProfile?.phone || '',
    tier: partnerProfile?.tier || 'Tier-1 Strategic Partner',
    location: partnerProfile?.location || partnerProfile?.city || 'Bengaluru, India',
    specialties: Array.isArray(partnerProfile?.specialties)
      ? partnerProfile.specialties.join(', ')
      : partnerProfile?.specialties || partnerProfile?.domain || 'Software Engineering & IT Staffing',
    website: partnerProfile?.website || '',
    description:
      partnerProfile?.description ||
      'Registered IT Vendor & Talent Partner Organization on FlexiStaff.',
    logoUrl: partnerProfile?.logoUrl || partnerProfile?.logo || partnerProfile?.avatar || '',
  });

  // Keep form synchronized when context state updates
  useEffect(() => {
    if (partnerProfile) {
      setFormData({
        name: partnerProfile.name || 'Partner Organization',
        email: partnerProfile.email || '',
        contactPerson: partnerProfile.contactPerson || '',
        phone: partnerProfile.phone || '',
        tier: partnerProfile.tier || 'Tier-1 Strategic Partner',
        location: partnerProfile.location || partnerProfile.city || 'Bengaluru, India',
        specialties: Array.isArray(partnerProfile.specialties)
          ? partnerProfile.specialties.join(', ')
          : partnerProfile.specialties || partnerProfile.domain || 'Software Engineering & IT Staffing',
        website: partnerProfile.website || '',
        description:
          partnerProfile.description ||
          'Registered IT Vendor & Talent Partner Organization on FlexiStaff.',
        logoUrl: partnerProfile.logoUrl || partnerProfile.logo || partnerProfile.avatar || '',
      });
    }
  }, [partnerProfile]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [notifications, setNotifications] = useState(
    partnerProfile?.notifications || {
      allocationRequests: true,
      assignmentApprovals: true,
      sowInvoicing: true,
      emailAlerts: true,
    }
  );

  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, WEBP, SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({ ...prev, logoUrl: event.target.result }));
      toast.success('Company logo/media uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleCompanySubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      const specialtiesArray = typeof formData.specialties === 'string'
        ? formData.specialties.split(',').map((s) => s.trim()).filter(Boolean)
        : formData.specialties;

      updatePartnerProfile({
        ...formData,
        domain: formData.specialties,
        specialties: specialtiesArray,
        avatar: formData.logoUrl,
        notifications,
      });
      setIsSaving(false);
      toast.success('Profile updated successfully!');
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
      toast.success('Partner portal password updated successfully!');
    }, 400);
  };

  const handleNotificationToggle = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    updatePartnerProfile({ notifications: updated });
    toast.info('Notification preferences saved.');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Building2 size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Profile
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Corporate credentials, admin-added partner details, contacts, and security preferences.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span>Verified Staffing Partner</span>
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
            src={formData.logoUrl}
            name={formData.name}
            size="xl"
            className="w-24 h-24 rounded-3xl ring-4 ring-indigo-50 dark:ring-white/10 shadow-md"
          />
          <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1.5 rounded-xl shadow-xs">
            <Camera size={14} />
          </div>
        </div>

        <div className="text-center sm:text-left flex-1 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">{formData.name}</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold self-center sm:self-auto border border-indigo-200 dark:border-indigo-800/40">
              {formData.tier}
            </span>
          </div>
          <p className="text-xs text-indigo-700 dark:text-indigo-400 font-extrabold">{formData.specialties}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
            {formData.contactPerson && (
              <span className="flex items-center gap-1">
                <User size={12} className="text-slate-400 dark:text-slate-500" />
                Contact: {formData.contactPerson}
              </span>
            )}
            {formData.email && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail size={12} className="text-slate-400 dark:text-slate-500" />
                  {formData.email}
                </span>
              </>
            )}
            {formData.location && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="text-slate-400 dark:text-slate-500" />
                  {formData.location}
                </span>
              </>
            )}
            {formData.website && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Globe size={12} className="text-slate-400 dark:text-slate-500" />
                  {formData.website}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('company')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'company'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
          }`}
        >
          <Building2 size={14} />
          <span>Company & Contacts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'security'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
          }`}
        >
          <KeyRound size={14} />
          <span>Change Password</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'notifications'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
          }`}
        >
          <Bell size={14} />
          <span>Notification Preferences</span>
        </button>
      </div>

      {/* Tab 1: Company Profile & Admin Details Form */}
      {activeTab === 'company' && (
        <form onSubmit={handleCompanySubmit} className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14132b] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-white/10 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Partner Organization Details</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Update company branding, primary contacts, location, specialty domains, and tier level.
            </p>
          </div>

          {/* Company Logo Selector with Upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Company Logo / Media Branding</label>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">PNG, JPG, SVG, WEBP</span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative group shrink-0">
                <UserAvatar
                  src={formData.logoUrl}
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
                className="flex-1 w-full rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/15 hover:border-indigo-600 dark:hover:border-indigo-400 bg-slate-50/50 dark:bg-[#1c1a36]/50 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 p-3.5 text-center cursor-pointer transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleMediaUpload}
                />
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <Upload size={15} />
                    <span>Upload Logo / Photo from Media or Device</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Click to browse or drag and drop image file (PNG, JPG, WEBP, SVG)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Primary Contact Person *</label>
              <input
                type="text"
                required
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Partnership Tier *</label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-600"
              >
                <option value="Tier-1 Strategic Partner">Tier-1 Strategic Partner</option>
                <option value="Preferred Talent Vendor">Preferred Talent Vendor</option>
                <option value="Specialist Guild">Specialist Guild</option>
                <option value="Regional Staffing Agency">Regional Staffing Agency</option>
                <option value="Niche Technology Provider">Niche Technology Provider</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Headquarters / Location *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. San Jose, CA or Bengaluru, India"
                className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 outline-none focus:border-indigo-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Specialty Skill Domains *</label>
              <input
                type="text"
                required
                value={formData.specialties}
                onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                placeholder="Full-Stack Dev, Cloud Native, AI & ML, DevOps"
                className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 outline-none focus:border-indigo-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Website URL</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 outline-none focus:border-indigo-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your technical capabilities, roster specializations, and domain experience..."
                className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-white/10">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
            >
              <Save size={15} />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Change Password */}
      {activeTab === 'security' && (
        <form onSubmit={handlePasswordSubmit} className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14132b] p-6 sm:p-8 shadow-xs space-y-6 max-w-2xl">
          <div className="border-b border-slate-100 dark:border-white/10 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Change Password</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Secure partner company administrative credentials.
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
                  className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] p-3 pr-10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 outline-none focus:border-indigo-600"
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
                  className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] p-3 pr-10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 outline-none focus:border-indigo-600"
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
                  className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] p-3 pr-10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 outline-none focus:border-indigo-600"
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
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
            >
              <KeyRound size={15} />
              <span>{isSaving ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Notification Preferences */}
      {activeTab === 'notifications' && (
        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14132b] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-white/10 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Partner Notification Preferences</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configure notifications for bench requests, specialist sign-offs, and monthly billing.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-[#1c1a36] border border-slate-100 dark:border-white/10">
              <div>
                <p className="font-extrabold text-slate-900 dark:text-white text-xs">Workforce Allocation Requests</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Alerts when HR Managers request specialized engineers from your bench.</p>
              </div>
              <button
                type="button"
                onClick={() => handleNotificationToggle('allocationRequests')}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications.allocationRequests ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.allocationRequests ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-[#1c1a36] border border-slate-100 dark:border-white/10">
              <div>
                <p className="font-extrabold text-slate-900 dark:text-white text-xs">Assignment Approvals & Deployment Sign-Offs</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Notifications when Company and Managers approve your proposed technical specialists.</p>
              </div>
              <button
                type="button"
                onClick={() => handleNotificationToggle('assignmentApprovals')}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications.assignmentApprovals ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.assignmentApprovals ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-[#1c1a36] border border-slate-100 dark:border-white/10">
              <div>
                <p className="font-extrabold text-slate-900 dark:text-white text-xs">SOW Invoicing & Revenue Statements</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Monthly reports detailing project billable hours and partner disbursements.</p>
              </div>
              <button
                type="button"
                onClick={() => handleNotificationToggle('sowInvoicing')}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications.sowInvoicing ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.sowInvoicing ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-[#1c1a36] border border-slate-100 dark:border-white/10">
              <div>
                <p className="font-extrabold text-slate-900 dark:text-white text-xs">General Email Alerts</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Important system updates, contract renewals, and compliance reminders.</p>
              </div>
              <button
                type="button"
                onClick={() => handleNotificationToggle('emailAlerts')}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications.emailAlerts ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.emailAlerts ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerProfile;
