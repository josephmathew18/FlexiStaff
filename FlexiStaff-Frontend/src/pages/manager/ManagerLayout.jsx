import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderCheck,
  Users,
  Cpu,
  GitPullRequest,
  TrendingUp,
  Bell,
  UserCheck,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ChevronDown,
  AlertTriangle,
  Briefcase,
  LifeBuoy,
  HelpCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export const ManagerLayout = () => {
  const {
    managers,
    managerProfile,
    projects,
    partnerProjects,
    workforce,
    managerAssignments,
    managerNotifications,
  } = useData();

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Check current manager status
  const currentManagerData =
    (managers || []).find((m) => m.email === user?.email || m.name === user?.name) || managerProfile;
  const isManagerActive =
    !currentManagerData ||
    !currentManagerData.status ||
    (currentManagerData.status !== 'Suspended' &&
      currentManagerData.status !== 'Terminated' &&
      currentManagerData.status !== 'Resigned');
  const isProfilePage = location.pathname === '/manager/profile';

  // Filter approved projects awaiting workforce assignment
  const approvedProjects = (projects || []).filter(
    (p) =>
      p.status === 'Approved' ||
      p.status === 'Partially Assigned' ||
      p.stage?.includes('Approved') ||
      p.stage?.includes('Matching')
  );
  const availableWorkforceCount = (workforce || []).filter((w) => w.availability === 'Available').length;
  const unreadNotifCount = (managerNotifications || []).filter((n) => n.unread).length;

  const navItems = [
    { label: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
    {
      label: 'Approved Projects',
      path: '/manager/projects',
      icon: FolderCheck,
      badge: approvedProjects.length > 0 ? `${approvedProjects.length} Ready` : null,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      label: 'Workforce Pool',
      path: '/manager/workforce',
      icon: Users,
      badge: availableWorkforceCount > 0 ? `${availableWorkforceCount} Avail` : null,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    { label: 'Skill Matching', path: '/manager/matching', icon: Cpu, highlight: true },
    {
      label: 'Assignment Requests',
      path: '/manager/assignments',
      icon: GitPullRequest,
      badge: (managerAssignments || []).length > 0 ? (managerAssignments || []).length : null,
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      label: 'Notifications',
      path: '/manager/notifications',
      icon: Bell,
      badge: unreadNotifCount > 0 ? unreadNotifCount : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    { label: 'Profile', path: '/manager/profile', icon: User },
    { label: 'Support', path: '/manager/support', icon: LifeBuoy },
  ];

  const handleLogout = () => {
    logout();
    toast.info('Signed out of Manager Portal');
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white border-r border-[#c3c6d7]/70 text-[#434655]">
      <div>
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <Link to="/manager/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#004ac6] to-[#2563eb] text-white shadow-md shadow-[#2563eb]/20">
              <Layers size={20} />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-[#191b23] block leading-tight">
                FlexiStaff<span className="text-[#2563eb]">AI</span>
              </span>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/80 px-1.5 py-0.2 rounded tracking-wide uppercase">
                Manager Portal
              </span>
            </div>
          </Link>
          {isMobileMenuOpen && (
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Active Manager Identity Strip */}
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
          <Link
            to="/manager/profile"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2.5 group"
          >
            <img
              src={managerProfile?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80'}
              alt={managerProfile?.name || 'Sarah Jenkins'}
              className="h-8 w-8 rounded-lg object-cover ring-1 ring-slate-200"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700 truncate">
                {managerProfile?.name || 'Sarah Jenkins'}
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700">
                <Briefcase size={10} className="text-blue-600" />
                <span>Organization Manager</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="px-3 py-3 space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#737686] mb-1">
            Manager Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path === '/manager/projects' && location.pathname.startsWith('/manager/projects/')) ||
              (item.path === '/manager/matching' && location.pathname.startsWith('/manager/matching/'));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#2563eb] text-white shadow-sm shadow-[#2563eb]/25 font-bold'
                    : item.highlight
                    ? 'bg-blue-50 text-[#004ac6] hover:bg-blue-100 font-bold border border-blue-200/60'
                    : 'text-[#434655] hover:bg-slate-100 hover:text-[#191b23]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    size={17}
                    className={
                      isActive
                        ? 'text-white'
                        : item.highlight
                        ? 'text-[#004ac6]'
                        : 'text-[#737686] group-hover:text-[#191b23]'
                    }
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                      isActive ? 'bg-white text-[#2563eb]' : item.badgeColor || 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/40">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#faf8ff] text-[#191b23] font-sans antialiased">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-30 shadow-xs">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="relative z-10 w-72 h-full bg-white shadow-2xl"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex flex-1 flex-col md:pl-64 min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#c3c6d7]/60 bg-white/90 px-4 sm:px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs font-semibold text-[#737686]">FlexiStaff Organization Manager Portal</span>
              <h2 className="text-sm font-bold text-[#191b23] capitalize">
                {location.pathname.replace('/manager/', '').replace('/', ' / ') || 'Dashboard'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/manager/matching"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#004ac6] to-[#2563eb] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:from-[#003da6] hover:to-[#1d4ed8] active:scale-95 transition-all"
            >
              <Cpu size={14} />
              <span>Skill-Based Matching</span>
            </Link>

            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileOpen(false);
                }}
                className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Bell size={18} />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white ring-2 ring-white">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="absolute right-0 z-50 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <h4 className="text-xs font-bold text-slate-900">Manager Notifications</h4>
                      <Link
                        to="/manager/notifications"
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-[11px] font-bold text-[#004ac6] hover:underline"
                      >
                        View All
                      </Link>
                    </div>

                    <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto my-1">
                      {(managerNotifications || []).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            setIsNotificationsOpen(false);
                            if (notif.link) navigate(notif.link);
                          }}
                          className={`p-2.5 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors text-xs ${
                            notif.unread ? 'bg-blue-50/40 font-semibold' : ''
                          }`}
                        >
                          <p className="font-bold text-slate-900">{notif.title}</p>
                          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{notif.time}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-2.5 text-xs text-[#191b23] hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <img
                  src={managerProfile?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80'}
                  alt={managerProfile?.name || 'Sarah Jenkins'}
                  className="h-7 w-7 rounded-lg object-cover"
                />
                <div className="hidden lg:block text-left">
                  <p className="font-bold text-xs leading-none">{managerProfile?.name || 'Sarah Jenkins'}</p>
                  <p className="text-[10px] text-[#737686] leading-tight mt-0.5">Manager Portal</p>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10"
                  >
                    <div className="p-3 bg-slate-50 rounded-xl mb-1.5">
                      <p className="text-xs font-bold text-slate-900">{managerProfile?.name || 'Sarah Jenkins'}</p>
                      <p className="text-[11px] text-slate-500 truncate">{managerProfile?.email || 'sarah.jenkins@flexistaff.ai'}</p>
                      <span className="mt-1.5 inline-block rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                        {managerProfile?.department || 'Enterprise Workforce Operations'}
                      </span>
                    </div>

                    <Link
                      to="/manager/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      <User size={15} className="text-slate-400" />
                      <span>Profile</span>
                    </Link>

                    <Link
                      to="/manager/support"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      <HelpCircle size={15} className="text-slate-400" />
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

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {!isManagerActive && !isProfilePage ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border border-amber-200 bg-amber-50/60 p-8 sm:p-12 text-center max-w-2xl mx-auto my-8 space-y-5 shadow-sm"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-xs">
                <AlertTriangle size={32} />
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-200/80 px-3 py-1 text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Account Status: {currentManagerData?.status || 'Inactive'}
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Project Management Access Paused
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                  Your Organization Manager account is currently marked as <strong>{currentManagerData?.status}</strong>. Access to active sprint delivery orchestration, workforce matching, and project allocation has been temporarily disabled.
                </p>
                {currentManagerData?.statusReason && (
                  <div className="text-xs text-amber-900 bg-amber-100/70 p-3 rounded-2xl max-w-md mx-auto border border-amber-200/80 text-left">
                    <p className="font-bold text-[11px] uppercase tracking-wider text-amber-800">Governance Notice:</p>
                    <p className="mt-0.5">{currentManagerData.statusReason}</p>
                  </div>
                )}
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/manager/profile"
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  View Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          ) : (
            <Outlet />
          )}
        </main>

        <footer className="border-t border-slate-200/60 bg-white py-3 px-6 text-center text-xs text-slate-400 font-medium shrink-0">
          © 2026 FlexiStaffAI.
        </footer>
      </div>
    </div>
  );
};

export default ManagerLayout;
