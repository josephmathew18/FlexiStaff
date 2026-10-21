import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Users,
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Star,
  Award,
  CheckCircle2,
  Clock,
  ChevronDown,
  Building2,
  Handshake,
  FolderKanban,
  AlertCircle,
  X,
  Check,
  Code2,
  Sparkles,
  FolderSearch,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  UserX,
  HelpCircle,
  FileCheck,
  FileX,
  AlertTriangle,
  BadgeAlert,
  Send,
  UserPlus,
  Download,
  FileText,
  Trash2,
  Pencil,
  Eye,
  GraduationCap,
} from 'lucide-react';
import { useData, getPartnerCompanyName } from '../../context/DataContext';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import UserAvatar from '../../components/common/UserAvatar';

// ====================================================================
// INLINE REUSABLE UI: StatusBadge
// ====================================================================
const StatusBadge = ({ status = '', size = 'sm', className = '', title = '' }) => {
  const normalized = (status || '').toLowerCase().trim();
  if (!status || ['available', 'immediate'].includes(normalized)) {
    return null;
  }
  let colorClasses = 'bg-slate-100 text-[#565e74] border-[#c3c6d7]';
  let dotColor = 'bg-slate-400';

  if (['active', 'approved', 'verified'].includes(normalized)) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (['assigned', 'busy', 'in progress', 'currently assigned', 'working'].includes(normalized)) {
    colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
    dotColor = 'bg-blue-500';
  } else if (['temporarily unavailable', 'unavailable', 'on leave'].includes(normalized)) {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-300';
    dotColor = 'bg-amber-500';
  } else if (['pending', 'pending review', 'under review', 'onboarding'].includes(normalized)) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
    dotColor = 'bg-amber-500';
  } else if (['rejected', 'inactive', 'terminated'].includes(normalized)) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
    dotColor = 'bg-rose-500';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  return (
    <span title={title || status} className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${sizeClasses} ${colorClasses} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      <span>{status}</span>
    </span>
  );
};

// ====================================================================
// INLINE REUSABLE UI: SearchBar, FilterDropdown, DataTable, Modal, FormInput
// ====================================================================
const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => (
  <div className="relative w-full">
    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-[#c3c6d7]/80 dark:border-white/15 bg-white dark:bg-[#1c1a36] py-2 pl-9 pr-8 text-xs text-[#191b23] dark:text-white placeholder-slate-400 shadow-xs outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15"
    />
    {value && (
      <button type="button" onClick={() => onChange?.('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
        <X size={14} />
      </button>
    )}
  </div>
);

const FilterDropdown = ({ label = 'Filter', options = [], value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value) || options[0];
  const isFiltered = value && value !== 'all' && value !== '';

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
          isFiltered
            ? 'border-[#2563eb] bg-blue-50/50 dark:bg-blue-950/40 text-[#004ac6] dark:text-blue-400'
            : 'border-[#c3c6d7]/80 dark:border-white/15 bg-white dark:bg-[#1c1a36] text-[#434655] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'
        }`}
      >
        <Filter size={13} className={isFiltered ? 'text-[#004ac6] dark:text-blue-400' : 'text-slate-400'} />
        <span>{label}: <strong>{selectedOption?.label || 'All'}</strong></span>
        <ChevronDown size={13} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <div className="absolute left-0 z-30 mt-1 min-w-[170px] rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#14132b] p-1 shadow-lg shadow-black/30">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange?.(opt.value); setIsOpen(false); }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs ${
                  opt.value === value ? 'bg-blue-50 dark:bg-blue-900/40 text-[#004ac6] dark:text-blue-300 font-bold' : 'text-[#434655] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                <span>{opt.label}</span>
                {opt.value === value && <Check size={13} />}
              </button>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Modal = ({ isOpen = false, onClose, title, subtitle, children, maxWidth = 'max-w-lg', showCloseButton = true }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`relative z-10 w-full ${maxWidth} rounded-2xl bg-white dark:bg-[#14132b] shadow-2xl border border-slate-200 dark:border-white/15 overflow-hidden my-8`}>
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-white/10 px-6 py-4 bg-slate-50/50 dark:bg-[#1c1a36]">
              <div>
                {title && <h3 className="text-base font-bold text-[#191b23] dark:text-white">{title}</h3>}
                {subtitle && <p className="mt-0.5 text-xs text-[#737686] dark:text-slate-400">{subtitle}</p>}
              </div>
              {showCloseButton && (
                <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors">
                  <X size={18} />
                </button>
              )}
            </div>
          )}
          <div className="px-6 py-5 max-h-[75vh] overflow-y-auto text-slate-900 dark:text-white">{children}</div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const FormInput = ({ label, name, type = 'text', placeholder, register, error, required = false, options = [], className = '', disabled = false, ...rest }) => {
  const isError = Boolean(error);
  const inputBaseClasses = `w-full rounded-lg border text-xs text-[#191b23] dark:text-white placeholder-slate-400 transition-all outline-none ${
    isError ? 'border-rose-400 bg-rose-50/20' : 'border-[#c3c6d7] dark:border-white/15 bg-white dark:bg-[#1c1a36] focus:border-[#004ac6]'
  } ${disabled ? 'bg-slate-100 dark:bg-white/5 text-slate-500' : ''}`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="flex items-center justify-between text-xs font-semibold text-[#434655] dark:text-slate-300">
          <span>{label}{required && <span className="text-rose-500 ml-0.5">*</span>}</span>
        </label>
      )}
      {type === 'select' ? (
        <select {...(register ? register(name) : {})} disabled={disabled} className={`${inputBaseClasses} px-3 py-2 bg-white dark:bg-[#1c1a36]`} {...rest}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#1c1a36] text-[#191b23] dark:text-white">{opt.label}</option>
          ))}
        </select>
      ) : (
        <input type={type} {...(register ? register(name) : {})} disabled={disabled} placeholder={placeholder} className={`${inputBaseClasses} px-3 py-2`} {...rest} />
      )}
      {isError && (
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-rose-600">
          <AlertCircle size={13} />
          <span>{error.message || error}</span>
        </div>
      )}
    </div>
  );
};

