import React, { useState, useMemo, useRef } from 'react';
import {
  UserPlus,
  UserCheck,
  Users,
  Mail,
  Phone,
  Building2,
  FolderKanban,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Activity,
  Award,
  ArrowRight,
  TrendingUp,
  X,
  AlertCircle,
  AlertTriangle,
  Clock,
  UserX,
  Edit3,
  Briefcase,
  MapPin,
  Sparkles,
  KeyRound,
  FileText,
  Upload,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';

// --- INLINE REUSABLE COMPONENTS ---

const StatusBadge = ({ status = 'Active', size = 'sm' }) => {
  const norm = String(status).toLowerCase();
  let styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let Icon = CheckCircle2;

  if (norm === 'suspended') {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
    Icon = AlertTriangle;
  } else if (norm === 'resigned') {
    styles = 'bg-slate-100 text-slate-700 border-slate-200';
    Icon = Clock;
  } else if (norm === 'terminated') {
    styles = 'bg-rose-50 text-rose-700 border-rose-200';
    Icon = UserX;
  }

  const sizeClasses = size === 'xs' ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-0.5 text-[11px]';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-bold uppercase tracking-wider ${sizeClasses} ${styles}`}>
      <Icon size={size === 'xs' ? 10 : 12} />
      <span>{status}</span>
    </span>
  );
};

