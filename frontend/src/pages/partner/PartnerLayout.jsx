import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Logo } from '../../components/common/Logo';
import UserAvatar from '../../components/common/UserAvatar';
import { ThemeDropdown } from '../../components/common/ThemeDropdown';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-toastify';

export const PartnerLayout = () => {
  const { user, logout } = useAuth();
  const { effectiveTheme } = useTheme();
  const { partnerProfile, partnerProjects, partnerWorkforce, partnerNotifications } = useData() || {};
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Verify partner account active status on session
  React.useEffect(() => {
    try {
      const savedPartnersStr = localStorage.getItem('flexistaff_partners');
      if (savedPartnersStr) {
        const partnersList = JSON.parse(savedPartnersStr);
        const userEmail = (user?.email || '').toLowerCase().trim();
        const matched = partnersList.find((p) => {
          if (!p) return false;
          const pEmail = (p.email || '').toLowerCase().trim();
          return pEmail && (pEmail === userEmail || userEmail.includes('partner'));
        });

        if (matched) {
          const status = String(matched.status || '').toLowerCase().trim();
          if (['inactive', 'deactivated', 'terminated', 'pending', 'rejected'].includes(status)) {
            toast.error(`Partner organization "${matched.name}" has been deactivated by Admin. Logging out...`);
            logout();
            navigate('/login');
          }
        }
      }
    } catch {
      // Ignore
    }
  }, [user, navigate, logout]);

  const pendingRequestsCount = (partnerWorkforce || []).filter(
    (w) => w.status === 'Pending Allocation' || w.status === 'Under Review'
  ).length;
  const unreadNotifCount = (partnerNotifications || []).filter((n) => n.unread).length;

  const navItems = [
    { label: 'Dashboard', path: '/partner/dashboard', icon: LayoutDashboard },
    {
      label: 'Partner Projects',
      path: '/partner/projects',
      icon: FolderKanban,
      badge: (partnerProjects || []).length > 0 ? `${(partnerProjects || []).length} Active` : null,
      badgeColor: 'bg-[#004ac6]/10 text-[#004ac6]',
    },
    { label: 'Project Progress', path: '/partner/project-progress', icon: TrendingUp },
    {
      label: 'Workforce Roster',
      path: '/partner/workforce',
      icon: Users,
      badge: (partnerWorkforce || []).length > 0 ? (partnerWorkforce || []).length : null,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    { label: 'Add Workforce Member', path: '/partner/workforce/register', icon: PlusCircle },
    {
      label: 'Allocation Requests',
      path: '/partner/workforce-requests',
      icon: GitPullRequest,
      badge: pendingRequestsCount > 0 ? `${pendingRequestsCount} Pending` : null,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      label: 'Notifications',
      path: '/partner/notifications',
      icon: Bell,
      badge: unreadNotifCount > 0 ? unreadNotifCount : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    { label: 'Profile', path: '/partner/profile', icon: Building2 },
    { label: 'Support & Help', path: '/partner/support', icon: HelpCircle },
  ];

  const handleLogout = () => {
    logout();
    toast.info('Signed out of Partner Portal');
    navigate('/login');
  };

  const sidebarContent = (
    <div className={`flex h-full flex-col justify-between border-r transition-colors ${
      effectiveTheme === 'dark' ? 'bg-[#141324] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-700'
    }`}>
      <div>
        {/* Brand Header */}
        <div className={`flex h-16 items-center justify-between px-5 border-b ${
          effectiveTheme === 'dark' ? 'border-white/10 bg-[#18172c]' : 'border-slate-100 bg-gradient-to-r from-blue-50/40 to-indigo-50/40'
        }`}>
          <Logo size="md" to="/partner/dashboard" />
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
        <div className={`px-4 py-3 border-b ${
          effectiveTheme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50/60'
        }`}>
          <Link
            to="/partner/profile"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2.5 group"
          >
            <UserAvatar
              src={partnerProfile?.logoUrl || partnerProfile?.avatar}
              name={partnerProfile?.name || user?.companyName || user?.name || 'Partner Company'}
              size="sm"
              className="h-8 w-8 rounded-lg"
            />
            <div className="min-w-0 flex-1">
              <p className={`text-xs font-bold group-hover:text-indigo-700 truncate ${
                effectiveTheme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>{partnerProfile?.name || user?.companyName || user?.name || 'Partner Company'}</p>
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
              (item.path === '/partner/workforce' && location.pathname.startsWith('/partner/workforce/') && location.pathname !== '/partner/workforce/register');

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#2563eb] text-white shadow-sm shadow-[#2563eb]/25 font-bold'
                    : effectiveTheme === 'dark'
                    ? 'text-slate-300 hover:bg-white/5 hover:text-white'
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
      <div className={`p-3 border-t ${effectiveTheme === 'dark' ? 'border-white/10' : 'border-slate-100'}`}>
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
    <div className={`flex min-h-screen font-sans antialiased transition-colors ${
      effectiveTheme === 'dark' ? 'bg-[#0b0a1a] text-white' : 'bg-slate-50 text-slate-900'
    }`}>
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
              className="relative z-10 w-72 h-full shadow-2xl"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex flex-1 flex-col md:pl-64 min-w-0">
        {/* Top Navbar */}
        <header className={`sticky top-0 z-20 flex h-16 items-center justify-between border-b px-4 sm:px-6 backdrop-blur-md transition-colors ${
          effectiveTheme === 'dark' ? 'bg-[#141324]/90 border-white/10 text-white' : 'bg-white/90 border-[#c3c6d7]/60 text-slate-900'
        }`}>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs font-semibold text-[#737686] dark:text-slate-400">FlexiStaff Client & Partner Portal</span>
              <h2 className={`text-sm font-bold capitalize ${
                effectiveTheme === 'dark' ? 'text-white' : 'text-[#191b23]'
              }`}>
                {location.pathname.replace('/partner/', '').replace('/', ' / ') || 'Dashboard'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeDropdown />
            {/* Notifications Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileOpen(false);
                }}
                className={`relative rounded-xl border p-2 transition-colors shadow-2xs ${
                  effectiveTheme === 'dark' ? 'border-white/10 bg-[#1c1a36] text-white hover:bg-white/10' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
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
                    className="absolute right-0 z-50 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14132b] p-4 shadow-xl shadow-slate-900/10 text-slate-900 dark:text-white"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-2.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">Partner Notifications</h4>
                        {unreadNotifCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10px] font-bold">
                            {unreadNotifCount} new
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={markAllPartnerNotificationsRead}
                        className="text-[11px] font-bold text-[#004ac6] dark:text-indigo-400 hover:underline"
                      >
                        Mark all as read
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-white/10 max-h-72 overflow-y-auto my-1">
                      {partnerNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markPartnerNotificationRead(notif.id);
                            setIsNotificationsOpen(false);
                            if (notif.link) navigate(notif.link);
                          }}
                          className="p-2.5 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-xs"
                        >
                          <p className="font-bold text-slate-900 dark:text-white">{notif.title}</p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">{notif.message}</p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">{notif.time}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-slate-100 dark:border-white/10 pt-2 text-center">
                      <Link
                        to="/partner/notifications"
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline block"
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
                className={`flex items-center gap-2 rounded-xl border p-1.5 pr-2.5 text-xs transition-colors shadow-2xs ${
                  effectiveTheme === 'dark'
                    ? 'border-white/10 bg-[#1c1a36] text-white hover:bg-white/10'
                    : 'border-slate-200 bg-white text-[#191b23] hover:bg-slate-50'
                }`}
              >
                <UserAvatar
                  src={partnerProfile?.avatar}
                  name={partnerProfile?.contactPerson || partnerProfile?.name || user?.fullName || user?.name || 'Partner Contact'}
                  size="xs"
                  className="h-7 w-7 rounded-lg"
                />
                <div className="hidden lg:block text-left">
                  <p className="font-bold text-xs leading-none">{partnerProfile?.contactPerson || user?.fullName || user?.name || partnerProfile?.name || 'Partner Account'}</p>
                  <p className="text-[10px] text-[#737686] dark:text-slate-400 leading-tight mt-0.5">{partnerProfile?.name || user?.companyName || 'Partner Organization'}</p>
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
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{partnerProfile?.contactPerson || user?.fullName || user?.name || partnerProfile?.name || 'Partner Account'}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{partnerProfile?.email || user?.email || ''}</p>
                      <span className="mt-1.5 inline-block rounded-md bg-indigo-100 dark:bg-indigo-950/60 px-2 py-0.5 text-[10px] font-bold text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
                        {partnerProfile?.tier || 'Verified Partner'}
                      </span>
                    </div>

                    <Link
                      to="/partner/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                    >
                      <Building2 size={15} className="text-slate-400" />
                      <span>Profile</span>
                    </Link>

                    <Link
                      to="/partner/support"
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

        {/* Routed Sub-pages */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
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

export default PartnerLayout;
