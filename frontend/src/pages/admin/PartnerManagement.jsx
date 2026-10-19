import React, { useState, useEffect, useMemo } from 'react';
import {
  Handshake,
  Plus,
  LayoutGrid,
  List,
  Mail,
  Phone,
  Building2,
  Users,
  Star,
  CheckCircle2,
  MapPin,
  Search,
  X,
  ChevronDown,
  Check,
  Filter,
  AlertCircle,
  FolderSearch,
  ExternalLink,
  ShieldCheck,
  Clock,
  Sparkles,
  Award,
  FileCheck,
  UserPlus,
  Briefcase,
  TrendingUp,
  Activity,
  Calendar,
  Layers,
  ArrowRight,
  Pencil,
  Power,
  Trash2,
  Eye,
  UserCheck,
  Globe,
  FileText,
  Download,
  CheckCircle,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';

// ====================================================================
// INLINE REUSABLE UI: StatusBadge
// ====================================================================
const StatusBadge = ({ status = 'Active', size = 'sm' }) => {
  const normalized = String(status).toLowerCase().trim();
  let bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let dot = 'bg-emerald-500';

  if (['pending', 'pending review', 'onboarding'].includes(normalized)) {
    bg = 'bg-amber-50 text-amber-700 border-amber-200';
    dot = 'bg-amber-500';
  } else if (['inactive', 'deactivated', 'rejected', 'terminated'].includes(normalized)) {
    bg = 'bg-rose-50 text-rose-700 border-rose-200';
    dot = 'bg-rose-500';
  }

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${sizeClasses} ${bg}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      <span>{status}</span>
    </span>
  );
};

