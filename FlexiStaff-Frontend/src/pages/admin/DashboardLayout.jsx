import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, NavLink, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

import {
  LayoutDashboard,
  Building2,
  Users,
  Handshake,
  UserCheck,
  Briefcase,
  FolderKanban,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  Menu,
  Plus,
  ChevronDown,
  Globe,
  Bell,
  Check,
  AlertTriangle,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  LifeBuoy,
} from 'lucide-react';
import { MdHub } from 'react-icons/md';

import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

// ====================================================================
// INLINE REUSABLE UI: Modal
// ====================================================================
const InlineModal = ({
  isOpen = false,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
  showCloseButton = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
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
            transition={{ duration: 0.2 }}
            className={`relative z-10 w-full ${maxWidth} rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8`}
          >
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
                <div>
                  {title && <h3 className="text-base font-bold text-[#191b23]">{title}</h3>}
                  {subtitle && <p className="mt-0.5 text-xs text-[#737686]">{subtitle}</p>}
                </div>
                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-[#191b23] transition-colors"
                  >
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
};

// ====================================================================
// INLINE REUSABLE UI: FormInput
// ====================================================================
const InlineFormInput = ({
  label,
  name,
  type = 'text',
  placeholder,
  register,
  error,
  required = false,
  options = [],
  rows = 3,
  helperText,
  icon: Icon,
  className = '',
  disabled = false,
  ...rest
}) => {
  const isError = Boolean(error);
  const inputBaseClasses = `w-full rounded-lg border text-xs md:text-sm text-[#191b23] placeholder-slate-400 transition-all outline-none ${isError
    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
    : 'border-[#c3c6d7] bg-white focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15'
    } ${disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="flex items-center justify-between text-xs font-semibold text-[#434655]">
          <span>
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </span>
          {helperText && !isError && (
            <span className="text-[11px] font-normal text-slate-400">{helperText}</span>
          )}
        </label>
      )}

      <div className="relative group">
        {Icon && type !== 'textarea' && (
          <Icon
            className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isError ? 'text-rose-400' : 'text-slate-400 group-focus-within:text-[#004ac6]'
              }`}
            size={16}
          />
        )}

        {type === 'select' ? (
          <select
            {...(register ? register(name) : {})}
            disabled={disabled}
            className={`${inputBaseClasses} ${Icon ? 'pl-9' : 'px-3'} py-2.5 bg-white`}
            {...rest}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            {...(register ? register(name) : {})}
            rows={rows}
            disabled={disabled}
            placeholder={placeholder}
            className={`${inputBaseClasses} p-3 resize-none`}
            {...rest}
          />
        ) : (
          <input
            type={type}
            {...(register ? register(name) : {})}
            disabled={disabled}
            placeholder={placeholder}
            className={`${inputBaseClasses} ${Icon ? 'pl-9' : 'px-3'} pr-3 py-2.5`}
            {...rest}
          />
        )}
      </div>

      {isError && (
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-rose-600">
          <AlertCircle size={13} className="shrink-0" />
          <span>{error.message || error}</span>
        </div>
      )}
    </div>
  );
};

// --- Quick Project Creation Schema ---
const quickProjectSchema = yup.object().shape({
  title: yup.string().required('Project title is required').min(3, 'Title is too short'),
  client: yup.string().required('Client selection is required'),
  stage: yup.string().required('Initial stage is required'),
  priority: yup.string().required('Priority is required'),
  manager: yup.string().required('Manager is required'),
  budget: yup.string().required('Estimated budget is required'),
  deadline: yup.string().required('Target deadline is required'),
  description: yup.string().required('Description is required').min(10, 'Provide more details'),
  skills: yup.string().required('Enter at least 1 comma-separated skill tag'),
});

