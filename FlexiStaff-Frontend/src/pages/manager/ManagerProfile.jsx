import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Briefcase,
  ShieldCheck,
  KeyRound,
  Bell,
  CheckCircle2,
  Save,
  Camera,
  Layers,
  Eye,
  EyeOff,
  Sparkles,
  Upload,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { toast } from 'react-toastify';

export const ManagerProfile = () => {
  const { managerProfile, updateManagerProfile } = useData();

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'security' | 'notifications'
  const [formData, setFormData] = useState({
    name: managerProfile?.name || 'Alex Morgan',
    email: managerProfile?.email || 'manager@flexistaff.com',
    phone: managerProfile?.phone || '+1 (415) 555-8910',
    jobTitle: managerProfile?.jobTitle || managerProfile?.role || 'Organization Manager',
    department: managerProfile?.department || 'Enterprise Talent Matching',
    location: managerProfile?.location || 'San Francisco, CA',
    bio:
      managerProfile?.bio ||
      'Oversees technical resource allocation, skill matching, and sprint milestone execution across enterprise partner projects.',
    avatar:
      managerProfile?.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [notifications, setNotifications] = useState(
    managerProfile?.notifications || {
      email: true,
      assignmentRequests: true,
      talentAvailability: true,
      milestoneUpdates: true,
    }
  );

  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({ ...prev, avatar: event.target.result }));
      toast.success('Media photo uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleGeneralSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      updateManagerProfile({
        ...formData,
        role: formData.jobTitle,
        notifications,
      });
      setIsSaving(false);
      toast.success('Manager profile updated successfully!');
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

  const handleNotificationToggle = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    updateManagerProfile({ notifications: updated });
    toast.info('Notification preferences saved.');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#004ac6] to-[#2563eb] text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <User size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Organization Manager Profile
              </h1>
              <p className="text-xs text-slate-500">
                Manage operational credentials, assigned department, authentication security, and matching alerts.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-blue-600" />
            <span>Authorized Organization Manager</span>
          </span>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group">
          <img
            src={formData.avatar}
            alt={formData.name}
            className="w-24 h-24 rounded-3xl object-cover ring-4 ring-blue-50 shadow-md"
          />
          <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-xl shadow-xs">
            <Camera size={14} />
          </div>
        </div>

        <div className="text-center sm:text-left flex-1 space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-black text-slate-900">{formData.name}</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold self-center sm:self-auto border border-blue-200">
              {formData.jobTitle}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-semibold">
            {formData.department} • FlexiStaff Global Operations
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <Mail size={12} className="text-slate-400" />
              {formData.email}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Phone size={12} className="text-slate-400" />
              {formData.phone}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin size={12} className="text-slate-400" />
              {formData.location}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'general'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User size={14} />
          <span>Operational Details</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'security'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-100'
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
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bell size={14} />
          <span>Notification Preferences</span>
        </button>
      </div>

      {/* Tab 1: Operational Information Form */}
      {activeTab === 'general' && (
        <form onSubmit={handleGeneralSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900">Manager Credentials</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Update your contact information, organizational department, and operational focus.
            </p>
          </div>

          {/* Profile Photo Selector with Upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">Manager Profile Photo</label>
              <span className="text-[11px] text-slate-400">JPG, PNG, WEBP (Max 5MB)</span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative group shrink-0">
                <img
                  src={formData.avatar}
                  alt="Profile"
                  className="w-20 h-20 rounded-2xl object-cover ring-2 ring-slate-200 shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-900/50 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-bold gap-1"
                >
                  <Camera size={18} />
                  <span>Upload</span>
                </button>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 w-full rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-600 bg-slate-50/50 hover:bg-blue-50/20 p-3.5 text-center cursor-pointer transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleMediaUpload}
                />
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
                    <Upload size={15} />
                    <span>Upload Photo from Media / Device</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Click to browse or drag and drop image file (PNG, JPG, WEBP up to 5MB)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Job Title *</label>
              <input
                type="text"
                required
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department *</label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-blue-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Operational Responsibilities / Bio</label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Detail your organizational duties and squad management scope..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all"
            >
              <Save size={15} />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile Details'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Change Password */}
      {activeTab === 'security' && (
        <form onSubmit={handlePasswordSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6 max-w-2xl">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900">Change Password</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Keep your manager portal access secure.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Current Password *</label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full rounded-xl border border-slate-300 p-3 pr-10 text-xs text-slate-900 outline-none focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Password *</label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Min. 6 characters"
                  className="w-full rounded-xl border border-slate-300 p-3 pr-10 text-xs text-slate-900 outline-none focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password *</label>
              <div className="relative">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password"
                  className="w-full rounded-xl border border-slate-300 p-3 pr-10 text-xs text-slate-900 outline-none focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all"
            >
              <KeyRound size={15} />
              <span>{isSaving ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Notification Preferences */}
      {activeTab === 'notifications' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900">Manager Notification Preferences</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Control your operational notifications for talent matching, assignment approvals, and sprint milestones.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="font-extrabold text-slate-900 text-xs">Email Notifications</p>
                <p className="text-[11px] text-slate-500">Receive summary reports on team activities and project handoffs.</p>
              </div>
              <button
                type="button"
                onClick={() => handleNotificationToggle('email')}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications.email ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.email ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="font-extrabold text-slate-900 text-xs">Assignment Requests & Company Approvals</p>
                <p className="text-[11px] text-slate-500">Instant notification when Company signs off on your matched specialists.</p>
              </div>
              <button
                type="button"
                onClick={() => handleNotificationToggle('assignmentRequests')}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications.assignmentRequests ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.assignmentRequests ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="font-extrabold text-slate-900 text-xs">Talent Pool Availability Alerts</p>
                <p className="text-[11px] text-slate-500">Get notified when new engineers join the bench or become available for matching.</p>
              </div>
              <button
                type="button"
                onClick={() => handleNotificationToggle('talentAvailability')}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications.talentAvailability ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.talentAvailability ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="font-extrabold text-slate-900 text-xs">Project Milestone Progress</p>
                <p className="text-[11px] text-slate-500">Alerts when workforce talent marks sprint deliverables as completed.</p>
              </div>
              <button
                type="button"
                onClick={() => handleNotificationToggle('milestoneUpdates')}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications.milestoneUpdates ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.milestoneUpdates ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerProfile;
