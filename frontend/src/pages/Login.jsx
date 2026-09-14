import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ForgotPassword from '../components/auth/ForgotPassword';
import { toast } from 'react-toastify';
import { Logo } from '../components/common/Logo';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Video Stream Reference (Exact background animation video from Landing Page)
  const videoRef = useRef(null);
  const videoSrc = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_084718_72a17915-4964-4059-afcd-22d59399b72e.mp4";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;

    const playVideo = () => {
      const promise = video.play();
      if (promise !== undefined) {
        promise.catch((err) => {
          console.log("Auto-play blocked or waiting for user interaction:", err);
        });
      }
    };

    if (video.readyState >= 2) {
      playVideo();
    } else {
      video.addEventListener('canplay', playVideo, { once: true });
      video.addEventListener('loadeddata', playVideo, { once: true });
    }
  }, [videoSrc]);

  // Credentials State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  // Status & Modal states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const passwordInputRef = useRef(null);

  // Generalized Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email or username.');
      toast.error('Please enter your email or username.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      toast.error('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((res) => setTimeout(res, 400));

      const result = await login(email, password);

      if (!result.success) {
        setIsLoading(false);
        setErrorMessage(result.error || 'Invalid email or password.');
        toast.error(result.error || 'Invalid email or password.');
        return;
      }

      toast.success(`Welcome back, ${result.user?.name || 'User'}!`);
      navigate(result.redirectPath || result.user?.portalPath || '/dashboard');
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('An unexpected authentication error occurred.');
      toast.error('An unexpected authentication error occurred.');
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black text-white selection:bg-[#6A54F4] selection:text-white font-sans antialiased flex flex-col justify-between">
      {/* ========================================================================= */}
      {/* GLOBAL FIXED ANIMATED BACKGROUND VIDEO (EXACTLY LIKE LANDING PAGE) */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          src={videoSrc}
          className="w-full h-full object-cover opacity-35 scale-105 filter contrast-125 brightness-90 transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-20 flex items-center justify-between px-6 sm:px-12 py-6 max-w-7xl w-full mx-auto">
        <Logo size="md" variant="dark" />
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white backdrop-blur-md transition-all active:scale-95 shadow-lg"
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Centered Generalized Login Card */}
      <div className="relative z-10 max-w-md w-full mx-auto px-4 py-8 flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full rounded-3xl bg-[#0b0a1a]/85 border border-white/15 p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl space-y-6"
        >
          {/* Title Header */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Sign In
            </h2>
            <p className="text-xs text-slate-400">
              Enter your credentials to access your FlexiStaff portal
            </p>
          </div>

          {/* Error Message Display */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-200 font-semibold"
              >
                <AlertCircle size={15} className="shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unified Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-bold text-slate-300"
              >
                Email Address or Username
              </label>
              <div className="relative group">
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6A54F4] transition-colors"
                />
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="Enter email or username"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#6A54F4] focus:ring-2 focus:ring-[#6A54F4]/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-300"
              >
                Password
              </label>
              <div className="relative group">
                <Lock
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6A54F4] transition-colors"
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
                  placeholder="Enter password"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#6A54F4] focus:ring-2 focus:ring-[#6A54F4]/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-white/10 text-[#6A54F4] focus:ring-[#6A54F4] h-3.5 w-3.5"
                />
                <span className="font-medium text-[11px] sm:text-xs">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(true)}
                className="font-bold text-purple-400 hover:text-purple-300 hover:underline text-[11px] sm:text-xs transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6A54F4] via-[#2563eb] to-[#004ac6] hover:from-[#5844E5] hover:to-[#1d4ed8] text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-purple-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>



          {/* Registration Link */}
          <div className="pt-4 border-t border-white/10 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <span>Don't have an account?</span>
            <Link
              to="/register"
              className="font-extrabold text-[#6A54F4] hover:text-purple-300 hover:underline transition-colors"
            >
              Register Here →
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Bottom Footer Credits */}
      <footer className="relative z-10 py-4 text-center text-[11px] text-slate-500 border-t border-white/5">
        © 2026 FlexiStaff AI Platform. Enterprise Workforce Operations.
      </footer>

      {/* Forgot Password Modal */}
      <ForgotPassword
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </main>
  );
};

export default Login;