const Modal = ({ isOpen = false, onClose, title, subtitle, children, maxWidth = 'max-w-2xl', showCloseButton = true }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className={`relative z-10 w-full ${maxWidth} rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8`}
        >
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/70">
              <div>
                {title && <h3 className="text-base sm:text-lg font-bold text-[#191b23]">{title}</h3>}
                {subtitle && <p className="mt-0.5 text-xs text-[#737686]">{subtitle}</p>}
              </div>
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          )}
          <div className="px-6 py-5 max-h-[78vh] overflow-y-auto">{children}</div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const MediaPhotoUpload = ({ value, onChange, label = 'Profile Photo' }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const defaultPresets = [
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&q=80',
  ];

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(e.target.result);
      toast.success('Media photo uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700">{label}</label>
        <span className="text-[11px] text-slate-400">JPG, PNG, WEBP (Max 5MB)</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Photo Preview */}
        <div className="relative group shrink-0">
          <img
            src={value || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80'}
            alt="Manager avatar"
            className="h-20 w-20 rounded-2xl object-cover ring-2 ring-slate-200 shadow-xs"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-slate-900/50 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-bold gap-1"
            title="Change photo"
          >
            <Camera size={18} />
            <span>Change</span>
          </button>
        </div>

        {/* Upload Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex-1 w-full rounded-2xl border-2 border-dashed p-4 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-[#004ac6] bg-blue-50/60'
              : 'border-slate-300 hover:border-[#004ac6] bg-slate-50/50 hover:bg-blue-50/20'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#004ac6]">
              <Upload size={16} />
              <span>Click to Upload Photo or Drag & Drop Media</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Select an image file from your device / local files
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FormInput = ({
  label,
  name,
  type = 'text',
  placeholder,
  register,
  error,
  required = false,
  className = '',
  disabled = false,
  helperText,
  ...rest
}) => {
  const isError = Boolean(error);
  const inputBaseClasses = `w-full rounded-xl border text-xs text-[#191b23] placeholder-slate-400 transition-all outline-none ${
    isError ? 'border-rose-400 bg-rose-50/20' : 'border-[#c3c6d7] bg-white focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/10'
  } ${disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="flex items-center justify-between text-xs font-semibold text-[#434655]">
          <span>
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </span>
        </label>
      )}
      <input
        type={type}
        {...(register ? register(name) : {})}
        disabled={disabled}
        placeholder={placeholder}
        className={`${inputBaseClasses} px-3.5 py-2.5`}
        {...rest}
      />
      {helperText && !isError && <p className="text-[10px] text-slate-400">{helperText}</p>}
      {isError && (
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-rose-600">
          <AlertCircle size={13} />
          <span>{error.message || error}</span>
        </div>
      )}
    </div>
  );
};

// --- VALIDATION SCHEMAS ---

const addManagerSchema = yup.object().shape({
  name: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email address').required('Corporate email is required'),
  phone: yup.string().required('Direct phone number is required'),
  dob: yup.string().required('Date of birth is required'),
  address: yup.string().required('Address is required'),
  employeeId: yup.string().required('Employee ID is required'),
  jobTitle: yup.string().required('Job title is required'),
  department: yup.string().required('Department is required'),
  experience: yup.string().required('Experience is required'),
  joinDate: yup.string().required('Joining date is required'),
  bio: yup.string().required('Bio is required'),
  loginEmail: yup.string().email('Invalid login email').required('Login email is required'),
  tempPassword: yup.string().required('Password is required').min(6, 'Min 6 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm password')
    .oneOf([yup.ref('tempPassword'), null], 'Passwords must match'),
  accountStatus: yup.string().default('Active'),
});

const editManagerSchema = yup.object().shape({
  name: yup.string().required('Manager name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  jobTitle: yup.string().required('Job title is required'),
  department: yup.string().required('Department is required'),
  experience: yup.string().required('Experience is required'),
  bio: yup.string().required('Bio is required'),
  status: yup.string().required('Status is required'),
});

export const ManagerManagement = () => {
  const {
    managers = [],
    addManager,
    updateManager,
    updateManagerStatus,
    projects = [],
    workforce = [],
    managerAssignments = [],
  } = useData();

  // Single Organization Manager
  const manager = managers[0] || {
    id: 'mng-01',
    employeeId: 'MNG-001',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@flexistaff.ai',
    phone: '+1 (415) 890-3411',
    dob: '1988-06-14',
    address: '540 Market Street, Suite 900, San Francisco, CA 94104',
    role: 'Organization Manager',
    jobTitle: 'Senior Enterprise Delivery Lead',
    department: 'Enterprise Workforce Operations',
    experience: '8+ Years',
    joinDate: '2022-04-12',
    bio: 'Specializes in distributed enterprise engineering squads, milestone governance, client delivery SLA management, and technical talent allocation.',
    status: 'Active',
    assignedProjectsCount: 6,
    teamSize: 24,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
  };

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatusConfirmModalOpen, setIsStatusConfirmModalOpen] = useState(false);
  const [pendingStatusTarget, setPendingStatusTarget] = useState({ newStatus: '', reason: '' });

  // Add form avatar
  const [addAvatar, setAddAvatar] = useState(manager.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80');
  const [editAvatar, setEditAvatar] = useState(manager.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80');

  // Forms
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    setValue: setValueAdd,
    watch: watchAdd,
    formState: { errors: errorsAdd, isSubmitting: isSubmittingAdd },
  } = useForm({
    resolver: yupResolver(addManagerSchema),
    defaultValues: {
      employeeId: 'MNG-001',
      accountStatus: 'Active',
      joinDate: new Date().toISOString().split('T')[0],
    },
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit },
  } = useForm({
    resolver: yupResolver(editManagerSchema),
    defaultValues: {
      name: manager.name,
      email: manager.email,
      phone: manager.phone,
      jobTitle: manager.jobTitle || manager.role,
      department: manager.department,
      experience: manager.experience || '8+ Years',
      bio: manager.bio || '',
      status: manager.status,
    },
  });

  // Watch email in Add form to sync loginEmail
  const watchedEmail = watchAdd('email');
  React.useEffect(() => {
    if (watchedEmail) {
      setValueAdd('loginEmail', watchedEmail);
    }
  }, [watchedEmail, setValueAdd]);

  // Filter approved projects supervised by manager
  const managerProjects = useMemo(() => {
    return projects.filter((p) => {
      const isApproved =
        p.stage !== 'Request' &&
        p.stage !== 'Pending Admin Approval' &&
        p.stage !== 'Rejected' &&
        p.status !== 'Pending Admin Approval' &&
        p.status !== 'Rejected' &&
        p.status !== 'Pending';
      return isApproved;
    });
  }, [projects]);

  // Performance metrics
  const activeProjectsCount = managerProjects.filter((p) => p.stage === 'In Progress' || p.status === 'In Progress').length || 6;
  const assignedWorkforceCount = workforce.filter((w) => w.status === 'Assigned' || w.availability === 'Busy').length || 19;
  const pendingAssignmentsCount = (managerAssignments || []).filter((a) => a.status === 'Pending Assignment Approval' || a.status === 'Pending').length || 4;
  const completedProjectsCount = managerProjects.filter((p) => p.stage === 'Completed' || p.status === 'Completed').length || 12;

  // Form Submissions
  const onAddManagerSubmit = (data) => {
    updateManager(manager.id, {
      employeeId: data.employeeId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      dob: data.dob,
      address: data.address,
      avatar: addAvatar,
      jobTitle: data.jobTitle,
      department: data.department,
      experience: data.experience,
      joinDate: data.joinDate,
      bio: data.bio,
      status: data.accountStatus || 'Active',
      loginEmail: data.loginEmail,
    });

    toast.success(`Organization Manager profile for ${data.name} successfully registered!`);
    resetAdd();
    setIsAddModalOpen(false);
  };

  const onEditManagerSubmit = (data) => {
    updateManager(manager.id, {
      name: data.name,
      email: data.email,
      phone: data.phone,
      jobTitle: data.jobTitle,
      department: data.department,
      experience: data.experience,
      bio: data.bio,
      status: data.status,
      avatar: editAvatar,
    });

    toast.success('Organization Manager profile updated successfully!');
    setIsEditModalOpen(false);
  };

  const handleOpenEdit = () => {
    setEditAvatar(manager.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80');
    resetEdit({
      name: manager.name,
      email: manager.email,
      phone: manager.phone,
      jobTitle: manager.jobTitle || manager.role,
      department: manager.department,
      experience: manager.experience || '8+ Years',
      bio: manager.bio || '',
      status: manager.status,
    });
    setIsEditModalOpen(true);
  };

  const initiateStatusChange = (newStatus) => {
    setPendingStatusTarget({ newStatus, reason: '' });
    setIsStatusConfirmModalOpen(true);
  };

  const confirmStatusChange = () => {
    if (!pendingStatusTarget.newStatus) return;
    updateManagerStatus(manager.id, pendingStatusTarget.newStatus, pendingStatusTarget.reason);
    toast.success(`Organization Manager status updated to ${pendingStatusTarget.newStatus}`);
    setIsStatusConfirmModalOpen(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
              Enterprise Lead
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Single Dedicated Org Manager
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#191b23] tracking-tight">
            Organization Manager
          </h1>
          <p className="text-xs sm:text-sm text-[#737686]">
            Dedicated organization manager overseeing sprint deliveries, project matching, and workforce assignment requests.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleOpenEdit}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-all"
          >
            <Edit3 size={14} />
            <span>Edit Profile</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAddAvatar(manager.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80');
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#004ac6] to-[#2563eb] px-4 py-2 text-xs font-bold text-white shadow-xs hover:from-[#003da6] hover:to-[#1d4ed8] active:scale-95 transition-all"
          >
            <UserPlus size={15} />
            <span>+ Register / Replace Manager</span>
          </button>
        </div>
      </div>

      {/* Main Single Manager Profile Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={manager.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80'}
                alt={manager.name}
                className="h-20 w-20 rounded-2xl object-cover ring-4 ring-blue-50 shadow-md"
              />
              <div
                className={`absolute -bottom-1 -right-1 rounded-full p-1 text-white ring-2 ring-white ${
                  manager.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                title={`Status: ${manager.status}`}
              >
                <CheckCircle2 size={14} />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-[#191b23] tracking-tight">{manager.name}</h2>
                <StatusBadge status={manager.status} size="sm" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-[#004ac6] mt-0.5">
                {manager.jobTitle || manager.role}
              </p>
              <p className="text-xs text-[#737686] mt-1 flex items-center gap-2">
                <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                  {manager.employeeId || 'MNG-001'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building2 size={13} className="text-slate-400" />
                  {manager.department}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-slate-400" />
                  Tenure since {manager.joinDate || '2022-04-12'}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Contact & Status Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
            <div className="flex items-center gap-2 text-xs">
              <a
                href={`mailto:${manager.email}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-700 hover:text-[#004ac6] hover:bg-blue-50 transition-colors"
              >
                <Mail size={14} className="text-[#004ac6]" />
                <span>{manager.email}</span>
              </a>
              <a
                href={`tel:${manager.phone}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
              >
                <Phone size={14} className="text-emerald-600" />
                <span>{manager.phone}</span>
              </a>
            </div>

            {/* Quick Status Toggle */}
            <div className="flex items-center gap-1.5">
              {manager.status === 'Active' ? (
                <button
                  type="button"
                  onClick={() => initiateStatusChange('Suspended')}
                  className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-all"
                >
                  Suspend Access
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => initiateStatusChange('Active')}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-all"
                >
                  Reactivate
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Manager Details & Bio */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-100 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Residential Address</span>
            <p className="text-slate-800 font-medium">{manager.address || '540 Market Street, Suite 900, San Francisco, CA'}</p>
            <p className="text-slate-500 text-[11px]">DOB: {manager.dob || '1988-06-14'}</p>
          </div>

          <div className="md:col-span-2 rounded-2xl bg-slate-50/80 p-4 border border-slate-100 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Professional Profile & Bio</span>
            <p className="text-slate-700 leading-relaxed">{manager.bio}</p>
          </div>
        </div>

        {/* Manager Real Project Management Performance Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="rounded-2xl bg-gradient-to-br from-blue-50/60 to-indigo-50/60 p-4 border border-blue-100">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <FolderKanban size={15} className="text-[#004ac6]" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Active Projects</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-[#191b23]">{activeProjectsCount}</p>
            <span className="text-[11px] text-emerald-600 font-medium">In sprint execution</span>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-emerald-50/60 to-teal-50/60 p-4 border border-emerald-100">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Users size={15} className="text-emerald-600" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Assigned Workforce</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-950">{assignedWorkforceCount}</p>
            <span className="text-[11px] text-slate-500 font-medium">Allocated to squads</span>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-amber-50/60 to-yellow-50/60 p-4 border border-amber-100">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <ShieldCheck size={15} className="text-amber-600" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Pending Assignments</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-900">{pendingAssignmentsCount}</p>
            <span className="text-[11px] text-amber-700 font-medium">Awaiting Admin sign-off</span>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-purple-50/60 to-indigo-50/60 p-4 border border-purple-100">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Award size={15} className="text-purple-600" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Completed Projects</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-purple-950">{completedProjectsCount}</p>
            <span className="text-[11px] text-slate-500 font-medium">Delivered to SLA</span>
          </div>
        </div>
      </div>

      {/* Admin-Approved Enterprise Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#191b23]">
              Admin-Approved Active Projects Supervised by {manager.name}
            </h3>
            <p className="text-xs text-[#737686]">
              All approved client engagements and active sprint requisitions assigned for talent orchestration.
            </p>
          </div>
          <Link
            to="/projects"
            className="text-xs font-bold text-[#004ac6] hover:underline flex items-center gap-1"
          >
            <span>View All Projects</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {managerProjects.slice(0, 6).map((proj) => (
            <Link
              key={proj.id}
              to={`/projects/${proj.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-[#004ac6]/40 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    {proj.id}
                  </span>
                  <StatusBadge status={proj.stage} size="xs" />
                </div>
                <h4 className="text-sm font-bold text-[#191b23] group-hover:text-[#004ac6] transition-colors line-clamp-1">
                  {proj.title || proj.name}
                </h4>
                <p className="text-xs text-[#737686] mt-0.5">
                  Client: <span className="font-semibold text-slate-700">{proj.client}</span>
                </p>
                <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                  {proj.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-[#191b23]">{proj.budget}</span>
                <span className="text-[11px] font-semibold text-blue-600">
                  {proj.progress || 0}% Delivered
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: REGISTER / REPLACE ORGANIZATION MANAGER MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register / Replace Organization Manager"
        subtitle="Update or appoint the enterprise Organization Manager with media upload"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmitAdd(onAddManagerSubmit)} className="space-y-6 pt-1">
          {/* Section 1: Personal Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-[#004ac6]">
                <Users size={14} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                1. Personal Information & Media Photo
              </h4>
            </div>

            {/* Media Upload Component */}
            <MediaPhotoUpload
              value={addAvatar}
              onChange={(newAvatar) => setAddAvatar(newAvatar)}
              label="Manager Profile Photo"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <FormInput
                label="Full Name"
                name="name"
                register={registerAdd}
                error={errorsAdd.name}
                placeholder="e.g. Sarah Jenkins"
                required
              />
              <FormInput
                label="Corporate Email"
                name="email"
                type="email"
                register={registerAdd}
                error={errorsAdd.email}
                placeholder="sarah.jenkins@flexistaff.ai"
                required
              />
              <FormInput
                label="Direct Phone"
                name="phone"
                register={registerAdd}
                error={errorsAdd.phone}
                placeholder="+1 (415) 890-3411"
                required
              />
              <FormInput
                label="Date of Birth"
                name="dob"
                type="date"
                register={registerAdd}
                error={errorsAdd.dob}
                required
              />
            </div>

            <FormInput
              label="Address"
              name="address"
              register={registerAdd}
              error={errorsAdd.address}
              placeholder="540 Market Street, Suite 900, San Francisco, CA"
              required
            />
          </div>

          {/* Section 2: Professional Information */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                <Briefcase size={14} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                2. Professional Information
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <FormInput
                label="Employee ID"
                name="employeeId"
                register={registerAdd}
                error={errorsAdd.employeeId}
                placeholder="MNG-001"
                required
              />
              <FormInput
                label="Job Title"
                name="jobTitle"
                register={registerAdd}
                error={errorsAdd.jobTitle}
                placeholder="Senior Enterprise Delivery Lead"
                required
              />
              <FormInput
                label="Department"
                name="department"
                register={registerAdd}
                error={errorsAdd.department}
                placeholder="Enterprise Workforce Operations"
                required
              />
              <FormInput
                label="Experience"
                name="experience"
                register={registerAdd}
                error={errorsAdd.experience}
                placeholder="e.g. 8+ Years"
                required
              />
              <FormInput
                label="Joining Date"
                name="joinDate"
                type="date"
                register={registerAdd}
                error={errorsAdd.joinDate}
                required
              />
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Role</label>
                <input
                  type="text"
                  value="Organization Manager"
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs font-bold text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Professional Bio</label>
              <textarea
                {...registerAdd('bio')}
                rows={3}
                placeholder="Enter background, squad leadership experience, and delivery governance credentials..."
                className="w-full rounded-xl border border-[#c3c6d7] bg-white p-3 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
              />
              {errorsAdd.bio && (
                <span className="text-[11px] font-medium text-rose-600">{errorsAdd.bio.message}</span>
              )}
            </div>
          </div>

          {/* Section 3: Account Credentials */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <KeyRound size={14} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                3. Account Credentials
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <FormInput
                label="Login Email"
                name="loginEmail"
                type="email"
                register={registerAdd}
                error={errorsAdd.loginEmail}
                placeholder="manager@flexistaff.ai"
                required
              />
              <FormInput
                label="Temporary Password"
                name="tempPassword"
                type="password"
                register={registerAdd}
                error={errorsAdd.tempPassword}
                placeholder="Min 6 characters"
                required
              />
              <FormInput
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                register={registerAdd}
                error={errorsAdd.confirmPassword}
                placeholder="Confirm password"
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingAdd}
              className="rounded-xl bg-gradient-to-r from-[#004ac6] to-[#2563eb] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-[#003da6] hover:to-[#1d4ed8] active:scale-95 transition-all"
            >
              Save Manager Profile
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT MANAGER PROFILE MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Organization Manager: ${manager.name}`}
        subtitle="Update the enterprise organization manager details and photo"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitEdit(onEditManagerSubmit)} className="space-y-4 pt-1">
          {/* Media Photo Upload in Edit Modal */}
          <MediaPhotoUpload
            value={editAvatar}
            onChange={(newAvatar) => setEditAvatar(newAvatar)}
            label="Manager Profile Photo"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FormInput
              label="Full Name"
              name="name"
              register={registerEdit}
              error={errorsEdit.name}
              required
            />
            <FormInput
              label="Corporate Email"
              name="email"
              type="email"
              register={registerEdit}
              error={errorsEdit.email}
              required
            />
            <FormInput
              label="Direct Phone"
              name="phone"
              register={registerEdit}
              error={errorsEdit.phone}
              required
            />
            <FormInput
              label="Job Title"
              name="jobTitle"
              register={registerEdit}
              error={errorsEdit.jobTitle}
              required
            />
            <FormInput
              label="Department"
              name="department"
              register={registerEdit}
              error={errorsEdit.department}
              required
            />
            <FormInput
              label="Years of Experience"
              name="experience"
              register={registerEdit}
              error={errorsEdit.experience}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Account Status</label>
            <select
              {...registerEdit('status')}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-[#004ac6]"
            >
              <option value="Active">Active — Authorized for project coordination</option>
              <option value="Suspended">Suspended — Access paused</option>
              <option value="Resigned">Resigned — Inactive</option>
              <option value="Terminated">Terminated — Dismissed</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Professional Bio</label>
            <textarea
              {...registerEdit('bio')}
              rows={3}
              className="w-full rounded-xl border border-[#c3c6d7] bg-white p-3 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
            />
            {errorsEdit.bio && (
              <span className="text-[11px] font-medium text-rose-600">{errorsEdit.bio.message}</span>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingEdit}
              className="rounded-xl bg-[#004ac6] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#003da6] active:scale-95 transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: STATUS CHANGE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isStatusConfirmModalOpen}
        onClose={() => setIsStatusConfirmModalOpen(false)}
        title={`Confirm Status Change: ${pendingStatusTarget.newStatus}`}
        subtitle={`Organization Manager: ${manager.name}`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200 text-xs text-amber-900 space-y-2">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle size={15} className="text-amber-700" />
              <span>Governance Confirmation</span>
            </p>
            <p className="leading-relaxed">
              Are you sure you want to change the status of <strong>{manager.name}</strong> to{' '}
              <strong className="uppercase">{pendingStatusTarget.newStatus}</strong>?
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Governance Note / Remarks</label>
            <textarea
              value={pendingStatusTarget.reason}
              onChange={(e) =>
                setPendingStatusTarget((prev) => ({ ...prev, reason: e.target.value }))
              }
              rows={2}
              placeholder="e.g. Schedule review / Account reactivation"
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsStatusConfirmModalOpen(false)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmStatusChange}
              className="rounded-xl bg-[#004ac6] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#003da6] transition-all"
            >
              Confirm Status
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManagerManagement;
