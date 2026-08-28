import React, { useState } from 'react';
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  ShieldCheck,
  KeyRound,
  Bell,
  CheckCircle2,
  Save,
  Camera,
  Layers,
  FileText,
  Eye,
  EyeOff,
  User,
  Sparkles,
  Upload,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { toast } from 'react-toastify';

export const PartnerProfile = () => {
  const { partnerProfile, updatePartnerProfile } = useData();

  const [activeTab, setActiveTab] = useState('company'); // 'company' | 'business' | 'security' | 'notifications'
  const [formData, setFormData] = useState({
    name: partnerProfile?.name || 'Apex Digital Enterprises Inc.',
    email: partnerProfile?.email || 'partner@flexistaff.com',
    contactPerson: partnerProfile?.contactPerson || 'Marcus Vance',
    phone: partnerProfile?.phone || '+1 (415) 620-8800',
    address: partnerProfile?.address || '500 Howard Street, Suite 400',
    city: partnerProfile?.city || 'San Francisco',
    country: partnerProfile?.country || 'United States',
    website: partnerProfile?.website || 'https://apexdigital.io',
    description:
      partnerProfile?.description ||
      'Apex Digital Enterprises builds next-generation omnichannel commerce, financial technology ecosystems, and cloud SaaS platforms. We partner with FlexiStaff to fulfill specialized temporary engineering requirements with rapid scaling and guaranteed SLA execution.',
    registrationId: partnerProfile?.registrationId || 'REG-2024-99214-US',
    taxId: partnerProfile?.taxId || 'EIN-84-9920193',
    businessType: partnerProfile?.businessType || 'Corporation (C-Corp)',
    domain: partnerProfile?.domain || 'Technology Consulting & Staff Augmentation',
    logoUrl:
      partnerProfile?.logoUrl ||
      partnerProfile?.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
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
    partnerProfile?.notifications || {
      allocationRequests: true,
      assignmentApprovals: true,
      sowInvoicing: true,
      emailAlerts: true,
    }
  );

  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, WEBP, SVG).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB.');
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
      updatePartnerProfile({
        ...formData,
        avatar: formData.logoUrl,
        notifications,
      });
      setIsSaving(false);
      toast.success('Partner company profile updated successfully!');
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Building2 size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Partner Company Profile
              </h1>
              <p className="text-xs text-slate-500">
                Corporate credentials, business registration standing, contacts, and security credentials.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-indigo-600" />
            <span>Verified Staffing Partner</span>
          </span>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group">
          <img
            src={formData.logoUrl}
            alt={formData.name}
            className="w-24 h-24 rounded-3xl object-cover ring-4 ring-indigo-50 shadow-md"
          />
          <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1.5 rounded-xl shadow-xs">
            <Camera size={14} />
          </div>
        </div>

        <div className="text-center sm:text-left flex-1 space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-black text-slate-900">{formData.name}</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold self-center sm:self-auto border border-indigo-200">
              Reg: {formData.registrationId}
            </span>
          </div>
          <p className="text-xs text-indigo-700 font-extrabold">{formData.domain}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <User size={12} className="text-slate-400" />
              Contact: {formData.contactPerson}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Mail size={12} className="text-slate-400" />
              {formData.email}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Globe size={12} className="text-slate-400" />
              {formData.website}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('company')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'company'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 size={14} />
          <span>Company & Contacts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('business')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'business'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText size={14} />
          <span>Business Registration</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'security'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
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
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bell size={14} />
          <span>Notification Preferences</span>
        </button>
      </div>

      {/* Tab 1: Company Profile Details Form */}
      {activeTab === 'company' && (
        <form onSubmit={handleCompanySubmit} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900">Partner Organization Details</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Update company branding, primary representatives, and registered address.
            </p>
          </div>

          {/* Company Logo Selector with Upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">Company Logo / Media Branding</label>
              <span className="text-[11px] text-slate-400">PNG, JPG, SVG, WEBP (Max 5MB)</span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative group shrink-0">
                <img
                  src={formData.logoUrl}
                  alt="Partner Logo"
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
                className="flex-1 w-full rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-600 bg-slate-50/50 hover:bg-indigo-50/20 p-3.5 text-center cursor-pointer transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleMediaUpload}
                />
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                    <Upload size={15} />
                    <span>Upload Logo / Photo from Media or Device</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Click to browse or drag and drop image file (PNG, JPG, WEBP, SVG up to 5MB)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Primary Contact Person *</label>
              <input
                type="text"
                required
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Website URL *</label>
              <input
                type="url"
                required
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City & State</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="San Francisco, CA"
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-indigo-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Office Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="500 Howard Street, Suite 400"
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-indigo-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Company Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your technical capabilities, roster specializations, and domain experience..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
            >
              <Save size={15} />
              <span>{isSaving ? 'Saving Changes...' : 'Save Company Profile'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Business & Registration Information */}
      {activeTab === 'business' && (
        <form onSubmit={handleCompanySubmit} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900">Business & Registration Information</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Official corporate registration identifiers, domain classifications, and tax reporting numbers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Business Registration ID *</label>
              <input
                type="text"
                required
                value={formData.registrationId}
                onChange={(e) => setFormData({ ...formData, registrationId: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-indigo-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tax ID / EIN Number *</label>
              <input
                type="text"
                required
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-indigo-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Business Entity Type *</label>
              <select
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-indigo-600 bg-white"
              >
                <option value="Corporation (C-Corp)">Corporation (C-Corp)</option>
                <option value="Limited Liability Company (LLC)">Limited Liability Company (LLC)</option>
                <option value="S-Corporation">S-Corporation</option>
                <option value="Partnership / Joint Venture">Partnership / Joint Venture</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Primary Business Domain *</label>
              <input
                type="text"
                required
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-900">
            <ShieldCheck size={18} className="text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold">Corporate Partner Agreement Active</p>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                Your business registration and master services agreement (MSA) have been validated by FlexiStaff Company.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
            >
              <Save size={15} />
              <span>{isSaving ? 'Saving Changes...' : 'Save Registration Details'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Change Password */}
      {activeTab === 'security' && (
        <form onSubmit={handlePasswordSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6 max-w-2xl">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900">Change Password</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Secure partner company administrative credentials.
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
                  className="w-full rounded-xl border border-slate-300 p-3 pr-10 text-xs text-slate-900 outline-none focus:border-indigo-600"
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
                  className="w-full rounded-xl border border-slate-300 p-3 pr-10 text-xs text-slate-900 outline-none focus:border-indigo-600"
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
                  className="w-full rounded-xl border border-slate-300 p-3 pr-10 text-xs text-slate-900 outline-none focus:border-indigo-600"
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
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
            >
              <KeyRound size={15} />
              <span>{isSaving ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 4: Notification Preferences */}
      {activeTab === 'notifications' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900">Partner Notification Preferences</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure notifications for bench requests, specialist sign-offs, and monthly billing.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="font-extrabold text-slate-900 text-xs">Workforce Allocation Requests</p>
                <p className="text-[11px] text-slate-500">Alerts when Organization Managers request specialized engineers from your bench.</p>
              </div>
              <button
                type="button"
                onClick={() => handleNotificationToggle('allocationRequests')}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications.allocationRequests ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.allocationRequests ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="font-extrabold text-slate-900 text-xs">Assignment Approvals & Deployment Sign-Offs</p>
                <p className="text-[11px] text-slate-500">Notifications when Company and Managers approve your proposed technical specialists.</p>
              </div>
              <button
                type="button"
                onClick={() => handleNotificationToggle('assignmentApprovals')}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications.assignmentApprovals ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.assignmentApprovals ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="font-extrabold text-slate-900 text-xs">SOW Invoicing & Revenue Statements</p>
                <p className="text-[11px] text-slate-500">Monthly reports detailing project billable hours and partner disbursements.</p>
              </div>
              <button
                type="button"
                onClick={() => handleNotificationToggle('sowInvoicing')}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications.sowInvoicing ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.sowInvoicing ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="font-extrabold text-slate-900 text-xs">General Email Alerts</p>
                <p className="text-[11px] text-slate-500">Important system updates, contract renewals, and compliance reminders.</p>
              </div>
              <button
                type="button"
                onClick={() => handleNotificationToggle('emailAlerts')}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications.emailAlerts ? 'bg-indigo-600' : 'bg-slate-300'}`}
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
