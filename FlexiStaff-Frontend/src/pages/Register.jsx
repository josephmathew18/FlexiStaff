import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
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
  const { login } = useAuth();

  // Current active step (1 or 2)
  const [currentStep, setCurrentStep] = useState(1);

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

  const passwordCriteria = useMemo(() => {
    const pwd = formData.password;
    return {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>_]/.test(pwd),
    };
  }, [formData.password]);

  const passwordStrengthScore = useMemo(() => {
    let score = 0;
    if (passwordCriteria.length) score++;
    if (passwordCriteria.uppercase && passwordCriteria.lowercase) score++;
    if (passwordCriteria.number) score++;
    if (passwordCriteria.special) score++;
    return score;
  }, [passwordCriteria]);

  const passwordStrengthLabel = useMemo(() => {
    if (!formData.password) return { text: 'None', color: 'text-gray-400', bar: 'bg-gray-200', width: 'w-0' };
    if (passwordStrengthScore <= 1) return { text: 'Weak', color: 'text-rose-600', bar: 'bg-rose-500', width: 'w-1/3' };
    if (passwordStrengthScore === 2 || passwordStrengthScore === 3)
      return { text: 'Medium', color: 'text-amber-600', bar: 'bg-amber-500', width: 'w-2/3' };
    return { text: 'Strong', color: 'text-emerald-600', bar: 'bg-emerald-500', width: 'w-full' };
  }, [formData.password, passwordStrengthScore]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    setFocusedField(null);
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const showToastNotification = (message, type = 'success') => {
    const id = Date.now();
    setToast({ message, type, id });
    setTimeout(() => {
      setToast((current) => (current && current.id === id ? null : current));
    }, 4500);
  };

  const canProceedFromStep1 = !errors.fullName && !errors.email && !errors.phone && !errors.companyName;

  const handleNextStep = () => {
    setTouched({ fullName: true, email: true, phone: true, companyName: true });
    if (canProceedFromStep1) {
      setCurrentStep(2);
    } else {
      showToastNotification('Please fill in all required company details accurately.', 'error');
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(1);
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
      showToastNotification('Please fix errors in the form before submitting.', 'error');
      return;
    }

    setLoading(true);

    try {
      await new Promise((res) => setTimeout(res, 800));

      login(formData.email, formData.password, 'Client');

      showToastNotification('Enterprise Client Registration successful! Redirecting...', 'success');

      setTimeout(() => {
        if (onNavigateToLogin) {
          onNavigateToLogin();
        } else {
          navigate('/client/dashboard');
        }
      }, 1200);
    } catch (err) {
      setLoading(false);
      showToastNotification('Registration failed. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#faf8ff] font-sans antialiased text-[#191b23]">
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
      <div className="relative hidden lg:flex lg:w-5/12 bg-[#004ac6] flex-col justify-between p-12 overflow-hidden text-white">
        <div className="absolute inset-0 z-0">
          <img
            alt="FlexiStaff AI Enterprise Client Portal"
            className="w-full h-full object-cover opacity-30"
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#003ca3]/95 via-[#004ac6]/90 to-[#1d4ed8]/80" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
            <MdHub className="text-white text-2xl" />
          </div>
          <div>
            <span className="font-extrabold text-2xl tracking-tight leading-none text-white">
              FlexiStaff<span className="text-blue-300">AI</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-blue-200 font-semibold block mt-0.5">
              Enterprise Client Registration
            </span>
          </div>
        </div>

        <div className="relative z-10 my-auto space-y-4 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 border border-blue-300/30 text-blue-100 text-xs font-medium backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>On-Demand Engineering Squads & SOW Management</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
            Register Enterprise Client Organization
          </h1>

          <p className="text-sm text-blue-100/90 leading-relaxed">
            Submit your company details to post project requirements, inspect verified talent roster, and track live sprint milestones.
          </p>
        </div>

        <div className="relative z-10 pt-4 border-t border-white/20 flex justify-between text-xs text-blue-200">
          <span>Enterprise Client Account</span>
          <span>© 2026 FlexiStaffAI.</span>
        </div>
      </div>

      {/* RIGHT REGISTRATION FORM */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 lg:px-16 min-h-screen">
        <div className="max-w-xl mx-auto w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl">
          {/* Form Header */}
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-200 flex items-center gap-1">
                <Building2 size={13} />
                <span>Enterprise Client Account</span>
              </span>

              <Link to="/login" className="text-xs font-bold text-[#004ac6] hover:underline">
                Sign in to existing account →
              </Link>
            </div>
            <h2 className="font-extrabold text-2xl text-slate-900 mt-2 tracking-tight">Register Your Company</h2>
            <p className="text-xs text-slate-500 mt-1">Fill in your organization details to set up your Client Portal access.</p>
          </div>

          {/* STEP INDICATOR */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className={`flex items-center gap-2 text-xs font-bold ${currentStep === 1 ? 'text-[#004ac6]' : 'text-emerald-600'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${currentStep === 1 ? 'bg-[#004ac6] text-white' : 'bg-emerald-600 text-white'}`}>
                {currentStep > 1 ? <Check size={14} /> : 1}
              </div>
              <span>1. Company & Contact Details</span>
            </div>

            <div className={`flex items-center gap-2 text-xs font-bold ${currentStep === 2 ? 'text-[#004ac6]' : 'text-slate-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${currentStep === 2 ? 'bg-[#004ac6] text-white' : 'bg-slate-200 text-slate-500'}`}>
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
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
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
                        placeholder="e.g. Finovate Global Ltd"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
                        required
                      />
                    </div>
                    {touched.companyName && errors.companyName && (
                      <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.companyName}
                      </p>
                    )}
                  </div>

                  {/* Email & Phone Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Corporate Email <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          onBlur={() => handleBlur('email')}
                          placeholder="client@company.com"
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
                          required
                        />
                      </div>
                      {touched.email && errors.email && (
                        <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                          <AlertCircle size={12} /> {errors.email}
                        </p>
                      )}
                    </div>

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
                          placeholder="+1 (555) 000-0000"
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
                          required
                        />
                      </div>
                      {touched.phone && errors.phone && (
                        <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                          <AlertCircle size={12} /> {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full py-3 rounded-xl bg-[#004ac6] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    <span>Continue to Security Setup</span>
                    <ArrowRight size={16} />
                  </button>
                </motion.div>
              )}

              {/* STEP 2: SECURITY & TERMS */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="space-y-4"
                >
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
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

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
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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

                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
                      <input
                        type="checkbox"
                        name="terms"
                        checked={formData.terms}
                        onChange={handleInputChange}
                        className="rounded border-slate-300 text-[#004ac6] focus:ring-[#004ac6] mt-0.5 h-4 w-4"
                      />
                      <span>
                        I agree to the <strong className="text-slate-900">FlexiStaff Terms of Service</strong> and <strong className="text-slate-900">Privacy Policy</strong>.
                      </span>
                    </label>
                    {touched.terms && errors.terms && (
                      <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                        <AlertCircle size={12} /> {errors.terms}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-4 py-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1"
                    >
                      <ChevronLeft size={16} />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white font-bold text-xs sm:text-sm shadow-md hover:from-blue-700 hover:to-blue-600 transition-all flex items-center justify-center gap-2 disabled:opacity-75"
                    >
                      {loading ? (
                        <span>Registering Enterprise Client...</span>
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