export const WorkforceManagement = () => {
  const {
    workforce,
    partners,
    clients,
    approveWorkforceMember,
    rejectWorkforceMember,
    updateWorkforceMember,
    deleteWorkforceMember,
    freelancerApplications = [],
    approveFreelancerApplication,
    rejectFreelancerApplication,
    refreshWorkforce,
  } = useData();

  // Auto-refresh when workforce availability changes anywhere in the app
  React.useEffect(() => {
    if (refreshWorkforce) {
      refreshWorkforce();
    }
    const handleAvailabilitySync = () => {
      if (refreshWorkforce) {
        refreshWorkforce();
      }
    };
    window.addEventListener('workforce_availability_changed', handleAvailabilitySync);
    window.addEventListener('storage', handleAvailabilitySync);
    return () => {
      window.removeEventListener('workforce_availability_changed', handleAvailabilitySync);
      window.removeEventListener('storage', handleAvailabilitySync);
    };
  }, []);

  // Navigation Filter Tabs
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'active' | 'pending' | 'rejected'
  const [roleTypeFilter, setRoleTypeFilter] = useState('all'); // 'all' | 'Professional' | 'Freelancer'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals state
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [viewingAppModal, setViewingAppModal] = useState(null);
  const [previewResumeModal, setPreviewResumeModal] = useState(null);
  const [rejectionModalTalent, setRejectionModalTalent] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('Skill set does not match current project requirements');

  // Enriched talent detail opener (merges freelancer application verification data if available)
  const handleOpenTalentDetails = (talent) => {
    if (!talent) return;
    const matchingApp = (freelancerApplications || []).find(
      (a) =>
        (a.email && talent.email && a.email.toLowerCase() === talent.email.toLowerCase()) ||
        a.id === talent.id ||
        a.numericId === talent.numericId ||
        a.id === talent.freelancerId ||
        (a.fullName && talent.name && a.fullName.toLowerCase() === talent.name.toLowerCase())
    );

    const merged = matchingApp
      ? {
          ...matchingApp,
          ...talent,
          experiences: (talent.experiences && talent.experiences.length > 0)
            ? talent.experiences
            : (matchingApp.experiences || []),
          educations: (talent.educations && talent.educations.length > 0)
            ? talent.educations
            : (matchingApp.educations || []),
          certifications: (talent.certifications && talent.certifications.length > 0)
            ? talent.certifications
            : (matchingApp.certifications || []),
          languages: (talent.languages && talent.languages.length > 0)
            ? talent.languages
            : (matchingApp.languages || []),
          bio: talent.bio || matchingApp.bioOverview || matchingApp.bio || '',
          bioOverview: talent.bio || matchingApp.bioOverview || matchingApp.bio || '',
          category: talent.category || matchingApp.category || '',
          specialties: (talent.specialties && talent.specialties.length > 0)
            ? talent.specialties
            : (matchingApp.specialties || []),
          experienceLevel: talent.experienceLevel || matchingApp.experienceLevel || 'I have some experience',
          freelanceGoal: talent.freelanceGoal || matchingApp.freelanceGoal || 'To earn my main income',
          workPreferences: (Array.isArray(talent.workPreferences) && talent.workPreferences.length > 0)
            ? talent.workPreferences
            : ((Array.isArray(matchingApp.workPreferences) && matchingApp.workPreferences.length > 0) ? matchingApp.workPreferences : ['I\'d like to find opportunities myself']),
          openToContractToHire: talent.openToContractToHire ?? matchingApp.openToContractToHire ?? true,
          resumeUrl: talent.resumeUrl || talent.resume || matchingApp.resumeUrl || matchingApp.resume || '',
          resumeName: talent.resumeName || talent.resumeFileName || matchingApp.resumeFileName || matchingApp.resumeName || '',
          linkedInPdfUrl: talent.linkedInPdfUrl || matchingApp.linkedInPdfUrl || '',
          linkedInPdfName: talent.linkedInPdfName || matchingApp.linkedInPdfName || '',
          linkedin: talent.linkedin || matchingApp.linkedin || '',
          github: talent.github || matchingApp.github || '',
        }
      : talent;

    setSelectedTalent(merged);
  };

  // Edit Employee Modal state
  const [editingTalent, setEditingTalent] = useState(null);
  const [editTalentForm, setEditTalentForm] = useState({
    name: '',
    title: '',
    hourlyRate: '',
    experience: '',
    skills: '',
    email: '',
    phone: '',
    location: '',
    availability: 'Available',
    bio: '',
    avatar: '',
  });

  const handleStartEditTalent = (talent) => {
    setEditingTalent(talent);
    setEditTalentForm({
      name: talent.name || talent.pseudonym || '',
      title: talent.title || talent.role || '',
      hourlyRate: talent.hourlyRate || '$85/hr',
      experience: talent.experience || '3+ Years',
      skills: Array.isArray(talent.skills) ? talent.skills.join(', ') : (talent.skills || ''),
      email: talent.email || '',
      phone: talent.phone || '',
      location: talent.location || 'Bengaluru, India',
      availability: talent.availability || talent.status || 'Available',
      bio: talent.bio || '',
      avatar: talent.avatar || '',
      staffBadgeId: talent.staffBadgeId || talent.employeeId || talent.companyId || '',
      staffBadgeUrl: talent.staffBadgeUrl || talent.badgeDocumentUrl || '',
      staffBadgeName: talent.staffBadgeName || talent.badgeDocumentName || '',
      linkedin: talent.linkedin || '',
      resumeUrl: talent.resumeUrl || talent.resume || '',
      resumeName: talent.resumeName || '',
      github: talent.github || '',
    });
  };

  const handleOpenDocument = (url, fallbackName = 'Document') => {
    if (!url) return;
    try {
      const win = window.open();
      if (win) {
        win.document.write(
          `<iframe src="${url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
        );
        win.document.title = fallbackName;
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSaveEditTalent = (e) => {
    e.preventDefault();
    if (!editingTalent) return;
    const skillsArr = editTalentForm.skills
      ? editTalentForm.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const updatedData = {
      name: editTalentForm.name,
      title: editTalentForm.title,
      role: editTalentForm.title,
      hourlyRate: editTalentForm.hourlyRate.startsWith('$') ? editTalentForm.hourlyRate : `$${editTalentForm.hourlyRate}`,
      experience: editTalentForm.experience,
      skills: skillsArr,
      email: editTalentForm.email,
      phone: editTalentForm.phone,
      location: editTalentForm.location,
      availability: editTalentForm.availability,
      availabilityStatus: editTalentForm.availability,
      status: editingTalent.status || editingTalent.approvalStatus || 'Approved',
      approvalStatus: editingTalent.approvalStatus || editingTalent.status || 'Approved',
      bio: editTalentForm.bio,
      avatar: editTalentForm.avatar,
      staffBadgeId: editTalentForm.staffBadgeId,
      staffBadgeUrl: editTalentForm.staffBadgeUrl,
      staffBadgeName: editTalentForm.staffBadgeName,
      badgeDocumentUrl: editTalentForm.staffBadgeUrl,
      badgeDocumentName: editTalentForm.staffBadgeName,
      linkedin: editTalentForm.linkedin,
      resumeUrl: editTalentForm.resumeUrl,
      resumeName: editTalentForm.resumeName,
      github: editTalentForm.github,
    };
    if (updateWorkforceMember) {
      updateWorkforceMember(editingTalent.id, updatedData);
    }
    toast.success(`Profile for "${editTalentForm.name}" updated successfully!`);
    setEditingTalent(null);
    if (selectedTalent?.id === editingTalent.id) {
      setSelectedTalent((prev) => ({ ...prev, ...updatedData }));
    }
  };

  // Extract all available skill tags
  const allSkills = useMemo(() => {
    const set = new Set();
    workforce.forEach((w) => w.skills?.forEach((s) => set.add(s)));
    return ['all', ...Array.from(set)];
  }, [workforce]);

  // Helper to check if record is a Partner Company organization account (which belongs to Partner Companies page, not Workforce!)
  const isPartnerCompanyOrg = (w) => {
    if (!w) return true;
    const roleLower = (w.role || w.title || w.category || '').toLowerCase().trim();
    const nameLower = (w.name || w.pseudonym || '').toLowerCase().trim();
    const emailLower = (w.email || '').toLowerCase().trim();

    return (
      roleLower === 'partner company' ||
      roleLower === 'partner' ||
      roleLower === 'role_partner' ||
      nameLower === 'infosys' ||
      nameLower === 'partner' ||
      nameLower === 'partner company' ||
      emailLower === 'partner@infosys.com' ||
      emailLower === 'partner@gmail.com' ||
      emailLower === 'partner@flexistaff.com'
    );
  };

  // Helper to check if record is rejected either in workforce or in freelancer applications
  const isRejectedRecord = (member) => {
    if (!member) return false;
    const status = (member.status || '').toLowerCase().trim();
    const approval = (member.approvalStatus || '').toLowerCase().trim();
    const verification = (member.verificationStatus || '').toLowerCase().trim();
    const account = (member.accountStatus || '').toLowerCase().trim();

    if (
      status === 'rejected' || status === 'declined' ||
      approval === 'rejected' || approval === 'declined' ||
      verification === 'rejected' || verification === 'declined' ||
      account === 'rejected' || account === 'declined'
    ) {
      return true;
    }

    const mEmail = (member.email || '').toLowerCase().trim();
    const mName = (member.name || member.pseudonym || '').toLowerCase().trim();
    const mId = String(member.id || '');
    const mNum = String(member.numericId || '');

    const matchingApp = (freelancerApplications || []).find((a) => {
      const aEmail = (a.email || '').toLowerCase().trim();
      const aName = (a.fullName || a.name || '').toLowerCase().trim();
      const aId = String(a.id || '');
      const aNum = String(a.numericId || '');
      return (
        (mEmail && aEmail && mEmail === aEmail) ||
        (mName && aName && mName === aName) ||
        (mId && aId && mId === aId) ||
        (mNum && aNum && mNum === aNum)
      );
    });

    if (matchingApp && (matchingApp.status === 'Rejected' || matchingApp.status === 'Declined')) {
      return true;
    }

    return false;
  };

  // Clean workforce roster without partner company organizations, without Admin/Manager/Client users, and without Rejected records
  const cleanWorkforceRoster = useMemo(() => {
    return workforce.filter((w) => {
      if (!w) return false;
      if (isPartnerCompanyOrg(w)) return false;

      const roleLower = (w.role || w.title || w.roleType || w.category || '').toLowerCase().trim();
      const userRoleLower = (w.userRole || w.user_role || '').toLowerCase().trim();
      const emailLower = (w.email || '').toLowerCase().trim();
      const nameLower = (w.name || w.pseudonym || '').toLowerCase().trim();

      if (
        roleLower === 'admin' || roleLower === 'manager' || roleLower === 'client' ||
        userRoleLower === 'admin' || userRoleLower === 'manager' || userRoleLower === 'client' ||
        roleLower === 'role_admin' || roleLower === 'role_manager' || roleLower === 'role_client' ||
        roleLower.includes('admin') || roleLower.includes('manager') || roleLower.includes('client') ||
        emailLower.includes('admin') || emailLower.includes('manager') ||
        nameLower === 'admin' || nameLower === 'manager' || nameLower === 'client'
      ) {
        return false;
      }

      // DO NOT show rejected workforce in standard active roster
      if (isRejectedRecord(w)) {
        return false;
      }

      return true;
    });
  }, [workforce, freelancerApplications]);

  // Non-rejected freelancer applications for the "Freelancer Applications" tab
  const activeFreelancerApplications = useMemo(() => {
    return (freelancerApplications || []).filter(
      (app) => app && app.status !== 'Rejected' && app.status !== 'Declined'
    );
  }, [freelancerApplications]);

  // Dedicated separate collection of Rejected Candidates / Workforce for Admin
  const rejectedRecords = useMemo(() => {
    const list = [];
    const seenEmails = new Set();
    const seenIds = new Set();

    // 1. From workforce who are marked rejected
    (workforce || []).forEach((w) => {
      if (!w || isPartnerCompanyOrg(w)) return;
      if (isRejectedRecord(w)) {
        const email = (w.email || '').toLowerCase().trim();
        const id = String(w.id || '');
        if (email) seenEmails.add(email);
        if (id) seenIds.add(id);

        const matchingApp = (freelancerApplications || []).find(
          (a) =>
            (a.email && email && a.email.toLowerCase().trim() === email) ||
            String(a.id) === id ||
            String(a.numericId) === id
        );

        list.push({
          ...matchingApp,
          ...w,
          isFromApp: Boolean(matchingApp),
          appId: matchingApp?.id,
          rejectionReason: w.rejectionReason || matchingApp?.rejectionReason || 'Declined by Administrator',
        });
      }
    });

    // 2. From freelancerApplications marked rejected
    (freelancerApplications || []).forEach((app) => {
      if (!app) return;
      if (app.status === 'Rejected' || app.status === 'Declined') {
        const email = (app.email || '').toLowerCase().trim();
        const id = String(app.id || '');
        if ((email && seenEmails.has(email)) || (id && seenIds.has(id))) {
          return;
        }
        if (email) seenEmails.add(email);
        if (id) seenIds.add(id);

        list.push({
          id: app.id,
          numericId: app.numericId,
          name: app.fullName || app.name || 'Candidate',
          title: app.roleTitle || 'Freelancer Professional',
          role: app.roleTitle || 'Freelancer',
          email: app.email,
          phone: app.phone || app.personalDetails?.phoneNumber,
          hourlyRate: typeof app.hourlyRate === 'number' ? `₹${app.hourlyRate.toFixed(2)}/hr` : (app.hourlyRate || '₹1500/hr'),
          experience: app.experienceLevel || '3+ years',
          location: app.personalDetails?.city || app.place || 'Remote',
          skills: app.skills || [],
          source: 'Independent Freelancer',
          roleType: 'Freelancer',
          status: 'Rejected',
          approvalStatus: 'Rejected',
          rejectionReason: app.rejectionReason || 'Declined by Administrator',
          isFromApp: true,
          appId: app.id,
          personalDetails: app.personalDetails,
          resumeUrl: app.resumeUrl || app.resume,
          resumeName: app.resumeFileName || app.resumeName,
          linkedin: app.linkedin,
          github: app.github,
          bio: app.bioOverview,
          bioOverview: app.bioOverview,
          submittedAt: app.submittedAt,
        });
      }
    });

    return list;
  }, [workforce, freelancerApplications]);

  // Filtered Rejected Records based on search and role type filter
  const filteredRejectedRecords = useMemo(() => {
    return rejectedRecords.filter((talent) => {
      if (roleTypeFilter !== 'all') {
        const isFreelancer =
          talent.roleType === 'Freelancer' ||
          talent.source === 'Freelancer' ||
          talent.source === 'Independent Freelancer' ||
          talent.source === 'Freelancer Registration' ||
          talent.professionalType === 'FREELANCER' ||
          !talent.partnerCompanyId;
        if (roleTypeFilter === 'Freelancer' && !isFreelancer) return false;
        if (roleTypeFilter === 'Professional' && isFreelancer) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameStr = (talent.name || talent.pseudonym || '').toLowerCase();
        const titleStr = (talent.title || talent.role || '').toLowerCase();
        const emailStr = (talent.email || '').toLowerCase();
        const matchesName = nameStr.includes(q);
        const matchesTitle = titleStr.includes(q);
        const matchesEmail = emailStr.includes(q);
        const matchesSkills = Array.isArray(talent.skills)
          ? talent.skills.some((s) => String(s).toLowerCase().includes(q))
          : typeof talent.skills === 'string'
          ? talent.skills.toLowerCase().includes(q)
          : false;
        if (!matchesName && !matchesTitle && !matchesEmail && !matchesSkills) return false;
      }
      return true;
    });
  }, [rejectedRecords, roleTypeFilter, searchQuery]);

  // Counts for Badges
  const pendingCount = useMemo(
    () =>
      cleanWorkforceRoster.filter(
        (w) =>
          w.approvalStatus === 'Pending Review' ||
          w.approvalStatus === 'Pending' ||
          w.verificationStatus === 'Pending' ||
          w.status === 'Pending Review' ||
          w.status === 'Pending'
      ).length,
    [cleanWorkforceRoster]
  );
  const pendingPartnerCount = useMemo(
    () =>
      cleanWorkforceRoster.filter(
        (w) =>
          (w.approvalStatus === 'Pending Review' ||
            w.approvalStatus === 'Pending' ||
            w.verificationStatus === 'Pending' ||
            w.status === 'Pending Review' ||
            w.status === 'Pending') &&
          (w.source === 'Partner Company' || w.professionalType === 'PARTNER_EMPLOYEE')
      ).length,
    [cleanWorkforceRoster]
  );
  const pendingFreelancerCount = useMemo(
    () =>
      cleanWorkforceRoster.filter(
        (w) =>
          (w.approvalStatus === 'Pending Review' ||
            w.approvalStatus === 'Pending' ||
            w.verificationStatus === 'Pending' ||
            w.status === 'Pending Review' ||
            w.status === 'Pending') &&
          (w.source === 'Freelancer' ||
            w.source === 'Freelancer Registration' ||
            w.professionalType === 'FREELANCER' ||
            w.roleType === 'Freelancer' ||
            !w.partnerCompanyId)
      ).length,
    [cleanWorkforceRoster]
  );
  const activeTalentCount = useMemo(
    () =>
      cleanWorkforceRoster.filter(
        (w) =>
          w.approvalStatus === 'Approved' ||
          w.verificationStatus === 'Approved' ||
          w.accountStatus === 'Active' ||
          w.status === 'Active' ||
          w.status === 'Approved'
      ).length,
    [cleanWorkforceRoster]
  );
  const availableTalentCount = useMemo(
    () =>
      cleanWorkforceRoster.filter(
        (w) =>
          (w.approvalStatus === 'Approved' ||
            w.verificationStatus === 'Approved' ||
            w.accountStatus === 'Active' ||
            w.status === 'Active' ||
            w.status === 'Approved') &&
          (w.availabilityStatus === 'Available' ||
            w.availability === 'Available' ||
            w.availabilityStatus === 'Immediate' ||
            w.availability === 'Immediate')
      ).length,
    [cleanWorkforceRoster]
  );

  // Filtered Workforce List
  const filteredWorkforce = useMemo(() => {
    return cleanWorkforceRoster.filter((member) => {
      const isMemberPending =
        member.approvalStatus === 'Pending Review' ||
        member.approvalStatus === 'Pending' ||
        member.verificationStatus === 'Pending' ||
        member.status === 'Pending Review' ||
        member.status === 'Pending';
      const isMemberApproved =
        member.approvalStatus === 'Approved' ||
        member.verificationStatus === 'Approved' ||
        member.accountStatus === 'Active' ||
        member.status === 'Active' ||
        member.status === 'Approved';
      const isMemberRejected =
        member.approvalStatus === 'Rejected' ||
        member.verificationStatus === 'Rejected' ||
        member.status === 'Rejected';

      // Tab Filtering
      if (activeTab === 'active' && !isMemberApproved) return false;
      if (activeTab === 'pending' && !isMemberPending) return false;

      // Role Type Filtering
      if (roleTypeFilter !== 'all') {
        const isFreelancer =
          member.roleType === 'Freelancer' ||
          member.source === 'Freelancer' ||
          member.source === 'Freelancer Registration' ||
          member.professionalType === 'FREELANCER' ||
          !member.partnerCompanyId;
        if (roleTypeFilter === 'Freelancer' && !isFreelancer) return false;
        if (roleTypeFilter === 'Professional' && isFreelancer) return false;
      }

      // Skill Filtering
      if (selectedSkill !== 'all') {
        const skillsArr = Array.isArray(member.skills) ? member.skills : (typeof member.skills === 'string' ? member.skills.split(',').map(s=>s.trim()) : []);
        if (!skillsArr.includes(selectedSkill)) return false;
      }

      // Search Query Filtering
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameStr = (member.name || member.pseudonym || '').toLowerCase();
        const titleStr = (member.title || member.role || '').toLowerCase();
        const partnerStr = (member.partnerName || '').toLowerCase();
        const emailStr = (member.email || '').toLowerCase();
        const matchesName = nameStr.includes(q);
        const matchesTitle = titleStr.includes(q);
        const matchesPartner = partnerStr.includes(q);
        const matchesEmail = emailStr.includes(q);
        const matchesSkills = Array.isArray(member.skills)
          ? member.skills.some((s) => String(s).toLowerCase().includes(q))
          : typeof member.skills === 'string'
          ? member.skills.toLowerCase().includes(q)
          : false;
        if (!matchesName && !matchesTitle && !matchesPartner && !matchesEmail && !matchesSkills) return false;
      }

      return true;
    });
  }, [cleanWorkforceRoster, activeTab, roleTypeFilter, selectedSkill, searchQuery]);

  // Handle Admin Decision: Accept
  const handleAdminAccept = (member) => {
    approveWorkforceMember(member.id);
    const sourceLabel = member.source === 'Partner Company' ? `from partner "${member.partnerName}"` : '(Independent Freelancer)';
    toast.success(`Candidate ${member.name} ${sourceLabel} was Approved and added to the active talent pool.`);
    if (selectedTalent?.id === member.id) setSelectedTalent(null);
  };

  // Handle Admin Decision: Reject Confirm
  const handleAdminRejectConfirm = () => {
    if (!rejectionModalTalent) return;
    rejectWorkforceMember(rejectionModalTalent.id, rejectionReason);
    toast.info(`Candidate submission for ${rejectionModalTalent.name} was rejected.`);
    setRejectionModalTalent(null);
    if (selectedTalent?.id === rejectionModalTalent.id) setSelectedTalent(null);
  };

  // Handle Admin Delete Candidate
  const handleDeleteWorkforceMember = (member) => {
    if (!member) return;
    if (window.confirm(`Are you sure you want to remove ${member.name} from the workforce roster?`)) {
      deleteWorkforceMember(member);
      toast.success(`Removed ${member.name} from workforce.`);
      if (selectedTalent?.id === member.id) setSelectedTalent(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* PAGE HEADER */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#191b23] dark:text-white tracking-tight">
              Workforce Management
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 text-xs font-bold text-[#004ac6] dark:text-blue-400 border border-blue-200 dark:border-blue-800/40">
              Admin Review & Approvals
            </span>
          </div>
          <p className="mt-1 text-xs text-[#565e74] dark:text-slate-400">
            Review candidate applications submitted by Partner Companies and Independent Freelancers, and authorize them into the talent pool.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* KPI METRIC CARDS OVERVIEW */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14132b] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Talent Pool</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{activeTalentCount}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-amber-50/40 dark:bg-amber-950/40 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-300">Pending Approvals</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-900 dark:text-amber-200">{pendingCount}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14132b] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Available Talent</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {availableTalentCount}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14132b] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Workforce Pool</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Code2 size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{cleanWorkforceRoster.length}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PENDING APPROVALS NOTIFICATION BANNER (IF ANY) */}
      {/* ========================================================================= */}
      {pendingCount > 0 && activeTab !== 'pending' && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950">
                {pendingCount} Talent Application{pendingCount > 1 ? 's' : ''} Awaiting Admin Decision
              </h4>
              <p className="text-[11px] text-amber-800">
                Review candidate skill competencies and approve them into the active talent pool for project matching.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all self-end sm:self-auto"
          >
            Review & Decide ({pendingCount})
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-[#2563eb] text-white shadow-xs'
              : 'text-[#565e74] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
          }`}
        >
          <Users size={15} />
          <span>All Records ({cleanWorkforceRoster.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'active'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-[#565e74] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
          }`}
        >
          <CheckCircle2 size={15} />
          <span>Active Talent Pool ({activeTalentCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'pending'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-[#565e74] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
          }`}
        >
          <Clock size={15} />
          <span>Pending Admin Review</span>
          {pendingCount > 0 && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                activeTab === 'pending' ? 'bg-white text-amber-700' : 'bg-amber-500 text-white'
              }`}
            >
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('freelancer-applications')}
          className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'freelancer-applications'
              ? 'bg-[#7c3aed] text-white shadow-xs'
              : 'text-[#565e74] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
          }`}
        >
          <Sparkles size={15} />
          <span>Freelancer Applications</span>
          {(activeFreelancerApplications || []).filter((a) => a.status === 'Pending Admin Approval').length > 0 && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                activeTab === 'freelancer-applications' ? 'bg-white text-purple-700' : 'bg-[#7c3aed] text-white'
              }`}
            >
              {(activeFreelancerApplications || []).filter((a) => a.status === 'Pending Admin Approval').length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rejected')}
          className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'rejected'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-[#565e74] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
          }`}
        >
          <X size={15} />
          <span>Rejected Workforce</span>
          {rejectedRecords.length > 0 && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                activeTab === 'rejected' ? 'bg-white text-rose-700' : 'bg-rose-500 text-white'
              }`}
            >
              {rejectedRecords.length}
            </span>
          )}
        </button>

      </div>

      {/* ========================================================================= */}
      {/* FILTER CONTROLS BAR */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-[#14132b] p-4 rounded-xl border border-[#c3c6d7]/70 dark:border-white/10 shadow-xs">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, role, partner company, or skill..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <FilterDropdown
            label="Type"
            value={roleTypeFilter}
            onChange={setRoleTypeFilter}
            options={[
              { value: 'all', label: 'All Role Types' },
              { value: 'Professional', label: 'Partner Staff (Pros)' },
              { value: 'Freelancer', label: 'Independent Freelancers' },
            ]}
          />


          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-[#c3c6d7]/80 dark:border-white/15 bg-slate-100 dark:bg-[#1c1a36] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#2563eb] shadow-xs text-[#004ac6] dark:text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-[#2563eb] shadow-xs text-[#004ac6] dark:text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Table View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* WORKFORCE GRID / TABLE VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'rejected' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Rejected Workforce & Declined Candidates ({rejectedRecords.length})</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Talent and freelancer submissions declined during administrative review. Stored separately from the active workforce pool.
              </p>
            </div>
          </div>

          {rejectedRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#c3c6d7] dark:border-white/10 bg-white dark:bg-[#14132b] p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mb-3">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Rejected Workforce Records</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                There are currently no declined candidate applications. All candidate submissions are either active or awaiting decision.
              </p>
            </div>
          ) : filteredRejectedRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#c3c6d7] dark:border-white/10 bg-white dark:bg-[#14132b] p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-400 flex items-center justify-center mb-3">
                <FolderSearch size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">No rejected candidates match your filters</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                Try clearing your search query or adjusting role type filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRejectedRecords.map((talent) => (
                <div
                  key={talent.id || talent.email}
                  className="rounded-3xl border border-rose-200 dark:border-rose-900/40 bg-white dark:bg-[#16152B] p-5 shadow-xs flex flex-col justify-between hover:border-rose-300 transition-all"
                >
                  <div className="space-y-3.5">
                    {/* Top Bar: Source & Rejected Badge */}
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-rose-100 dark:border-white/10">
                      <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-md text-[11px] font-bold">
                        <Code2 size={12} className="shrink-0" />
                        <span>{talent.source || 'Independent Freelancer'}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800 text-[10px] font-extrabold">
                        <X size={11} className="shrink-0" />
                        <span>Rejected</span>
                      </span>
                    </div>

                    {/* Candidate Identity */}
                    <div className="flex items-start gap-3.5">
                      <UserAvatar
                        src={talent.avatar || talent.personalDetails?.avatarUrl}
                        name={talent.name}
                        size="md"
                        className="w-12 h-12 rounded-xl shrink-0 grayscale opacity-80"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{talent.name}</h3>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">{talent.title}</p>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <span>{talent.experience}</span>
                          <span>•</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{talent.hourlyRate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Rejection Reason Notice */}
                    <div className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/40 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                        <AlertCircle size={13} className="text-rose-600 shrink-0" />
                        <span>Decline Reason</span>
                      </div>
                      <p className="text-xs text-rose-900 dark:text-rose-200 italic font-medium leading-relaxed">
                        "{talent.rejectionReason || 'Declined by Administrator'}"
                      </p>
                    </div>

                    {/* Contact Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                      <div className="truncate">
                        <span className="text-slate-400 text-[10px] font-bold block">Email</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block" title={talent.email}>{talent.email}</span>
                      </div>
                      <div className="truncate">
                        <span className="text-slate-400 text-[10px] font-bold block">Phone</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">{talent.phone || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Skills */}
                    {Array.isArray(talent.skills) && talent.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {talent.skills.slice(0, 5).map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-[11px] font-medium"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions: View Details, Restore / Approve, Remove */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 space-y-2">
                    <button
                      type="button"
                      onClick={() => handleOpenTalentDetails(talent)}
                      className="w-full py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>View Full Profile</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (talent.appId || talent.isFromApp) {
                            approveFreelancerApplication(talent.appId || talent.id);
                          }
                          approveWorkforceMember(talent.id);
                          toast.success(`Re-evaluated & Approved ${talent.name}! Restored to active talent pool.`);
                        }}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check size={13} />
                        <span>Re-evaluate & Approve</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteWorkforceMember(talent)}
                        className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 font-bold text-xs transition-colors cursor-pointer"
                        title="Delete record permanently"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'freelancer-applications' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Submitted Freelancer Applications ({activeFreelancerApplications.length})
            </h3>
            <span className="text-xs text-slate-500">
              Approve to add candidate to active workforce pool
            </span>
          </div>

          {activeFreelancerApplications.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#c3c6d7] bg-white p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#7c3aed] flex items-center justify-center mb-3">
                <Sparkles size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No Pending Freelancer Applications</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Applications submitted by independent freelancers via the Workforce login page will appear here for Admin approval.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeFreelancerApplications.map((app) => {
                const isPending = app.status === 'Pending Admin Approval';
                const isApproved = app.status === 'Approved';

                return (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-purple-300 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                        <UserAvatar
                          src={app.personalDetails?.avatarUrl || app.avatar}
                          name={app.fullName}
                          size="md"
                          className="w-12 h-12 rounded-2xl shrink-0"
                        />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-extrabold text-slate-900">{app.fullName}</h4>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                  isPending
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}
                              >
                                {app.status}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-[#7c3aed] mt-0.5">
                              {app.roleTitle || 'Freelancer Professional'}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                              <span className="flex items-center gap-1">
                                <MapPin size={13} className="text-slate-400" /> {app.personalDetails?.city || app.place || 'Remote'}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Briefcase size={13} className="text-slate-400" /> {app.experienceLevel || '3+ years'}
                              </span>
                              <span>•</span>
                              <span className="font-extrabold text-emerald-600">
                                ₹{typeof app.hourlyRate === 'number' ? app.hourlyRate.toFixed(2) : app.hourlyRate}/hr
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div>
                          <span className="text-slate-400 text-[10px] font-bold block">Contact Email</span>
                          <span className="font-semibold text-slate-800">{app.email}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] font-bold block">Phone Contact</span>
                          <span className="font-semibold text-slate-800">{app.phone || app.personalDetails?.phoneNumber || 'N/A'}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1.5">
                          Technical Skills
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {(app.skills || []).map((s) => (
                            <span
                              key={s}
                              className="px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200/60 text-xs font-bold"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setViewingAppModal(app)}
                        className="w-full text-center py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7c3aed] border border-purple-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <ExternalLink size={13} />
                        <span>View Full Application & Registration Details</span>
                      </button>
                    </div>

                    {isPending ? (
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            approveFreelancerApplication(app.id);
                            toast.success(`Approved ${app.fullName}! Added candidate to active workforce.`);
                          }}
                          className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
                        >
                          <Check size={14} />
                          <span>Approve Candidate</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            rejectFreelancerApplication(app.id);
                            toast.info(`Rejected application for ${app.fullName}. Moved to Rejected Workforce.`);
                          }}
                          className="flex-1 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
                        >
                          <X size={14} />
                          <span>Reject Application</span>
                        </button>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-slate-100 text-xs font-bold text-slate-500 flex justify-between items-center">
                        <span>Submitted on: {app.submittedAt}</span>
                        <span className="text-emerald-600">
                          Decision Finalized (Approved)
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : filteredWorkforce.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#c3c6d7] dark:border-white/10 bg-white dark:bg-[#14132b] p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-400 flex items-center justify-center mb-3">
            <FolderSearch size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No workforce resources match your criteria</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            Try adjusting your search keywords, role filters, or check the Pending Admin Review tab.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWorkforce.map((talent) => {
            const isPending =
              talent.approvalStatus === 'Pending Review' ||
              talent.approvalStatus === 'Pending' ||
              talent.verificationStatus === 'Pending' ||
              talent.status === 'Pending Review' ||
              talent.status === 'Pending' ||
              talent.accountStatus === 'Pending Review';
            const isRejected =
              talent.approvalStatus === 'Rejected' ||
              talent.verificationStatus === 'Rejected' ||
              talent.status === 'Rejected' ||
              talent.accountStatus === 'Rejected';

            return (
              <motion.div
                key={talent.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex flex-col justify-between rounded-2xl border bg-white dark:bg-[#14132b] p-5 shadow-xs hover:shadow-md transition-all ${
                  isPending
                    ? 'border-amber-300 dark:border-amber-500/40 ring-2 ring-amber-400/20 bg-amber-50/10 dark:bg-amber-950/20'
                    : isRejected
                    ? 'border-rose-200 dark:border-rose-900/40 bg-rose-50/10 dark:bg-rose-950/20 opacity-75'
                    : 'border-[#c3c6d7]/80 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500'
                }`}
              >
                <div>
                  {/* Top Bar: Source & Dual Status Badges (Availability & Approval) */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-white/10">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold">
                      {Boolean(talent.partnerCompanyId || talent.source === 'Partner Company' || talent.professionalType === 'PARTNER_EMPLOYEE' || getPartnerCompanyName(talent, partners, clients)) ? (
                        <span className="inline-flex items-center gap-1 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800/40 truncate max-w-[170px]" title={getPartnerCompanyName(talent, partners, clients) || talent.partnerCompany || 'Partner Company'}>
                          <Handshake size={12} className="shrink-0" />
                          <span className="truncate">{getPartnerCompanyName(talent, partners, clients) || talent.partnerCompany || 'Partner Company'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800/40">
                          <Code2 size={12} className="shrink-0" />
                          <span>Independent Freelancer</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {talent.availabilityStatus && !['available', 'immediate'].includes(String(talent.availabilityStatus).toLowerCase().trim()) && (
                        <StatusBadge
                          status={talent.availabilityStatus}
                          size="sm"
                          title="Live Status"
                        />
                      )}
                    </div>
                  </div>

                  {/* Candidate Identity */}
                  <div className="mt-3.5 flex items-start gap-3.5">
                    <UserAvatar
                      src={talent.avatar}
                      name={talent.name}
                      size="md"
                      className="w-12 h-12 rounded-xl shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{talent.name}</h3>
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 truncate">{talent.title}</p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>{talent.experience}</span>
                        <span>•</span>
                        <span className="font-bold text-slate-800 dark:text-white">{talent.hourlyRate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Assignment & Project Status Banner */}
                  {Boolean(talent.isCurrentlyWorking && talent.currentProject && talent.currentProject !== 'None' && talent.currentProject !== 'none') ? (
                    <div className="mt-3 p-2.5 rounded-xl bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 space-y-0.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 font-bold text-[#004ac6] dark:text-blue-400">
                          <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                          <span>Currently Working</span>
                        </div>
                        <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-900/60 px-1.5 py-0.5 rounded">
                          {talent.assignmentStatus || 'Assigned'}
                        </span>
                      </div>
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                        {talent.currentProjectName || talent.currentProject}
                      </div>
                      {talent.currentProjectClient && (
                        <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">
                          Client: {talent.currentProjectClient}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Assignment Status:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">None</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Current Project:</span>
                        <span className="font-semibold text-slate-500 dark:text-slate-400 italic">None</span>
                      </div>
                    </div>
                  )}

                  {/* Skills Tags */}
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {talent.skills?.slice(0, 4).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1c1a36] border border-slate-200/80 dark:border-white/10 text-[10px] font-semibold text-slate-700 dark:text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                    {(talent.skills?.length || 0) > 4 && (
                      <span className="text-[10px] text-slate-400 font-semibold self-center">
                        +{talent.skills.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Actions Area */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-white/10 space-y-2">
                  {/* Verification Details Button - ALWAYS SHOWN */}
                  <button
                    type="button"
                    onClick={() => handleOpenTalentDetails(talent)}
                    className="w-full text-center py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/80 dark:border-blue-800/40 text-xs font-bold text-[#004ac6] dark:text-blue-300 transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-98 cursor-pointer"
                  >
                    <Eye size={14} />
                    <span>View Verification Details</span>
                  </button>

                  {isPending ? (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center justify-between">
                        <span>Admin Decision Required</span>
                        <span>{talent.submittedDate || 'Pending'}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {/* ACCEPT BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleAdminAccept(talent)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                        >
                          <Check size={14} />
                          <span>Accept</span>
                        </button>

                        {/* REJECT BUTTON */}
                        <button
                          type="button"
                          onClick={() => setRejectionModalTalent(talent)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white dark:bg-white/10 border border-rose-300 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold shadow-2xs active:scale-95 transition-all cursor-pointer"
                        >
                          <X size={14} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => handleStartEditTalent(talent)}
                        className="text-[11px] font-bold text-slate-500 hover:text-[#004ac6] dark:hover:text-blue-400 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Pencil size={12} />
                        <span>Edit Profile</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteWorkforceMember(talent)}
                        className="text-[11px] font-bold text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Delete candidate"
                      >
                        <Trash2 size={13} />
                        <span>Remove</span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14132b] shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1a1835] text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3.5 px-4">User ID</th>
                  <th className="py-3.5 px-4">Talent Name & Title</th>
                  <th className="py-3.5 px-4">Source / Partner</th>
                  <th className="py-3.5 px-4">Hourly Rate</th>
                  <th className="py-3.5 px-4">Experience</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {filteredWorkforce.map((talent) => {
                  const isPending =
                    talent.approvalStatus === 'Pending Review' ||
                    talent.approvalStatus === 'Pending' ||
                    talent.verificationStatus === 'Pending' ||
                    talent.status === 'Pending Review' ||
                    talent.status === 'Pending' ||
                    talent.accountStatus === 'Pending Review';
                  return (
                    <tr key={talent.id} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                        #{talent.numericId || talent.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar src={talent.avatar} name={talent.name} size="sm" className="w-9 h-9 rounded-lg shrink-0" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{talent.name}</p>
                            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">{talent.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800 dark:text-slate-300">
                          {getPartnerCompanyName(talent, partners, clients) || talent.partnerCompany || (talent.partnerCompanyId || talent.source === 'Partner Company' || talent.professionalType === 'PARTNER_EMPLOYEE' ? 'Partner Company' : 'Independent Freelancer')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{talent.hourlyRate}</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{talent.experience}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {talent.availabilityStatus && !['available', 'immediate'].includes(String(talent.availabilityStatus).toLowerCase().trim()) ? (
                            <StatusBadge status={talent.availabilityStatus} size="sm" title="Live Status" />
                          ) : null}
                        </div>
                        <div className="mt-1.5 text-[11px]">
                          {Boolean(talent.isCurrentlyWorking && talent.currentProject && talent.currentProject !== 'None' && talent.currentProject !== 'none') ? (
                            <div className="font-bold text-blue-700 dark:text-blue-400">
                              Working: {talent.currentProjectName || talent.currentProject}
                              {talent.currentProjectClient ? ` (${talent.currentProjectClient})` : ''}
                            </div>
                          ) : (
                            <div className="text-slate-400 font-medium">Assignment: <span className="font-semibold text-slate-600 dark:text-slate-300">None</span></div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenTalentDetails(talent)}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#004ac6] dark:text-blue-300 text-[11px] font-bold hover:bg-blue-100 flex items-center gap-1 cursor-pointer"
                            >
                              <Eye size={12} />
                              <span>Details</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAdminAccept(talent)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs cursor-pointer"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectionModalTalent(talent)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-[11px] font-bold hover:bg-rose-100 cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenTalentDetails(talent)}
                              className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Eye size={12} />
                              <span>Details</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteWorkforceMember(talent)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Delete candidate"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CANDIDATE VERIFICATION & ADMIN DECISION MODAL */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* MODAL 1: VIEW VERIFICATION & PROFILE DETAILS */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(selectedTalent)}
        onClose={() => setSelectedTalent(null)}
        title="Candidate Profile & Full Verification Details"
        subtitle={selectedTalent?.title}
        maxWidth="max-w-3xl"
      >
        {selectedTalent && (() => {
          const isPendingDecision =
            selectedTalent.approvalStatus === 'Pending Review' ||
            selectedTalent.approvalStatus === 'Pending' ||
            selectedTalent.approvalStatus === 'Pending Admin Review' ||
            selectedTalent.verificationStatus === 'Pending' ||
            selectedTalent.status === 'Pending Review' ||
            selectedTalent.status === 'Pending' ||
            selectedTalent.status === 'Pending Admin Approval' ||
            selectedTalent.status === 'Pending Admin Review' ||
            selectedTalent.accountStatus === 'Pending Review';

          const isFreelancer =
            selectedTalent.roleType === 'Freelancer' ||
            selectedTalent.source === 'Freelancer' ||
            selectedTalent.source === 'Freelancer Registration' ||
            selectedTalent.source === 'Independent Freelancer' ||
            selectedTalent.professionalType === 'FREELANCER' ||
            (!selectedTalent.partnerCompanyId && !selectedTalent.partnerCompany && selectedTalent.source !== 'Partner Company');

          return (
            <div className="space-y-5">
              {/* Top Banner Card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <UserAvatar
                  src={selectedTalent.avatar}
                  name={selectedTalent.name}
                  size="lg"
                  className="w-16 h-16 rounded-xl shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">{selectedTalent.name}</h4>
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/40 shrink-0">
                      {selectedTalent.hourlyRate}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 truncate">{selectedTalent.title}</p>
                  <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                    {selectedTalent.availabilityStatus && !['available', 'immediate'].includes(String(selectedTalent.availabilityStatus).toLowerCase().trim()) && (
                      <StatusBadge status={selectedTalent.availabilityStatus} size="sm" title="Live Status" />
                    )}
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Status: <strong className={isPendingDecision ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
                        {selectedTalent.approvalStatus || selectedTalent.status || 'Active'}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal & Contact Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Recruitment Source</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                    {getPartnerCompanyName(selectedTalent, partners, clients) || selectedTalent?.partnerCompany || (selectedTalent?.partnerCompanyId || selectedTalent?.source === 'Partner Company' || selectedTalent?.professionalType === 'PARTNER_EMPLOYEE' ? 'Partner Company' : 'Independent Freelancer')}
                  </p>
                </div>
                {!isFreelancer && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Company Staff Badge ID</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                      {selectedTalent.staffBadgeId || selectedTalent.employeeId || selectedTalent.companyId || (
                        <span className="text-slate-400 font-normal italic">Not assigned</span>
                      )}
                    </p>
                  </div>
                )}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Experience</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedTalent.experience || 'Not specified'}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Location</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">{selectedTalent.location || 'Remote'}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Email Address</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate" title={selectedTalent.email}>{selectedTalent.email || 'Not provided'}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone Number</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">{selectedTalent.phone || <span className="text-slate-400 font-normal italic">Not provided</span>}</p>
                </div>
              </div>

              {/* Category & Technical Specialties */}
              {(selectedTalent.category || (Array.isArray(selectedTalent.specialties) && selectedTalent.specialties.length > 0)) && (
                <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-800/40 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-900 dark:text-purple-300">
                      Primary Domain: {selectedTalent.category || 'Web, Mobile & Software Dev'}
                    </span>
                  </div>
                  {Array.isArray(selectedTalent.specialties) && selectedTalent.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTalent.specialties.map((spec, i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 text-[11px] font-bold border border-purple-200 dark:border-purple-700">
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Professional Bio & Overview */}
              {(selectedTalent.bio || selectedTalent.bioOverview) && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 space-y-1.5">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Professional Bio & Overview
                  </h5>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {selectedTalent.bio || selectedTalent.bioOverview}
                  </p>
                </div>
              )}

              {/* Quick Onboarding Responses & Freelancer Preferences */}
              {(selectedTalent.experienceLevel || selectedTalent.freelanceGoal || (Array.isArray(selectedTalent.workPreferences) && selectedTalent.workPreferences.length > 0) || selectedTalent.openToContractToHire !== undefined) && (
                <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                      <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
                      <span>Onboarding Quick Questions & Working Preferences</span>
                    </h5>
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-700">
                      Applicant Survey
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* 1. Prior Freelancing Experience */}
                    <div className="p-3 rounded-xl bg-white dark:bg-[#16152B] border border-indigo-100 dark:border-white/10 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">1. Prior Freelancing Experience</span>
                      <div className="flex items-center gap-2">
                        <Briefcase size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span className="font-bold text-slate-800 dark:text-slate-100">
                          {selectedTalent.experienceLevel || 'I have some experience'}
                        </span>
                      </div>
                    </div>

                    {/* 2. Primary Freelance Goal */}
                    <div className="p-3 rounded-xl bg-white dark:bg-[#16152B] border border-indigo-100 dark:border-white/10 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">2. Primary Freelancing Goal</span>
                      <div className="flex items-center gap-2">
                        <Star size={14} className="text-amber-500 shrink-0" />
                        <span className="font-bold text-slate-800 dark:text-slate-100">
                          {selectedTalent.freelanceGoal || 'To earn my main income'}
                        </span>
                      </div>
                    </div>

                    {/* 3. Work Preferences */}
                    <div className="p-3 rounded-xl bg-white dark:bg-[#16152B] border border-indigo-100 dark:border-white/10 space-y-1 sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">3. Preferred Ways of Working & Contracting</span>
                        {selectedTalent.openToContractToHire !== false && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                            Open to Contract-to-Hire
                          </span>
                        )}
                      </div>
                      {Array.isArray(selectedTalent.workPreferences) && selectedTalent.workPreferences.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {selectedTalent.workPreferences.map((pref, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-100/70 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 text-xs font-bold border border-indigo-200 dark:border-indigo-800/40">
                              <CheckCircle2 size={12} className="text-indigo-600 dark:text-indigo-400" />
                              <span>{pref}</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic font-medium">Standard Talent Marketplace bidding</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Verification Documents & Credentials */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1a36] border border-slate-200 dark:border-white/10 space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Credentials & Verification Documents
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* 1. Resume / CV */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="truncate">
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Resume / CV Document</p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {selectedTalent.resumeName || (selectedTalent.resumeUrl || selectedTalent.resume ? 'Resume Attached' : 'Not uploaded')}
                        </p>
                      </div>
                    </div>
                    {Boolean(selectedTalent.resumeUrl || selectedTalent.resume) ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewResumeModal({
                              url: selectedTalent.resumeUrl || selectedTalent.resume,
                              title: `${selectedTalent.name} - Resume / CV Document`,
                              name: selectedTalent.resumeName || `${selectedTalent.name}_Resume.pdf`,
                            })
                          }
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye size={11} />
                          <span>Preview</span>
                        </button>
                        <a
                          href={selectedTalent.resumeUrl || selectedTalent.resume}
                          download={selectedTalent.resumeName || `${selectedTalent.name}_Resume.pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 text-[10px] font-bold transition-colors"
                          title="Download Resume Document"
                        >
                          <Download size={11} />
                        </a>
                      </div>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-[10px] font-medium text-slate-400 shrink-0">
                        Not uploaded
                      </span>
                    )}
                  </div>

                  {/* 2. Staff ID Badge Proof */}
                  {!isFreelancer && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <ShieldCheck size={16} />
                        </div>
                        <div className="truncate">
                          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Staff ID Badge</p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {selectedTalent.staffBadgeName || selectedTalent.badgeDocumentName || (selectedTalent.staffBadgeUrl ? 'Badge Attached' : 'Not uploaded')}
                          </p>
                        </div>
                      </div>
                      {Boolean(selectedTalent.staffBadgeUrl || selectedTalent.badgeDocumentUrl) ? (
                        <button
                          type="button"
                          onClick={() => handleOpenDocument(selectedTalent.staffBadgeUrl || selectedTalent.badgeDocumentUrl, `${selectedTalent.name}_Staff_Badge`)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold text-[10px] hover:bg-blue-100 dark:hover:bg-blue-900 shrink-0 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <ExternalLink size={11} />
                          <span>View</span>
                        </button>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-[10px] font-medium text-slate-400 shrink-0">
                          Not uploaded
                        </span>
                      )}
                    </div>
                  )}

                  {/* 3. LinkedIn Profile & PDF */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-[#0a66c2]/10 text-[#0a66c2] flex items-center justify-center font-bold text-xs shrink-0">
                        in
                      </div>
                      <div className="truncate">
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">LinkedIn Profile</p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {selectedTalent.linkedin ? selectedTalent.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, '@') : 'Not provided'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {selectedTalent.linkedin && (
                        <a
                          href={selectedTalent.linkedin.startsWith('http') ? selectedTalent.linkedin : `https://${selectedTalent.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-[#0a66c2]/10 text-[#0a66c2] font-bold text-[10px] hover:bg-[#0a66c2]/20 flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink size={11} />
                          <span>Open</span>
                        </a>
                      )}
                      {selectedTalent.linkedInPdfUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewResumeModal({
                              url: selectedTalent.linkedInPdfUrl,
                              title: `${selectedTalent.name} - LinkedIn PDF Profile`,
                              name: selectedTalent.linkedInPdfName || 'LinkedIn_Profile.pdf',
                            })
                          }
                          className="px-2 py-1 rounded-lg bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-700"
                          title="Preview LinkedIn PDF Export"
                        >
                          PDF
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 4. GitHub / Portfolio */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                        <Code2 size={16} />
                      </div>
                      <div className="truncate">
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">GitHub Profile</p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {selectedTalent.github ? selectedTalent.github.replace(/^https?:\/\/(www\.)?github\.com\//i, '@') : 'Not provided'}
                        </p>
                      </div>
                    </div>
                    {selectedTalent.github ? (
                      <a
                        href={selectedTalent.github.startsWith('http') ? selectedTalent.github : `https://${selectedTalent.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-bold text-[10px] hover:bg-slate-200 dark:hover:bg-white/20 shrink-0 flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink size={11} />
                        <span>Open</span>
                      </a>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-[10px] font-medium text-slate-400 shrink-0">
                        Not provided
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Technical Competencies (Skills) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Technical Competencies & Skills
                  </h5>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {selectedTalent.skills?.length || 0} skills verified
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTalent.skills?.map((skill, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/40 text-xs font-bold text-blue-800 dark:text-blue-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Employment History & Experience */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Employment History & Work Experience
                  </h5>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {Array.isArray(selectedTalent.experiences) ? selectedTalent.experiences.length : 0} positions
                  </span>
                </div>
                {Array.isArray(selectedTalent.experiences) && selectedTalent.experiences.length > 0 ? (
                  <div className="space-y-2.5">
                    {selectedTalent.experiences.map((exp, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 space-y-1.5">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h6 className="font-extrabold text-xs text-slate-900 dark:text-white">{exp.title}</h6>
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400">{exp.company} {exp.location ? `• ${exp.location}` : ''}</p>
                          </div>
                          <span className="text-[11px] font-bold text-slate-500 bg-white dark:bg-white/10 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-white/10 shrink-0">
                            {exp.period || exp.dates}
                          </span>
                        </div>
                        {exp.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                            {exp.description}
                          </p>
                        )}
                        {exp.documentName && (
                          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-[11px]">
                            <FileCheck size={13} className="text-emerald-600" />
                            <span>Attached Proof: {exp.documentName}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                    No individual employment records submitted. Commercial experience: {selectedTalent.experience || 'Not specified'}.
                  </p>
                )}
              </div>

              {/* Education & Academic Qualifications */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Education & Academic Qualifications
                  </h5>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {Array.isArray(selectedTalent.educations) ? selectedTalent.educations.length : 0} degrees/schools
                  </span>
                </div>
                {Array.isArray(selectedTalent.educations) && selectedTalent.educations.length > 0 ? (
                  <div className="space-y-2">
                    {selectedTalent.educations.map((edu, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 flex justify-between items-center text-xs">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                            <GraduationCap size={16} />
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white">{edu.degree}</p>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">{edu.school}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-white dark:bg-white/10 px-2 py-0.5 rounded border border-slate-200 dark:border-white/10 shrink-0">
                          {edu.year || edu.dates || 'Completed'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                    No academic degree records attached.
                  </p>
                )}
              </div>

              {/* Certifications & Licenses */}
              {Array.isArray(selectedTalent.certifications) && selectedTalent.certifications.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Certifications & Professional Credentials
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedTalent.certifications.map((cert, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 flex items-center gap-2">
                        <Award size={15} className="text-amber-500 shrink-0" />
                        <span className="text-xs font-bold text-slate-800 dark:text-white">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages & Fluency */}
              {Array.isArray(selectedTalent.languages) && selectedTalent.languages.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Languages & Fluency
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedTalent.languages.map((lang, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-white">{lang.name}</span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                          {lang.proficiency}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Decision Action Banner when candidate is pending */}
              {isPendingDecision && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400" />
                      <span>Admin Decision Required</span>
                    </h5>
                    <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                      Full verification review complete
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        handleAdminAccept(selectedTalent);
                        setSelectedTalent(null);
                      }}
                      className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Check size={16} />
                      <span>Accept Candidate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const target = selectedTalent;
                        setSelectedTalent(null);
                        setRejectionModalTalent(target);
                      }}
                      className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <X size={16} />
                      <span>Reject Request</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Modal Footer / Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteWorkforceMember(selectedTalent)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Remove Candidate</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTalent(null)}
                  className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-white/20 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ========================================================================= */}
      {/* EDIT EMPLOYEE PROFILE MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(editingTalent)}
        onClose={() => setEditingTalent(null)}
        title="Edit Employee Profile"
        subtitle={`Update profile details for ${editingTalent?.name || 'Employee'}`}
        maxWidth="max-w-xl"
      >
        {editingTalent && (
          <form onSubmit={handleSaveEditTalent} className="space-y-4">
            {/* Profile Avatar Upload & Preview Section */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1c1a36] border border-slate-200 dark:border-white/10 space-y-3">
              <label className="block text-xs font-bold text-[#434655] dark:text-slate-300">
                Profile Photo / Avatar
              </label>
              <div className="flex items-center gap-4">
                <UserAvatar
                  src={editTalentForm.avatar}
                  name={editTalentForm.name}
                  size="xl"
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/30 shadow-md shrink-0"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all">
                      <Download size={13} className="rotate-180" />
                      <span>Upload New Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error('Image size must be less than 5MB');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setEditTalentForm((prev) => ({
                                ...prev,
                                avatar: event.target.result,
                              }));
                              toast.info('New photo loaded! Click Save Changes to apply.');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    {editTalentForm.avatar && (
                      <button
                        type="button"
                        onClick={() => setEditTalentForm((prev) => ({ ...prev, avatar: '' }))}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Or paste image URL (https://...)"
                    value={editTalentForm.avatar || ''}
                    onChange={(e) => setEditTalentForm((prev) => ({ ...prev, avatar: e.target.value }))}
                    className="w-full rounded-lg border border-[#c3c6d7] dark:border-white/15 bg-white dark:bg-[#14132b] px-3 py-1.5 text-xs text-[#191b23] dark:text-white placeholder-slate-400 outline-none focus:border-[#004ac6]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormInput
                label="Full Name"
                name="name"
                value={editTalentForm.name}
                onChange={(e) => setEditTalentForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
              <FormInput
                label="Job Title / Role"
                name="title"
                value={editTalentForm.title}
                onChange={(e) => setEditTalentForm((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
              <FormInput
                label="Hourly Billing Rate"
                name="hourlyRate"
                value={editTalentForm.hourlyRate}
                onChange={(e) => setEditTalentForm((prev) => ({ ...prev, hourlyRate: e.target.value }))}
                placeholder="$85/hr"
                required
              />
              <FormInput
                label="Experience"
                name="experience"
                value={editTalentForm.experience}
                onChange={(e) => setEditTalentForm((prev) => ({ ...prev, experience: e.target.value }))}
                placeholder="3+ Years"
              />
              <FormInput
                label="Work Email"
                name="email"
                type="email"
                value={editTalentForm.email}
                onChange={(e) => setEditTalentForm((prev) => ({ ...prev, email: e.target.value }))}
              />
              <FormInput
                label="Phone Number"
                name="phone"
                value={editTalentForm.phone}
                onChange={(e) => setEditTalentForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
              <FormInput
                label="Location / City"
                name="location"
                value={editTalentForm.location}
                onChange={(e) => setEditTalentForm((prev) => ({ ...prev, location: e.target.value }))}
              />
              <FormInput
                label="Availability Status"
                name="availability"
                type="select"
                value={editTalentForm.availability}
                onChange={(e) => setEditTalentForm((prev) => ({ ...prev, availability: e.target.value }))}
                options={[
                  { value: 'Available', label: 'Available' },
                  { value: 'Assigned', label: 'Assigned (On Project)' },
                  { value: 'Onboarding', label: 'Onboarding' },
                  { value: 'Inactive', label: 'Inactive' },
                ]}
              />
              {!(
                editingTalent?.roleType === 'Freelancer' ||
                editingTalent?.source === 'Freelancer' ||
                editingTalent?.source === 'Independent Freelancer' ||
                editingTalent?.professionalType === 'FREELANCER' ||
                (!editingTalent?.partnerCompanyId && !editingTalent?.partnerCompany && editingTalent?.source !== 'Partner Company')
              ) && (
                <FormInput
                  label="Company Staff Badge ID"
                  name="staffBadgeId"
                  value={editTalentForm.staffBadgeId || ''}
                  onChange={(e) => setEditTalentForm((prev) => ({ ...prev, staffBadgeId: e.target.value }))}
                  placeholder="e.g. EMP-1049"
                />
              )}
              <FormInput
                label="LinkedIn Profile URL"
                name="linkedin"
                value={editTalentForm.linkedin || ''}
                onChange={(e) => setEditTalentForm((prev) => ({ ...prev, linkedin: e.target.value }))}
                placeholder="https://linkedin.com/in/username"
              />
              <FormInput
                label="GitHub Profile URL"
                name="github"
                value={editTalentForm.github || ''}
                onChange={(e) => setEditTalentForm((prev) => ({ ...prev, github: e.target.value }))}
                placeholder="https://github.com/username"
              />
            </div>

            {/* Document Uploads: Staff Badge & Resume */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {!(
                editingTalent?.roleType === 'Freelancer' ||
                editingTalent?.source === 'Freelancer' ||
                editingTalent?.source === 'Independent Freelancer' ||
                editingTalent?.professionalType === 'FREELANCER' ||
                (!editingTalent?.partnerCompanyId && !editingTalent?.partnerCompany && editingTalent?.source !== 'Partner Company')
              ) && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Staff ID Badge Proof
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all">
                      <Download size={13} className="rotate-180" />
                      <span>{editTalentForm.staffBadgeUrl ? 'Change File' : 'Upload Badge'}</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              setEditTalentForm((prev) => ({
                                ...prev,
                                staffBadgeUrl: evt.target.result,
                                staffBadgeName: file.name,
                              }));
                              toast.info(`Staff badge "${file.name}" attached.`);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    {editTalentForm.staffBadgeUrl && (
                      <button
                        type="button"
                        onClick={() => setEditTalentForm((prev) => ({ ...prev, staffBadgeUrl: '', staffBadgeName: '' }))}
                        className="text-xs text-rose-500 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {editTalentForm.staffBadgeName && (
                    <p className="text-[11px] text-slate-500 truncate">{editTalentForm.staffBadgeName}</p>
                  )}
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Resume / Curriculum Vitae
                </label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all">
                    <Download size={13} className="rotate-180" />
                    <span>{editTalentForm.resumeUrl ? 'Change File' : 'Upload Resume'}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            setEditTalentForm((prev) => ({
                              ...prev,
                              resumeUrl: evt.target.result,
                              resumeName: file.name,
                            }));
                            toast.info(`Resume "${file.name}" attached.`);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  {editTalentForm.resumeUrl && (
                    <button
                      type="button"
                      onClick={() => setEditTalentForm((prev) => ({ ...prev, resumeUrl: '', resumeName: '' }))}
                      className="text-xs text-rose-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {editTalentForm.resumeName && (
                  <p className="text-[11px] text-slate-500 truncate">{editTalentForm.resumeName}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#434655] dark:text-slate-300">
                Technical Skills (comma-separated)
              </label>
              <input
                type="text"
                value={editTalentForm.skills}
                onChange={(e) => setEditTalentForm((prev) => ({ ...prev, skills: e.target.value }))}
                placeholder="React.js, Node.js, Python, TypeScript"
                className="w-full rounded-lg border border-[#c3c6d7] dark:border-white/15 bg-white dark:bg-[#1c1a36] px-3 py-2 text-xs text-[#191b23] dark:text-white placeholder-slate-400 outline-none focus:border-[#004ac6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#434655] dark:text-slate-300">
                Professional Bio / Summary
              </label>
              <textarea
                rows={3}
                value={editTalentForm.bio}
                onChange={(e) => setEditTalentForm((prev) => ({ ...prev, bio: e.target.value }))}
                placeholder="Short bio or candidate overview..."
                className="w-full rounded-lg border border-[#c3c6d7] dark:border-white/15 bg-white dark:bg-[#1c1a36] px-3 py-2 text-xs text-[#191b23] dark:text-white placeholder-slate-400 outline-none focus:border-[#004ac6]"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingTalent(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/15 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* FREELANCER APPLICATION FULL DETAILS MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(viewingAppModal)}
        onClose={() => setViewingAppModal(null)}
        title="Freelancer Registration Profile Details"
        subtitle={viewingAppModal?.roleTitle || viewingAppModal?.fullName}
        maxWidth="max-w-2xl"
      >
        {viewingAppModal && (
          <div className="space-y-6 text-xs text-slate-700 dark:text-slate-200">
            {/* Header Profile Summary */}
            <div className="flex items-start justify-between p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40">
              <div className="flex items-start gap-4">
                <UserAvatar
                  src={viewingAppModal.personalDetails?.avatarUrl || viewingAppModal.avatar}
                  name={viewingAppModal.fullName}
                  size="lg"
                  className="w-16 h-16 rounded-2xl shrink-0"
                />
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{viewingAppModal.fullName}</h4>
                  <p className="text-xs font-bold text-[#7c3aed] dark:text-purple-300">{viewingAppModal.roleTitle || 'Full Stack Engineer'}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                      {viewingAppModal.status}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                      Proposed Rate: ₹{typeof viewingAppModal.hourlyRate === 'number' ? viewingAppModal.hourlyRate.toFixed(2) : viewingAppModal.hourlyRate}/hr
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <span>Submitted Date: </span>
                <span className="font-bold text-slate-800 dark:text-white">{viewingAppModal.submittedAt}</span>
              </div>
            </div>

            {/* Personal Overview / Bio */}
            {viewingAppModal.bioOverview && (
              <div className="space-y-1">
                <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Personal Overview / Professional Bio</h5>
                <p className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1c1a36] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 italic leading-relaxed">
                  "{viewingAppModal.bioOverview}"
                </p>
              </div>
            )}

            {/* Contact & Personal Address Details */}
            <div className="space-y-2">
              <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Contact, DOB & Location Information</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#1c1a36] border border-slate-200 dark:border-white/10">
                <div>
                  <span className="text-slate-400 font-bold text-[10px] block">Work / Personal Email</span>
                  <span className="font-bold text-slate-900 dark:text-white">{viewingAppModal.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold text-[10px] block">Phone Contact</span>
                  <span className="font-bold text-slate-900 dark:text-white">{viewingAppModal.phone || viewingAppModal.personalDetails?.phoneNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold text-[10px] block">Date of Birth (DOB)</span>
                  <span className="font-bold text-slate-900 dark:text-white">{viewingAppModal.personalDetails?.dob || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold text-[10px] block">Experience Level & Goal</span>
                  <span className="font-bold text-slate-900 dark:text-white">{viewingAppModal.experienceLevel || 'Expert'} • {viewingAppModal.freelanceGoal || 'Freelance'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold text-[10px] block">Street Address</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {viewingAppModal.personalDetails?.streetAddress || ''} {viewingAppModal.personalDetails?.aptSuite || ''}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold text-[10px] block">City, State, Country & Zip</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {viewingAppModal.personalDetails?.city || viewingAppModal.place || 'Bengaluru'}, {viewingAppModal.personalDetails?.state || ''} {viewingAppModal.personalDetails?.country || 'India'} ({viewingAppModal.personalDetails?.zipCode || ''})
                  </span>
                </div>
              </div>
            </div>

            {/* Category & Technical Skills */}
            <div className="space-y-2">
              <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Category & Technical Skills</h5>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1c1a36] border border-slate-200 dark:border-white/10 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold text-xs">
                    {viewingAppModal.category}
                  </span>
                  {(viewingAppModal.specialties || []).map((sp) => (
                    <span key={sp} className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold text-xs border border-indigo-200 dark:border-indigo-800">
                      {sp}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(viewingAppModal.skills || []).map((s) => (
                    <span key={s} className="px-2.5 py-0.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-bold text-xs border border-purple-200 dark:border-purple-800">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Imported Documents & Method */}
            <div className="space-y-2">
              <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Profile Import Method & Verification Documents</h5>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1c1a36] border border-slate-200 dark:border-white/10 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 dark:border-white/10">
                  <span className="text-slate-500 dark:text-slate-400 font-bold">Import Method Selected:</span>
                  <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-extrabold text-xs border border-purple-200 dark:border-purple-800">
                    {viewingAppModal.importMethod || 'Fill out manually'}
                  </span>
                </div>

                {/* Resume Document Card */}
                {viewingAppModal.resumeFileName && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#7c3aed] text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white">Candidate Resume Document</p>
                        <p className="text-[11px] text-purple-700 dark:text-purple-300 font-medium">
                          {viewingAppModal.resumeFileName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const url = viewingAppModal.resumeUrl || viewingAppModal.resume;
                          if (url) {
                            setPreviewResumeModal({
                              url,
                              title: `${viewingAppModal.fullName} - Resume Document`,
                              name: viewingAppModal.resumeFileName || 'Resume.pdf',
                            });
                          } else {
                            toast.info(`Candidate resume document: ${viewingAppModal.resumeFileName}`);
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-[11px] font-bold shadow-xs flex items-center gap-1.5 transition-all"
                      >
                        <Eye size={13} />
                        <span>Preview Resume</span>
                      </button>
                      {viewingAppModal.resumeUrl && (
                        <a
                          href={viewingAppModal.resumeUrl}
                          download={viewingAppModal.resumeFileName || `${viewingAppModal.fullName}_Resume.pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 text-slate-800 dark:text-white text-[11px] font-bold flex items-center gap-1"
                          title="Download PDF"
                        >
                          <Download size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* LinkedIn Profile Link Card */}
                {viewingAppModal.linkedin && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#0a66c2] text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                        <FaLinkedin size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white">LinkedIn Profile</p>
                        <p className="text-[11px] text-blue-700 dark:text-blue-300 font-medium truncate max-w-[280px]">
                          {viewingAppModal.linkedin}
                        </p>
                      </div>
                    </div>
                    <a
                      href={viewingAppModal.linkedin.startsWith('http') ? viewingAppModal.linkedin : `https://${viewingAppModal.linkedin}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-lg bg-[#0a66c2] hover:bg-[#084e96] text-white text-[11px] font-bold shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <ExternalLink size={13} />
                      <span>Open LinkedIn</span>
                    </a>
                  </div>
                )}

                {/* GitHub Profile Link Card */}
                {(viewingAppModal.github || viewingAppModal.personalDetails?.github) && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                        <FaGithub size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white">GitHub Profile</p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium truncate max-w-[280px]">
                          {viewingAppModal.github || viewingAppModal.personalDetails?.github}
                        </p>
                      </div>
                    </div>
                    <a
                      href={(viewingAppModal.github || viewingAppModal.personalDetails?.github).startsWith('http') ? (viewingAppModal.github || viewingAppModal.personalDetails?.github) : `https://${viewingAppModal.github || viewingAppModal.personalDetails?.github}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-[11px] font-bold shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <ExternalLink size={13} />
                      <span>Open GitHub</span>
                    </a>
                  </div>
                )}

                {/* LinkedIn PDF Document Card */}
                {viewingAppModal.linkedInPdfName && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#0a66c2] text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white">LinkedIn PDF Profile Export</p>
                        <p className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">
                          {viewingAppModal.linkedInPdfName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {viewingAppModal.linkedInPdfUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewResumeModal({
                              url: viewingAppModal.linkedInPdfUrl,
                              title: `${viewingAppModal.fullName} - LinkedIn Profile PDF`,
                              name: viewingAppModal.linkedInPdfName || 'LinkedIn_Profile.pdf',
                            });
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-[#0a66c2] hover:bg-[#084e96] text-white text-[11px] font-bold shadow-xs flex items-center gap-1.5 transition-all"
                        >
                          <Eye size={13} />
                          <span>Preview</span>
                        </button>
                      )}
                      {viewingAppModal.linkedInPdfUrl && (
                        <a
                          href={viewingAppModal.linkedInPdfUrl}
                          download={viewingAppModal.linkedInPdfName || 'LinkedIn_Profile.pdf'}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 text-slate-800 dark:text-white text-[11px] font-bold flex items-center gap-1"
                          title="Download LinkedIn PDF"
                        >
                          <Download size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {!viewingAppModal.resumeFileName && !viewingAppModal.linkedInPdfName && viewingAppModal.importMethod !== 'Upload your resume' && viewingAppModal.importMethod !== 'Import from LinkedIn' && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 italic p-1">
                    Candidate chose to enter profile details manually.
                  </div>
                )}
              </div>
            </div>

            {/* Work Experiences */}
            {viewingAppModal.experiences && viewingAppModal.experiences.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Work Experience History</h5>
                <div className="space-y-2">
                  {viewingAppModal.experiences.map((exp) => (
                    <div key={exp.id || exp.title} className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1c1a36] border border-slate-200 dark:border-white/10 space-y-1">
                      <div className="flex justify-between items-start">
                        <h6 className="font-bold text-slate-900 dark:text-white">{exp.title}</h6>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{exp.period}</span>
                      </div>
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">{exp.company}</p>
                      {exp.description && <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{exp.description}</p>}
                      {exp.documentName && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-[11px]">
                          <FileCheck size={13} className="text-emerald-600" />
                          <span>Attached Document: {exp.documentName}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {viewingAppModal.educations && viewingAppModal.educations.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Education & Academic Qualifications</h5>
                <div className="space-y-2">
                  {viewingAppModal.educations.map((edu) => (
                    <div key={edu.id || edu.degree} className="p-3 rounded-xl bg-slate-50 dark:bg-[#1c1a36] border border-slate-200 dark:border-white/10 flex justify-between items-center">
                      <div>
                        <h6 className="font-bold text-slate-900 dark:text-white">{edu.degree}</h6>
                        <p className="text-xs text-slate-600 dark:text-slate-300">{edu.school}</p>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">{edu.dates}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {viewingAppModal.languages && viewingAppModal.languages.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Languages Spoken</h5>
                <div className="flex flex-wrap gap-2">
                  {viewingAppModal.languages.map((lang) => (
                    <span key={lang.id || lang.name} className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-[#1c1a36] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 font-bold text-xs">
                      {lang.name} • <span className="text-slate-500 dark:text-slate-400 font-medium">{lang.proficiency}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {viewingAppModal.status === 'Pending Admin Approval' && (
              <div className="flex items-center gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    approveFreelancerApplication(viewingAppModal.id);
                    toast.success(`Approved ${viewingAppModal.fullName}! Added candidate to active workforce.`);
                    setViewingAppModal(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <Check size={16} />
                  <span>Approve & Authorize Talent</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    rejectFreelancerApplication(viewingAppModal.id);
                    toast.info(`Rejected application for ${viewingAppModal.fullName}.`);
                    setViewingAppModal(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <X size={16} />
                  <span>Reject Application</span>
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 4: REJECTION CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(rejectionModalTalent)}
        onClose={() => setRejectionModalTalent(null)}
        title="Confirm Request Rejection"
        subtitle={`Decline candidate: ${rejectionModalTalent?.name}`}
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-3">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p>
              Rejecting this submission will mark the candidate as <strong>Declined</strong> and prevent assignment to upcoming client projects.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Rejection Reason</label>
            <select
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
            >
              <option value="Skill set does not match current project requirements">Skill set does not match current project requirements</option>
              <option value="Requested billing rate exceeds project budget ceilings">Requested billing rate exceeds project budget ceilings</option>
              <option value="Failed partner credential / compliance verification">Failed partner credential / compliance verification</option>
              <option value="Insufficient commercial experience level">Insufficient commercial experience level</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setRejectionModalTalent(null)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdminRejectConfirm}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 active:scale-95 transition-all"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 5: EMBEDDED RESUME DOCUMENT VIEWER */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(previewResumeModal)}
        onClose={() => setPreviewResumeModal(null)}
        title={previewResumeModal?.title || 'Resume Document Preview'}
        subtitle={previewResumeModal?.name}
        maxWidth="max-w-4xl"
      >
        {previewResumeModal && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/10">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Official candidate resume uploaded in system
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={previewResumeModal.url}
                  download={previewResumeModal.name || 'Resume.pdf'}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Download size={13} />
                  <span>Download PDF</span>
                </a>
                <a
                  href={previewResumeModal.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-800 dark:text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <ExternalLink size={13} />
                  <span>Open in Tab</span>
                </a>
              </div>
            </div>

            <div className="w-full h-[640px] bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg">
              <iframe
                src={previewResumeModal.url}
                title={previewResumeModal.title}
                className="w-full h-full bg-white border-0"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WorkforceManagement;
