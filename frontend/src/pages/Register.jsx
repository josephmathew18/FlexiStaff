import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Logo } from '../components/common/Logo';
import {
  User,
  Mail,
  Phone,
  Building2,
  Lock,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Check,
  ArrowRight,
  ChevronLeft,
} from 'lucide-react';
import { MdHub } from 'react-icons/md';

export const Register = ({ onNavigateToLogin }) => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { addClient } = useData();

  // Current active step (0 = Account Selector, 1 = Details, 2 = Security)
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAccountType, setSelectedAccountType] = useState('Client'); // 'Client' | 'Freelancer'

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'Client',
    companyName: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });

  // Field focus and touched tracking
  const [touched, setTouched] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading and Toast states
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Validation Rules
  const errors = useMemo(() => {
    const errs = {};

    if (!formData.fullName.trim()) {
      errs.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      errs.fullName = 'Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    const phoneRegex = /^[\d\s()+-]{7,20}$/;
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone.trim())) {
      errs.phone = 'Enter a valid phone number (min 7 digits)';
    }

    if (!formData.companyName.trim()) {
      errs.companyName = 'Company / Organization name is required';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (!formData.terms) {
      errs.terms = 'You must accept the Terms of Service';
    }

    return errs;
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
  };

  const showToastNotification = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleNextStep = () => {
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      companyName: true,
    });

    if (errors.fullName || errors.email || errors.phone || errors.companyName) {
      showToastNotification('Please complete all required fields correctly before proceeding.');
      return;
    }

    setCurrentStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      companyName: true,
      password: true,
      confirmPassword: true,
      terms: true,
    });

    if (Object.keys(errors).length > 0) {
      showToastNotification('Please resolve all form errors before submitting.');
      return;
    }

    setLoading(true);

    try {
      const authRes = await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'Client',
        companyName: formData.companyName,
      });

      setLoading(false);

      if (authRes.success) {
        addClient({
          companyName: formData.companyName,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          location: 'India',
          industry: 'Enterprise Software & Services',
          tier: 'Enterprise Client',
          status: 'Active',
        });
        showToastNotification('Client organization account registered successfully!', 'success');
        setTimeout(() => {
          navigate('/client/dashboard');
        }, 800);
      } else {
        showToastNotification(authRes.error || 'Registration failed. Email may already be registered.', 'error');
      }
    } catch (err) {
      setLoading(false);
      showToastNotification('Registration failed. Please try again.', 'error');
    }
  };

  // =========================================================================
  // STEP 0: UPWORK STYLE ACCOUNT TYPE SELECTOR SCREEN (WELCOME TO FLEXISTAFF)
  // =========================================================================
  if (currentStep === 0) {
    return (
      <div className="min-h-screen w-full bg-black font-sans antialiased text-white flex flex-col justify-between">
        {/* Top Header */}
        <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <Logo size="md" />
        </header>

        {/* Main Content */}
        <main className="max-w-2xl mx-auto w-full px-4 text-center my-auto space-y-8 py-10">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Welcome to FlexiStaff
            </h1>
            <p className="text-slate-400 text-sm sm:text-base font-medium">
              Which describes you best?
            </p>
          </div>

          {/* 2 Selectable Cards (Client vs Freelancer matching Upwork screenshot) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            
            {/* Client Card */}
            <div
              onClick={() => setSelectedAccountType('Client')}
              className={`group relative rounded-3xl p-6 sm:p-8 cursor-pointer transition-all border-2 bg-[#16152B] flex flex-col justify-between shadow-xl min-h-[300px] ${
                selectedAccountType === 'Client'
                  ? 'border-[#6A54F4] bg-[#1A1835] ring-2 ring-[#6A54F4]/50 scale-[1.02]'
                  : 'border-white/10 hover:border-white/30 hover:scale-[1.01]'
              }`}
            >
              {/* Soft Green Gradient Icon Container */}
              <div className="w-full aspect-square rounded-2xl bg-gradient-to-tr from-emerald-400/25 via-emerald-300/15 to-[#6A54F4]/20 border border-emerald-500/30 flex items-center justify-center mb-6 shadow-inner">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                  <Building2 size={36} />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-white group-hover:text-purple-300 transition-colors flex items-center gap-1">
                  <span>Client</span>
                  <ArrowRight size={18} />
                </h3>
              </div>
            </div>

            {/* Freelancer / Workforce Card */}
            <div
              onClick={() => setSelectedAccountType('Freelancer')}
              className={`group relative rounded-3xl p-6 sm:p-8 cursor-pointer transition-all border-2 bg-[#16152B] flex flex-col justify-between shadow-xl min-h-[300px] ${
                selectedAccountType === 'Freelancer'
                  ? 'border-[#6A54F4] bg-[#1A1835] ring-2 ring-[#6A54F4]/50 scale-[1.02]'
                  : 'border-white/10 hover:border-white/30 hover:scale-[1.01]'
              }`}
            >
              {/* Soft Purple/Green Gradient Icon Container */}
              <div className="w-full aspect-square rounded-2xl bg-gradient-to-tr from-[#6A54F4]/25 via-purple-500/20 to-emerald-400/20 border border-purple-500/30 flex items-center justify-center mb-6 shadow-inner">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-300">
                  <User size={36} />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-white group-hover:text-purple-300 transition-colors flex items-center gap-1">
                  <span>Freelancer</span>
                  <ArrowRight size={18} />
                </h3>
              </div>
            </div>

          </div>

          {/* Action Button */}
          <div className="pt-4 max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => {
                if (selectedAccountType === 'Freelancer') {
                  navigate('/freelancer/apply');
                } else {
                  setCurrentStep(1);
                }
              }}
              className="w-full py-3.5 rounded-full bg-[#6A54F4] hover:bg-[#5844E5] text-white font-bold text-sm shadow-lg shadow-purple-950/50 transition-all hover:scale-105"
            >
              {selectedAccountType === 'Client' ? 'Apply as a Client' : 'Apply as a Freelancer'}
            </button>
          </div>

          {/* Footer */}
          <div className="pt-2 text-xs text-slate-400">
            <span>Already have an account? </span>
            <Link to="/login" className="font-bold text-[#7B66FF] hover:underline">
              Log in
            </Link>
          </div>
        </main>

        <footer className="py-6 text-center text-xs text-slate-500 border-t border-white/10">
          © {new Date().getFullYear()} FlexiStaff Inc. All rights reserved.
        </footer>
      </div>
    );
  }

  // =========================================================================
  // STEP 1 & 2: REGISTRATION FORM FOR CLIENT ACCOUNT
  // =========================================================================
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-black font-sans antialiased text-white">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT HERO SECTION */}
      <div className="relative hidden lg:flex lg:w-5/12 bg-[#6A54F4] flex-col justify-between p-12 overflow-hidden text-white">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-25"
          >
            <source
              src="https://cdn.coverr.co/videos/coverr-typing-on-a-keyboard-4433/1080p.mp4"
              type="video/mp4"
            />
            <source
              src="https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-41324-large.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-br from-[#4F36E3]/90 via-[#6A54F4]/85 to-[#7B66FF]/75" />
        </div>

        <div className="relative z-10">
          <Logo size="lg" />
        </div>

        <div className="relative z-10 my-auto space-y-4 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-xs font-medium backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>On-Demand Engineering Squads & SOW Management</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
            Register Enterprise Client Organization
          </h1>

          <p className="text-sm text-purple-100/90 leading-relaxed">
            Submit your company details to post project requirements, inspect verified talent roster, and track live sprint milestones.
          </p>
        </div>

        <div className="relative z-10 pt-4 border-t border-white/20 flex justify-between text-xs text-purple-200">
          <span>Enterprise Client Account</span>
          <span>© 2026 FlexiStaff Inc.</span>
        </div>
      </div>

      {/* RIGHT REGISTRATION FORM */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 lg:px-16 min-h-screen">
        <div className="max-w-xl mx-auto w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl text-slate-900">
          
          {/* Form Header */}
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(0)}
                className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
              >
                <ChevronLeft size={14} /> Back to Role Selection
              </button>

              <Link to="/login" className="text-xs font-bold text-[#6A54F4] hover:underline">
                Sign in to existing account →
              </Link>
            </div>
            <h2 className="font-extrabold text-2xl text-slate-900 mt-3 tracking-tight">Register Your Company</h2>
            <p className="text-xs text-slate-500 mt-1">Fill in your organization details to set up your Client Portal access.</p>
          </div>

          {/* STEP INDICATOR */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className={`flex items-center gap-2 text-xs font-bold ${currentStep === 1 ? 'text-[#6A54F4]' : 'text-emerald-600'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${currentStep === 1 ? 'bg-[#6A54F4] text-white' : 'bg-emerald-600 text-white'}`}>
                {currentStep > 1 ? <Check size={14} /> : 1}
              </div>
              <span>1. Company & Contact Details</span>
            </div>

            <div className={`flex items-center gap-2 text-xs font-bold ${currentStep === 2 ? 'text-[#6A54F4]' : 'text-slate-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${currentStep === 2 ? 'bg-[#6A54F4] text-white' : 'bg-slate-200 text-slate-500'}`}>
                2
              </div>
              <span>2. Security & Credentials</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {/* STEP 1: COMPANY & CONTACT INFO */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="space-y-4"
                >
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Contact Person Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('fullName')}
                        placeholder="Enter full name"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#6A54F4] focus:ring-2 focus:ring-[#6A54F4]/15 transition-all"
                        required
                      />
                    </div>
                    {touched.fullName && errors.fullName && (
                      <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Company Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Company / Organization Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('companyName')}
                        placeholder="Enter company name"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#6A54F4] focus:ring-2 focus:ring-[#6A54F4]/15 transition-all"
                        required
                      />
                    </div>
                    {touched.companyName && errors.companyName && (
                      <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.companyName}
                      </p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Work Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('email')}
                        placeholder="Enter work email address"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#6A54F4] focus:ring-2 focus:ring-[#6A54F4]/15 transition-all"
                        required
                      />
                    </div>
                    {touched.email && errors.email && (
                      <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('phone')}
                        placeholder="Enter phone number"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#6A54F4] focus:ring-2 focus:ring-[#6A54F4]/15 transition-all"
                        required
                      />
                    </div>
                    {touched.phone && errors.phone && (
                      <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.phone}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full py-3 mt-4 rounded-xl bg-[#6A54F4] hover:bg-[#5844E5] text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Continue to Security & Password</span>
                    <ArrowRight size={16} />
                  </button>
                </motion.div>
              )}

              {/* STEP 2: SECURITY & CREDENTIALS */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="space-y-4"
                >
                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Create Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('password')}
                        placeholder="At least 8 characters"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#6A54F4] focus:ring-2 focus:ring-[#6A54F4]/15 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {touched.password && errors.password && (
                      <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('confirmPassword')}
                        placeholder="Re-enter password"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#6A54F4] focus:ring-2 focus:ring-[#6A54F4]/15 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {touched.confirmPassword && errors.confirmPassword && (
                      <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Terms Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        name="terms"
                        checked={formData.terms}
                        onChange={handleInputChange}
                        className="mt-0.5 rounded border-slate-300 text-[#6A54F4] focus:ring-[#6A54F4] h-4 w-4"
                      />
                      <span className="text-xs text-slate-600 leading-normal">
                        I agree to the <span className="font-bold text-slate-900 underline">Terms of Service</span>, <span className="font-bold text-slate-900 underline">Privacy Policy</span>, and workforce compliance policies.
                      </span>
                    </label>
                    {touched.terms && errors.terms && (
                      <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                        <AlertCircle size={12} /> {errors.terms}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1"
                    >
                      <ChevronLeft size={16} /> Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 rounded-xl bg-[#6A54F4] hover:bg-[#5844E5] text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-75"
                    >
                      {loading ? (
                        'Registering Client Account...'
                      ) : (
                        <>
                          <span>Complete Client Registration</span>
                          <CheckCircle2 size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
