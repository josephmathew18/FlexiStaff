import React, { useState, useMemo } from 'react';
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

  if (['pending', 'inactive', 'pending review', 'onboarding'].includes(normalized)) {
    bg = 'bg-amber-50 text-amber-700 border-amber-200';
    dot = 'bg-amber-500';
  } else if (['rejected', 'terminated'].includes(normalized)) {
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
      className="w-full rounded-xl border border-[#c3c6d7]/80 bg-white py-2.5 pl-9 pr-8 text-xs text-[#191b23] placeholder-slate-400 shadow-xs outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
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
        className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-all ${
          isFiltered ? 'border-[#2563eb] bg-blue-50/60 text-[#004ac6]' : 'border-[#c3c6d7]/80 bg-white text-[#434655] hover:bg-slate-50'
        }`}
      >
        <Filter size={13} className={isFiltered ? 'text-[#004ac6]' : 'text-slate-400'} />
        <span>{label}: <strong>{selectedOption?.label || 'All'}</strong></span>
        <ChevronDown size={13} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <div className="absolute left-0 z-30 mt-1 min-w-[170px] rounded-xl border border-slate-200 bg-white p-1 shadow-lg shadow-slate-900/10">
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
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className={`relative z-10 w-full ${maxWidth} rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8`}>
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/60">
              <div>
                {title && <h3 className="text-base font-bold text-[#191b23]">{title}</h3>}
                {subtitle && <p className="mt-0.5 text-xs text-[#737686]">{subtitle}</p>}
              </div>
              {showCloseButton && (
                <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors">
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
  const inputBaseClasses = `w-full rounded-xl border text-xs text-[#191b23] placeholder-slate-400 transition-all outline-none ${
    isError ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' : 'border-[#c3c6d7] bg-white focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15'
  } ${disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="flex items-center justify-between text-xs font-semibold text-[#434655]">
          <span>{label}{required && <span className="text-rose-500 ml-0.5">*</span>}</span>
        </label>
      )}
      {type === 'select' ? (
        <select {...(register ? register(name) : {})} disabled={disabled} className={`${inputBaseClasses} px-3 py-2.5 bg-white`} {...rest}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input type={type} {...(register ? register(name) : {})} disabled={disabled} placeholder={placeholder} className={`${inputBaseClasses} px-3 py-2.5`} {...rest} />
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

// Form Schemas
const partnerSchema = yup.object().shape({
  name: yup.string().required('Partner company name is required'),
  contactPerson: yup.string().required('Contact person is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  tier: yup.string().required('Partnership tier is required'),
  suppliedProfessionals: yup
    .number()
    .typeError('Enter a valid number')
    .min(0, 'Cannot be negative')
    .required('Supplied talent count is required'),
  status: yup.string().required('Status is required'),
  location: yup.string().required('Location is required'),
  specialties: yup.string().required('Enter comma-separated specialty skills'),
});

const submitStaffSchema = yup.object().shape({
  name: yup.string().required('Candidate name is required'),
  partnerName: yup.string().required('Partner company is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  title: yup.string().required('Job title / designation is required'),
  skills: yup.string().required('Enter comma-separated skills'),
  experience: yup.string().required('Experience range is required'),
  hourlyRate: yup.string().required('Hourly billing rate is required'),
  location: yup.string().required('Location is required'),
});

export const PartnerManagement = () => {
  const { partners, addPartner, workforce, submitPartnerCandidate, projects } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [staffSubmitPartner, setStaffSubmitPartner] = useState(null);

  // Form for Registering New Partner Company
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(partnerSchema),
    defaultValues: {
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      tier: 'Tier-1 Strategic Partner',
      suppliedProfessionals: 15,
      status: 'Active',
      location: 'San Jose, CA',
      specialties: 'AWS, Kubernetes, DevOps, Python',
    },
  });

  // Form for Submitting Temporary Staff under a Partner
  const {
    register: registerStaff,
    handleSubmit: handleStaffSubmit,
    reset: resetStaff,
    formState: { errors: staffErrors, isSubmitting: isSubmittingStaff },
  } = useForm({
    resolver: yupResolver(submitStaffSchema),
    defaultValues: {
      name: '',
      partnerName: '',
      email: '',
      phone: '',
      title: 'Senior Cloud DevOps Specialist',
      skills: 'AWS, Kubernetes, Docker, Terraform',
      experience: '6+ years',
      hourlyRate: '$110/hr',
      location: 'Seattle, WA',
    },
  });

  // Filtered Partners
  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.specialties?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' || p.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesTier =
        tierFilter === 'all' || (p.tier || '').toLowerCase().includes(tierFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesTier;
    });
  }, [partners, searchQuery, statusFilter, tierFilter]);

  // Aggregate Partner Metrics
  const totalSuppliedStaff = useMemo(() => {
    return partners.reduce((sum, p) => sum + (Number(p.suppliedProfessionals) || 0), 0);
  }, [partners]);

  const totalActivePlacements = useMemo(() => {
    return partners.reduce((sum, p) => sum + (Number(p.activePlacements) || 0), 0);
  }, [partners]);

  // Register new Partner Submit
  const onAddSubmit = (data) => {
    const specialtiesArray = data.specialties.split(',').map((s) => s.trim()).filter(Boolean);
    addPartner({
      ...data,
      specialties: specialtiesArray,
    });
    toast.success(`Partner Organization ${data.name} registered successfully!`);
    reset();
    setIsAddModalOpen(false);
  };

  // Submit Staff for Partner
  const onSubmitStaff = (data) => {
    const skillsArray = data.skills.split(',').map((s) => s.trim()).filter(Boolean);
    submitPartnerCandidate({
      ...data,
      skills: skillsArray,
      partnerName: staffSubmitPartner?.name || data.partnerName,
      roleType: 'Professional',
    });
    toast.success(`Candidate ${data.name} submitted under ${staffSubmitPartner?.name || data.partnerName} for Admin Review!`);
    resetStaff();
    setStaffSubmitPartner(null);
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
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#191b23] tracking-tight">
                Partner Staffing Organizations
              </h1>
              <p className="text-xs text-[#737686]">
                Manage vendor partnerships, external engineering guilds, talent supply agreements, and candidate submissions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Partner Agencies</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Handshake size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{partners.length}</span>
            <span className="text-xs font-semibold text-emerald-600">Active Network</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Approved staffing vendors</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Supplied Talent Pool</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalSuppliedStaff}</span>
            <span className="text-xs text-slate-500">Engineers</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Total cataloged professionals</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Deployed Placements</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalActivePlacements}</span>
            <span className="text-xs font-bold text-emerald-600">
              {totalSuppliedStaff > 0 ? `${Math.round((totalActivePlacements / totalSuppliedStaff) * 100)}%` : '0%'} Allocated
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Engaged on client sprints</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Bench Readiness SLA</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">92.8%</span>
            <span className="text-xs font-bold text-indigo-600">&lt; 24h Response</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Average candidate mobilization</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FILTER CONTROLS BAR */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 bg-white p-4 rounded-2xl border border-[#c3c6d7]/70 shadow-xs">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by partner name, contact person, location, or skills..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <FilterDropdown
            label="Tier"
            value={tierFilter}
            onChange={setTierFilter}
            options={[
              { value: 'all', label: 'All Tiers' },
              { value: 'Tier-1', label: 'Tier-1 Strategic' },
              { value: 'Tier-2', label: 'Tier-2 Preferred' },
              { value: 'Tier-3', label: 'Tier-3 Certified' },
            ]}
          />

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

          <div className="flex items-center rounded-xl border border-[#c3c6d7]/80 bg-slate-100 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`rounded-lg p-2 transition-all ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-[#004ac6]' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`rounded-lg p-2 transition-all ${
                viewMode === 'table' ? 'bg-white shadow-xs text-[#004ac6]' : 'text-slate-500 hover:text-slate-800'
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
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#c3c6d7] bg-white p-12 text-center">
          <FolderSearch size={32} className="text-slate-400 mb-2" />
          <h4 className="text-sm font-bold text-[#191b23]">No partner organizations found</h4>
          <p className="text-xs text-slate-500 mt-0.5">Try adjusting your search criteria or register a new partner agency.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((partner) => {
            const partnerStaffList = workforce.filter(
              (w) => w.partnerName === partner.name
            );

            return (
              <motion.div
                key={partner.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all space-y-4"
              >
                <div>
                  {/* Top Bar: Tier Badge & Status */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200/60">
                      {partner.tier}
                    </span>
                    <StatusBadge status={partner.status} />
                  </div>

                  {/* Company Info */}
                  <div className="mt-3.5 flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-50 to-blue-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 shadow-2xs">
                      <Building2 size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">{partner.name}</h3>
                      <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate">{partner.location}</span>
                      </p>
                    </div>
                  </div>

                  {/* Representative Card */}
                  <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="font-bold text-slate-800 flex items-center justify-between">
                      <span>{partner.contactPerson}</span>
                      <span className="text-[11px] text-amber-600 font-bold flex items-center gap-0.5">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <span>{partner.rating || 4.8}</span>
                      </span>
                    </div>
                    <p className="text-slate-500 truncate text-[11px] flex items-center gap-1.5">
                      <Mail size={11} className="text-slate-400 shrink-0" />
                      <span className="truncate">{partner.email}</span>
                    </p>
                    <p className="text-slate-500 text-[11px] flex items-center gap-1.5">
                      <Phone size={11} className="text-slate-400 shrink-0" />
                      <span>{partner.phone}</span>
                    </p>
                  </div>

                  {/* Metrics 2-column strip */}
                  <div className="mt-3.5 grid grid-cols-2 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Supplied Staff</span>
                      <span className="block text-xs font-extrabold text-slate-900 mt-0.5">
                        {partner.suppliedProfessionals || partnerStaffList.length} Engineers
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Active Placed</span>
                      <span className="block text-xs font-extrabold text-emerald-600 mt-0.5">
                        {partner.activePlacements || 0} Placed
                      </span>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {partner.specialties?.slice(0, 3).map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold text-slate-700"
                      >
                        {spec}
                      </span>
                    ))}
                    {(partner.specialties?.length || 0) > 3 && (
                      <span className="text-[10px] text-slate-400 font-semibold self-center">
                        +{partner.specialties.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStaffSubmitPartner(partner);
                      resetStaff({
                        name: '',
                        partnerName: partner.name,
                        email: '',
                        phone: '',
                        title: 'Senior Cloud Specialist',
                        skills: partner.specialties?.join(', ') || 'AWS, Kubernetes, Go',
                        experience: '5+ years',
                        hourlyRate: '$110/hr',
                        location: partner.location,
                      });
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors shadow-2xs"
                  >
                    <UserPlus size={13} />
                    <span>Submit Staff</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPartner(partner)}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    <span>View Agreement</span>
                  </button>
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
                  <th className="py-3.5 px-4">Partner Organization</th>
                  <th className="py-3.5 px-4">Representative</th>
                  <th className="py-3.5 px-4">Supplied Roster</th>
                  <th className="py-3.5 px-4">Active Deployments</th>
                  <th className="py-3.5 px-4">Readiness SLA</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPartners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{partner.name}</p>
                        <p className="text-[11px] text-indigo-600 font-medium">{partner.tier}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{partner.contactPerson}</p>
                      <p className="text-[11px] text-slate-500">{partner.email}</p>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{partner.suppliedProfessionals} Engineers</td>
                    <td className="py-3 px-4 font-bold text-emerald-600">{partner.activePlacements} Placed</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{partner.availabilityRate || '90%'}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={partner.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedPartner(partner)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                      >
                        Details
                      </button>
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
            placeholder="e.g. Nexus Global Staffing"
            register={register}
            error={errors.name}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FormInput
              label="Contact Representative"
              name="contactPerson"
              placeholder="e.g. Jonathan Hayes"
              register={register}
              error={errors.contactPerson}
              required
            />
            <FormInput
              label="Partnership Tier"
              name="tier"
              type="select"
              register={register}
              error={errors.tier}
              required
              options={[
                { value: 'Tier-1 Strategic Partner', label: 'Tier-1 Strategic Partner' },
                { value: 'Tier-2 Preferred Partner', label: 'Tier-2 Preferred Partner' },
                { value: 'Tier-3 Certified Partner', label: 'Tier-3 Certified Partner' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FormInput
              label="Corporate Email"
              name="email"
              type="email"
              placeholder="jonathan@nexusstaff.com"
              register={register}
              error={errors.email}
              required
            />
            <FormInput
              label="Phone Number"
              name="phone"
              placeholder="+1 (415) 555-0182"
              register={register}
              error={errors.phone}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <FormInput
              label="Talent Capacity"
              name="suppliedProfessionals"
              type="number"
              placeholder="15"
              register={register}
              error={errors.suppliedProfessionals}
              required
            />
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
            <FormInput
              label="Headquarters"
              name="location"
              placeholder="Seattle, WA"
              register={register}
              error={errors.location}
              required
            />
          </div>

          <FormInput
            label="Specialty Skill Domains (Comma-separated)"
            name="specialties"
            placeholder="AWS, Kubernetes, Go, Python, React"
            register={register}
            error={errors.specialties}
            required
          />

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
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
      {/* MODAL 2: SUBMIT TEMPORARY STAFF UNDER PARTNER */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(staffSubmitPartner)}
        onClose={() => setStaffSubmitPartner(null)}
        title={`Submit Temporary Staff for ${staffSubmitPartner?.name}`}
        subtitle="This candidate will be sent to the FlexiStaff Admin Review Queue for acceptance."
      >
        <form onSubmit={handleStaffSubmit(onSubmitStaff)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FormInput
              label="Candidate Full Name"
              name="name"
              placeholder="e.g. Victor Hansen"
              register={registerStaff}
              error={staffErrors.name}
              required
            />
            <FormInput
              label="Job Title / Designation"
              name="title"
              placeholder="e.g. Senior Kubernetes Specialist"
              register={registerStaff}
              error={staffErrors.title}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FormInput
              label="Corporate Email"
              name="email"
              type="email"
              placeholder="victor@staffingagency.com"
              register={registerStaff}
              error={staffErrors.email}
              required
            />
            <FormInput
              label="Phone Number"
              name="phone"
              placeholder="+1 (415) 555-0199"
              register={registerStaff}
              error={staffErrors.phone}
              required
            />
          </div>

          <FormInput
            label="Verified Technical Skills (Comma-separated)"
            name="skills"
            placeholder="Go, Kubernetes, AWS, Distributed Systems"
            register={registerStaff}
            error={staffErrors.skills}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <FormInput
              label="Experience"
              name="experience"
              placeholder="6+ years"
              register={registerStaff}
              error={staffErrors.experience}
              required
            />
            <FormInput
              label="Hourly Billing Rate"
              name="hourlyRate"
              placeholder="$115/hr"
              register={registerStaff}
              error={staffErrors.hourlyRate}
              required
            />
            <FormInput
              label="Location"
              name="location"
              placeholder="Stockholm, SE"
              register={registerStaff}
              error={staffErrors.location}
              required
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setStaffSubmitPartner(null)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingStaff}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
            >
              Submit to Admin Queue
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: PARTNER SLA & AGREEMENT DETAILS */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(selectedPartner)}
        onClose={() => setSelectedPartner(null)}
        title={selectedPartner?.name}
        subtitle={selectedPartner?.tier}
      >
        {selectedPartner && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-indigo-900">{selectedPartner.name}</p>
                <p className="text-[11px] text-indigo-700 mt-0.5">{selectedPartner.location} • SLA: Active Verified</p>
              </div>
              <StatusBadge status={selectedPartner.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Representative</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedPartner.contactPerson}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{selectedPartner.email}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Quality Rating</span>
                <p className="font-bold text-amber-600 mt-0.5 flex items-center gap-1">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span>{selectedPartner.rating || 4.8} / 5.0</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">{selectedPartner.availabilityRate || '90%'} Availability</p>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Specialized Engineering Domains
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {selectedPartner.specialties?.map((s, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setStaffSubmitPartner(selectedPartner);
                  setSelectedPartner(null);
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus size={15} />
                <span>Submit Candidate for this Partner</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PartnerManagement;