// ====================================================================
// INLINE REUSABLE UI: SearchBar, FilterDropdown, Modal, FormInput
// ====================================================================
const SearchBar = ({ value = '', onChange, placeholder = 'Search...' }) => (
  <div className="relative flex items-center w-full">
    <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-[#c3c6d7]/80 dark:border-white/15 bg-white dark:bg-[#1c1a36] py-2.5 pl-9 pr-8 text-xs text-[#191b23] dark:text-white placeholder-slate-400 shadow-xs outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
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
        className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-all ${
          isFiltered ? 'border-[#2563eb] bg-blue-50/60 dark:bg-blue-950/40 text-[#004ac6] dark:text-blue-400' : 'border-[#c3c6d7]/80 dark:border-white/15 bg-white dark:bg-[#1c1a36] text-[#434655] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'
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

const Modal = ({ isOpen = false, onClose, title, subtitle, children, maxWidth = 'max-w-lg', showCloseButton = true, hideHeader = false, padding = 'px-6 py-5' }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className={`relative z-10 w-full ${maxWidth} rounded-3xl bg-white dark:bg-[#14132b] shadow-2xl border border-slate-200 dark:border-white/15 overflow-hidden my-8`}>
          {!hideHeader && (title || showCloseButton) && (
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-white/10 px-6 py-4 bg-slate-50/60 dark:bg-[#1c1a36]">
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
          <div className={`${padding} max-h-[85vh] overflow-y-auto text-slate-900 dark:text-white`}>{children}</div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const FormInput = ({ label, name, type = 'text', placeholder, register, error, required = false, options = [], className = '', disabled = false, autoComplete = 'off', ...rest }) => {
  const isError = Boolean(error);
  const inputBaseClasses = `w-full rounded-xl border text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 transition-all outline-none ${
    isError ? 'border-rose-400 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' : 'border-[#c3c6d7] dark:border-white/15 bg-white dark:bg-[#1c1a36] focus:border-[#004ac6]'
  } ${disabled ? 'bg-slate-100 dark:bg-white/5 text-slate-500 cursor-not-allowed' : ''}`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="flex items-center justify-between text-xs font-semibold text-[#434655] dark:text-slate-300">
          <span>{label}{required && <span className="text-rose-500 ml-0.5">*</span>}</span>
        </label>
      )}
      {type === 'select' ? (
        <select {...(register ? register(name) : {})} disabled={disabled} className={`${inputBaseClasses} px-3 py-2.5`} {...rest}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#14132b] text-slate-900 dark:text-white">{opt.label}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          autoComplete={autoComplete}
          {...(register ? register(name) : {})}
          disabled={disabled}
          placeholder={placeholder}
          className={`${inputBaseClasses} px-3 py-2.5 font-medium text-slate-900 dark:text-white`}
          {...rest}
        />
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

// ====================================================================
// INLINE REUSABLE UI: SkillSelector (Matches User Skill Design)
// ====================================================================
const SkillSelector = ({ value = '', onChange, error }) => {
  const [inputValue, setInputValue] = useState('');

  const selectedSkills = useMemo(() => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return String(value)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [value]);

  const suggestedSkills = [
    'React',
    'Node.js',
    'Python',
    'TypeScript',
    'AWS',
    'Docker',
    'PostgreSQL',
    'Full Stack Development',
    'UI/UX Design',
    'Software QA',
    'Software Testing',
    'Data Analysis',
    'Information Analysis',
    'Test Results & Analysis',
    'Alpha Testing',
    'Beta Testing',
    'Kubernetes',
    'GraphQL',
    'Tailwind CSS',
  ];

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (!selectedSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...selectedSkills, trimmed];
      onChange(updated.join(', '));
    }
    setInputValue('');
  };

  const removeSkill = (skillToRemove) => {
    const updated = selectedSkills.filter((s) => s !== skillToRemove);
    onChange(updated.join(', '));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(inputValue);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-semibold text-[#434655] dark:text-slate-300 block mb-1.5">
          Your skills / Specialty Skill Domains <span className="text-rose-500">*</span>
        </label>

        {/* Selected skills & Input box */}
        <div
          className={`w-full rounded-2xl border bg-white dark:bg-[#1c1a36] p-3 text-xs text-[#191b23] dark:text-white transition-all focus-within:border-[#004ac6] flex flex-wrap items-center gap-2 min-h-[52px] ${
            error ? 'border-rose-400 bg-rose-50/20' : 'border-[#c3c6d7] dark:border-white/15'
          }`}
        >
          {selectedSkills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 px-3 py-1 text-xs font-bold text-[#004ac6] dark:text-blue-300"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="hover:text-rose-500 transition-colors"
              >
                <X size={12} />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => inputValue && addSkill(inputValue)}
            placeholder={selectedSkills.length === 0 ? 'Enter skills here' : 'Type skill & press Enter...'}
            className="flex-1 min-w-[140px] bg-transparent outline-none text-xs text-[#191b23] dark:text-white placeholder-slate-400"
          />
        </div>
        {error && (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-rose-600 mt-1">
            <AlertCircle size={13} />
            <span>{error.message || error}</span>
          </div>
        )}
      </div>

      {/* Suggested skills */}
      <div className="space-y-2 pt-1">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Suggested skills</span>
        <div className="flex flex-wrap gap-2">
          {suggestedSkills.map((skill) => {
            const isAdded = selectedSkills.some((s) => s.toLowerCase() === skill.toLowerCase());
            return (
              <button
                key={skill}
                type="button"
                onClick={() => (isAdded ? removeSkill(skill) : addSkill(skill))}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                  isAdded
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-100 dark:bg-[#1c1a36] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                <span>{isAdded ? '✓' : '+'}</span>
                <span>{skill}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Form Schemas
const partnerSchema = yup.object().shape({
  name: yup.string().required('Partner company name is required'),
  contactPerson: yup.string().required('Contact person is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  status: yup.string().required('Status is required'),
  location: yup.string().required('Location is required'),
  tempPassword: yup.string().required('Temporary password is required').min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm password')
    .oneOf([yup.ref('tempPassword')], 'Passwords must match'),
});

const editPartnerSchema = yup.object().shape({
  name: yup.string().required('Partner company name is required'),
  contactPerson: yup.string().required('Contact person is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  suppliedProfessionals: yup
    .number()
    .typeError('Enter a valid number')
    .min(0, 'Cannot be negative')
    .required('Supplied talent count is required'),
  status: yup.string().required('Status is required'),
  location: yup.string().required('Location is required'),
  specialties: yup.string().nullable().optional(),
});

export const PartnerManagement = () => {
  const { partners, addPartner, updatePartner, deletePartner, clearPartners, refreshPartners, workforce, projects } = useData();

  useEffect(() => {
    if (typeof refreshPartners === 'function') {
      refreshPartners();
    }
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [editingPartner, setEditingPartner] = useState(null);
  const [partnerModalTab, setPartnerModalTab] = useState('Overview');

  useEffect(() => {
    if (selectedPartner) {
      setPartnerModalTab('Overview');
    }
  }, [selectedPartner]);

  // Dynamic real dossier calculation for selectedPartner
  const partnerDossier = useMemo(() => {
    if (!selectedPartner) return null;
    const pId = String(selectedPartner.id || selectedPartner.numericId || '').toLowerCase().trim();
    const pName = String(selectedPartner.name || selectedPartner.companyName || '').toLowerCase().trim();

    // 1. Matched Workforce belonging to this partner
    const matchedTalent = (workforce || []).filter((w) => {
      if (!w) return false;

      // Independent freelancers never belong to a partner agency
      const isFreelancer =
        w.roleType === 'Freelancer' ||
        w.source === 'Freelancer' ||
        w.source === 'Freelancer Registration' ||
        w.professionalType === 'FREELANCER' ||
        w.workforceType === 'Independent Freelancer';

      const wPartnerId = String(w.partnerCompanyId || w.partnerId || '').trim().toLowerCase();
      const wPartnerName = String(w.partnerCompanyName || w.partnerCompany || w.partnerName || w.partner || '').trim().toLowerCase();

      // If they have no partner ID and no partner name, they cannot belong to a partner
      if (!wPartnerId && !wPartnerName) return false;
      if (isFreelancer && !wPartnerId && !wPartnerName) return false;

      const idMatches = Boolean(
        pId &&
        wPartnerId &&
        (wPartnerId === pId ||
         (selectedPartner.id && String(selectedPartner.id).toLowerCase().trim() === wPartnerId) ||
         (selectedPartner.userId && String(selectedPartner.userId).toLowerCase().trim() === wPartnerId) ||
         (selectedPartner.numericId && String(selectedPartner.numericId).toLowerCase().trim() === wPartnerId))
      );

      const nameMatches = Boolean(
        pName &&
        wPartnerName &&
        wPartnerName !== 'freelancer' &&
        wPartnerName !== 'independent freelancer' &&
        (wPartnerName === pName ||
         (wPartnerName.length > 2 && pName.includes(wPartnerName)) ||
         (pName.length > 2 && wPartnerName.includes(pName)))
      );

      return idMatches || nameMatches;
    });

    const totalStaffCount = matchedTalent.length;

    const availableStaff = matchedTalent.filter(
      (w) => String(w.availability || '').toLowerCase().trim() === 'available'
    );
    const assignedStaff = matchedTalent.filter(
      (w) => ['assigned', 'working', 'allocated', 'partially available'].includes(String(w.availability || '').toLowerCase().trim())
    );
    const onLeaveStaff = matchedTalent.filter(
      (w) => ['on leave', 'leave', 'vacation'].includes(String(w.availability || '').toLowerCase().trim())
    );

    const availCount = availableStaff.length;
    const assignCount = assignedStaff.length;
    const leaveCount = onLeaveStaff.length;
    const inactiveCount = Math.max(0, totalStaffCount - (availCount + assignCount + leaveCount));

    const availPercent = totalStaffCount > 0 ? Math.round((availCount / totalStaffCount) * 100) : 0;
    const assignPercent = totalStaffCount > 0 ? Math.round((assignCount / totalStaffCount) * 100) : 0;
    const leavePercent = totalStaffCount > 0 ? Math.round((leaveCount / totalStaffCount) * 100) : 0;
    const inactivePercent = totalStaffCount > 0 ? Math.max(0, 100 - (availPercent + assignPercent + leavePercent)) : 0;

    // 2. Matched Projects associated with this partner
    const matchedProjects = (projects || []).filter((proj) => {
      if (!proj) return false;
      const projPartnerId = String(proj.partnerCompanyId || proj.partnerId || '').trim().toLowerCase();
      const projPartnerName = String(proj.partnerCompanyName || proj.partnerCompany || proj.partner || proj.partnerName || '').trim().toLowerCase();

      const idMatches = Boolean(
        pId &&
        projPartnerId &&
        (projPartnerId === pId ||
         (selectedPartner.id && String(selectedPartner.id).toLowerCase().trim() === projPartnerId) ||
         (selectedPartner.userId && String(selectedPartner.userId).toLowerCase().trim() === projPartnerId))
      );

      const nameMatches = Boolean(
        pName &&
        projPartnerName &&
        (projPartnerName === pName ||
         (projPartnerName.length > 2 && pName.includes(projPartnerName)) ||
         (pName.length > 2 && projPartnerName.includes(pName)))
      );

      if (idMatches || nameMatches) return true;

      if (matchedTalent.length > 0) {
        const team = Array.isArray(proj.team) ? proj.team : Array.isArray(proj.assignedEngineers) ? proj.assignedEngineers : [];
        return team.some((member) => {
          const memberName = String(member?.name || member || '').trim().toLowerCase();
          return memberName && matchedTalent.some((w) => String(w?.name || '').trim().toLowerCase() === memberName);
        });
      }
      return false;
    });

    const totalProjectsCount = matchedProjects.length;
    const compCount = matchedProjects.filter((pr) => ['completed', 'delivered', 'done'].includes(String(pr.status || '').toLowerCase().trim())).length;
    const actCount = matchedProjects.filter((pr) => ['active', 'in progress', 'ongoing', 'assigned'].includes(String(pr.status || '').toLowerCase().trim())).length;

    const partnerIdCode = selectedPartner.partnerId || selectedPartner.companyId || `PC-${String(selectedPartner.id || '001').padStart(3, '0')}`;

    const rawDate = selectedPartner.partnerSince || selectedPartner.joinedDate || selectedPartner.createdAt;
    const joinedDate = rawDate
      ? new Date(rawDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : '';

    const website = selectedPartner.website || '';
    const industry = selectedPartner.industry || selectedPartner.category || 'IT Staffing & Consulting';

    const displayProjects = matchedProjects.slice(0, 5).map((p) => ({
      name: p.title || p.name || 'Client Project',
      status: p.status || 'Ongoing',
      date: p.deadline || p.createdAt ? new Date(p.deadline || p.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : 'Active',
      progress: typeof p.progress === 'number' ? p.progress : (String(p.status || '').toLowerCase().includes('completed') ? 100 : 0),
    }));

    // Real persisted activity log entries only; synthetic demo entries removed
    const activityLogs = Array.isArray(selectedPartner.activityLogs)
      ? selectedPartner.activityLogs
      : Array.isArray(selectedPartner.logs)
      ? selectedPartner.logs
      : [];

    return {
      partnerIdCode,
      joinedDate,
      website,
      industry,
      matchedTalent,
      totalStaffCount,
      availCount,
      assignCount,
      leaveCount,
      inactiveCount,
      availPercent,
      assignPercent,
      leavePercent,
      inactivePercent,
      matchedProjects,
      totalProjectsCount,
      compCount,
      actCount,
      displayProjects,
      activityLogs,
    };
  }, [selectedPartner, workforce, projects]);

  // Form for Registering New Partner Company
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(partnerSchema),
    defaultValues: {
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      suppliedProfessionals: 0,
      status: 'Active',
      location: '',
      specialties: '',
      tempPassword: '',
      confirmPassword: '',
    },
  });

  // Form for Editing Existing Partner Company
  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    setValue: setEditValue,
    watch: watchEdit,
    formState: { errors: editErrors, isSubmitting: isSubmittingEdit },
  } = useForm({
    resolver: yupResolver(editPartnerSchema),
  });

  const handleOpenEditModal = (partner) => {
    setEditingPartner(partner);
    setEditValue('name', partner.name || '');
    setEditValue('contactPerson', partner.contactPerson || '');
    setEditValue('email', partner.email || '');
    setEditValue('phone', partner.phone || '');
    setEditValue('suppliedProfessionals', partner.suppliedProfessionals || 0);
    setEditValue('status', partner.status || 'Active');
    setEditValue('location', partner.location || '');
    setEditValue(
      'specialties',
      Array.isArray(partner.specialties) ? partner.specialties.join(', ') : partner.specialties || ''
    );
  };

  const onEditSubmit = async (data) => {
    if (!editingPartner) return;
    const specialtiesArray = typeof data.specialties === 'string'
      ? data.specialties.split(',').map((s) => s.trim()).filter(Boolean)
      : data.specialties;

    await updatePartner(editingPartner.id, {
      ...data,
      companyName: data.companyName || data.name,
      specialties: specialtiesArray,
    });

    toast.success(`Partner Organization ${data.name || data.companyName} updated successfully!`);
    setEditingPartner(null);
  };

  // Toggle Partner Status (Deactivate / Activate)
  const handleTogglePartnerStatus = async (partner) => {
    const isCurrentlyActive = String(partner.status).toLowerCase().trim() === 'active';
    const newStatus = isCurrentlyActive ? 'Inactive' : 'Active';
    await updatePartner(partner.id, { status: newStatus });
    if (isCurrentlyActive) {
      toast.info(`Partner Organization "${partner.name || partner.companyName}" has been deactivated.`);
    } else {
      toast.success(`Partner Organization "${partner.name || partner.companyName}" is now active!`);
    }
  };

  // Delete Single Partner
  const handleDeletePartner = async (partner) => {
    if (window.confirm(`Are you sure you want to delete ${partner.name || partner.companyName}? This will remove all associated partner data.`)) {
      await deletePartner(partner.id);
      toast.info(`Partner Organization "${partner.name || partner.companyName}" has been deleted.`);
      if (selectedPartner?.id === partner.id) setSelectedPartner(null);
      if (editingPartner?.id === partner.id) setEditingPartner(null);
    }
  };

  // Clear Activity Logs for Selected Partner
  const handleClearActivityLogs = async () => {
    if (!selectedPartner) return;
    const updated = { ...selectedPartner, activityLogs: [], logs: [] };
    setSelectedPartner(updated);
    if (typeof updatePartner === 'function') {
      await updatePartner(selectedPartner.id, { activityLogs: [] });
    }
    toast.info(`Operational activity log for ${selectedPartner.name || selectedPartner.companyName} cleared.`);
  };

  // Filtered Partners
  const filteredPartners = useMemo(() => {
    return (partners || []).filter((p) => {
      if (!p) return false;
      const pName = p.name || p.companyName || '';
      const pContact = p.contactPerson || '';
      const pLoc = p.location || p.city || '';
      const specs = Array.isArray(p.specialties)
        ? p.specialties
        : typeof p.specialties === 'string' && p.specialties.trim()
        ? p.specialties.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const matchesSearch =
        pName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pContact.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pLoc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        specs.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' || (p.status || '').toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [partners, searchQuery, statusFilter]);

  // Aggregate Partner Metrics
  const totalSuppliedStaff = useMemo(() => {
    return (partners || []).reduce((sum, p) => {
      if (!p) return sum;
      const pStaffList = (workforce || []).filter(
        (w) =>
          (w.partnerCompanyId && (w.partnerCompanyId === p.id || String(w.partnerCompanyId) === String(p.id))) ||
          (w.partnerName && p.name && w.partnerName.toLowerCase().trim() === p.name.toLowerCase().trim()) ||
          (w.partnerCompany && p.name && w.partnerCompany.toLowerCase().trim() === p.name.toLowerCase().trim()) ||
          (w.partner && p.name && w.partner.toLowerCase().trim() === p.name.toLowerCase().trim())
      );
      const count = Number(p.suppliedProfessionals) || pStaffList.length || 0;
      return sum + count;
    }, 0);
  }, [partners, workforce]);

  const totalActivePlacements = useMemo(() => {
    return (partners || []).reduce((sum, p) => {
      if (!p) return sum;
      const activeWf = (workforce || []).filter(
        (w) =>
          ((w.partnerCompanyId && (w.partnerCompanyId === p.id || String(w.partnerCompanyId) === String(p.id))) ||
           (w.partnerName && p.name && w.partnerName.toLowerCase().trim() === p.name.toLowerCase().trim()) ||
           (w.partnerCompany && p.name && w.partnerCompany.toLowerCase().trim() === p.name.toLowerCase().trim())) &&
          (w.status === 'Assigned' || w.status === 'Active' || w.availabilityStatus === 'Working' || (w.currentProject && w.currentProject !== 'Unassigned'))
      );
      const count = Number(p.activePlacements) || activeWf.length || 0;
      return sum + count;
    }, 0);
  }, [partners, workforce]);

  // Register new Partner Submit
  const onAddSubmit = async (data) => {
    await addPartner({
      ...data,
      companyName: data.companyName || data.name,
      suppliedProfessionals: 0,
      specialties: data.specialties || '',
    });
    toast.success(`Partner Organization ${data.name || data.companyName} registered successfully!`);
    reset();
    setIsAddModalOpen(false);
  };


  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ========================================================================= */}
      {/* HEADER & TOP ACTION BUTTONS */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/20">
              <Handshake size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#191b23] dark:text-white tracking-tight">
                Partner Staffing Organizations
              </h1>
              <p className="text-xs text-[#737686] dark:text-slate-400">
                Manage vendor partnerships, external engineering guilds, talent supply agreements, and candidate submissions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {partners.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all partner organizations to start fresh?')) {
                  clearPartners();
                  toast.info('All partner records cleared. Ready to start fresh!');
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 px-3.5 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-all active:scale-95"
              title="Clear all partner records"
            >
              <Trash2 size={15} />
              <span>Clear All Partners</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#004ac6] via-[#1d4ed8] to-[#2563eb] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:from-[#003da6] hover:to-[#1d4ed8] active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span>Register Partner Company</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* KPI METRICS OVERVIEW CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14132b] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Partner Agencies</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Handshake size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{partners.length}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14132b] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Supplied Talent Pool</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{totalSuppliedStaff}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14132b] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Deployed Placements</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{totalActivePlacements}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FILTER CONTROLS BAR */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 bg-white dark:bg-[#14132b] p-4 rounded-2xl border border-[#c3c6d7]/70 dark:border-white/10 shadow-xs">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by partner name, contact person, location, or skills..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'Active', label: 'Active Agreements' },
              { value: 'Pending', label: 'Pending Review' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
          />

          <div className="flex items-center rounded-xl border border-[#c3c6d7]/80 dark:border-white/15 bg-slate-100 dark:bg-white/10 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`rounded-lg p-2 transition-all ${
                viewMode === 'grid' ? 'bg-white dark:bg-[#1c1a36] shadow-xs text-[#004ac6] dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`rounded-lg p-2 transition-all ${
                viewMode === 'table' ? 'bg-white dark:bg-[#1c1a36] shadow-xs text-[#004ac6] dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
              title="Table View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PARTNER CARDS GRID / TABLE VIEW */}
      {/* ========================================================================= */}
      {filteredPartners.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#c3c6d7] dark:border-white/15 bg-white dark:bg-[#14132b] p-12 text-center">
          <FolderSearch size={32} className="text-slate-400 mb-2" />
          <h4 className="text-sm font-bold text-[#191b23] dark:text-white">No partner companies found</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {partners.length === 0
              ? 'No registered partner companies found in PostgreSQL database. Click "Register Partner Company" to add a new partner agency.'
              : 'Try adjusting your search criteria or register a new partner agency.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((partner) => {
            const partnerStaffList = (workforce || []).filter(
              (w) =>
                (w.partnerCompanyId && (w.partnerCompanyId === partner.id || String(w.partnerCompanyId) === String(partner.id))) ||
                (w.partnerName && partner.name && w.partnerName.toLowerCase().trim() === partner.name.toLowerCase().trim()) ||
                (w.partnerCompany && partner.name && w.partnerCompany.toLowerCase().trim() === partner.name.toLowerCase().trim())
            );

            const specs = Array.isArray(partner.specialties)
              ? partner.specialties
              : typeof partner.specialties === 'string' && partner.specialties.trim()
              ? partner.specialties.split(',').map((s) => s.trim()).filter(Boolean)
              : [];

            return (
              <motion.div
                key={partner.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#14132b] p-5 sm:p-6 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-md transition-all space-y-4"
              >
                <div>
                  {/* Top Bar: Status */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-white/10">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Partner Organization</span>
                    <StatusBadge status={partner.status} />
                  </div>

                  {/* Company Info */}
                  <div className="mt-3.5 flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-50 to-blue-50 dark:from-indigo-950/60 dark:to-blue-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-white/10 shadow-2xs">
                      <Building2 size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">{partner.name}</h3>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate">{partner.location}</span>
                      </p>
                    </div>
                  </div>

                  {/* Representative Card */}
                  <div className="mt-3.5 p-3 rounded-xl bg-slate-50 dark:bg-[#1c1a36] border border-slate-100 dark:border-white/10 text-xs space-y-1">
                    <div className="font-bold text-slate-800 dark:text-white">
                      <span>{partner.contactPerson}</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 truncate text-[11px] flex items-center gap-1.5">
                      <Mail size={11} className="text-slate-400 shrink-0" />
                      <span className="truncate">{partner.email}</span>
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1.5">
                      <Phone size={11} className="text-slate-400 shrink-0" />
                      <span>{partner.phone}</span>
                    </p>
                  </div>

                  {/* Metrics 2-column strip */}
                  <div className="mt-3.5 grid grid-cols-2 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1c1a36] border border-slate-100 dark:border-white/10">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Supplied Staff</span>
                      <span className="block text-xs font-extrabold text-slate-900 dark:text-white mt-0.5">
                        {partner.suppliedProfessionals || partnerStaffList.length} Engineers
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1c1a36] border border-slate-100 dark:border-white/10">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Active Placed</span>
                      <span className="block text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {partner.activePlacements || 0} Placed
                      </span>
                    </div>
                  </div>

                  {/* Specialties */}
                  {specs.length > 0 && (
                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {specs.slice(0, 3).map((spec, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-white dark:bg-[#1c1a36] border border-slate-200 dark:border-white/10 text-[10px] font-semibold text-slate-700 dark:text-slate-300"
                        >
                          {spec}
                        </span>
                      ))}
                      {specs.length > 3 && (
                        <span className="text-[10px] text-slate-400 font-semibold self-center">
                          +{specs.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPartner(partner)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-white text-xs font-bold transition-colors"
                  >
                    <span>View Details</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTogglePartnerStatus(partner)}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                      String(partner.status).toLowerCase().trim() === 'active'
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/60'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                    }`}
                    title={String(partner.status).toLowerCase().trim() === 'active' ? 'Deactivate Partner Organization' : 'Activate Partner Organization'}
                  >
                    <Power size={14} />
                    <span>{String(partner.status).toLowerCase().trim() === 'active' ? 'Deactivate' : 'Activate'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePartner(partner)}
                    className="flex items-center justify-center p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 transition-colors"
                    title="Delete Partner Organization"
                  >
                    <Trash2 size={14} />
                  </button>
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
                  <th className="py-3.5 px-4">Partner Organization</th>
                  <th className="py-3.5 px-4">Representative</th>
                  <th className="py-3.5 px-4">Supplied Roster</th>
                  <th className="py-3.5 px-4">Active Deployments</th>
                  <th className="py-3.5 px-4">Availability Rate</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {filteredPartners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">{partner.name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800 dark:text-white">{partner.contactPerson}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{partner.email}</p>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{partner.suppliedProfessionals} Engineers</td>
                    <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">{partner.activePlacements} Placed</td>
                    <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">{partner.availabilityRate || '90%'}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={partner.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedPartner(partner)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-white text-xs font-semibold"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTogglePartnerStatus(partner)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                            String(partner.status).toLowerCase().trim() === 'active'
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                          }`}
                          title={String(partner.status).toLowerCase().trim() === 'active' ? 'Deactivate Partner' : 'Activate Partner'}
                        >
                          <Power size={13} />
                          <span>{String(partner.status).toLowerCase().trim() === 'active' ? 'Deactivate' : 'Activate'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePartner(partner)}
                          className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                          title="Delete Partner Organization"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: REGISTER NEW PARTNER COMPANY */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Partner Staffing Agency"
        subtitle="Onboard a verified vendor organization to supply temporary talent."
      >
        <form onSubmit={handleSubmit(onAddSubmit)} className="space-y-4">
          <FormInput
            label="Partner Company Name"
            name="name"
            placeholder="Enter partner company name"
            register={register}
            error={errors.name}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FormInput
              label="Contact Representative"
              name="contactPerson"
              placeholder="Enter contact person name"
              register={register}
              error={errors.contactPerson}
              required
            />
            <FormInput
              label="Corporate Email"
              name="email"
              type="email"
              placeholder="Enter corporate email address"
              register={register}
              error={errors.email}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FormInput
              label="Phone Number"
              name="phone"
              placeholder="Enter phone number"
              register={register}
              error={errors.phone}
              required
            />
            <FormInput
              label="Headquarters"
              name="location"
              placeholder="Seattle, WA"
              register={register}
              error={errors.location}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FormInput
              label="Status"
              name="status"
              type="select"
              register={register}
              error={errors.status}
              required
              options={[
                { value: 'Active', label: 'Active Agreement' },
                { value: 'Pending', label: 'Pending Review' },
              ]}
            />
          </div>

          {/* Partner Login Credentials Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-3">
            <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider block">
              Partner Account Credentials (For Login Access)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <FormInput
                label="Temporary Password"
                name="tempPassword"
                type="password"
                placeholder="Min 6 characters"
                register={register}
                error={errors.tempPassword}
                required
              />
              <FormInput
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Confirm password"
                register={register}
                error={errors.confirmPassword}
                required
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:hover:bg-white/10 dark:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 transition-all"
            >
              Register Partner
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT PARTNER ORGANIZATION */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(editingPartner)}
        onClose={() => setEditingPartner(null)}
        title="Edit Partner Organization"
        subtitle={`Update partnership details for ${editingPartner?.name}`}
      >
        <form onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-4">
          <FormInput
            label="Partner Company Name"
            name="name"
            placeholder="Enter partner company name"
            register={registerEdit}
            error={editErrors.name}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FormInput
              label="Contact Representative"
              name="contactPerson"
              placeholder="Enter contact person name"
              register={registerEdit}
              error={editErrors.contactPerson}
              required
            />
            <FormInput
              label="Corporate Email"
              name="email"
              type="email"
              placeholder="Enter corporate email address"
              register={registerEdit}
              error={editErrors.email}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FormInput
              label="Phone Number"
              name="phone"
              placeholder="Enter phone number"
              register={registerEdit}
              error={editErrors.phone}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <FormInput
              label="Talent Capacity"
              name="suppliedProfessionals"
              type="number"
              placeholder="15"
              register={registerEdit}
              error={editErrors.suppliedProfessionals}
              required
            />
            <FormInput
              label="Status"
              name="status"
              type="select"
              register={registerEdit}
              error={editErrors.status}
              required
              options={[
                { value: 'Active', label: 'Active Agreement' },
                { value: 'Pending', label: 'Pending Review' },
                { value: 'Inactive', label: 'Inactive' },
              ]}
            />
            <FormInput
              label="Headquarters"
              name="location"
              placeholder="Seattle, WA"
              register={registerEdit}
              error={editErrors.location}
              required
            />
          </div>

          {/* Specialty Skill Domains Component */}
          <SkillSelector
            value={watchEdit('specialties') || ''}
            onChange={(newVal) => setEditValue('specialties', newVal, { shouldValidate: true })}
            error={editErrors.specialties}
          />

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setEditingPartner(null)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:hover:bg-white/10 dark:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingEdit}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: PARTNER PROFILE DOSSIER & SLA DETAILS (PICTURE 2 SPEC) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(selectedPartner && partnerDossier)}
        onClose={() => setSelectedPartner(null)}
        maxWidth="max-w-4xl sm:max-w-5xl"
        hideHeader={true}
        padding="p-0"
      >
        {selectedPartner && partnerDossier && (
          <div className="flex flex-col bg-slate-50/50 dark:bg-[#14132b]">
            {/* 1. MODAL HEADER */}
            <div className="p-6 bg-white dark:bg-[#181631] border-b border-slate-100 dark:border-white/10 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Building2 size={28} strokeWidth={2.2} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {selectedPartner.name || selectedPartner.companyName}
                    </h2>
                    <CheckCircle2 size={18} className="text-blue-600 fill-blue-600 text-white shrink-0" />
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                    <span>Partner ID: {partnerDossier.partnerIdCode}</span>
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-slate-400" />
                      <span>{selectedPartner.location || 'Kochi, Kerala, India'}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 mt-2.5 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{selectedPartner.status || 'Active'}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      <Check size={11} strokeWidth={3} />
                      <span>Verified</span>
                    </span>                    {partnerDossier.joinedDate ? (
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        Partner since {partnerDossier.joinedDate}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        Active Enterprise Partner
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPartner(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* 2. NAVIGATION TABS BAR */}
            <div className="px-6 bg-white dark:bg-[#181631] border-b border-slate-200 dark:border-white/10 flex items-center gap-7 overflow-x-auto">
              {['Overview', 'Professionals', 'Projects', 'Activity Log'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setPartnerModalTab(tab)}
                  className={`py-3 text-xs font-bold transition-all relative whitespace-nowrap ${
                    partnerModalTab === tab
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* 3. TAB CONTENT */}
            <div className="p-6 space-y-5">
              {partnerModalTab === 'Overview' && (
                <>
                  {/* Top 3 Stat Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* 1. Registered Professionals */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1a36] border border-slate-200/80 dark:border-white/10 shadow-2xs flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Users size={20} />
                      </div>
                      <div>
                        <span className="text-2xl font-black text-slate-900 dark:text-white leading-tight block">
                          {partnerDossier.totalStaffCount}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mt-0.5">
                          Registered Professionals
                        </span>
                      </div>
                    </div>

                    {/* 2. Available Professionals */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1a36] border border-slate-200/80 dark:border-white/10 shadow-2xs flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <UserCheck size={20} />
                      </div>
                      <div>
                        <span className="text-2xl font-black text-slate-900 dark:text-white leading-tight block">
                          {partnerDossier.availCount}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mt-0.5">
                          Available Professionals
                        </span>
                      </div>
                    </div>

                    {/* 3. Total Projects */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1a36] border border-slate-200/80 dark:border-white/10 shadow-2xs flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                        <Briefcase size={20} />
                      </div>
                      <div>
                        <span className="text-2xl font-black text-slate-900 dark:text-white leading-tight block">
                          {partnerDossier.totalProjectsCount}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mt-0.5">
                          Total Projects
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                          {partnerDossier.compCount} Completed • {partnerDossier.actCount} Active
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Main 2-Column Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                    {/* Left Column: Company Information */}
                    <div className="space-y-4">
                      {/* Company Information Card */}
                      <div className="p-5 rounded-2xl bg-white dark:bg-[#1c1a36] border border-slate-200/80 dark:border-white/10 shadow-2xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                            Company Information
                          </h4>
                          <button
                            type="button"
                            onClick={() => {
                              const target = selectedPartner;
                              setSelectedPartner(null);
                              handleOpenEditModal(target);
                            }}
                            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                          >
                            <Pencil size={12} />
                            <span>Edit</span>
                          </button>
                        </div>

                        <div className="space-y-2.5 text-xs">
                          <div className="flex items-center justify-between py-1">
                            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                              <Building2 size={14} className="text-slate-400" />
                              <span>Company Name</span>
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {selectedPartner.name || selectedPartner.companyName}
                            </span>
                          </div>

                          <div className="flex items-center justify-between py-1">
                            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                              <UserCheck size={14} className="text-slate-400" />
                              <span>Representative</span>
                            </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {selectedPartner.contactPerson || 'Not assigned'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between py-1">
                            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                              <Mail size={14} className="text-slate-400" />
                              <span>Email</span>
                            </span>
                            <a
                              href={`mailto:${selectedPartner.email}`}
                              className="font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 hover:underline"
                            >
                              {selectedPartner.email}
                            </a>
                          </div>

                          <div className="flex items-center justify-between py-1">
                            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                              <Phone size={14} className="text-slate-400" />
                              <span>Phone</span>
                            </span>
                            <a
                              href={`tel:${selectedPartner.phone}`}
                              className="font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 hover:underline"
                            >
                              {selectedPartner.phone || '—'}
                            </a>
                          </div>

                          <div className="flex items-center justify-between py-1">
                            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                              <MapPin size={14} className="text-slate-400" />
                              <span>Location</span>
                            </span>
                            <span className="font-medium text-slate-700 dark:text-slate-200">
                              {selectedPartner.location || 'Not specified'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between py-1">
                            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                              <Layers size={14} className="text-slate-400" />
                              <span>Industry</span>
                            </span>
                            <span className="font-medium text-slate-700 dark:text-slate-200">
                              {partnerDossier.industry}
                            </span>
                          </div>

                          <div className="flex items-center justify-between py-1">
                            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                              <Globe size={14} className="text-slate-400" />
                              <span>Website</span>
                            </span>
                            {partnerDossier.website ? (
                              <a
                                href={partnerDossier.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[200px]"
                              >
                                {partnerDossier.website}
                              </a>
                            ) : (
                              <span className="text-slate-400">Not specified</span>
                            )}
                          </div>

                          <div className="flex items-center justify-between py-1">
                            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                              <Calendar size={14} className="text-slate-400" />
                              <span>Partner Since</span>
                            </span>
                            <span className="font-medium text-slate-700 dark:text-slate-200">
                              {partnerDossier.joinedDate || 'Recently joined'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Workforce Overview & Recent Projects */}
                    <div className="space-y-4">
                      {/* Workforce Overview Donut Card */}
                      <div className="p-5 rounded-2xl bg-white dark:bg-[#1c1a36] border border-slate-200/80 dark:border-white/10 shadow-2xs space-y-4">
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                          Workforce Overview
                        </h4>

                        {partnerDossier.totalStaffCount > 0 ? (
                          <div className="flex items-center justify-around gap-4 py-1">
                            {/* Donut graphic */}
                            <div
                              className="relative w-32 h-32 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                              style={{
                                background: `conic-gradient(
                                  #10b981 0% ${partnerDossier.availPercent}%,
                                  #3b82f6 ${partnerDossier.availPercent}% ${partnerDossier.availPercent + partnerDossier.assignPercent}%,
                                  #f59e0b ${partnerDossier.availPercent + partnerDossier.assignPercent}% ${partnerDossier.availPercent + partnerDossier.assignPercent + partnerDossier.leavePercent}%,
                                  #94a3b8 ${partnerDossier.availPercent + partnerDossier.assignPercent + partnerDossier.leavePercent}% 100%
                                )`,
                              }}
                            >
                              <div className="w-20 h-20 rounded-full bg-white dark:bg-[#1c1a36] flex flex-col items-center justify-center text-center shadow-inner">
                                <span className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">
                                  {partnerDossier.totalStaffCount}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-0.5 leading-tight">
                                  Professionals<br />Total
                                </span>
                              </div>
                            </div>

                            {/* Legend list */}
                            <div className="space-y-2 text-xs">
                              <div className="flex items-center justify-between gap-6">
                                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                  <span>Available</span>
                                </span>
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {partnerDossier.availCount} ({partnerDossier.availPercent}%)
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-6">
                                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                  <span>Assigned</span>
                                </span>
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {partnerDossier.assignCount} ({partnerDossier.assignPercent}%)
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-6">
                                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                  <span>On Leave</span>
                                </span>
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {partnerDossier.leaveCount} ({partnerDossier.leavePercent}%)
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-6">
                                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                  <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                                  <span>Inactive</span>
                                </span>
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {partnerDossier.inactiveCount} ({partnerDossier.inactivePercent}%)
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-6 text-center rounded-xl bg-slate-50 dark:bg-white/5 space-y-1.5">
                            <Users size={24} className="mx-auto text-slate-300 dark:text-slate-600" />
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">No workforce enrolled yet</p>
                            <p className="text-[11px] text-slate-400">Engineers and technical consultants will display here once registered to this partner roster.</p>
                          </div>
                        )}
                      </div>

                      {/* Recent Projects Card */}
                      <div className="p-5 rounded-2xl bg-white dark:bg-[#1c1a36] border border-slate-200/80 dark:border-white/10 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                            Recent Projects ({partnerDossier.totalProjectsCount})
                          </h4>
                          {partnerDossier.displayProjects.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setPartnerModalTab('Projects')}
                              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              View All
                            </button>
                          )}
                        </div>

                        {partnerDossier.displayProjects.length > 0 ? (
                          <div className="space-y-2 text-xs">
                            {partnerDossier.displayProjects.map((proj, pidx) => (
                              <div
                                key={pidx}
                                className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-white/5 last:border-b-0"
                              >
                                <span className="font-bold text-slate-800 dark:text-slate-200 truncate pr-2">
                                  {proj.name}
                                </span>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      String(proj.status).toLowerCase().includes('completed')
                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200'
                                        : String(proj.status).toLowerCase().includes('progress')
                                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200'
                                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200'
                                    }`}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        String(proj.status).toLowerCase().includes('completed')
                                          ? 'bg-blue-500'
                                          : String(proj.status).toLowerCase().includes('progress')
                                          ? 'bg-indigo-500'
                                          : 'bg-emerald-500'
                                      }`}
                                    />
                                    <span>{proj.status}</span>
                                  </span>

                                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                                    {proj.date}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-4 text-center text-xs text-slate-400">
                            No active or recent projects allocated to this partner organization.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Tab 2: Professionals */}
              {partnerModalTab === 'Professionals' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        Affiliated Workforce & Supplied Talent ({partnerDossier.matchedTalent.length})
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Engineers and technical consultants registered under {selectedPartner.name || selectedPartner.companyName}.
                      </p>
                    </div>
                  </div>

                  {partnerDossier.matchedTalent.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {partnerDossier.matchedTalent.map((member, midx) => (
                        <div
                          key={midx}
                          className="p-3.5 rounded-2xl bg-white dark:bg-[#1c1a36] border border-slate-200/80 dark:border-white/10 flex items-start justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                              {(member.name || 'W').charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white text-xs truncate">
                                {member.name || member.pseudonym}
                              </p>
                              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold truncate">
                                {member.role || member.title || 'Software Specialist'}
                              </p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                                {member.hourlyRate || '$85/hr'} • {member.experience || '3+ Years'}
                              </p>
                            </div>
                          </div>
                          <StatusBadge status={member.availability || 'Available'} size="sm" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#1c1a36] border border-slate-200 dark:border-white/10 space-y-2">
                      <Users size={32} className="mx-auto text-slate-300" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        No individual engineers linked yet
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {selectedPartner.name || selectedPartner.companyName} supplies a pool of {partnerDossier.totalStaffCount} engineers. Individual members can be registered via the Partner Portal or Workforce Management.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Projects */}
              {partnerModalTab === 'Projects' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Partner Project Assignments ({partnerDossier.totalProjectsCount})
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Deliveries and client engagements managed by {selectedPartner.name || selectedPartner.companyName}.
                    </p>
                  </div>

                  {partnerDossier.displayProjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {partnerDossier.displayProjects.map((proj, pidx) => (
                        <div
                          key={pidx}
                          className="p-4 rounded-2xl bg-white dark:bg-[#1c1a36] border border-slate-200/80 dark:border-white/10 shadow-2xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                              {proj.name}
                            </h5>
                            <StatusBadge status={proj.status} size="sm" />
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Timeline target: {proj.date}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>Progress</span>
                            <span className="font-semibold text-slate-600 dark:text-slate-300">{proj.progress || 0}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(100, Math.max(0, proj.progress || 0))}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#1c1a36] border border-slate-200 dark:border-white/10 space-y-2">
                      <Briefcase size={32} className="mx-auto text-slate-300" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        No project assignments yet
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Deliveries and client engagements will appear here once allocated.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Activity Log */}
              {partnerModalTab === 'Activity Log' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        Partner Operational Activity Log
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Audit trail of agreements, updates, and placement milestones.
                      </p>
                    </div>
                    {partnerDossier.activityLogs && partnerDossier.activityLogs.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearActivityLogs}
                        className="text-xs text-rose-500 hover:text-rose-600 font-semibold px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        Clear Log
                      </button>
                    )}
                  </div>

                  {partnerDossier.activityLogs && partnerDossier.activityLogs.length > 0 ? (
                    <div className="space-y-3">
                      {partnerDossier.activityLogs.map((log, lidx) => (
                        <div
                          key={lidx}
                          className="p-3 rounded-xl bg-white dark:bg-[#1c1a36] border border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                            <div>
                              <p className="font-bold text-slate-800 dark:text-white">{log.title}</p>
                              <p className="text-[11px] text-slate-400">By {log.actor} • {log.time}</p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                            {log.badge}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#1c1a36] border border-slate-200 dark:border-white/10 space-y-2">
                      <CheckCircle2 size={32} className="mx-auto text-slate-300" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        No operational activity logged yet
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Operational events, audits, and placement updates will be recorded here.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 4. FOOTER ACTION BAR */}
            <div className="p-4 bg-white dark:bg-[#181631] border-t border-slate-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPartnerModalTab('Professionals')}
                  className="px-3.5 py-2 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Eye size={14} />
                  <span>View Professionals</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPartnerModalTab('Projects')}
                  className="px-3.5 py-2 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <FolderSearch size={14} />
                  <span>View Projects</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedPartner;
                    setSelectedPartner(null);
                    handleOpenEditModal(target);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Pencil size={14} />
                  <span>Edit Partner Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const target = selectedPartner;
                    setSelectedPartner(null);
                    handleTogglePartnerStatus(target);
                  }}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    String(selectedPartner.status).toLowerCase().trim() === 'active'
                      ? 'border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400'
                      : 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  <Power size={14} />
                  <span>{String(selectedPartner.status).toLowerCase().trim() === 'active' ? 'Deactivate' : 'Activate'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PartnerManagement;
