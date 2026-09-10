import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Bell,
  Briefcase,
  CheckCircle2,
  Clock,
  LogOut,
  Menu,
  X,
  UserCheck,
  TrendingUp,
  Award,
  User,
  LifeBuoy,
  ChevronDown,
  HelpCircle,
} from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import UserAvatar from '../../components/common/UserAvatar';
import { ThemeDropdown } from '../../components/common/ThemeDropdown';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

export const WorkforceLayout = () => {
  const { user, logout } = useAuth();
  const { effectiveTheme } = useTheme();
  const { workforceUserProfile, managerAssignments = [], workforceNotifications = [] } = useData() || {};
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const pendingOffersCount = (managerAssignments || []).filter(
    (a) => a.status === 'Awaiting Workforce Response'
  ).length;
  const unreadNotifCount = (workforceNotifications || []).filter((n) => n.unread).length;

  const navItems = [
    { label: 'Dashboard', path: '/workforce/dashboard', icon: LayoutDashboard },
    {
      label: 'Assignment Offers & Tasks',
      path: '/workforce/assignments',
      icon: Briefcase,
      badge: pendingOffersCount > 0 ? `${pendingOffersCount} Offers` : null,
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    { label: 'Live Availability', path: '/workforce/availability', icon: CheckCircle2 },
    { label: 'Profile & Settings', path: '/workforce/profile', icon: User },
    { label: 'Support & Feedback', path: '/workforce/support', icon: LifeBuoy },
  ];

  const handleLogout = () => {
    logout();
    toast.info('Signed out of Workforce Portal');
    navigate('/login');
  };

  const isCompanyEmployee =
    Boolean(workforceUserProfile?.partnerCompany) ||
    Boolean(workforceUserProfile?.partnerName) ||
    Boolean(workforceUserProfile?.partner) ||
    (Boolean(workforceUserProfile?.companyName) && workforceUserProfile?.companyName !== 'Enterprise Client') ||
    workforceUserProfile?.roleType === 'Professional' ||
    workforceUserProfile?.professionalType === 'PARTNER_EMPLOYEE' ||
    workforceUserProfile?.userType === 'PARTNER_EMPLOYEE' ||
    workforceUserProfile?.employmentType?.includes('Partner') ||
    workforceUserProfile?.employmentType?.includes('Company');

  const sidebarContent = (
    <div className={`flex h-full flex-col justify-between border-r transition-colors ${
      effectiveTheme === 'dark' ? 'bg-[#141324] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-700'
    }`}>
      <div>
        <div className={`flex h-16 items-center justify-between px-4 border-b ${
          effectiveTheme === 'dark' ? 'border-white/10' : 'border-slate-100'
        }`}>
          <Logo size="md" to="/workforce/dashboard" />
          {isMobileMenuOpen && (
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <nav className="space-y-1 px-3 py-4">
          <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Talent Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] text-white shadow-sm shadow-purple-500/20'
                      : effectiveTheme === 'dark'
                      ? 'text-slate-300 hover:bg-white/5 hover:text-white'
                      : 'text-[#434655] hover:bg-purple-50/50 hover:text-[#7c3aed]'
                  }`
                }
              >
                <Icon size={18} className="shrink-0" />
                <div className="flex flex-1 items-center justify-between overflow-hidden">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className={`p-3 border-t ${effectiveTheme === 'dark' ? 'border-white/10' : 'border-slate-100'}`}>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className={`flex h-screen overflow-hidden font-sans antialiased transition-colors ${
      effectiveTheme === 'dark' ? 'bg-[#0b0a1a] text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
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
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 shadow-2xl"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:pl-64 overflow-hidden">
        {/* Top Navbar */}
        <header className={`h-16 border-b px-4 sm:px-6 flex items-center justify-between shrink-0 z-20 transition-colors ${
          effectiveTheme === 'dark' ? 'bg-[#141324]/90 border-white/10 text-white backdrop-blur-md' : 'bg-white/90 border-slate-200 text-slate-900 backdrop-blur-md'
        }`}>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                  isCompanyEmployee
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isCompanyEmployee ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                <span>
                  {isCompanyEmployee
                    ? workforceUserProfile?.partnerCompany || 'Partner Employee'
                    : 'Independent Freelancer'}
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Selector Dropdown */}
            <ThemeDropdown />
            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`relative p-2 rounded-xl transition-colors ${
                  effectiveTheme === 'dark' ? 'border border-white/10 bg-[#1c1a36] text-white hover:bg-white/10' : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Bell size={18} />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-500" />
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-[#14132b] shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden z-50 text-xs text-slate-900 dark:text-white"
                  >
                    <div className="p-3.5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-[#1c1a36]">
                      <h4 className="font-bold text-slate-900 dark:text-white">Talent Notifications</h4>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">{unreadNotifCount} unread</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-white/10">
                      {workforceNotifications.map((notif) => (
                        <div key={notif.id} className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <p className="font-bold text-slate-900 dark:text-white">{notif.title}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{notif.message}</p>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 block">{notif.time}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              to="/workforce/assignments"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] text-white text-xs font-bold shadow-sm shadow-purple-500/20 active:scale-95 transition-all"
            >
              <Briefcase size={14} />
              <span>My Assignments</span>
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                }}
                className={`flex items-center gap-2 rounded-xl border p-1.5 pr-2.5 text-xs transition-colors shadow-2xs ${
                  effectiveTheme === 'dark'
                    ? 'border-white/10 bg-[#1c1a36] text-white hover:bg-white/10'
                    : 'border-slate-200 bg-white text-[#191b23] hover:bg-slate-50'
                }`}
              >
                <UserAvatar
                  src={workforceUserProfile?.avatar}
                  name={workforceUserProfile?.name || user?.name || 'Workforce Specialist'}
                  size="xs"
                  className="h-7 w-7 rounded-lg"
                />
                <div className="hidden lg:block text-left">
                  <p className="font-bold text-xs leading-none">{workforceUserProfile?.name || user?.name || 'Workforce Specialist'}</p>
                  <p className="text-[10px] text-[#737686] dark:text-slate-400 leading-tight mt-0.5">
                    {isCompanyEmployee ? (workforceUserProfile?.partnerCompany || 'Partner Employee') : 'Independent Freelancer'}
                  </p>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14132b] p-2 shadow-xl shadow-slate-900/10 text-slate-900 dark:text-white"
                  >
                    <div className="p-3 bg-slate-50 dark:bg-[#1c1a36] rounded-xl mb-1.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{workforceUserProfile?.name || user?.name || 'Professional / Freelancer'}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{workforceUserProfile?.email || user?.email || ''}</p>
                      <span className="mt-1.5 inline-block rounded-md bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 text-[10px] font-bold text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
                        {isCompanyEmployee ? (workforceUserProfile?.partnerCompany || 'Partner Employee') : 'Independent Freelancer'}
                      </span>
                    </div>

                    <Link
                      to="/workforce/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                    >
                      <User size={15} className="text-slate-400" />
                      <span>Profile & Settings</span>
                    </Link>

                    <Link
                      to="/workforce/support"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                    >
                      <HelpCircle size={15} className="text-slate-400" />
                      <span>Support Desk</span>
                    </Link>

                    <div className="border-t border-slate-100 dark:border-white/10 my-1" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
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

        {/* Main Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

        <footer className={`border-t py-3 px-6 text-center text-xs font-medium shrink-0 transition-colors ${
          effectiveTheme === 'dark' ? 'bg-[#141324] border-white/10 text-slate-400' : 'bg-white border-slate-200/60 text-slate-400'
        }`}>
          © 2026 FlexiStaffAI.
        </footer>
      </div>
    </div>
  );
};

export default WorkforceLayout;
