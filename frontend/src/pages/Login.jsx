import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Building2,
  Users,
  HardHat,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
  FolderKanban,
  Zap,
  TrendingUp,
  GitPullRequest,
  Bell,
  Shield,
  Loader2,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ForgotPassword from '../components/auth/ForgotPassword';
import { toast } from 'react-toastify';

// Specific Portal Configurations for the 5 User Roles
const ROLE_TABS = [
  {
    key: 'Admin',
    label: 'Admin',
    icon: ShieldCheck,
    title: 'Enterprise Admin Suite',
    portalTitle: 'Company Admin Login',
    subtitle: 'Sign in to manage platform operations, approve client project requirements, and authorize workforce assignments.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-[#004ac6] via-[#1d4ed8] to-[#2563eb]',
    buttonBg: 'from-[#004ac6] to-[#2563eb]',
    defaultEmail: 'admin@flexistaff.com',
    defaultPassword: 'admin123',
    redirectPath: '/admin/dashboard',
    heroBadge: 'Platform Administration & Approval Authority',
    heroHeading: 'Centralized Administrative & Assignment Approval Suite',
    heroDescription: 'Review client project staffing requests, approve workforce assignments proposed by Organization Managers, and oversee platform operations.',
    highlights: [
      { icon: ShieldCheck, title: 'Project Approvals', desc: 'Review & approve client requirement submissions' },
      { icon: CheckCircle2, title: 'Assignment Approvals', desc: 'Final sign-off on manager talent allocations' },
      { icon: Building2, title: 'Partner Directory', desc: 'Oversee verified partner client organizations' },
    ],
  },
  {
    key: 'Client',
    label: 'Client',
    icon: Building2,
    title: 'Enterprise Client Portal',
    portalTitle: 'Client Login',
    subtitle: 'Sign in to submit project staffing requirements, track live sprint milestones, and monitor project progress.',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-[#059669] via-[#10b981] to-[#34d399]',
    buttonBg: 'from-[#059669] to-[#10b981]',
    defaultEmail: 'client@flexistaff.com',
    defaultPassword: 'client123',
    redirectPath: '/client/dashboard',
    heroBadge: 'Client Project Request & Tracking Hub',
    heroHeading: 'On-Demand Engineering Squads & Transparent Project Tracking',
    heroDescription: 'Submit project requirements, track sprint progress, and inspect milestone deliverables in real-time.',
    highlights: [
      { icon: FolderKanban, title: 'Submit Requirements', desc: 'Define project scope, category, and budget goals' },
      { icon: TrendingUp, title: 'Live Progress Tracking', desc: 'Real-time sprint velocity and milestone completion' },
      { icon: Users, title: 'Squad Visibility', desc: 'Inspect verified talent assigned to your projects' },
    ],
  },
  {
    key: 'Manager',
    label: 'Manager',
    icon: Users,
    title: 'Organization Manager Portal',
    portalTitle: 'Manager Login',
    subtitle: 'Sign in to review Company-approved projects, match workforce talent, and propose candidate assignments.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-[#3730a3] via-[#4338ca] to-[#4f46e5]',
    buttonBg: 'from-[#3730a3] to-[#4f46e5]',
    defaultEmail: 'manager@flexistaff.com',
    defaultPassword: 'manager123',
    redirectPath: '/manager/dashboard',
    heroBadge: 'Talent Orchestration & Management',
    heroHeading: 'Skill-Based Matching & Squad Allocation',
    heroDescription: 'Coordinate engineering squads, analyze project technical requirements, and propose candidate allocations to Company for assignment sign-off.',
    highlights: [
      { icon: Zap, title: 'Skill-Based Matching', desc: 'Match candidate skills against project requirements' },
      { icon: GitPullRequest, title: 'Assignment Requests', desc: 'Submit talent allocation requests to Company' },
      { icon: TrendingUp, title: 'Execution Oversight', desc: 'Monitor sprint tasks and deliverables' },
    ],
  },
  {
    key: 'Partner Company',
    label: 'Partner',
    icon: Building2,
    title: 'Partner Company Portal',
    portalTitle: 'Partner Portal Login',
    subtitle: 'Sign in to add company professionals, maintain talent availability, and monitor active assignments.',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-[#004ac6] via-[#2563eb] to-[#3b82f6]',
    buttonBg: 'from-[#004ac6] to-[#2563eb]',
    defaultEmail: 'partner@flexistaff.com',
    defaultPassword: 'partner123',
    redirectPath: '/partner/dashboard',
    heroBadge: 'Enterprise Partner Ecosystem',
    heroHeading: 'Workforce & Sprint Tracking',
    heroDescription: 'Add specialized professionals to the common workforce pool, update talent availability statuses, and monitor deployed projects.',
    highlights: [
      { icon: Users, title: 'Roster Management', desc: 'Add technical professionals to the common pool' },
      { icon: CheckCircle2, title: 'Live Availability', desc: 'Update talent availability in real time' },
      { icon: FolderKanban, title: 'Project Monitoring', desc: 'Track where company talent is deployed' },
    ],
  },
  {
    key: 'Workforce',
    label: 'Workforce',
    icon: HardHat,
    title: 'Professional & Freelancer Portal',
    portalTitle: 'Workforce Login',
    subtitle: 'Sign in as a Partner Company Employee (Professional) or an Independent Freelancer to review Company-approved project invitations.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-[#7c3aed] via-[#8b5cf6] to-[#a78bfa]',
    buttonBg: 'from-[#7c3aed] to-[#8b5cf6]',
    defaultEmail: 'talent@flexistaff.com',
    defaultPassword: 'talent123',
    redirectPath: '/workforce/dashboard',
    heroBadge: 'Professionals & Independent Freelancers Hub',
    heroHeading: 'Project Invitations, Task Execution & Milestones',
    heroDescription: 'Receive Company-approved project assignment invitations, accept or decline offers, log sprint progression, and view your employment classification.',
    highlights: [
      { icon: Bell, title: 'Assignment Invitations', desc: 'Accept or decline Company-approved project offers' },
      { icon: TrendingUp, title: 'Task & Sprint Updates', desc: 'Log work progress and mark milestones complete' },
      { icon: CheckCircle2, title: 'Employment & Availability', desc: 'Partner employee and independent freelancer status' },
    ],
  },
];

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Active Role Tab (Default: Partner Company)
  const [activeTabKey, setActiveTabKey] = useState('Partner Company');

  const activeRoleConfig = ROLE_TABS.find((t) => t.key === activeTabKey) || ROLE_TABS[1];

  // Credentials State initialized to active tab default
  const [email, setEmail] = useState(activeRoleConfig.defaultEmail);
  const [password, setPassword] = useState(activeRoleConfig.defaultPassword);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Status & Modal states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const passwordInputRef = useRef(null);

  // Switch role tab and prefill demo credentials
  const handleTabSwitch = (tabKey) => {
    setActiveTabKey(tabKey);
    setErrorMessage('');
    const targetConfig = ROLE_TABS.find((t) => t.key === tabKey);
    if (targetConfig) {
      setEmail(targetConfig.defaultEmail);
      setPassword(targetConfig.defaultPassword);
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email.');
      toast.error('Please enter your email.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      toast.error('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate short authentication check
      await new Promise((res) => setTimeout(res, 350));

      const result = await login(email, password, activeTabKey);

      if (!result.success) {
        setIsLoading(false);
        setErrorMessage(result.error || 'Invalid email or password.');
        toast.error(result.error || 'Invalid email or password.');
        return;
      }

      toast.success(`Welcome to ${activeRoleConfig.title}! Signed in as ${result.user?.name || activeTabKey}.`);
      navigate(activeRoleConfig.redirectPath);
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('An unexpected authentication error occurred.');
      toast.error('An unexpected authentication error occurred.');
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col lg:flex-row bg-[#faf8ff] selection:bg-[#2563eb] selection:text-white font-sans antialiased">
      {/* ========================================================================= */}
      {/* LEFT SIDE: Dynamic Role Person Hero Panel */}
      {/* ========================================================================= */}
      <section className="relative hidden lg:flex w-1/2 flex-col justify-between p-12 xl:p-16 overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/20" />
        <motion.img
          key={activeRoleConfig.key}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          alt={activeRoleConfig.title}
          className="absolute inset-0 h-full w-full object-cover"
          src={activeRoleConfig.image}
        />

        {/* Top: Brand Header */}
        <div className="relative z-20 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
            <Layers size={24} className="text-white" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-white block leading-tight">
              FlexiStaff<span className="text-blue-300">AI</span>
            </span>
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
              Smart Workforce Management
            </span>
          </div>
        </div>

        {/* Bottom Hero Text */}
        <div className="relative z-20 max-w-lg text-white space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-white mb-1">
            <activeRoleConfig.icon size={14} />
            <span>{activeRoleConfig.heroBadge}</span>
          </div>
          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight">
            {activeRoleConfig.heroHeading}
          </h2>
          <p className="text-sm text-slate-200 opacity-90 leading-relaxed">
            {activeRoleConfig.heroDescription}
          </p>

          <div className="pt-4 border-t border-white/20 flex items-center justify-between text-xs text-slate-300">
            <span>{activeRoleConfig.title}</span>
            <span>© 2026 FlexiStaffAI.</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* RIGHT SIDE / MULTI-ROLE TABBED LOGIN CARD */}
      {/* ========================================================================= */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 sm:px-8 py-10 min-h-screen">
        <div className="w-full max-w-[460px] rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-[0_10px_35px_rgba(0,74,198,0.07)] space-y-6">

          {/* Brand Header for Mobile View */}
          <div className="flex items-center gap-2.5 lg:hidden border-b border-slate-100 pb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#004ac6] to-[#2563eb] text-white flex items-center justify-center shadow-md">
              <Layers size={20} />
            </div>
            <div>
              <span className="font-extrabold text-base text-[#191b23] block leading-tight">
                FlexiStaff<span className="text-[#2563eb]">AI</span>
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                Multi-Role Authentication
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* USER ROLE TAB SWITCHER (5 Dedicated Tabs on One Single Page) */}
          {/* ========================================================================= */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 tracking-tight">
                Select User Portal
              </span>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                {activeRoleConfig.label} Access
              </span>
            </div>

            {/* 5-Tab Segmented Control */}
            <div className="grid grid-cols-5 gap-1 p-1 rounded-2xl bg-slate-100/90 border border-slate-200/80">
              {ROLE_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTabKey === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => handleTabSwitch(tab.key)}
                    className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[10px] sm:text-[11px] font-bold transition-all duration-150 ${
                      isActive
                        ? 'bg-white text-[#004ac6] shadow-sm shadow-slate-900/10 border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <Icon size={15} className={`mb-0.5 ${isActive ? 'text-[#004ac6]' : 'text-slate-400'}`} />
                    <span className="truncate w-full text-center leading-tight">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Portal Heading */}
          <div className="border-b border-slate-100 pb-3">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#191b23] tracking-tight">
              {activeRoleConfig.portalTitle}
            </h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {activeRoleConfig.subtitle}
            </p>
          </div>

          {/* Demo Credentials Box (Development Mode Helper) */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span className="flex items-center gap-1 text-[#004ac6]">
                <Sparkles size={13} />
                <span>Demo Account</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setEmail(activeRoleConfig.defaultEmail);
                  setPassword(activeRoleConfig.defaultPassword);
                  toast.info(`Filled ${activeRoleConfig.label} credentials`);
                }}
                className="text-[10px] font-bold text-blue-600 hover:underline"
              >
                Autofill
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-600 pt-0.5 font-mono">
              <span>User: <strong className="text-slate-900">{email}</strong></span>
              <span>Pass: <strong className="text-slate-900">{password}</strong></span>
            </div>
          </div>

          {/* Error Message Display */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold"
              >
                <AlertCircle size={15} className="shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-bold text-slate-700"
              >
                Email Address / Username
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="Enter your email or username"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="password"
                  ref={passwordInputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-[#2563eb] focus:ring-[#2563eb] h-3.5 w-3.5"
                />
                <span className="font-medium text-[11px] sm:text-xs">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(true)}
                className="font-bold text-[#004ac6] hover:underline text-[11px] sm:text-xs"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl bg-gradient-to-r ${activeRoleConfig.buttonBg} text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-75`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In as {activeRoleConfig.label}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
            <Shield size={13} className="text-emerald-600" />
            <span>Protected by role-based access control.</span>
          </div>

          {/* Registration Link: ONLY for Client Portal */}
          {activeTabKey === 'Client' && (
            <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5 flex-wrap">
              <span>Don't have a Client account?</span>
              <Link
                to="/register"
                className="font-extrabold text-[#059669] hover:text-emerald-700 transition-colors"
              >
                Register Enterprise Client →
              </Link>
            </div>
          )}

          {/* Form for Freelancer Link: ONLY for Workforce Portal */}
          {activeTabKey === 'Workforce' && (
            <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5 flex-wrap">
              <span>Are you an independent freelancer?</span>
              <Link
                to="/freelancer/apply"
                className="font-extrabold text-[#7c3aed] hover:text-purple-700 transition-colors"
              >
                Form for Freelancer →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Forgot Password Modal */}
      <ForgotPassword
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </main>
  );
};

export default Login;