// ====================================================================
// SUB-COMPONENT: NotificationMenu
// ====================================================================
const InlineNotificationMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, markNotificationRead, markAllNotificationsRead } = useData();

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'request':
        return <FolderKanban size={14} className="text-[#2563eb]" />;
      case 'alert':
        return <AlertTriangle size={14} className="text-amber-600" />;
      case 'workforce':
        return <Briefcase size={14} className="text-emerald-600" />;
      default:
        return <Sparkles size={14} className="text-indigo-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#c3c6d7]/70 bg-white text-[#434655] shadow-xs hover:bg-slate-50 hover:text-[#191b23] transition-all"
        aria-label="View notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2563eb] px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl shadow-slate-900/10 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-[#faf8ff] px-4 py-3">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#191b23]">
                  Notifications
                </h4>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-[#004ac6]">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  className="flex items-center gap-1 text-[11px] font-medium text-[#2563eb] hover:underline"
                >
                  <Check size={12} />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No notifications
                </div>
              ) : (
                notifications.map((notif) => (
                  <Link
                    key={notif.id}
                    to={notif.link || '#'}
                    onClick={() => {
                      markNotificationRead(notif.id);
                      setIsOpen(false);
                    }}
                    className={`flex items-start gap-3 p-3.5 transition-colors hover:bg-blue-50/40 ${notif.unread ? 'bg-blue-50/20' : 'bg-white'
                      }`}
                  >
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={`text-xs ${notif.unread
                            ? 'font-bold text-[#191b23]'
                            : 'font-medium text-[#434655]'
                            }`}
                        >
                          {notif.title}
                        </p>
                        {notif.unread && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-[#2563eb]" />
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] text-[#737686] line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      <span className="mt-1 block text-[10px] text-slate-400">
                        {notif.time}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ====================================================================
// SUB-COMPONENT: Sidebar
// ====================================================================
const InlineSidebar = ({
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { projects, workforce, managerAssignments, supportTickets = [] } = useData();

  const handleLogout = () => {
    logout();
    toast.info('Signed out of FlexiStaff Admin Suite');
    navigate('/login');
  };

  const pendingRequestsCount = projects.filter(
    (p) => p.status === 'Pending Admin Approval' || p.stage === 'Pending Admin Approval' || p.stage === 'Request'
  ).length;
  const pendingAssignmentsCount = managerAssignments.filter(
    (a) => a.status === 'Pending Assignment Approval'
  ).length;
  const availableWorkforceCount = workforce.filter((w) => w.availability === 'Available' || w.availability === 'Immediate').length;
  const pendingTicketsCount = (supportTickets || []).filter(
    (t) => t.status === 'Pending Admin Review' || t.status === 'Open'
  ).length;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Company', path: '/company', icon: Building2 },
    { label: 'Client Directory', path: '/clients', icon: Users },
    { label: 'Partner Companies', path: '/partners', icon: Handshake },
    { label: 'Manager', path: '/managers', icon: UserCheck },
    {
      label: 'Workforce',
      path: '/workforce',
      icon: Briefcase,
      badge: availableWorkforceCount > 0 ? `${availableWorkforceCount} Avail` : null,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      label: 'Project',
      path: '/projects',
      icon: FolderKanban,
      badge: pendingRequestsCount > 0 ? `${pendingRequestsCount} Pending` : null,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      label: 'Assignments',
      path: '/admin/assignment-approvals',
      icon: FolderKanban,
      badge: pendingAssignmentsCount > 0 ? `${pendingAssignmentsCount} New` : null,
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    {
      label: 'Support Reports',
      path: '/admin/support-tickets',
      icon: LifeBuoy,
      badge: pendingTicketsCount > 0 ? `${pendingTicketsCount} New` : null,
      badgeColor: 'bg-rose-100 text-rose-800',
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white border-r border-[#c3c6d7]/70 text-[#434655]">
      <div>
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden group">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#004ac6] to-[#2563eb] text-white shadow-md shadow-[#2563eb]/20 group-hover:scale-105 transition-transform">
              <MdHub className="text-xl" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col min-w-0">
                <span className="text-base font-bold tracking-tight text-[#191b23] leading-none">
                  FlexiStaff<span className="text-[#2563eb]">AI</span>
                </span>
                <span className="text-[10px] font-semibold text-[#737686] tracking-wider uppercase mt-0.5">
                  Enterprise
                </span>
              </div>
            )}
          </Link>

          {isMobileOpen && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="md:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <nav className="space-y-1 px-3 py-4">
          <div
            className={`px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#737686] ${isCollapsed && !isMobileOpen ? 'text-center' : ''
              }`}
          >
            {isCollapsed && !isMobileOpen ? '•••' : 'Main Navigation'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150 ${isActive
                    ? 'bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white shadow-sm shadow-blue-500/20'
                    : 'text-[#434655] hover:bg-[#faf8ff] hover:text-[#004ac6]'
                  } ${isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''}`
                }
                title={isCollapsed && !isMobileOpen ? item.label : undefined}
              >
                <Icon size={18} className="shrink-0" />
                {(!isCollapsed || isMobileOpen) && (
                  <div className="flex flex-1 items-center justify-between overflow-hidden">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-slate-100 space-y-1.5">
        <button
          type="button"
          onClick={handleLogout}
          className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors ${
            isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''
          }`}
          title="Sign Out"
        >
          <LogOut size={16} />
          {(!isCollapsed || isMobileOpen) && <span>Sign Out</span>}
        </button>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden md:flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200/80 bg-white py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight size={16} />
          ) : (
            <>
              <ChevronLeft size={16} />
              <span>Collapse Menu</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden md:block transition-all duration-300 ease-in-out shrink-0 ${isCollapsed ? 'w-18' : 'w-64'
          }`}
      >
        <div className="sticky top-0 h-screen overflow-y-auto">
          {sidebarContent}
        </div>
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

// ====================================================================
// SUB-COMPONENT: Navbar
// ====================================================================
const InlineNavbar = ({ onOpenMobileSidebar, onOpenCreateProject }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.info('Signed out of FlexiStaff Admin Suite');
    navigate('/login');
  };

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path.startsWith('/projects/')) {
      const id = path.split('/')[2];
      return [
        { label: 'Projects & Requests', path: '/projects' },
        { label: `Project Details (${id})`, path },
      ];
    }

    const map = {
      '/dashboard': [{ label: 'Dashboard Overview', path: '/dashboard' }],
      '/company': [{ label: 'Company Profile & Compliance', path: '/company' }],
      '/clients': [{ label: 'Client Management', path: '/clients' }],
      '/partners': [{ label: 'Partner Companies', path: '/partners' }],
      '/managers': [{ label: 'Organization Managers', path: '/managers' }],
      '/workforce': [{ label: 'Workforce Management', path: '/workforce' }],
      '/projects': [{ label: 'Projects & Requests', path: '/projects' }],
      '/admin/support-tickets': [{ label: 'Support & Feedback Reports', path: '/admin/support-tickets' }],
    };

    return map[path] || [{ label: 'Dashboard', path: '/dashboard' }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#c3c6d7]/70 bg-white/90 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="rounded-lg p-1.5 text-[#434655] hover:bg-slate-100 md:hidden focus:outline-none"
        >
          <Menu size={20} />
        </button>

        <nav className="flex items-center gap-1.5 text-xs text-[#737686]">
          {breadcrumbs.map((b, idx) => (
            <React.Fragment key={b.path}>
              {idx > 0 && <span className="text-slate-300">/</span>}
              <span
                className={
                  idx === breadcrumbs.length - 1
                    ? 'font-bold text-[#191b23]'
                    : 'text-[#737686] hover:text-[#004ac6]'
                }
              >
                {b.label}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <InlineNotificationMenu />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-2.5 text-xs text-[#191b23] hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80"
              alt={user?.name || 'FlexiStaff Admin'}
              className="h-7 w-7 rounded-lg object-cover"
            />
            <div className="hidden lg:block text-left">
              <p className="font-bold text-xs leading-none">{user?.name || 'FlexiStaff Admin'}</p>
              <p className="text-[10px] text-[#737686] leading-tight mt-0.5">Platform Administrator</p>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10 text-xs"
              >
                <div className="p-3 bg-slate-50 rounded-xl mb-1.5">
                  <p className="text-xs font-bold text-slate-900">{user?.name || 'FlexiStaff Admin'}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email || 'admin@flexistaff.com'}</p>
                  <span className="mt-1.5 inline-block rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                    Super Admin Access
                  </span>
                </div>

                <Link
                  to="/admin/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Building2 size={15} className="text-slate-400" />
                  <span>Profile</span>
                </Link>

                <Link
                  to="/admin/support-tickets"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  <LifeBuoy size={15} className="text-slate-400" />
                  <span>Support Desk</span>
                </Link>

                <div className="border-t border-slate-100 my-1" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

// ====================================================================
// MASTER EXPORT: DashboardLayout Component
// ====================================================================
export const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { clients, managers, addProject } = useData();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(quickProjectSchema),
    defaultValues: {
      title: '',
      client: clients[0]?.name || '',
      stage: 'Request',
      priority: 'High',
      manager: managers[0]?.name || '',
      budget: '$100,000',
      deadline: '2026-11-30',
      description: '',
      skills: 'React, TypeScript, Node.js',
    },
  });

  const onSubmitQuickProject = (data) => {
    const skillsArray = data.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const clientObj = clients.find((c) => c.name === data.client);
    const managerObj = managers.find((m) => m.name === data.manager);

    const newPrj = addProject({
      title: data.title,
      client: data.client,
      clientId: clientObj?.id || 'cli-01',
      stage: data.stage,
      priority: data.priority,
      manager: data.manager,
      managerAvatar: managerObj?.avatar,
      budget: data.budget.startsWith('$') ? data.budget : `$${data.budget}`,
      deadline: data.deadline,
      description: data.description,
      requiredSkills: skillsArray,
      assignedResources: [],
    });

    toast.success(`Project / Request "${data.title}" submitted successfully!`);
    reset();
    setIsCreateModalOpen(false);
    navigate(`/projects/${newPrj.id}`);
  };

  return (
    <div className="flex min-h-screen w-full bg-[#faf8ff] text-[#191b23] font-sans antialiased">
      {/* Unified Inline Sidebar */}
      <InlineSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Unified Inline Top Navbar */}
        <InlineNavbar
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
          onOpenCreateProject={() => setIsCreateModalOpen(true)}
        />

        {/* Page Viewport */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>

        <footer className="border-t border-slate-200/60 bg-white py-3 px-6 text-center text-xs text-slate-400 font-medium shrink-0">
          © 2026 FlexiStaffAI.
        </footer>
      </div>

      {/* Quick Project / Requisition Creation Modal */}
      <InlineModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Project or Talent Requisition"
        subtitle="Submit a project scope to match talent and initiate sprint execution"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit(onSubmitQuickProject)} className="space-y-4 pt-2">
          <InlineFormInput
            label="Project or Requisition Title"
            name="title"
            register={register}
            error={errors.title}
            placeholder="e.g. NextGen Cloud Migration Sprint"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#434655] mb-1">
                Client Enterprise <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('client')}
                className="w-full rounded-xl border border-[#c3c6d7] bg-white px-3 py-2 text-xs font-medium focus:border-[#004ac6] outline-none"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#434655] mb-1">
                Assigned Organization Manager <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('manager')}
                className="w-full rounded-xl border border-[#c3c6d7] bg-white px-3 py-2 text-xs font-medium focus:border-[#004ac6] outline-none"
              >
                {managers.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} ({m.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#434655] mb-1">Initial Stage</label>
              <select
                {...register('stage')}
                className="w-full rounded-xl border border-[#c3c6d7] bg-white px-3 py-2 text-xs font-medium focus:border-[#004ac6] outline-none"
              >
                <option value="Request">Request</option>
                <option value="Sourcing">Sourcing</option>
                <option value="In Progress">In Progress</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#434655] mb-1">Priority</label>
              <select
                {...register('priority')}
                className="w-full rounded-xl border border-[#c3c6d7] bg-white px-3 py-2 text-xs font-medium focus:border-[#004ac6] outline-none"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <InlineFormInput
              label="Estimated Budget"
              name="budget"
              register={register}
              error={errors.budget}
              placeholder="$80,000"
            />
          </div>

          <InlineFormInput
            label="Required Tech Skills (comma-separated)"
            name="skills"
            register={register}
            error={errors.skills}
            placeholder="React, AWS, Node.js, Kubernetes"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-[#434655] mb-1">
              Project Scope & Requirements <span className="text-rose-500">*</span>
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full rounded-xl border border-[#c3c6d7] bg-white p-3 text-xs focus:border-[#004ac6] outline-none"
              placeholder="Outline deliverables, sprint cadence, and candidate experience expectations..."
            />
            {errors.description && (
              <span className="text-[11px] text-rose-500 mt-1 block">
                {errors.description.message}
              </span>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-gradient-to-r from-[#004ac6] to-[#2563eb] px-5 py-2 text-xs font-bold text-white shadow-sm hover:from-[#003da6] hover:to-[#1d4ed8] disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Create Project'}
            </button>
          </div>
        </form>
      </InlineModal>
    </div>
  );
};

export default DashboardLayout;
