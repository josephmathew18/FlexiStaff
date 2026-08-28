import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  Users,
  GitPullRequest,
  TrendingUp,
  Bell,
  Building2,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronDown,
  User,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export const PartnerLayout = () => {
  const {
    partnerProfile,
    partnerProjects,
    partnerWorkforce,
    partnerNotifications,
    markPartnerNotificationRead,
    markAllPartnerNotificationsRead,
  } = useData();

  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const pendingApprovalCount = partnerProjects.filter((p) => p.status === 'Pending Approval').length;
  const availableWorkforceCount = partnerWorkforce.filter((w) => w.availability === 'Available').length;
  const unreadNotifCount = partnerNotifications.filter((n) => n.unread).length;

  const navItems = [
    { label: 'Dashboard', path: '/partner/dashboard', icon: LayoutDashboard },
    {
      label: 'Projects',
      path: '/partner/projects',
      icon: FolderKanban,
      badge: pendingApprovalCount > 0 ? `${pendingApprovalCount} Pending` : null,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      label: 'Workforce',
      path: '/partner/workforce',
      icon: Users,
      badge: availableWorkforceCount > 0 ? `${availableWorkforceCount} Avail` : null,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      label: 'Notifications',
      path: '/partner/notifications',
      icon: Bell,
      badge: unreadNotifCount > 0 ? unreadNotifCount : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    { label: 'Profile', path: '/partner/profile', icon: Building2 },
    { label: 'Support', path: '/partner/support', icon: HelpCircle },
  ];

  const handleLogout = () => {
    logout();
    toast.info('Signed out of Partner Portal');
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white border-r border-[#c3c6d7]/70 text-[#434655]">
      <div>
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-100 bg-gradient-to-r from-blue-50/40 to-indigo-50/40">
          <Link to="/partner/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#004ac6] to-[#2563eb] text-white shadow-md shadow-[#2563eb]/20">
              <Layers size={20} />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-[#191b23] block leading-tight">
                FlexiStaff<span className="text-[#2563eb]">AI</span>
              </span>
              <span className="text-[10px] font-bold text-slate-500 tracking-wide uppercase">
                Partner Portal
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

        {/* Active Partner Company Identity Strip */}
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
          <Link
            to="/partner/profile"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2.5 group"
          >
            <img
              src={partnerProfile?.logoUrl || partnerProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt={partnerProfile?.name || 'Partner Company'}
              className="h-8 w-8 rounded-lg object-cover ring-1 ring-slate-200"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 truncate">{partnerProfile?.name || 'Partner Company'}</p>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                <ShieldCheck size={10} className="text-emerald-600" />
                <span>Verified Partner Company</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="px-3 py-3 space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#737686] mb-1">
            Partner Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path === '/partner/projects' && location.pathname.startsWith('/partner/projects/')) ||
              (item.path === '/partner/workforce' && location.pathname.startsWith('/partner/workforce/'));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#2563eb] text-white shadow-sm shadow-[#2563eb]/25 font-bold'
                    : 'text-[#434655] hover:bg-slate-100 hover:text-[#191b23]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    size={17}
                    className={
                      isActive
                        ? 'text-white'
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
              <span className="text-xs font-semibold text-[#737686]">FlexiStaff Client & Partner Portal</span>
              <h2 className="text-sm font-bold text-[#191b23] capitalize">
                {location.pathname.replace('/partner/', '').replace('/', ' / ') || 'Dashboard'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications Popover */}
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
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">Partner Notifications</h4>
                        {unreadNotifCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-700 text-[10px] font-bold">
                            {unreadNotifCount} new
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={markAllPartnerNotificationsRead}
                        className="text-[11px] font-bold text-[#004ac6] hover:underline"
                      >
                        Mark all as read
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto my-1">
                      {partnerNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markPartnerNotificationRead(notif.id);
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

                    <div className="border-t border-slate-100 pt-2 text-center">
                      <Link
                        to="/partner/notifications"
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-xs font-bold text-indigo-600 hover:underline block"
                      >
                        View Notification Center →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
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
                  src={partnerProfile.avatar}
                  alt={partnerProfile.contactPerson}
                  className="h-7 w-7 rounded-lg object-cover"
                />
                <div className="hidden lg:block text-left">
                  <p className="font-bold text-xs leading-none">{partnerProfile.contactPerson}</p>
                  <p className="text-[10px] text-[#737686] leading-tight mt-0.5">{partnerProfile.name}</p>
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
                      <p className="text-xs font-bold text-slate-900">{partnerProfile.contactPerson}</p>
                      <p className="text-[11px] text-slate-500 truncate">{partnerProfile.email}</p>
                      <span className="mt-1.5 inline-block rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800">
                        {partnerProfile.industry}
                      </span>
                    </div>

                    <Link
                      to="/partner/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      <Building2 size={15} className="text-slate-400" />
                      <span>Profile</span>
                    </Link>

                    <Link
                      to="/partner/support"
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

        {/* Routed Sub-pages */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        <footer className="border-t border-slate-200/60 bg-white py-3 px-6 text-center text-xs text-slate-400 font-medium shrink-0">
          © 2026 FlexiStaffAI.
        </footer>
      </div>
    </div>
  );
};

export default PartnerLayout;
