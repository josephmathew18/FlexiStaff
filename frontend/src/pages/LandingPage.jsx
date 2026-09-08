import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Hls from 'hls.js';
import { Logo } from '../components/common/Logo';
import {
  Briefcase,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Building2,
  FolderKanban,
  Cpu,
  Users,
  Rocket,
  LineChart,
  Layers,
  Clock,
  AlertTriangle,
  FileText,
  Workflow,
  Search,
  Check,
  Send,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  ShieldCheck,
  Zap,
  TrendingUp,
  Sliders,
  BarChart3,
  Bell,
  Scale,
  BrainCircuit,
  Compass,
  Target,
  ChevronRight,
  ChevronDown,
  ArrowDown,
  Globe,
  Award,
  CreditCard,
  CheckCircle,
} from 'lucide-react';
import {
  FaLinkedin,
  FaGithub,
  FaTwitter,
} from 'react-icons/fa';

export const LandingPage = () => {
  // Video Stream Reference
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

  // Navigation & Scroll State
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollDirection, setScrollDirection] = useState('up');
  const [activeSection, setActiveSection] = useState('home');

  // Upwork Hero Mode & Search State
  const [workMode, setWorkMode] = useState('hire'); // 'hire' | 'work'
  const [heroSearch, setHeroSearch] = useState('');

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Scroll listener for sticky header, scroll direction, progress bar & scrollspy
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 1. Is Scrolled (>20px)
      setIsScrolled(currentScrollY > 20);

      // 2. Show Back to Top (>350px)
      setShowBackToTop(currentScrollY > 350);

      // 3. Scroll Direction tracking for auto-hide/reveal header layout
      if (currentScrollY > lastScrollY && currentScrollY > 120) {
        setScrollDirection('down');
      } else {
        setScrollDirection('up');
      }
      lastScrollY = currentScrollY;

      // 4. Scroll Progress Percentage calculation
      const totalScrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScrollHeight > 0) {
        const progress = (currentScrollY / totalScrollHeight) * 100;
        setScrollProgress(progress);
      }

      // 5. Active Section Detection (ScrollSpy)
      const sections = ['home', 'about', 'how-it-works', 'features', 'contact'];
      for (const sectionId of sections) {
        const elem = document.getElementById(sectionId);
        if (elem) {
          const rect = elem.getBoundingClientRect();
          if (rect.top <= 160 && rect.bottom >= 160) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const targetId = href.replace('#', '');
    const elem = document.getElementById(targetId);
    if (elem) {
      const yOffset = -75;
      const y = elem.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Thank you for reaching out! Our team will connect with your organization shortly.');
      setContactForm({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    }, 600);
  };

  // Navigation Links
  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Features', href: '#features' },
    { name: 'Contact', href: '#contact' },
  ];

  // The Problem Section Cards
  const problemCards = [
    {
      icon: Clock,
      title: 'Slow Workforce Selection',
      desc: 'Organizations spend excessive time finding qualified temporary personnel for specialized project requirements manually.',
    },
    {
      icon: AlertTriangle,
      title: 'Mismatch in Skills',
      desc: 'Generic job postings often lead to wrong talent assignments, causing project delays and costly retraining cycles.',
    },
    {
      icon: FileText,
      title: 'Unorganized Requirements',
      desc: 'Project needs, deliverables, and resource allocations are scattered across disconnected spreadsheets and emails.',
    },
  ];

  // The Solution Cards
  const solutionCards = [
    {
      icon: Sparkles,
      title: 'AI Requirement Processing',
      desc: 'Automatically extract technical skill requirements and project constraints directly from project documentation.',
    },
    {
      icon: Cpu,
      title: 'Smart Skill Matching',
      desc: 'Correlate project needs with verified temporary workforce capabilities to deliver instant, high-precision matches.',
    },
    {
      icon: Workflow,
      title: 'Structured Deployment',
      desc: 'Streamline the entire pipeline from project creation to workforce deployment and milestone tracking.',
    },
  ];

  // Target Stakeholders / Roles
  const roles = [
    {
      title: 'Enterprise Clients',
      subtitle: 'Post Projects & Hire Talent',
      desc: 'Create detailed project requisitions, define required skill matrices, and receive AI-matched workforce recommendations.',
      icon: Building2,
      badge: 'For Organizations',
    },
    {
      title: 'Project Managers',
      subtitle: 'Oversee Operations',
      desc: 'Evaluate incoming project requirements, allocate temporary workforce teams, and monitor project milestones.',
      icon: FolderKanban,
      badge: 'For Operations',
    },
    {
      title: 'Temporary Workforce',
      subtitle: 'Showcase Skills & Deploy',
      desc: 'Maintain verified skill profiles, review project invitations, and execute project deliverables efficiently.',
      icon: Users,
      badge: 'For Talent',
    },
    {
      title: 'Staffing Partners',
      subtitle: 'Supply Qualified Candidates',
      desc: 'Partner organizations submit pre-vetted temporary workers into client requisitions to fulfill staffing needs.',
      icon: ShieldCheck,
      badge: 'For Agencies',
    },
  ];

  // How It Works Steps
  const steps = [
    {
      step: '01',
      title: 'Create Project Requisition',
      desc: 'Clients post project details, timelines, budgets, and specific technical skill requirements.',
      icon: FileText,
    },
    {
      step: '02',
      title: 'AI Skill Analysis',
      desc: 'FlexiStaff AI processes the project scope to generate candidate skill vectors and match criteria.',
      icon: BrainCircuit,
    },
    {
      step: '03',
      title: 'Evaluate & Select Candidates',
      desc: 'Project managers and clients review top-ranked workforce matches with detailed skill fit scores.',
      icon: Users,
    },
    {
      step: '04',
      title: 'Workforce Deployment',
      desc: 'The selected workforce is coordinated and deployed for the required project engagement.',
      icon: Rocket,
    },
    {
      step: '05',
      title: 'Track Project Progress',
      desc: 'Workforce and project progress can be monitored transparently throughout the project lifecycle.',
      icon: LineChart,
    },
  ];

  // Smart Technology Section Cards
  const smartTechCards = [
    {
      icon: FileText,
      title: 'AI Requirement Analysis',
      desc: 'Analyze project descriptions, technical specifications, and milestones to identify core skill requisitions automatically.',
    },
    {
      icon: BrainCircuit,
      title: 'AI Skill Matching',
      desc: 'Match multi-tiered project requirements with relevant workforce skill vectors, experience levels, and availability.',
    },
    {
      icon: BarChart3,
      title: 'Workforce Insights & Analytics',
      desc: 'Use workforce and project information to support better staffing decisions, capacity planning, and resource balancing.',
    },
  ];

  // Key Features Grid
  const keyFeatures = [
    {
      icon: FolderKanban,
      title: 'Project Requirement Management',
      desc: 'Structure and catalog incoming project scopes, durations, budgets, and deliverable expectations in one centralized hub.',
    },
    {
      icon: BrainCircuit,
      title: 'AI-Based Requirement Analysis',
      desc: 'Extract technical competencies, seniority levels, and timeline constraints from project documentation.',
    },
    {
      icon: Cpu,
      title: 'Skill-Based Workforce Matching',
      desc: 'Correlate project needs with verified workforce skills to generate high-relevance staffing recommendations.',
    },
    {
      icon: Users,
      title: 'Temporary Workforce Management',
      desc: 'Maintain an organized catalog of temporary professionals with verified domain expertise and availability records.',
    },
    {
      icon: Sliders,
      title: 'Resource Bandwidth Allocation',
      desc: 'Track resource bandwidth in real-time to prevent scheduling overlaps and identify immediate capacity for new projects.',
    },
    {
      icon: Rocket,
      title: 'Assignment & Deployment',
      desc: 'Deploy qualified workforce resources to projects with clear milestone assignments and standardized operational sign-offs.',
    },
    {
      icon: LineChart,
      title: 'Project Progress Tracking',
      desc: 'Monitor milestone completion, burn-down metrics, and project phases across all active organizational projects.',
    },
    {
      icon: Bell,
      title: 'Notifications',
      desc: 'Automate system updates for project stage changes, requirement approvals, and milestone completions.',
    },
    {
      icon: BarChart3,
      title: 'Reports & Analytics',
      desc: 'Generate high-level operational reports on resource utilization, staffing velocity, and project timelines.',
    },
  ];

  // Why Choose FlexiStaff (Benefits)
  const benefits = [
    {
      number: '01',
      title: 'Save Time',
      desc: 'Reduce manual effort involved in workforce selection, requirement screening, and multi-party coordination.',
      icon: Clock,
    },
    {
      number: '02',
      title: 'Find Better Matches',
      desc: 'Use verified skills and structured project requirements to identify suitable workforce resources accurately.',
      icon: Target,
    },
    {
      number: '03',
      title: 'Improve Efficiency',
      desc: 'Organize temporary workforce operations and project milestones in a single, unified technology platform.',
      icon: Zap,
    },
    {
      number: '04',
      title: 'Scale Easily',
      desc: 'Support changing project demands and fluctuating workforce requirements across concurrent organizational initiatives.',
      icon: Scale,
    },
  ];

  return (
    <div id="home" className="min-h-screen bg-black text-white font-sans antialiased overflow-x-hidden selection:bg-[#6A54F4] selection:text-white relative">
      {/* ========================================================================= */}
      {/* GLOBAL FIXED ANIMATED BACKGROUND VIDEO (SHOWS WHEN SCROLLING DOWN) */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-80 transition-opacity duration-700"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/75 backdrop-blur-[1px]" />
      </div>

      {/* ========================================================================= */}
      {/* 0. TOP SCROLL PROGRESS INDICATOR BAR */}
      {/* ========================================================================= */}
      <div
        className="fixed top-0 left-0 right-0 z-[60] h-1 bg-[#6A54F4] transition-all duration-75 shadow-sm"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* ========================================================================= */}
      {/* 1. HEADER / NAVIGATION */}
      {/* ========================================================================= */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-black/95 backdrop-blur-md border-b border-white/10 py-3.5 shadow-xl'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6A54F4] text-white font-bold text-lg shadow-lg shadow-purple-900/40 group-hover:scale-105 transition-transform">
              <Briefcase size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-white leading-none">
                FlexiStaff<span className="text-[#7B66FF]">AI</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5">
                Workforce Management
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-300">
            {navLinks.map((link) => {
              const sectionId = link.href.replace('#', '');
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`transition-colors py-1 relative ${
                    isActive ? 'text-white font-bold' : 'hover:text-white'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6A54F4] rounded-full"
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="text-xs font-bold text-slate-200 hover:text-white px-4 py-2 rounded-xl transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl bg-[#6A54F4] hover:bg-[#5844E5] text-white text-xs font-bold shadow-lg shadow-purple-900/30 hover:shadow-purple-700/50 transition-all hover:scale-[1.02]"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path fillRule="evenodd" clipRule="evenodd" d="M18.278 16.864a1 1 0 01-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 01-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 011.414-1.414l4.829 4.828 4.828-4.828a1 1 0 111.414 1.414l-4.828 4.829 4.828 4.828z" />
              ) : (
                <path fillRule="evenodd" d="M4 5h16a1 1 0 010 2H4a1 1 0 110-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2z" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-black border-b border-white/10 px-4 pt-3 pb-6 space-y-3"
            >
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="block py-2 text-sm font-semibold text-slate-200 hover:text-purple-400"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
                <Link
                  to="/login"
                  className="w-full text-center py-2.5 border border-white/20 rounded-xl text-white font-semibold text-xs"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="w-full text-center py-2.5 bg-[#6A54F4] rounded-xl text-white font-semibold text-xs"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION COMPONENT */}
      {/* ========================================================================= */}
      <section className="relative w-full min-h-screen bg-transparent text-white overflow-hidden flex flex-col justify-center pt-24 pb-16 z-10">
        {/* Decorative Gradients */}
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none z-1" />
        <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none z-1" />

        {/* Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-12 space-y-8 flex flex-col items-center">
          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight max-w-4xl"
          >
            Temporary Workforce Allocation & Project Skill Matching
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-200 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl drop-shadow-sm"
          >
            Hire experts who use AI to amplify their talent, turning complex work into high impact business outcomes. FlexiStaff organizes resource deployment into one seamless platform.
          </motion.p>

          {/* Primary Action Buttons & Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pt-2 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              to="/register"
              className="px-7 py-3 rounded-xl bg-[#6A54F4] hover:bg-[#5844E5] text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-900/50 hover:shadow-purple-700/60 transition-all hover:scale-105 flex items-center gap-2"
            >
              <span>Get Started Now</span>
              <ArrowRight size={16} />
            </Link>
            <a
              href="#how-it-works"
              onClick={(e) => handleNavClick(e, '#how-it-works')}
              className="px-7 py-3 rounded-xl border border-white/20 hover:bg-white/10 text-slate-200 text-xs sm:text-sm font-bold transition-all backdrop-blur-sm"
            >
              Explore
            </a>
          </motion.div>

          {/* Trust Indicators */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-300 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>AI Skill Vector Matching</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>Real-time Resource Tracking</span>
            </div>
          </div>

          {/* Animated Scroll Down Indicator */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="pt-6 sm:pt-10"
          >
            <a
              href="#about"
              onClick={(e) => handleNavClick(e, '#about')}
              className="flex flex-col items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors group cursor-pointer"
              aria-label="Scroll down to learn more"
            >
              <span className="tracking-wider uppercase text-[10px] text-slate-400 group-hover:text-purple-300">Scroll Down</span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-9 h-9 rounded-full border border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center group-hover:border-[#7B66FF] group-hover:bg-[#6A54F4]/20 transition-all shadow-lg"
              >
                <ArrowDown size={15} className="text-[#7B66FF] group-hover:text-white" />
              </motion.div>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PROBLEM & SOLUTION SECTION */}
      {/* ========================================================================= */}
      <section id="about" className="py-20 bg-[#0E0D18]/70 backdrop-blur-md relative z-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#7B66FF] tracking-wider uppercase">
              Addressing Modern Workforce Challenges
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Why Traditional Staffing Needs Modernization
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              FlexiStaff addresses common operational bottlenecks in managing temporary project teams.
            </p>
          </div>

          {/* Problem Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {problemCards.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} className="bg-[#16152B] border border-white/10 rounded-3xl p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                    <IconComp size={20} />
                  </div>
                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Solution Banner */}
          <div className="bg-[#151426] border border-white/10 rounded-3xl p-8 sm:p-10 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">
                The FlexiStaff Approach
              </span>
              <h3 className="text-xl sm:text-3xl font-extrabold text-white">
                Modern Workforce Management
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {solutionCards.map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div key={idx} className="bg-[#1A192F] border border-white/5 rounded-2xl p-6 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-[#6A54F4]/20 text-[#7B66FF] flex items-center justify-center">
                      <IconComp size={20} />
                    </div>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. ROLES / STAKEHOLDERS SECTION */}
      {/* ========================================================================= */}
      <section className="py-20 bg-black/60 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#7B66FF] tracking-wider uppercase">
              Designed for Key Stakeholders
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              One Unified System for Every Role
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role, idx) => {
              const IconComp = role.icon;
              return (
                <div key={idx} className="bg-[#16152B] border border-white/10 hover:border-[#6A54F4]/50 rounded-3xl p-6 space-y-4 transition-all hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#6A54F4]/20 text-[#7B66FF] flex items-center justify-center">
                      <IconComp size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                      {role.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{role.title}</h3>
                    <p className="text-xs font-medium text-slate-400">{role.subtitle}</p>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{role.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. HOW IT WORKS / PIPELINE */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-20 bg-[#0E0D18]/70 backdrop-blur-md relative z-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#7B66FF] tracking-wider uppercase">
              Step-by-Step Workflow
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              How FlexiStaff Operates
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {steps.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} className="bg-[#16152B] border border-white/10 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-[#6A54F4]">{item.step}</span>
                    <IconComp size={18} className="text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. SMART TECHNOLOGY */}
      {/* ========================================================================= */}
      <section className="py-20 bg-black/60 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#7B66FF] tracking-wider uppercase">
              Advanced Automation Engine
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Smart Technology Powered Staffing
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {smartTechCards.map((card, idx) => {
              const IconComp = card.icon;
              return (
                <div key={idx} className="bg-[#16152B] border border-white/10 rounded-3xl p-6 space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-[#6A54F4]/20 text-[#7B66FF] flex items-center justify-center">
                    <IconComp size={20} />
                  </div>
                  <h3 className="text-base font-bold text-white">{card.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. KEY FEATURES GRID */}
      {/* ========================================================================= */}
      <section id="features" className="py-20 bg-[#0E0D18]/70 backdrop-blur-md relative z-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#7B66FF] tracking-wider uppercase">
              Comprehensive Platform Capabilities
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Built for Complete Workforce Management
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {keyFeatures.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div key={idx} className="bg-[#16152B] border border-white/10 hover:border-[#6A54F4]/40 rounded-3xl p-6 space-y-3 transition-all">
                  <div className="w-9 h-9 rounded-xl bg-[#6A54F4]/20 text-[#7B66FF] flex items-center justify-center">
                    <IconComp size={18} />
                  </div>
                  <h3 className="text-sm font-bold text-white">{feat.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. BENEFITS SECTION */}
      {/* ========================================================================= */}
      <section className="py-20 bg-black/60 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#7B66FF] tracking-wider uppercase">
              Measurable Outcomes
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Why Choose FlexiStaff
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {benefits.map((b, idx) => {
              const IconComp = b.icon;
              return (
                <div key={idx} className="bg-[#16152B] border border-white/10 rounded-3xl p-6 space-y-4">
                  <span className="text-2xl font-black text-[#6A54F4]">{b.number}</span>
                  <h3 className="text-base font-bold text-white">{b.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. CONTACT SECTION */}
      {/* ========================================================================= */}
      <section id="contact" className="py-20 bg-[#0E0D18]/75 backdrop-blur-md relative z-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#151426] border border-white/10 rounded-3xl p-8 sm:p-12 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs font-bold text-[#7B66FF] tracking-wider uppercase">
                  Get in Touch
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                  Have Questions About FlexiStaff?
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Our team is available to assist organizations, managers, and temporary workforce professionals.
                </p>

                <div className="space-y-3 pt-2 text-xs text-slate-300">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-[#7B66FF]" />
                    <span>support@flexistaff.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-[#7B66FF]" />
                    <span>+91 98765 43210</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-[#7B66FF]" />
                    <span>FlexiStaff HQ, Tech Park, Bengaluru, India</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <form onSubmit={handleContactSubmit} className="bg-[#1A192F] border border-white/5 rounded-2xl p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Name</label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full bg-[#121123] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6A54F4]"
                        placeholder="Your Name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full bg-[#121123] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6A54F4]"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="w-full bg-[#121123] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6A54F4]"
                      placeholder="Inquiry Subject"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Message</label>
                    <textarea
                      rows={4}
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full bg-[#121123] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6A54F4] resize-none"
                      placeholder="Enter your message..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-[#6A54F4] hover:bg-[#5844E5] text-white text-xs font-bold shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 transition-all"
                  >
                    <Send size={14} />
                    <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-white/10 bg-[#08080E] py-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/5">
            <Logo size="sm" />

            <div className="flex items-center gap-6 text-slate-400 font-medium">
              <a href="#home" onClick={(e) => handleNavClick(e, '#home')} className="hover:text-white">Home</a>
              <a href="#about" onClick={(e) => handleNavClick(e, '#about')} className="hover:text-white">About</a>
              <a href="#how-it-works" onClick={(e) => handleNavClick(e, '#how-it-works')} className="hover:text-white">How It Works</a>
              <a href="#features" onClick={(e) => handleNavClick(e, '#features')} className="hover:text-white">Features</a>
              <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className="hover:text-white">Contact</a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
            <p>© {new Date().getFullYear()} FlexiStaffAI. All rights reserved.</p>
            {showBackToTop && (
              <button
                type="button"
                onClick={scrollToTop}
                className="p-2 bg-[#16152B] border border-white/15 rounded-xl text-slate-300 hover:text-white"
                aria-label="Back to Top"
              >
                <ArrowUp size={16} />
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
