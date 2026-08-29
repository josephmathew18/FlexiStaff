import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
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
} from 'lucide-react';
import {
  FaLinkedin,
  FaGithub,
  FaTwitter,
} from 'react-icons/fa';

export const LandingPage = () => {
  // Navigation & Scroll State
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollDirection, setScrollDirection] = useState('up');
  const [activeSection, setActiveSection] = useState('home');

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
      title: 'Manual Workforce Selection',
      desc: 'Finding suitable professionals manually can take significant time, effort, and administrative overhead.',
      color: 'amber',
    },
    {
      icon: AlertTriangle,
      title: 'Skill Mismatch',
      desc: 'Project requirements may not always align with available workforce capabilities without structured analysis.',
      color: 'rose',
    },
    {
      icon: Layers,
      title: 'Complex Coordination',
      desc: 'Managing temporary workforce pipelines across multiple projects and vendors can quickly become difficult.',
      color: 'indigo',
    },
    {
      icon: Zap,
      title: 'Slow Deployment',
      desc: 'Delays in identifying and deploying suitable professionals can affect sprint timelines and project momentum.',
      color: 'blue',
    },
  ];

  // 5-Step Horizontal Workflow
  const workflowSteps = [
    {
      step: '01',
      title: 'Identify Requirements',
      desc: 'Project requirements such as skills, roles, duration, and workforce needs are clearly defined.',
      icon: FileText,
    },
    {
      step: '02',
      title: 'Analyze Requirements',
      desc: 'Project information is analyzed to understand the required workforce capabilities and constraints.',
      icon: BrainCircuit,
    },
    {
      step: '03',
      title: 'Smart Workforce Matching',
      desc: 'Suitable professionals can be identified based on project requirements and relevant skills.',
      icon: Cpu,
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
      title: 'Intelligent Workforce Insights',
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
      icon: Workflow,
      title: 'Project Coordination',
      desc: 'Streamline collaboration between managers, staffing partners, and engineering teams throughout the sprint lifecycle.',
    },
    {
      icon: Clock,
      title: 'Workforce Availability Management',
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
    <div id="home" className="min-h-screen bg-slate-50/50 text-slate-900 font-sans antialiased overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* ========================================================================= */}
      {/* 0. TOP SCROLL PROGRESS INDICATOR BAR */}
      {/* ========================================================================= */}
      <div
        className="fixed top-0 left-0 right-0 z-[60] h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 transition-all duration-75 shadow-sm"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* ========================================================================= */}
      {/* 1. NAVBAR */}
      {/* ========================================================================= */}
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 transform ${
          scrollDirection === 'down' && isScrolled
            ? '-translate-y-full shadow-none'
            : 'translate-y-0'
        } ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
              <Briefcase size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
                FlexiStaff<span className="text-blue-600">AI</span>
              </span>
              <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase mt-1">
                SMART WORKFORCE MANAGEMENT
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links with ScrollSpy indicator */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.replace('#', '');
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative py-1 transition-colors ${
                    isActive ? 'text-blue-600 font-bold' : 'hover:text-blue-600 text-slate-600'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold shadow-md shadow-blue-600/20 active:scale-95 transition-all"
            >
              <span>Get Started</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden rounded-xl p-2 text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`h-0.5 w-full bg-slate-700 rounded-full transition-transform ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`h-0.5 w-full bg-slate-700 rounded-full transition-opacity ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`h-0.5 w-full bg-slate-700 rounded-full transition-transform ${isMobileMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3"
            >
              <div className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="py-1.5 hover:text-blue-600"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
              <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-bold text-slate-700 hover:text-blue-600"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-md shadow-blue-600/20"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden bg-gradient-to-b from-blue-50/60 via-indigo-50/20 to-slate-50/50">
        {/* Soft Background Geometry with subtle scroll motion */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl" />
          <div className="absolute top-40 left-10 w-[450px] h-[450px] bg-gradient-to-tr from-purple-400/10 to-blue-400/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 max-w-3xl mx-auto"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-bold shadow-2xs">
              <Sparkles size={14} className="text-blue-600" />
              <span>AI-POWERED WORKFORCE MANAGEMENT</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Smarter{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                Workforce Management
              </span>{' '}
              for Every Project
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
              FlexiStaff helps organizations efficiently manage temporary workforce requirements, connect project needs with suitable professionals, and streamline workforce deployment through intelligent technology.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 active:scale-98 transition-all"
              >
                <span>Get Started →</span>
              </Link>
              <a
                href="#how-it-works"
                onClick={(e) => handleNavClick(e, '#how-it-works')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-xs transition-all"
              >
                <span>Explore How It Works</span>
              </a>
            </div>

            {/* Simple Benefits Strip */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-blue-600" />
                <span>Smart Workforce Matching</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-indigo-600" />
                <span>Faster Project Staffing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-purple-600" />
                <span>Efficient Project Coordination</span>
              </div>
            </div>

            {/* Interactive Scroll Down Indicator */}
            <div className="pt-8 flex justify-center">
              <a
                href="#about"
                onClick={(e) => handleNavClick(e, '#about')}
                className="flex flex-col items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors group cursor-pointer"
                aria-label="Scroll down to About section"
              >
                <span className="text-[11px] font-bold tracking-wider uppercase">Scroll to explore</span>
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 shadow-xs group-hover:border-blue-300 group-hover:bg-blue-50/50"
                >
                  <ArrowRight className="rotate-90 text-blue-600" size={16} />
                </motion.div>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. ABOUT FLEXISTAFF */}
      {/* ========================================================================= */}
      <section id="about" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-100/80 px-3 py-1 rounded-full">
                About FlexiStaff
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Transforming the Way Organizations Manage Temporary Workforce
              </h2>

              <div className="space-y-3.5 text-sm sm:text-base text-slate-600 leading-relaxed">
                <p>
                  Modern organizations often need skilled temporary professionals to accelerate specific projects, build new initiatives, and respond rapidly to market opportunities.
                </p>
                <p>
                  However, traditional workforce selection and coordination can be time-consuming, fragmented across spreadsheets, and prone to skill mismatches.
                </p>
                <p>
                  FlexiStaff provides a centralized technology platform that organizes project requirements, identifies suitable workforce capabilities, and streamlines end-to-end deployment.
                </p>
                <p>
                  By applying intelligent requirement analysis and skill matching techniques, FlexiStaff supports faster, data-driven staffing decisions for projects of any scale.
                </p>
              </div>

              {/* Key Bullet Highlights */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                  <Check size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <span>Centralized Platform</span>
                </div>
                <div className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                  <Check size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <span>Skill-Based Matching</span>
                </div>
                <div className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                  <Check size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <span>Streamlined Deployment</span>
                </div>
                <div className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                  <Check size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <span>Lifecycle Coordination</span>
                </div>
              </div>
            </div>

            {/* Right Abstract Workflow Illustration */}
            <div className="lg:col-span-6">
              <div className="bg-slate-50/80 rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                  <h3 className="text-sm font-bold text-slate-900">Platform Operational Ecosystem</h3>
                  <span className="text-xs font-semibold text-blue-600">Integrated Architecture</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Building2 size={18} />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">Organization Demand</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Defines project scopes and technical requisitions.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <BrainCircuit size={18} />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">Intelligent Analysis</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Evaluates required workforce competencies.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                      <Users size={18} />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">Workforce Pipeline</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Verified professionals and partner talent pools.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Workflow size={18} />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">Deployment Engine</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Coordinates assignments and milestone tracking.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. THE PROBLEM SECTION */}
      {/* ========================================================================= */}
      <section className="py-20 bg-slate-50/80 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-100/80 px-3 py-1 rounded-full">
              The Challenge
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Why Traditional Workforce Management Needs to Change
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Traditional staffing methods introduce bottlenecks that slow down engineering progress and inflate coordination costs.
            </p>
          </div>

          {/* 4 Problem Cards */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {problemCards.map((card, idx) => {
              const IconComponent = card.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 hover:shadow-md transition-all space-y-3.5 flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                      <IconComponent size={20} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{card.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {card.desc}
                    </p>
                  </div>
                  <div className="pt-2 text-[11px] font-semibold text-slate-400">
                    Challenge 0{idx + 1}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. HOW FLEXISTAFF WORKS */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100/80 px-3 py-1 rounded-full">
              Process Overview
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How FlexiStaff Works
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              A simple and intelligent process for efficient temporary workforce management.
            </p>
          </div>

          {/* 5-Step Connected Timeline */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 relative">
            {workflowSteps.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.step}
                  className="bg-slate-50/70 rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-2xs hover:border-blue-400 hover:bg-white hover:shadow-md transition-all group"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black text-slate-300 group-hover:text-blue-600 transition-colors">
                        {item.step}
                      </span>
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-2xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <IconComponent size={16} />
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>

                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-200/60 text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                    <span>Phase {idx + 1}</span>
                    <ArrowRight size={13} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. SMART TECHNOLOGY SECTION */}
      {/* ========================================================================= */}
      <section className="py-20 bg-gradient-to-b from-slate-50/80 to-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-100/80 px-3 py-1 rounded-full">
              Intelligent Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Powered by Intelligent Technology
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Intelligent techniques assist organizations in evaluating project requirements and matching suitable workforce capabilities objectively.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            {smartTechCards.map((tech, idx) => {
              const IconComponent = tech.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl border border-slate-200 p-7 shadow-xs hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5 transition-all space-y-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                    <IconComponent size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{tech.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {tech.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. KEY FEATURES */}
      {/* ========================================================================= */}
      <section id="features" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-100/80 px-3 py-1 rounded-full">
              Platform Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Comprehensive Platform Capabilities
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              A complete suite of tools to coordinate temporary workforce requirements and track project execution.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyFeatures.map((feat, idx) => {
              const IconComponent = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-50/60 rounded-2xl border border-slate-200/80 p-6 shadow-2xs hover:bg-white hover:border-blue-300 hover:shadow-md transition-all space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <IconComponent size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{feat.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. BENEFITS (WHY CHOOSE FLEXISTAFF) */}
      {/* ========================================================================= */}
      <section className="py-20 bg-slate-50/80 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100/80 px-3 py-1 rounded-full">
              Value Proposition
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Why Choose FlexiStaff?
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Clear business advantages for modern organizations scaling their project operations.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, idx) => {
              const IconComponent = b.icon;
              return (
                <div
                  key={b.number}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-slate-200">
                        {b.number}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <IconComponent size={20} />
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{b.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {b.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. PROJECT VISION */}
      {/* ========================================================================= */}
      <section className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-100/80 px-3 py-1 rounded-full">
              Our Vision
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Building a More Flexible Workforce Future
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              FlexiStaff aims to create a smarter and more organized approach to temporary workforce management by combining workforce coordination, project management, and intelligent matching technologies in a single platform.
            </p>

            {/* Abstract Connectivity Diagram */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <Building2 size={24} className="mx-auto text-blue-600 mb-2" />
                <p className="text-xs font-bold text-slate-800">Connected Organizations</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <FolderKanban size={24} className="mx-auto text-indigo-600 mb-2" />
                <p className="text-xs font-bold text-slate-800">Project Initiatives</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <BrainCircuit size={24} className="mx-auto text-purple-600 mb-2" />
                <p className="text-xs font-bold text-slate-800">Skill Competencies</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <Users size={24} className="mx-auto text-emerald-600 mb-2" />
                <p className="text-xs font-bold text-slate-800">Flexible Workforce</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. CALL TO ACTION SECTION */}
      {/* ========================================================================= */}
      <section className="py-20 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-2xl mx-auto leading-tight">
            Ready to Simplify Workforce Management?
          </h2>

          <p className="text-blue-100 text-base sm:text-lg max-w-xl mx-auto font-normal">
            Discover how FlexiStaff can make temporary workforce and project staffing more organized, efficient, and intelligent.
          </p>

          <div className="pt-2">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-sm shadow-xl active:scale-95 transition-all"
            >
              <span>Get Started →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. CONTACT SECTION */}
      {/* ========================================================================= */}
      <section id="contact" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Contact Details */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-100/80 px-3 py-1 rounded-full">
                  Contact
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
                  Let’s Connect
                </h2>
                <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                  Have questions about the FlexiStaff technology platform? Reach out to our team.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3.5 text-sm text-slate-700">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Email</p>
                    <a href="mailto:contact@flexistaff.org" className="font-bold text-slate-900 hover:text-blue-600">
                      contact@flexistaff.org
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 text-sm text-slate-700">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Phone</p>
                    <a href="tel:+14155552671" className="font-bold text-slate-900 hover:text-indigo-600">
                      +1 (415) 555-2671
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 text-sm text-slate-700">
                  <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Location</p>
                    <p className="font-bold text-slate-900">Academic Project Repository • Department of Computer Applications</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Clean Contact Form */}
            <div className="lg:col-span-7">
              <form
                onSubmit={handleContactSubmit}
                className="bg-slate-50/80 rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-4 shadow-2xs"
              >
                <h3 className="text-lg font-bold text-slate-900">Send a Message</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Your Name"
                      required
                      className="w-full rounded-xl bg-white border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="your.email@example.com"
                      required
                      className="w-full rounded-xl bg-white border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    placeholder="Inquiry Subject"
                    required
                    className="w-full rounded-xl bg-white border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                  <textarea
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Enter your message..."
                    required
                    className="w-full rounded-xl bg-white border border-slate-300 p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                >
                  <Send size={14} />
                  <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 12. FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-200 bg-white py-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-100">
            {/* Logo */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Briefcase size={16} />
                </div>
                <span className="text-base font-extrabold text-slate-900">
                  FlexiStaff<span className="text-blue-600">AI</span>
                </span>
              </div>
              <span className="hidden sm:inline text-slate-300">|</span>
              <span className="text-xs text-slate-500">
                Smart Workforce Management for Modern Organizations
              </span>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 font-semibold text-slate-600">
              <a href="#home" onClick={(e) => handleNavClick(e, '#home')} className="hover:text-blue-600 transition-colors">Home</a>
              <a href="#about" onClick={(e) => handleNavClick(e, '#about')} className="hover:text-blue-600 transition-colors">About</a>
              <a href="#how-it-works" onClick={(e) => handleNavClick(e, '#how-it-works')} className="hover:text-blue-600 transition-colors">How It Works</a>
              <a href="#features" onClick={(e) => handleNavClick(e, '#features')} className="hover:text-blue-600 transition-colors">Features</a>
              <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className="hover:text-blue-600 transition-colors">Contact</a>
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-3 text-slate-400">
              <a href="#home" onClick={(e) => handleNavClick(e, '#home')} className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 hover:text-blue-600 transition-colors" aria-label="LinkedIn">
                <FaLinkedin size={16} />
              </a>
              <a href="#home" onClick={(e) => handleNavClick(e, '#home')} className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 hover:text-slate-800 transition-colors" aria-label="GitHub">
                <FaGithub size={16} />
              </a>
              <a href="#home" onClick={(e) => handleNavClick(e, '#home')} className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 hover:text-blue-400 transition-colors" aria-label="Twitter">
                <FaTwitter size={16} />
              </a>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
            <p>© 2026 FlexiStaffAI.</p>
            <div className="flex items-center gap-4">
              <span className="hover:text-slate-600 cursor-pointer">Privacy Policy</span>
              <span>•</span>
              <span className="hover:text-slate-600 cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            transition={{ duration: 0.2 }}
            type="button"
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 transition-all hover:scale-110 active:scale-95 group cursor-pointer"
            aria-label="Back to Top"
          >
            <ArrowUp size={18} className="group-hover:-translate-y-0.5 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
