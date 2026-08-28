import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Mail,
  Phone,
  Building2,
  Briefcase,
  KeyRound,
  Bell,
  CheckCircle2,
  Save,
  Camera,
  Eye,
  EyeOff,
  User,
  Sparkles,
  Upload,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { toast } from 'react-toastify';

export const AdminProfile = () => {
  const { adminProfile, updateAdminProfile } = useData();

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'security' | 'notifications'
  const [formData, setFormData] = useState({
    name: adminProfile?.name || 'Sarah Jenkins',
    email: adminProfile?.email || 'admin@flexistaff.com',
    phone: adminProfile?.phone || '+1 (415) 890-3400',
    companyName: adminProfile?.companyName || 'FlexiStaff Global Technologies Inc.',
    jobTitle: adminProfile?.jobTitle || 'Super Administrator',
    avatar:
      adminProfile?.avatar ||
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
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
    adminProfile?.notifications || {
      projectSubmissions: true,
      talentApprovals: true,
      systemAlerts: true,
      billingReports: true,
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
      updateAdminProfile({
        ...formData,
        notifications,
      });
      setIsSaving(false);
      toast.success('Admin profile updated successfully!');
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
      toast.success('Admin password updated successfully!');
    }, 400);
  };

  const handleNotificationToggle = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    updateAdminProfile({ notifications: updated });
    toast.info('Notification preferences saved.');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#004ac6] to-[#002f87] text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Company Admin Profile
              </h1>
              <p className="text-xs text-slate-500">
                Manage your administrative credentials, organization profile details, password, and system notifications.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-900 border border-blue-200 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-blue-700" />
            <span>Super Administrator Root</span>
          </span>
        </div>
      </div>

      {/* Profile Card Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group">
          <img
            src={formData.avatar}
            alt={formData.name}
            className="w-24 h-24 rounded-3xl object-cover ring-4 ring-blue-50 shadow-md"
          />
          <div className="absolute -bottom-1 -right-1 bg-[#004ac6] text-white p-1.5 rounded-xl shadow-xs">
            <Camera size={14} />
          </div>
        </div>

        <div className="text-center sm:text-left flex-1 space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-black text-slate-900">{formData.name}</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-xs font-bold self-center sm:self-auto border border-blue-200">
              {formData.jobTitle}
            </span>
          </div>
          <p className="text-xs text-blue-800 font-extrabold">{formData.companyName}</p>
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
              ? 'bg-[#004ac6] text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User size={14} />
          <span>Admin Information</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'security'
              ? 'bg-[#004ac6] text-white shadow-sm shadow-blue-500/20'
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
              ? 'bg-[#004ac6] text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bell size={14} />
          <span>Notification Preferences</span>
        </button>
      </div>

      {/* Tab 1: Admin Profile Details Form */}
      {activeTab === 'general' && (
        <form onSubmit={handleGeneralSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900">Administrator Credentials</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Update your primary administrator contact information and company details.
            </p>
          </div>

          {/* Profile Photo Selector with Upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">Admin Profile Photo</label>
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
                className="flex-1 w-full rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#004ac6] bg-slate-50/50 hover:bg-blue-50/20 p-3.5 text-center cursor-pointer transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleMediaUpload}
                />
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#004ac6]">
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
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Job Title *</label>
              <input
                type="text"
                required
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#004ac6] hover:bg-[#003da6] text-white font-extrabold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all"
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
              Ensure high-entropy password security for Company Admin authorization.
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
                  className="w-full rounded-xl border border-slate-300 p-3 pr-10 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
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
                  className="w-full rounded-xl border border-slate-300 p-3 pr-10 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
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
                  className="w-full rounded-xl border border-slate-300 p-3 pr-10 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
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
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#004ac6] hover:bg-[#003da6] text-white font-extrabold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all"
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
            <h3 className="text-base font-extrabold text-slate-900">Admin Notification Preferences</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Control your platform-wide notifications, approvals, and alerts.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="font-extrabold text-slate-900 text-xs">Project Submissions from Clients</p>
                <p className="text-[11px] text-slate-500">Alerts when enterprise clients submit new staffing and project requests.</p>
              </div>
              <button
                type="button"
                onClick={() => handleNotificationToggle('projectSubmissions')}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications.projectSubmissions ? 'bg-[#004ac6]' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.projectSubmissions ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="font-extrabold text-slate-900 text-xs">Workforce Assignment Sign-Off Requests</p>
                <p className="text-[11px] text-slate-500">Get notified when Organization Managers submit candidate proposals for final sign-off.</p>
              </div>
              <button
                type="button"
                onClick={() => handleNotificationToggle('talentApprovals')}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications.talentApprovals ? 'bg-[#004ac6]' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.talentApprovals ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="font-extrabold text-slate-900 text-xs">Critical System & Security Audit Alerts</p>
                <p className="text-[11px] text-slate-500">Immediate notifications for account security anomalies, logins, and audit logs.</p>
              </div>
              <button
                type="button"
                onClick={() => handleNotificationToggle('systemAlerts')}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications.systemAlerts ? 'bg-[#004ac6]' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.systemAlerts ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="font-extrabold text-slate-900 text-xs">Billing & Financial Invoicing Reports</p>
                <p className="text-[11px] text-slate-500">Monthly billing summaries and partner revenue share reconciliations.</p>
              </div>
              <button
                type="button"
                onClick={() => handleNotificationToggle('billingReports')}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications.billingReports ? 'bg-[#004ac6]' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.billingReports ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;
