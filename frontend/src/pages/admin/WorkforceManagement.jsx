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
} from 'lucide-react';
import { useData } from '../../context/DataContext';

// ====================================================================
// INLINE REUSABLE UI: StatusBadge
// ====================================================================
const StatusBadge = ({ status = 'Available', size = 'sm', className = '' }) => {
  const normalized = (status || '').toLowerCase();
  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (['available', 'active', 'approved', 'verified'].includes(normalized)) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (['assigned', 'busy', 'in progress'].includes(normalized)) {
    colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
    dotColor = 'bg-blue-500';
  } else if (['pending', 'pending review', 'under review', 'onboarding'].includes(normalized)) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
    dotColor = 'bg-amber-500';
  } else if (['rejected', 'inactive', 'terminated'].includes(normalized)) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
    dotColor = 'bg-rose-500';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${sizeClasses} ${colorClasses} ${className}`}>
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
      className="w-full rounded-xl border border-[#c3c6d7]/80 bg-white py-2 pl-9 pr-8 text-xs text-[#191b23] placeholder-slate-400 shadow-xs outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15"
    />
    {value && (
      <button type="button" onClick={() => onChange?.('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
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
          isFiltered ? 'border-[#2563eb] bg-blue-50/50 text-[#004ac6]' : 'border-[#c3c6d7]/80 bg-white text-[#434655] hover:bg-slate-50'
        }`}
      >
        <Filter size={13} className={isFiltered ? 'text-[#004ac6]' : 'text-slate-400'} />
        <span>{label}: <strong>{selectedOption?.label || 'All'}</strong></span>
        <ChevronDown size={13} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <div className="absolute left-0 z-30 mt-1 min-w-[170px] rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange?.(opt.value); setIsOpen(false); }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs ${
                  opt.value === value ? 'bg-blue-50 text-[#004ac6] font-bold' : 'text-[#434655] hover:bg-slate-100'
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
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`relative z-10 w-full ${maxWidth} rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8`}>
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <div>
                {title && <h3 className="text-base font-bold text-[#191b23]">{title}</h3>}
                {subtitle && <p className="mt-0.5 text-xs text-[#737686]">{subtitle}</p>}
              </div>
              {showCloseButton && (
                <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 transition-colors">
                  <X size={18} />
                </button>
              )}
            </div>
          )}
          <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">{children}</div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const FormInput = ({ label, name, type = 'text', placeholder, register, error, required = false, options = [], className = '', disabled = false, ...rest }) => {
  const isError = Boolean(error);
  const inputBaseClasses = `w-full rounded-lg border text-xs text-[#191b23] placeholder-slate-400 transition-all outline-none ${
    isError ? 'border-rose-400 bg-rose-50/20' : 'border-[#c3c6d7] bg-white focus:border-[#004ac6]'
  } ${disabled ? 'bg-slate-100 text-slate-500' : ''}`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="flex items-center justify-between text-xs font-semibold text-[#434655]">
          <span>{label}{required && <span className="text-rose-500 ml-0.5">*</span>}</span>
        </label>
      )}
      {type === 'select' ? (
        <select {...(register ? register(name) : {})} disabled={disabled} className={`${inputBaseClasses} px-3 py-2 bg-white`} {...rest}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
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
    approveWorkforceMember,
    rejectWorkforceMember,
    freelancerApplications = [],
    approveFreelancerApplication,
    rejectFreelancerApplication,
  } = useData();

  // Navigation Filter Tabs
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'active' | 'pending' | 'rejected'
  const [roleTypeFilter, setRoleTypeFilter] = useState('all'); // 'all' | 'Professional' | 'Freelancer'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals state
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [rejectionModalTalent, setRejectionModalTalent] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('Skill set does not match current project requirements');

  // Extract all available skill tags
  const allSkills = useMemo(() => {
    const set = new Set();
    workforce.forEach((w) => w.skills?.forEach((s) => set.add(s)));
    return ['all', ...Array.from(set)];
  }, [workforce]);

  // Counts for Badges
  const pendingCount = useMemo(
    () =>
      workforce.filter(
        (w) =>
          w.approvalStatus === 'Pending Review' ||
          w.approvalStatus === 'Pending' ||
          w.verificationStatus === 'Pending'
      ).length,
    [workforce]
  );
  const pendingPartnerCount = useMemo(
    () =>
      workforce.filter(
        (w) =>
          (w.approvalStatus === 'Pending Review' ||
            w.approvalStatus === 'Pending' ||
            w.verificationStatus === 'Pending') &&
          (w.source === 'Partner Company' || w.professionalType === 'PARTNER_EMPLOYEE')
      ).length,
    [workforce]
  );
  const pendingFreelancerCount = useMemo(
    () =>
      workforce.filter(
        (w) =>
          (w.approvalStatus === 'Pending Review' ||
            w.approvalStatus === 'Pending' ||
            w.verificationStatus === 'Pending') &&
          (w.source === 'Freelancer' ||
            w.source === 'Freelancer Registration' ||
            w.professionalType === 'FREELANCER' ||
            w.roleType === 'Freelancer')
      ).length,
    [workforce]
  );
  const activeTalentCount = useMemo(
    () =>
      workforce.filter(
        (w) =>
          w.approvalStatus === 'Approved' ||
          w.verificationStatus === 'Approved' ||
          w.accountStatus === 'Active'
      ).length,
    [workforce]
  );

  // Filtered Workforce List
  const filteredWorkforce = useMemo(() => {
    return workforce.filter((member) => {
      const isMemberPending =
        member.approvalStatus === 'Pending Review' ||
        member.approvalStatus === 'Pending' ||
        member.verificationStatus === 'Pending';
      const isMemberApproved =
        member.approvalStatus === 'Approved' ||
        member.verificationStatus === 'Approved' ||
        member.accountStatus === 'Active';
      const isMemberRejected =
        member.approvalStatus === 'Rejected' ||
        member.verificationStatus === 'Rejected';

      // Tab Filtering
      if (activeTab === 'active' && !isMemberApproved) return false;
      if (activeTab === 'pending' && !isMemberPending) return false;
      if (activeTab === 'rejected' && !isMemberRejected) return false;

      // Role Type Filtering
      if (roleTypeFilter !== 'all') {
        const isFreelancer =
          member.roleType === 'Freelancer' ||
          member.source === 'Freelancer' ||
          member.source === 'Freelancer Registration' ||
          member.professionalType === 'FREELANCER';
        if (roleTypeFilter === 'Freelancer' && !isFreelancer) return false;
        if (roleTypeFilter === 'Professional' && isFreelancer) return false;
      }

      // Skill Filtering
      if (selectedSkill !== 'all' && !member.skills?.includes(selectedSkill)) return false;

      // Search Query Filtering
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = member.name.toLowerCase().includes(q);
        const matchesTitle = member.title.toLowerCase().includes(q);
        const matchesPartner = (member.partnerName || '').toLowerCase().includes(q);
        const matchesSkills = member.skills?.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesTitle && !matchesPartner && !matchesSkills) return false;
      }

      return true;
    });
  }, [workforce, activeTab, roleTypeFilter, selectedSkill, searchQuery]);

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

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* PAGE HEADER */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#191b23] tracking-tight">
              Workforce Management
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#004ac6] border border-blue-200">
              Admin Review & Approvals
            </span>
          </div>
          <p className="mt-1 text-xs text-[#565e74]">
            Review candidate applications submitted by Partner Companies and Independent Freelancers, and authorize them into the talent pool.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* KPI METRIC CARDS OVERVIEW */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Talent Pool</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{activeTalentCount}</span>
            <span className="text-[11px] font-semibold text-emerald-600">Approved & Ready</span>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900">Pending Approvals</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-900">{pendingCount}</span>
            <span className="text-[11px] font-bold text-amber-700">Needs Admin Decision</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Available Talent</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{workforce.filter((w) => w.availability === 'Available').length}</span>
            <span className="text-[11px] text-indigo-600 font-bold">Ready for Projects</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Workforce Pool</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Code2 size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{workforce.length}</span>
            <span className="text-[11px] text-slate-500">Registered Talent</span>
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
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-[#2563eb] text-white shadow-xs'
              : 'text-[#565e74] hover:bg-slate-100'
          }`}
        >
          <Users size={15} />
          <span>All Records ({workforce.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'active'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-[#565e74] hover:bg-slate-100'
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
              : 'text-[#565e74] hover:bg-slate-100'
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
              : 'text-[#565e74] hover:bg-slate-100'
          }`}
        >
          <Sparkles size={15} />
          <span>Freelancer Applications</span>
          {(freelancerApplications || []).filter((a) => a.status === 'Pending Admin Approval').length > 0 && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                activeTab === 'freelancer-applications' ? 'bg-white text-purple-700' : 'bg-[#7c3aed] text-white'
              }`}
            >
              {(freelancerApplications || []).filter((a) => a.status === 'Pending Admin Approval').length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rejected')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'rejected'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-[#565e74] hover:bg-slate-100'
          }`}
        >
          <X size={15} />
          <span>Rejected Requests</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* FILTER CONTROLS BAR */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#c3c6d7]/70 shadow-xs">
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

          <FilterDropdown
            label="Skill"
            value={selectedSkill}
            onChange={setSelectedSkill}
            options={allSkills.slice(0, 10).map((s) => ({
              value: s,
              label: s === 'all' ? 'All Skills' : s,
            }))}
          />

          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-[#c3c6d7]/80 bg-slate-100 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-[#004ac6]' : 'text-slate-500'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === 'table' ? 'bg-white shadow-xs text-[#004ac6]' : 'text-slate-500'
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
      {activeTab === 'freelancer-applications' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Submitted Freelancer Applications ({freelancerApplications.length})
            </h3>
            <span className="text-xs text-slate-500">
              Approve to add candidate to active workforce pool
            </span>
          </div>

          {freelancerApplications.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#c3c6d7] bg-white p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#7c3aed] flex items-center justify-center mb-3">
                <Sparkles size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No Freelancer Applications Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Applications submitted by independent freelancers via the Workforce login page will appear here for Admin approval.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {freelancerApplications.map((app) => {
                const isPending = app.status === 'Pending Admin Approval';
                const isApproved = app.status === 'Approved';
                const isRejected = app.status === 'Rejected';

                return (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-purple-300 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-extrabold text-slate-900">{app.fullName}</h4>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                isPending
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : isApproved
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}
                            >
                              {app.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin size={13} className="text-slate-400" /> {app.place || 'Location N/A'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Briefcase size={13} className="text-slate-400" /> {app.experience || 'Experience N/A'}
                            </span>
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
                          <span className="font-semibold text-slate-800">{app.phone}</span>
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
                            toast.info(`Rejected application for ${app.fullName}.`);
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
                        <span className={isApproved ? 'text-emerald-600' : 'text-rose-600'}>
                          Decision Finalized
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
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#c3c6d7] bg-white p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
            <FolderSearch size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No workforce resources match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Try adjusting your search keywords, role filters, or check the Pending Admin Review tab.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWorkforce.map((talent) => {
            const isPending = talent.approvalStatus === 'Pending Review';
            const isRejected = talent.approvalStatus === 'Rejected';

            return (
              <motion.div
                key={talent.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-xs hover:shadow-md transition-all ${
                  isPending
                    ? 'border-amber-300 ring-2 ring-amber-400/20 bg-amber-50/10'
                    : isRejected
                    ? 'border-rose-200 bg-rose-50/10 opacity-75'
                    : 'border-[#c3c6d7]/80 hover:border-blue-400'
                }`}
              >
                <div>
                  {/* Top Bar: Source & Approval Status */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold">
                      {talent.source === 'Partner Company' ? (
                        <span className="inline-flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 truncate max-w-[170px]" title={talent.partnerName}>
                          <Handshake size={12} className="shrink-0" />
                          <span className="truncate">{talent.partnerName}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          <Code2 size={12} className="shrink-0" />
                          <span>Direct Freelancer</span>
                        </span>
                      )}
                    </div>
                    <StatusBadge status={talent.approvalStatus || talent.status} />
                  </div>

                  {/* Candidate Identity */}
                  <div className="mt-3.5 flex items-start gap-3.5">
                    <img
                      src={talent.avatar}
                      alt={talent.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-white shadow-xs shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-900 truncate">{talent.name}</h3>
                      <p className="text-xs font-semibold text-blue-600 truncate">{talent.title}</p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                        <span>{talent.experience}</span>
                        <span>•</span>
                        <span className="font-bold text-slate-800">{talent.hourlyRate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills Tags */}
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {talent.skills?.slice(0, 4).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/80 text-[10px] font-semibold text-slate-700"
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
                <div className="mt-5 pt-3.5 border-t border-slate-100">
                  {isPending ? (
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center justify-between">
                        <span>Admin Decision Required</span>
                        <span>{talent.submittedDate || 'Pending'}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {/* ACCEPT BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleAdminAccept(talent)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                        >
                          <Check size={14} />
                          <span>Accept</span>
                        </button>

                        {/* REJECT BUTTON */}
                        <button
                          type="button"
                          onClick={() => setRejectionModalTalent(talent)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white border border-rose-300 hover:bg-rose-50 text-rose-700 text-xs font-bold shadow-2xs active:scale-95 transition-all"
                        >
                          <X size={14} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setSelectedTalent(talent)}
                        className="w-full text-center py-2 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 text-xs font-bold text-slate-700 transition-colors"
                      >
                        View Verification Details
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Talent Name & Title</th>
                  <th className="py-3.5 px-4">Source / Partner</th>
                  <th className="py-3.5 px-4">Hourly Rate</th>
                  <th className="py-3.5 px-4">Experience</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWorkforce.map((talent) => {
                  const isPending = talent.approvalStatus === 'Pending Review';
                  return (
                    <tr key={talent.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img src={talent.avatar} alt={talent.name} className="w-9 h-9 rounded-lg object-cover" />
                          <div>
                            <p className="font-bold text-slate-900">{talent.name}</p>
                            <p className="text-[11px] text-blue-600 font-medium">{talent.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800">
                          {talent.source === 'Partner Company' ? talent.partnerName : 'Direct Freelancer'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{talent.hourlyRate}</td>
                      <td className="py-3 px-4">{talent.experience}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={talent.approvalStatus || talent.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleAdminAccept(talent)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectionModalTalent(talent)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold hover:bg-rose-100"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedTalent(talent)}
                            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                          >
                            Details
                          </button>
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
      <Modal
        isOpen={Boolean(selectedTalent)}
        onClose={() => setSelectedTalent(null)}
        title="Candidate Profile & Verification"
        subtitle={selectedTalent?.title}
      >
        {selectedTalent && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <img
                src={selectedTalent.avatar}
                alt={selectedTalent.name}
                className="w-16 h-16 rounded-xl object-cover ring-2 ring-white shadow-xs"
              />
              <div>
                <h4 className="text-base font-bold text-slate-900">{selectedTalent.name}</h4>
                <p className="text-xs font-semibold text-blue-600">{selectedTalent.title}</p>
                <div className="mt-1 flex items-center gap-2">
                  <StatusBadge status={selectedTalent.approvalStatus || selectedTalent.status} />
                  <span className="text-xs font-bold text-slate-800">{selectedTalent.hourlyRate}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Recruitment Source</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {selectedTalent.source === 'Partner Company' ? selectedTalent.partnerName : 'Direct Freelancer'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Experience</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedTalent.experience}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Email Address</span>
                <p className="font-bold text-slate-800 mt-0.5 truncate">{selectedTalent.email}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Location</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedTalent.location}</p>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Technical Competencies</h5>
              <div className="flex flex-wrap gap-1.5">
                {selectedTalent.skills?.map((skill, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* If Pending, Show Admin Accept/Reject Controls */}
            {selectedTalent.approvalStatus === 'Pending Review' && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Admin Decision Required</h5>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleAdminAccept(selectedTalent)}
                    className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                  >
                    Accept Candidate
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRejectionModalTalent(selectedTalent);
                    }}
                    className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                  >
                    Reject Request
                  </button>
                </div>
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
    </div>
  );
};

export default WorkforceManagement;
