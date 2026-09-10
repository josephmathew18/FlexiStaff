import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  MailCheck,
  ShieldCheck,
  Briefcase,
  Code2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Check,
  X,
  Send,
  Mail,
  Phone,
  MapPin,
  Upload,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Building2,
  Calendar,
  GraduationCap,
  Globe,
  Star,
  DollarSign,
  Camera,
  Info,
  ChevronDown,
  ChevronLeft,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  Download,
} from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { Logo } from '../../components/common/Logo';
import { useData } from '../../context/DataContext';
import { toast } from 'react-toastify';

// ============================================================================
// SVG ILLUSTRATIONS FOR SELECTION CARDS
// ============================================================================

const IllustrationNew = () => (
  <svg className="w-24 h-24 mx-auto" viewBox="0 0 120 120" fill="none">
    <circle cx="50" cy="50" r="32" stroke="#10b981" strokeWidth="8" fill="#064e3b" opacity="0.6" />
    <path d="M72 72L100 100" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round" />
    <circle cx="50" cy="50" r="16" fill="#34d399" opacity="0.6" />
  </svg>
);

const IllustrationExperience = () => (
  <svg className="w-24 h-24 mx-auto" viewBox="0 0 120 120" fill="none">
    <path d="M30 80L80 30L90 40L40 90Z" fill="#3b82f6" />
    <path d="M20 100L30 80L40 90Z" fill="#f59e0b" />
    <path d="M75 25L95 45" stroke="#60a5fa" strokeWidth="4" />
    <path d="M40 95L95 40" stroke="#4ade80" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

const IllustrationExpert = () => (
  <svg className="w-24 h-24 mx-auto" viewBox="0 0 120 120" fill="none">
    <rect x="25" y="45" width="70" height="45" rx="6" fill="#15803d" />
    <rect x="33" y="52" width="54" height="30" rx="3" fill="#1e293b" />
    <path d="M15 95H105V98C105 101 102 103 99 103H21C18 103 15 101 15 98V95Z" fill="#64748b" />
    <circle cx="60" cy="32" r="14" fill="#fb7185" />
    <path d="M45 45C45 37 75 37 75 45V50H45V45Z" fill="#22c55e" />
  </svg>
);

const IllustrationMainIncome = () => (
  <svg className="w-24 h-24 mx-auto" viewBox="0 0 120 120" fill="none">
    <path d="M30 50C30 38 90 38 90 50V80C90 92 30 92 30 80V50Z" fill="#78350f" />
    <ellipse cx="60" cy="50" rx="30" ry="12" fill="#d97706" />
    <circle cx="50" cy="45" r="10" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
    <circle cx="65" cy="42" r="10" fill="#fef08a" stroke="#d97706" strokeWidth="2" />
    <circle cx="58" cy="48" r="12" fill="#fbbf24" stroke="#78350f" strokeWidth="2" />
  </svg>
);

const IllustrationSideIncome = () => (
  <svg className="w-24 h-24 mx-auto" viewBox="0 0 120 120" fill="none">
    <rect x="25" y="40" width="70" height="40" rx="6" fill="#15803d" />
    <circle cx="60" cy="60" r="12" fill="#22c55e" stroke="#166534" strokeWidth="3" />
    <path d="M30 45L45 60L30 75" stroke="#86efac" strokeWidth="3" strokeLinecap="round" />
    <path d="M90 45L75 60L90 75" stroke="#86efac" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const IllustrationMedal = () => (
  <svg className="w-24 h-24 mx-auto" viewBox="0 0 120 120" fill="none">
    <path d="M45 20L60 50L35 50Z" fill="#16a34a" />
    <path d="M75 20L60 50L85 50Z" fill="#15803d" />
    <circle cx="60" cy="72" r="24" fill="#fbbf24" stroke="#d97706" strokeWidth="4" />
    <polygon points="60,58 64,67 74,67 66,73 69,82 60,76 51,82 54,73 46,67 56,67" fill="#fef08a" />
  </svg>
);

const IllustrationNoGoal = () => (
  <svg className="w-24 h-24 mx-auto" viewBox="0 0 120 120" fill="none">
    <rect x="40" y="25" width="45" height="75" rx="8" fill="#0f766e" />
    <rect x="44" y="32" width="37" height="60" rx="4" fill="#134e4a" />
    <circle cx="55" cy="55" r="14" stroke="#22c55e" strokeWidth="5" fill="#1e293b" />
    <path d="M65 65L75 75" stroke="#4ade80" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

const IllustrationFindOpportunities = () => (
  <svg className="w-24 h-24 mx-auto" viewBox="0 0 120 120" fill="none">
    <rect x="15" y="30" width="60" height="40" rx="4" fill="#475569" />
    <rect x="20" y="35" width="50" height="30" rx="2" fill="#0f172a" />
    <rect x="60" y="45" width="35" height="50" rx="6" fill="#15803d" />
    <rect x="64" y="52" width="27" height="36" rx="3" fill="#1e293b" />
    <circle cx="40" cy="80" r="18" fill="#ea580c" />
    <path d="M48 88C48 80 62 80 62 88" stroke="#ffffff" strokeWidth="3" />
  </svg>
);

const IllustrationPackageWork = () => (
  <svg className="w-24 h-24 mx-auto" viewBox="0 0 120 120" fill="none">
    <rect x="25" y="35" width="45" height="45" rx="6" fill="#475569" />
    <path d="M40 50C40 40 70 40 80 50V90H40V50Z" fill="#16a34a" />
    <circle cx="60" cy="35" r="12" fill="#fbbf24" />
  </svg>
);

// CATEGORIES & SPECIALTIES
const CATEGORY_MAP = {
  'Web, Mobile & Software Dev': [
    'Frontend Development',
    'Backend Development',
    'Full Stack Development',
    'Mobile App Development',
    'DevOps & Cloud Engineering',
    'QA & Software Testing',
    'AI & ML Engineering',
  ],
  'Data Science & Analytics': [
    'Data Analysis & Visualization',
    'Machine Learning & Deep Learning',
    'Data Engineering & ETL Pipelines',
    'Business Intelligence & Dashboards',
  ],
  'Design & Creative': [
    'UI/UX Design',
    'Product Design',
    'Brand & Logo Identity',
    'Motion Graphics & Video',
  ],
  'IT & Networking': [
    'Cloud Security & Infrastructure',
    'Database Administration',
    'Network Architecture',
    'Systems Administration',
  ],
  'Engineering & Architecture': [
    'Software Architecture',
    'Embedded Systems & IoT',
    'Solutions Architecture',
  ],
};

// SUGGESTED SKILLS
const ALL_SUGGESTED_SKILLS = [
  'React',
  'Node.js',
  'Python',
  'TypeScript',
  'AWS',
  'Docker',
  'PostgreSQL',
  'Full Stack Development',
  'UI/UX Design',
  'Software QA',
  'Software Testing',
  'Data Analysis',
  'Information Analysis',
  'Test Results & Analysis',
  'Alpha Testing',
  'Beta Testing',
  'Kubernetes',
  'GraphQL',
  'Tailwind CSS',
];

export const FreelancerApply = () => {
  const navigate = useNavigate();
  const { addFreelancerApplication } = useData() || {};

  // Flow Steps:
  // 0: Freelancer Account Sign-up Form (Matching user's image)
  // 1: Welcome Screen ("Hey Joseph. Ready for your next big opportunity?")
  // 2: Question 1/3
  // 3: Question 2/3
  // 4: Question 3/3
  // 5: Profile 1/10 (Tell us about yourself)
  // 6: Profile 2/10 (Categories)
  // 7: Profile 3/10 (Skills)
  // 8: Profile 4/10 (Title)
  // 9: Profile 5/10 (Experience)
  // 10: Profile 6/10 (Education)
  // 11: Profile 7/10 (Languages)
  // 12: Profile 8/10 (Bio / Overview)
  // 13: Profile 9/10 (Hourly Rate)
  // 14: Profile 10/10 (Personal info, location & photo)
  // 15: Final Confirmation
  const [currentStep, setCurrentStep] = useState(0);
  const [regSubStep, setRegSubStep] = useState(1);

  // Step 0 Form State (Sign-up Form)
  const [signUpForm, setSignUpForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialtyTitle: '',
    password: '',
    confirmPassword: '',
    country: 'India',
    sendEmails: true,
    agreeTerms: true,
  });
  const [showPassword, setShowPassword] = useState(false);

  // Questionnaire States (Unselected by default as requested)
  const [experienceLevel, setExperienceLevel] = useState('');
  const [freelanceGoal, setFreelanceGoal] = useState('');
  const [workPreferences, setWorkPreferences] = useState([]);
  const [openToContractToHire, setOpenToContractToHire] = useState(false);

  // Profile Wizard States (Unselected by default as requested)
  const [importMethod, setImportMethod] = useState('');
  const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [linkedInPdfFile, setLinkedInPdfFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [isDraggingResume, setIsDraggingResume] = useState(false);

  const linkedInFileInputRef = useRef(null);
  const resumeFileInputRef = useRef(null);
  const expPdfInputRef = useRef(null);
  const avatarFileInputRef = useRef(null);

  const [selectedCategory, setSelectedCategory] = useState('Web, Mobile & Software Dev');
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [professionalRoleTitle, setProfessionalRoleTitle] = useState('');

  // Work Experience Entries
  const [experiences, setExperiences] = useState([]);
  const [isAddingExperienceModal, setIsAddingExperienceModal] = useState(false);
  const [newExp, setNewExp] = useState({ title: '', company: '', period: '', description: '', documentName: '' });

  // Education Entries
  const [educations, setEducations] = useState([]);
  const [isAddingEducationModal, setIsAddingEducationModal] = useState(false);
  const [newEdu, setNewEdu] = useState({ degree: '', school: '', dates: '' });

  // Languages Entries
  const [languages, setLanguages] = useState([
    { id: '1', name: 'English (all profiles include this)', proficiency: 'Native or Bilingual' },
  ]);
  const [availableLanguagesToAdd, setAvailableLanguagesToAdd] = useState(['Spanish', 'French', 'German', 'Hindi', 'Japanese', 'Mandarin']);

  // Bio / Overview
  const [bioOverview, setBioOverview] = useState('');

  // Hourly Rate (Indian Rupees ₹)
  const [hourlyRate, setHourlyRate] = useState(1500.00);

  // Personal Info & Location
  const [personalDetails, setPersonalDetails] = useState({
    dob: '',
    country: 'India',
    streetAddress: '',
    aptSuite: '',
    city: '',
    state: '',
    zipCode: '',
    phoneCode: '+91',
    phoneNumber: '',
    avatarUrl: '',
  });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    place: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccountCreationSubmit = (e) => {
    e.preventDefault();

    if (regSubStep === 1) {
      if (!signUpForm.firstName.trim()) {
        toast.error('Please enter your first name.');
        return;
      }
      if (!signUpForm.lastName.trim()) {
        toast.error('Please enter your last name.');
        return;
      }
      if (!signUpForm.email.trim()) {
        toast.error('Please enter your email address.');
        return;
      }
      setRegSubStep(2);
      return;
    }

    if (regSubStep === 2) {
      if (!signUpForm.password.trim()) {
        toast.error('Please enter a password.');
        return;
      }
      if (signUpForm.password.length < 8) {
        toast.error('Password must be at least 8 characters.');
        return;
      }

      const fullName = `${signUpForm.firstName.trim()} ${signUpForm.lastName.trim()}`;
      setFormData((prev) => ({
        ...prev,
        fullName,
        email: signUpForm.email.trim(),
        phone: signUpForm.phone.trim() || prev.phone,
      }));

      toast.success(`Account created for ${signUpForm.firstName}! Let's build your profile.`);
      setCurrentStep(1);
    }
  };

  const toggleWorkPreference = (pref) => {
    setWorkPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const toggleSpecialty = (spec) => {
    setSelectedSpecialties((prev) => {
      if (prev.includes(spec)) {
        return prev.filter((s) => s !== spec);
      }
      if (prev.length >= 3) {
        toast.info('You can select up to 3 specialties.');
        return prev;
      }
      return [...prev, spec];
    });
  };

  const addSkill = (skill) => {
    if (!skill.trim()) return;
    if (selectedSkills.includes(skill.trim())) return;
    if (selectedSkills.length >= 15) {
      toast.info('Maximum 15 skills allowed.');
      return;
    }
    setSelectedSkills((prev) => [...prev, skill.trim()]);
    setCustomSkillInput('');
  };

  const removeSkill = (skill) => {
    setSelectedSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleAddExperienceSubmit = (e) => {
    e.preventDefault();
    if (!newExp.title.trim() || !newExp.company.trim()) {
      toast.error('Please enter job title and company name.');
      return;
    }
    setExperiences((prev) => [...prev, { ...newExp, id: Date.now().toString() }]);
    setNewExp({ title: '', company: '', period: '', description: '', documentName: '' });
    setIsAddingExperienceModal(false);
    toast.success('Work experience added!');
  };

  const handleAddEducationSubmit = (e) => {
    e.preventDefault();
    if (!newEdu.degree.trim() || !newEdu.school.trim()) {
      toast.error('Please enter degree and school name.');
      return;
    }
    setEducations((prev) => [...prev, { ...newEdu, id: Date.now().toString() }]);
    setNewEdu({ degree: '', school: '', dates: '' });
    setIsAddingEducationModal(false);
    toast.success('Education added!');
  };

  const addLanguageRow = () => {
    if (availableLanguagesToAdd.length === 0) return;
    const langName = availableLanguagesToAdd[0];
    setLanguages((prev) => [...prev, { id: Date.now().toString(), name: langName, proficiency: 'Fluent' }]);
    setAvailableLanguagesToAdd((prev) => prev.filter((l) => l !== langName));
  };

  const removeLanguageRow = (id) => {
    const item = languages.find((l) => l.id === id);
    if (item && item.name !== 'English (all profiles include this)') {
      setLanguages((prev) => prev.filter((l) => l.id !== id));
      setAvailableLanguagesToAdd((prev) => [...prev, item.name]);
    }
  };

  const updateLanguageProficiency = (id, prof) => {
    setLanguages((prev) =>
      prev.map((l) => (l.id === id ? { ...l, proficiency: prof } : l))
    );
  };

  const handleSubmitFinal = () => {
    setLoading(true);

    const fullNameVal = formData.fullName || `${signUpForm.firstName} ${signUpForm.lastName}`.trim() || 'Freelancer Candidate';
    const linkedInDocName = linkedInPdfFile?.name || (importMethod === 'Import from LinkedIn' ? `${fullNameVal.replace(/\s+/g, '_')}_LinkedIn_Profile.pdf` : null);
    const resumeDocName = resumeFile?.name || (importMethod === 'Upload your resume' ? `${fullNameVal.replace(/\s+/g, '_')}_Resume.pdf` : null);

    setTimeout(() => {
      if (addFreelancerApplication) {
        addFreelancerApplication({
          fullName: fullNameVal,
          email: formData.email || signUpForm.email,
          phone: formData.phone || signUpForm.phone || personalDetails.phoneNumber,
          roleTitle: professionalRoleTitle || 'Full Stack Software Engineer',
          category: selectedCategory,
          specialties: selectedSpecialties,
          skills: selectedSkills,
          experiences,
          educations,
          languages,
          bioOverview,
          hourlyRate,
          personalDetails,
          experienceLevel,
          freelanceGoal,
          workPreferences,
          openToContractToHire,
          importMethod: importMethod || 'Fill out manually',
          linkedInPdfName: linkedInDocName,
          resumeFileName: resumeDocName,
        });
      }
      setLoading(false);
      toast.success('Profile created & submitted for verification!');
      navigate('/login');
    }, 600);
  };

  // Service Fee Calculations
  const serviceFee = (hourlyRate * 0.10).toFixed(2);
  const netEarnings = (hourlyRate - serviceFee).toFixed(2);

  // ==========================================================================
  // STEP 0: FREELANCER ACCOUNT SIGN-UP FORM (BLACK BACKGROUND THEME)
  // ==========================================================================
  if (currentStep === 0) {
    return (
      <div className="min-h-screen w-full flex flex-col lg:flex-row bg-black font-sans antialiased text-white">
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
              <span>Verified Talent Roster & Global Projects</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
              Register Freelancer Talent
            </h1>

            <p className="text-sm text-purple-100/90 leading-relaxed">
              Submit your details to join FlexiStaff's network, showcase your technical skills, and land high-paying global contracts.
            </p>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/20 flex justify-between text-xs text-purple-200">
            <span>Freelancer Talent Account</span>
            <span>© {new Date().getFullYear()} FlexiStaff Inc.</span>
          </div>
        </div>

        {/* RIGHT REGISTRATION FORM */}
        <div className="flex-1 flex flex-col justify-center px-6 py-10 lg:px-16 min-h-screen bg-black">
          <div className="max-w-xl mx-auto w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-2xl text-slate-900">
            
            {/* Form Header */}
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-xs font-bold text-[#6A54F4] hover:underline flex items-center gap-1"
                >
                  <ChevronLeft size={14} /> Back to Role Selection
                </button>

                <Link to="/login" className="text-xs font-bold text-[#6A54F4] hover:underline">
                  Sign in to existing account →
                </Link>
              </div>
              <h2 className="font-extrabold text-2xl text-slate-900 mt-3 tracking-tight">Register Your Account</h2>
              <p className="text-xs text-slate-500 mt-1">Fill in your personal details to set up your Freelancer Profile access.</p>
            </div>

            {/* STEP INDICATOR */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className={`flex items-center gap-2 text-xs font-bold ${regSubStep === 1 ? 'text-[#6A54F4]' : 'text-emerald-600'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${regSubStep === 1 ? 'bg-[#6A54F4] text-white' : 'bg-emerald-600 text-white'}`}>
                  {regSubStep > 1 ? <Check size={14} /> : 1}
                </div>
                <span>1. Personal & Contact Details</span>
              </div>

              <div className={`flex items-center gap-2 text-xs font-bold ${regSubStep === 2 ? 'text-[#6A54F4]' : 'text-slate-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${regSubStep === 2 ? 'bg-[#6A54F4] text-white' : 'bg-slate-200 text-slate-500'}`}>
                  2
                </div>
                <span>2. Security & Credentials</span>
              </div>
            </div>

            <form onSubmit={handleAccountCreationSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {regSubStep === 1 && (
                  <motion.div
                    key="regStep1"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    className="space-y-4"
                  >
                    {/* First Name & Last Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">
                          First Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={signUpForm.firstName}
                            onChange={(e) => setSignUpForm({ ...signUpForm, firstName: e.target.value })}
                            placeholder="First Name"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#6A54F4] focus:ring-2 focus:ring-[#6A54F4]/15 transition-all"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">
                          Last Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={signUpForm.lastName}
                            onChange={(e) => setSignUpForm({ ...signUpForm, lastName: e.target.value })}
                            placeholder="Last Name"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#6A54F4] focus:ring-2 focus:ring-[#6A54F4]/15 transition-all"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Work / Personal Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          value={signUpForm.email}
                          onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                          placeholder="Enter email address"
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#6A54F4] focus:ring-2 focus:ring-[#6A54F4]/15 transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="tel"
                          value={signUpForm.phone}
                          onChange={(e) => setSignUpForm({ ...signUpForm, phone: e.target.value })}
                          placeholder="Enter phone number"
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#6A54F4] focus:ring-2 focus:ring-[#6A54F4]/15 transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-2 py-3 px-6 rounded-xl bg-[#6A54F4] hover:bg-[#5842E3] text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                    >
                      <span>Continue to Security & Password</span>
                      <ArrowRight size={16} />
                    </button>
                  </motion.div>
                )}

                {regSubStep === 2 && (
                  <motion.div
                    key="regStep2"
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
                          value={signUpForm.password}
                          onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                          placeholder="At least 8 characters"
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#6A54F4] focus:ring-2 focus:ring-[#6A54F4]/15 transition-all"
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

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setRegSubStep(1)}
                        className="py-3 px-5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all"
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 px-6 rounded-xl bg-[#6A54F4] hover:bg-[#5842E3] text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                      >
                        <span>Create Account</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer text */}
              <div className="pt-2 text-center text-xs text-slate-500">
                <span>Already registered? </span>
                <Link to="/login" className="font-bold text-[#6A54F4] hover:underline">
                  Sign in here
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // STEP 1: WELCOME SCREEN (IMAGE 1 DEMO)
  // ==========================================================================
  if (currentStep === 1) {
    return (
      <div className="min-h-screen w-full bg-black text-white font-sans antialiased flex flex-col justify-between">
        <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <Logo size="md" to="/" />
          <Link to="/login" className="text-xs font-bold text-slate-400 hover:text-white">
            Already registered? <span className="text-[#6A54F4] hover:underline">Log in</span>
          </Link>
        </header>

        <main className="max-w-3xl mx-auto w-full px-6 py-12 my-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-12">
            Hey {signUpForm.firstName || 'there'}. Ready for your next big opportunity?
          </h1>

          <div className="mt-8">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-8 py-3.5 rounded-full bg-[#6A54F4] hover:bg-[#5844E5] text-white font-bold text-sm shadow-md transition-all self-start"
            >
              Get started
            </button>
          </div>
        </main>

        <footer className="py-6 text-center text-xs text-slate-500 border-t border-white/10">
          © {new Date().getFullYear()} FlexiStaff Inc. All rights reserved.
        </footer>
      </div>
    );
  }

  // ==========================================================================
  // STEP 2: QUESTION 1/3
  // ==========================================================================
  if (currentStep === 2) {
    return (
      <div className="min-h-screen w-full bg-black text-white font-sans antialiased flex flex-col justify-between">
        <div>
          <div className="w-full bg-slate-900 h-1.5">
            <div className="bg-[#6A54F4] h-1.5 w-1/3 transition-all duration-300" />
          </div>
          <header className="w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">1/3</span>
            <Logo size="sm" to="/" />
          </header>
        </div>

        <main className="max-w-5xl mx-auto w-full px-6 py-8 my-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
            A few quick questions: first, have you freelanced before?
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mb-10">
            This lets us know how much help to give you along the way. We won't share your answer with anyone else, including potential clients.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div
              onClick={() => setExperienceLevel('I am brand new to this')}
              className={`relative rounded-2xl p-6 border-2 cursor-pointer transition-all flex flex-col justify-between min-h-[220px] bg-[#16152B] ${
                experienceLevel === 'I am brand new to this'
                  ? 'border-[#6A54F4] bg-[#1A1835] ring-2 ring-[#6A54F4]/50 shadow-xl'
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              <div className="flex justify-end">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  experienceLevel === 'I am brand new to this' ? 'border-[#6A54F4] bg-[#6A54F4]' : 'border-slate-600'
                }`}>
                  {experienceLevel === 'I am brand new to this' && <Check size={12} className="text-white stroke-[3]" />}
                </div>
              </div>
              <IllustrationNew />
              <h3 className="text-base font-bold text-white mt-4">I am brand new to this</h3>
            </div>

            <div
              onClick={() => setExperienceLevel('I have some experience')}
              className={`relative rounded-2xl p-6 border-2 cursor-pointer transition-all flex flex-col justify-between min-h-[220px] bg-[#16152B] ${
                experienceLevel === 'I have some experience'
                  ? 'border-[#6A54F4] bg-[#1A1835] ring-2 ring-[#6A54F4]/50 shadow-xl'
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              <div className="flex justify-end">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  experienceLevel === 'I have some experience' ? 'border-[#6A54F4] bg-[#6A54F4]' : 'border-slate-600'
                }`}>
                  {experienceLevel === 'I have some experience' && <Check size={12} className="text-white stroke-[3]" />}
                </div>
              </div>
              <IllustrationExperience />
              <h3 className="text-base font-bold text-white mt-4">I have some experience</h3>
            </div>

            <div
              onClick={() => setExperienceLevel('I am an expert')}
              className={`relative rounded-2xl p-6 border-2 cursor-pointer transition-all flex flex-col justify-between min-h-[220px] bg-[#16152B] ${
                experienceLevel === 'I am an expert'
                  ? 'border-[#6A54F4] bg-[#1A1835] ring-2 ring-[#6A54F4]/50 shadow-xl'
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              <div className="flex justify-end">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  experienceLevel === 'I am an expert' ? 'border-[#6A54F4] bg-[#6A54F4]' : 'border-slate-600'
                }`}>
                  {experienceLevel === 'I am an expert' && <Check size={12} className="text-white stroke-[3]" />}
                </div>
              </div>
              <IllustrationExpert />
              <h3 className="text-base font-bold text-white mt-4">I am an expert</h3>
            </div>
          </div>
        </main>

        <footer className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between border-t border-white/10">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className="px-6 py-2 rounded-full border border-white/20 text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors"
          >
            Back
          </button>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="text-xs font-bold text-[#6A54F4] hover:underline"
            >
              Skip for now
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-7 py-2.5 rounded-full bg-[#6A54F4] hover:bg-[#5844E5] text-white font-bold text-xs shadow-sm transition-all"
            >
              Next
            </button>
          </div>
        </footer>
      </div>
    );
  }

  // ==========================================================================
  // STEP 3: QUESTION 2/3
  // ==========================================================================
  if (currentStep === 3) {
    return (
      <div className="min-h-screen w-full bg-black text-white font-sans antialiased flex flex-col justify-between">
        <div>
          <div className="w-full bg-slate-900 h-1.5">
            <div className="bg-[#6A54F4] h-1.5 w-2/3 transition-all duration-300" />
          </div>
          <header className="w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">2/3</span>
            <Logo size="sm" to="/" />
          </header>
        </div>

        <main className="max-w-6xl mx-auto w-full px-6 py-8 my-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
            Got it. What's your biggest goal for freelancing?
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl mb-10">
            Different people come to FlexiStaff for various reasons. We want to highlight the opportunities that fit your goals best while still showing you all the possibilities.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div
              onClick={() => setFreelanceGoal('To earn my main income')}
              className={`relative rounded-2xl p-6 border-2 cursor-pointer transition-all flex flex-col justify-between min-h-[240px] bg-[#16152B] ${
                freelanceGoal === 'To earn my main income'
                  ? 'border-[#6A54F4] bg-[#1A1835] ring-2 ring-[#6A54F4]/50 shadow-xl'
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              <div className="flex justify-end">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  freelanceGoal === 'To earn my main income' ? 'border-[#6A54F4] bg-[#6A54F4]' : 'border-slate-600'
                }`}>
                  {freelanceGoal === 'To earn my main income' && <Check size={12} className="text-white stroke-[3]" />}
                </div>
              </div>
              <IllustrationMainIncome />
              <h3 className="text-base font-bold text-white mt-4 leading-snug">To earn my main income</h3>
            </div>

            <div
              onClick={() => setFreelanceGoal('To make money on the side')}
              className={`relative rounded-2xl p-6 border-2 cursor-pointer transition-all flex flex-col justify-between min-h-[240px] bg-[#16152B] ${
                freelanceGoal === 'To make money on the side'
                  ? 'border-[#6A54F4] bg-[#1A1835] ring-2 ring-[#6A54F4]/50 shadow-xl'
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              <div className="flex justify-end">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  freelanceGoal === 'To make money on the side' ? 'border-[#6A54F4] bg-[#6A54F4]' : 'border-slate-600'
                }`}>
                  {freelanceGoal === 'To make money on the side' && <Check size={12} className="text-white stroke-[3]" />}
                </div>
              </div>
              <IllustrationSideIncome />
              <h3 className="text-base font-bold text-white mt-4 leading-snug">To make money on the side</h3>
            </div>

            <div
              onClick={() => setFreelanceGoal('To get experience, for a full-time job')}
              className={`relative rounded-2xl p-6 border-2 cursor-pointer transition-all flex flex-col justify-between min-h-[240px] bg-[#16152B] ${
                freelanceGoal === 'To get experience, for a full-time job'
                  ? 'border-[#6A54F4] bg-[#1A1835] ring-2 ring-[#6A54F4]/50 shadow-xl'
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              <div className="flex justify-end">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  freelanceGoal === 'To get experience, for a full-time job' ? 'border-[#6A54F4] bg-[#6A54F4]' : 'border-slate-600'
                }`}>
                  {freelanceGoal === 'To get experience, for a full-time job' && <Check size={12} className="text-white stroke-[3]" />}
                </div>
              </div>
              <IllustrationMedal />
              <h3 className="text-base font-bold text-white mt-4 leading-snug">To get experience, for a full-time job</h3>
            </div>

            <div
              onClick={() => setFreelanceGoal('I don\'t have a goal in mind yet')}
              className={`relative rounded-2xl p-6 border-2 cursor-pointer transition-all flex flex-col justify-between min-h-[240px] bg-[#16152B] ${
                freelanceGoal === 'I don\'t have a goal in mind yet'
                  ? 'border-[#6A54F4] bg-[#1A1835] ring-2 ring-[#6A54F4]/50 shadow-xl'
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              <div className="flex justify-end">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  freelanceGoal === 'I don\'t have a goal in mind yet' ? 'border-[#6A54F4] bg-[#6A54F4]' : 'border-slate-600'
                }`}>
                  {freelanceGoal === 'I don\'t have a goal in mind yet' && <Check size={12} className="text-white stroke-[3]" />}
                </div>
              </div>
              <IllustrationNoGoal />
              <h3 className="text-base font-bold text-white mt-4 leading-snug">I don't have a goal in mind yet</h3>
            </div>
          </div>
        </main>

        <footer className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-t border-white/10">
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className="px-6 py-2 rounded-full border border-white/20 text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors"
          >
            Back
          </button>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="text-xs font-bold text-[#6A54F4] hover:underline"
            >
              Skip for now
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-7 py-2.5 rounded-full bg-[#6A54F4] hover:bg-[#5844E5] text-white font-bold text-xs shadow-sm transition-all"
            >
              Next
            </button>
          </div>
        </footer>
      </div>
    );
  }

  // ==========================================================================
  // STEP 4: QUESTION 3/3
  // ==========================================================================
  if (currentStep === 4) {
    return (
      <div className="min-h-screen w-full bg-black text-white font-sans antialiased flex flex-col justify-between">
        <div>
          <div className="w-full bg-slate-900 h-1.5">
            <div className="bg-[#6A54F4] h-1.5 w-full transition-all duration-300" />
          </div>
          <header className="w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">3/3</span>
            <Logo size="sm" to="/" />
          </header>
        </div>

        <main className="max-w-5xl mx-auto w-full px-6 py-8 my-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
            And how would you like to work?
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl mb-10">
            Everybody works in different ways, so we have different ways of helping you win work. You can select multiple preferences now and can always change it later!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div
              onClick={() => toggleWorkPreference('I\'d like to find opportunities myself')}
              className={`relative rounded-2xl p-6 sm:p-8 border-2 cursor-pointer transition-all flex flex-col justify-between min-h-[260px] bg-[#16152B] ${
                workPreferences.includes('I\'d like to find opportunities myself')
                  ? 'border-[#6A54F4] bg-[#1A1835] ring-2 ring-[#6A54F4]/50 shadow-xl'
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              <div className="flex justify-end">
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                  workPreferences.includes('I\'d like to find opportunities myself') ? 'border-[#6A54F4] bg-[#6A54F4]' : 'border-slate-600'
                }`}>
                  {workPreferences.includes('I\'d like to find opportunities myself') && <Check size={12} className="text-white stroke-[3]" />}
                </div>
              </div>
              <IllustrationFindOpportunities />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  I'd like to find opportunities myself
                </h3>
                <p className="text-xs text-[#a0a5ba] leading-relaxed">
                  Clients post jobs on our Talent Marketplace™: you can browse and bid for them, or get invited by a client.
                </p>
              </div>
            </div>

            <div
              onClick={() => toggleWorkPreference('I\'d like to package up my work for clients to buy')}
              className={`relative rounded-2xl p-6 sm:p-8 border-2 cursor-pointer transition-all flex flex-col justify-between min-h-[260px] bg-[#16152B] ${
                workPreferences.includes('I\'d like to package up my work for clients to buy')
                  ? 'border-[#6A54F4] bg-[#1A1835] ring-2 ring-[#6A54F4]/50 shadow-xl'
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              <div className="flex justify-end">
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                  workPreferences.includes('I\'d like to package up my work for clients to buy') ? 'border-[#6A54F4] bg-[#6A54F4]' : 'border-slate-600'
                }`}>
                  {workPreferences.includes('I\'d like to package up my work for clients to buy') && <Check size={12} className="text-white stroke-[3]" />}
                </div>
              </div>
              <IllustrationPackageWork />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  I'd like to package up my work for clients to buy
                </h3>
                <p className="text-xs text-[#a0a5ba] leading-relaxed">
                  Define your service with prices and timelines: we'll list it in our Project Catalog™ for clients to buy right away.
                </p>
              </div>
            </div>
          </div>
        </main>

        <footer className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between border-t border-white/10">
          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className="px-6 py-2 rounded-full border border-white/20 text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors"
          >
            Back
          </button>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="text-xs font-bold text-[#6A54F4] hover:underline"
            >
              Skip for now
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="px-7 py-2.5 rounded-full bg-[#6A54F4] hover:bg-[#5844E5] text-white font-bold text-xs shadow-sm transition-all"
            >
              Next, create a profile
            </button>
          </div>
        </footer>
      </div>
    );
  }

  // ==========================================================================
  // STEP 5: CREATE YOUR PROFILE 1/10
  // ==========================================================================
  if (currentStep === 5) {
    return (
      <div className="min-h-screen w-full bg-black text-white font-sans antialiased flex flex-col justify-between relative">
        <div>
          <div className="w-full bg-slate-900 h-1.5">
            <div className="bg-[#6A54F4] h-1.5 w-[10%] transition-all duration-300" />
          </div>
          <header className="w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-white">Create your profile</span>
              <span className="text-xs font-semibold text-slate-400">1/10</span>
            </div>
            <Logo size="sm" to="/" />
          </header>
        </div>

        <main className="max-w-6xl mx-auto w-full px-6 py-8 my-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
                  How would you like to tell us about yourself?
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  We need to get a sense of your education, experience and skills. It's quickest to import your information — you can edit it before your profile goes live.
                </p>
              </div>

              <div className="space-y-4 pt-4 max-w-md">
                <button
                  type="button"
                  onClick={() => setIsLinkedInModalOpen(true)}
                  className="w-full py-3.5 px-6 rounded-full border border-white/15 bg-[#16152B] hover:border-[#6A54F4] hover:bg-[#6A54F4]/20 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <FaLinkedin size={18} className="text-[#0a66c2]" />
                  <span>Import from LinkedIn</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsResumeModalOpen(true)}
                  className="w-full py-3.5 px-6 rounded-full border border-white/15 bg-[#16152B] hover:border-[#6A54F4] hover:bg-[#6A54F4]/20 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <Upload size={18} className="text-[#6A54F4]" />
                  <span>Upload your resume</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setImportMethod('Fill out manually (15 min)');
                    setCurrentStep(6);
                  }}
                  className="w-full py-3.5 px-6 rounded-full border border-white/15 bg-[#16152B] hover:border-[#6A54F4] hover:bg-[#6A54F4]/20 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <FileText size={18} className="text-purple-400" />
                  <span>Fill out manually (15 min)</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-[#16152B] p-8 border border-white/10 space-y-6">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 shadow-md">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                    alt="Pro Tip Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <blockquote className="text-lg font-medium text-slate-200 leading-relaxed italic">
                  “Your FlexiStaff profile is how you stand out from the crowd. It's what you use to win work, so let's make it a good one.”
                </blockquote>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  FlexiStaff Pro Tip
                </p>
              </div>
            </div>
          </div>
        </main>

        <footer className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-t border-white/10">
          <button
            type="button"
            onClick={() => setCurrentStep(4)}
            className="px-6 py-2 rounded-full border border-white/20 text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors"
          >
            Back
          </button>
        </footer>

        {/* LINKEDIN UPLOAD MODAL (Matching Picture 2) */}
        <AnimatePresence>
          {isLinkedInModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white text-slate-900 rounded-[28px] max-w-xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6"
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsLinkedInModalOpen(false)}
                  className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>

                {/* Modal Header */}
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Upload your LinkedIn profile
                </h2>

                {/* Step 1 */}
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    Step 1: if you haven't already, save your LinkedIn profile as a PDF. Here's how:
                  </p>

                  {/* LinkedIn Mockup Card */}
                  <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 overflow-hidden relative max-w-md mx-auto">
                    <div className="bg-slate-300 h-16 rounded-t-xl relative w-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-300 to-slate-400" />
                    </div>

                    <div className="relative px-2 pb-2">
                      <div className="w-14 h-14 rounded-full bg-white border-2 border-white flex items-center justify-center -mt-7 shadow-sm text-slate-400">
                        <Camera size={20} />
                      </div>

                      <div className="mt-2">
                        <h4 className="text-sm font-bold text-slate-800">Your Name</h4>

                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="px-3 py-1 rounded-full bg-[#0a66c2] text-white text-[11px] font-semibold">
                            Open to
                          </span>
                          <span className="px-3 py-1 rounded-full border border-slate-300 text-slate-700 text-[11px] font-semibold">
                            Add section
                          </span>
                          <span className="px-3 py-1 rounded-full border border-slate-300 text-slate-700 text-[11px] font-semibold bg-slate-200">
                            More
                          </span>
                        </div>

                        {/* Popover Menu */}
                        <div className="mt-2 ml-12 bg-white rounded-xl shadow-lg border border-slate-200 p-2 space-y-1 text-xs max-w-[210px]">
                          <div className="px-2 py-1 text-slate-500 text-[11px] flex items-center gap-1">
                            <Send size={12} /> Share profile in a message
                          </div>
                          <div className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-900 font-bold flex items-center gap-1.5 border border-slate-300">
                            <Download size={13} className="text-[#0a66c2]" /> Save to PDF
                          </div>
                          <div className="px-2 py-1 text-slate-500 text-[11px]">
                            Build a resume
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="space-y-3 pt-2">
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    Step 2: come back here to upload it.
                  </p>

                  <input
                    type="file"
                    ref={linkedInFileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setLinkedInPdfFile(e.target.files[0]);
                      }
                    }}
                    accept=".pdf"
                    className="hidden"
                  />

                  {linkedInPdfFile ? (
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-purple-50 border border-[#6A54F4]/30 text-slate-900">
                      <div className="flex items-center gap-3">
                        <FileText className="text-[#6A54F4]" size={20} />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{linkedInPdfFile.name}</p>
                          <p className="text-[10px] text-slate-500">{(linkedInPdfFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLinkedInPdfFile(null)}
                        className="text-xs text-rose-600 hover:underline font-semibold"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => linkedInFileInputRef.current?.click()}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-full border-2 border-[#6A54F4] text-[#6A54F4] hover:bg-[#6A54F4]/10 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Upload size={16} />
                      <span>Upload your saved LinkedIn PDF</span>
                    </button>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={!linkedInPdfFile}
                    onClick={() => {
                      setImportMethod('Import from LinkedIn');
                      toast.success('LinkedIn PDF uploaded successfully!');
                      setIsLinkedInModalOpen(false);
                      setCurrentStep(6);
                    }}
                    className={`px-7 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all ${
                      linkedInPdfFile
                        ? 'bg-[#6A54F4] hover:bg-[#5844E5] text-white shadow-md cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* RESUME UPLOAD MODAL (Matching Picture 3) */}
        <AnimatePresence>
          {isResumeModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white text-slate-900 rounded-[28px] max-w-xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6"
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsResumeModalOpen(false)}
                  className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>

                {/* Modal Header */}
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Add your resume
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Use a PDF, Word doc, or rich text file.
                  </p>
                </div>

                {/* Dropzone Container */}
                <input
                  type="file"
                  ref={resumeFileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setResumeFile(e.target.files[0]);
                    }
                  }}
                  accept=".pdf,.doc,.docx,.txt,.rtf"
                  className="hidden"
                />

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingResume(true);
                  }}
                  onDragLeave={() => setIsDraggingResume(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingResume(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      setResumeFile(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => {
                    if (!resumeFile) resumeFileInputRef.current?.click();
                  }}
                  className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDraggingResume
                      ? 'border-[#6A54F4] bg-purple-50'
                      : resumeFile
                      ? 'border-emerald-400 bg-emerald-50/40'
                      : 'border-slate-300 hover:border-[#6A54F4] hover:bg-slate-50'
                  }`}
                >
                  {resumeFile ? (
                    <div className="space-y-3">
                      <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                        <CheckCircle2 size={32} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{resumeFile.name}</p>
                        <p className="text-xs text-slate-500">{(resumeFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setResumeFile(null);
                        }}
                        className="text-xs font-bold text-rose-600 hover:underline"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Document Illustration */}
                      <div className="w-20 h-20 mx-auto relative flex items-center justify-center">
                        <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
                          <rect x="12" y="8" width="36" height="48" rx="4" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
                          <rect x="20" y="16" width="20" height="3" rx="1.5" fill="#475569" />
                          <rect x="20" y="24" width="20" height="3" rx="1.5" fill="#94A3B8" />
                          <rect x="20" y="32" width="14" height="3" rx="1.5" fill="#94A3B8" />
                          <circle cx="44" cy="40" r="10" fill="#34D399" />
                          <path d="M40 40L43 43L48 37" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 font-medium">
                        Drag and drop or{' '}
                        <span className="text-[#6A54F4] underline font-bold hover:text-[#5844E5]">
                          choose file
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={!resumeFile}
                    onClick={() => {
                      setImportMethod('Upload your resume');
                      toast.success('Resume attached successfully!');
                      setIsResumeModalOpen(false);
                      setCurrentStep(6);
                    }}
                    className={`px-7 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all ${
                      resumeFile
                        ? 'bg-[#6A54F4] hover:bg-[#5844E5] text-white shadow-md cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ==========================================================================
  // STEP 6: CREATE YOUR PROFILE 2/10
  // ==========================================================================
  if (currentStep === 6) {
    const specialtiesList = CATEGORY_MAP[selectedCategory] || [];

    return (
      <div className="min-h-screen w-full bg-black text-white font-sans antialiased flex flex-col justify-between">
        <div>
          <div className="w-full bg-slate-900 h-1.5">
            <div className="bg-[#6A54F4] h-1.5 w-[20%] transition-all duration-300" />
          </div>
          <header className="w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-white">Create your profile</span>
              <span className="text-xs font-semibold text-slate-400">2/10</span>
            </div>
            <Logo size="sm" to="/" />
          </header>
        </div>

        <main className="max-w-6xl mx-auto w-full px-6 py-8 my-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
            Great, so what kind of work are you here to do?
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mb-8">
            Don't worry, you can change these choices later on.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border-t border-white/10 pt-6">
            <div className="md:col-span-5 border-r border-white/10 pr-6 space-y-1">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Select 1 category
              </div>
              {Object.keys(CATEGORY_MAP).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedSpecialties([]);
                  }}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#6A54F4] text-white shadow-md'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="md:col-span-7 space-y-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Now, select 1 to 3 specialties
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {specialtiesList.map((spec) => {
                  const isSelected = selectedSpecialties.includes(spec);
                  return (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => toggleSpecialty(spec)}
                      className={`px-4 py-3 rounded-2xl text-xs font-bold border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[#6A54F4] bg-[#6A54F4]/20 text-white ring-1 ring-[#6A54F4]'
                          : 'border-white/10 text-slate-300 hover:border-white/30 bg-[#16152B]'
                      }`}
                    >
                      <span>{spec}</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-[#6A54F4] bg-[#6A54F4] text-white' : 'border-slate-600'
                      }`}>
                        {isSelected && <Check size={10} strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </main>

        <footer className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-t border-white/10">
          <button
            type="button"
            onClick={() => setCurrentStep(5)}
            className="px-6 py-2 rounded-full border border-white/20 text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => {
              if (selectedSpecialties.length === 0) {
                toast.error('Please select at least 1 specialty before proceeding.');
                return;
              }
              setCurrentStep(7);
            }}
            className="px-7 py-2.5 rounded-full bg-[#6A54F4] hover:bg-[#5844E5] text-white font-bold text-xs shadow-sm transition-all"
          >
            Next, add your skills
          </button>
        </footer>
      </div>
    );
  }

  // ==========================================================================
  // STEP 7: CREATE YOUR PROFILE 3/10
  // ==========================================================================
  if (currentStep === 7) {
    return (
      <div className="min-h-screen w-full bg-black text-white font-sans antialiased flex flex-col justify-between">
        <div>
          <div className="w-full bg-slate-900 h-1.5">
            <div className="bg-[#6A54F4] h-1.5 w-[30%] transition-all duration-300" />
          </div>
          <header className="w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-white">Create your profile</span>
              <span className="text-xs font-semibold text-slate-400">3/10</span>
            </div>
            <Logo size="sm" to="/" />
          </header>
        </div>

        <main className="max-w-6xl mx-auto w-full px-6 py-8 my-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
                  Nearly there! What work are you here to do?
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Your skills show clients what you can offer, and help us choose which jobs to recommend to you. Add or remove the ones we've suggested, or start typing to pick more. It's up to you.
                </p>
                <button type="button" className="text-xs font-bold text-[#6A54F4] hover:underline mt-1 block">
                  Why choosing carefully matters
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">Your skills</label>
                <div className="p-3 rounded-2xl border border-white/15 bg-[#16152B] flex flex-wrap items-center gap-2 min-h-[56px] focus-within:border-[#6A54F4] transition-all">
                  {selectedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#6A54F4]/20 border border-[#6A54F4]/40 text-emerald-300 text-xs font-bold"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-emerald-400 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}

                  <input
                    type="text"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill(customSkillInput);
                      }
                    }}
                    placeholder={selectedSkills.length === 0 ? 'Enter skills here' : ''}
                    className="flex-1 min-w-[140px] text-xs sm:text-sm outline-none bg-transparent text-white placeholder-slate-500 py-1"
                  />
                </div>
                <div className="text-right text-[11px] text-slate-400 font-medium">Max 15 skills</div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400">Suggested skills</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_SUGGESTED_SKILLS.filter((s) => !selectedSkills.includes(s)).map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => addSkill(skill)}
                      className="px-3 py-1.5 rounded-full border border-white/15 bg-[#16152B] text-xs font-medium text-slate-300 hover:border-white/30 hover:bg-[#1A1835] transition-all flex items-center gap-1"
                    >
                      <Plus size={13} />
                      <span>{skill}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-[#16152B] p-8 border border-white/10 space-y-6">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 shadow-md">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
                    alt="Pro Tip Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <blockquote className="text-lg font-medium text-slate-200 leading-relaxed italic">
                  “FlexiStaff's algorithm will recommend specific job posts to you based on your skills. So choose them carefully to get the best match!”
                </blockquote>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  FlexiStaff Pro Tip
                </p>
              </div>
            </div>
          </div>
        </main>

        <footer className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-t border-white/10">
          <button
            type="button"
            onClick={() => setCurrentStep(6)}
            className="px-6 py-2 rounded-full border border-white/20 text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => {
              if (selectedSkills.length === 0) {
                toast.error('Please select or add at least 1 skill before proceeding (up to 15 skills).');
                return;
              }
              setCurrentStep(8);
            }}
            className="px-7 py-2.5 rounded-full bg-[#6A54F4] hover:bg-[#5844E5] text-white font-bold text-xs shadow-sm transition-all"
          >
            Next, add your title
          </button>
        </footer>
      </div>
    );
  }

  // ==========================================================================
  // STEP 8: CREATE YOUR PROFILE 4/10
  // ==========================================================================
  if (currentStep === 8) {
    return (
      <div className="min-h-screen w-full bg-black text-white font-sans antialiased flex flex-col justify-between">
        <div>
          <div className="w-full bg-slate-900 h-1.5">
            <div className="bg-[#6A54F4] h-1.5 w-[40%] transition-all duration-300" />
          </div>
          <header className="w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-white">Create your profile</span>
              <span className="text-xs font-semibold text-slate-400">4/10</span>
            </div>
            <Logo size="sm" to="/" />
          </header>
        </div>

        <main className="max-w-4xl mx-auto w-full px-6 py-8 my-auto space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
              Got it. Now, add a title to tell the world what you do.
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              It's the very first thing clients see, so make it count. Stand out by describing your expertise in your own words.
            </p>
          </div>

          <div className="space-y-2 max-w-xl">
            <label className="block text-xs font-bold text-slate-300">Your professional role</label>
            <input
              type="text"
              value={professionalRoleTitle}
              onChange={(e) => setProfessionalRoleTitle(e.target.value)}
              placeholder="Full Stack Software Engineer & React Specialist"
              className="w-full rounded-2xl border border-white/15 bg-[#16152B] py-3.5 px-4 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-[#6A54F4] transition-all"
            />
          </div>
        </main>

        <footer className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-t border-white/10">
          <button
            type="button"
            onClick={() => setCurrentStep(7)}
            className="px-6 py-2 rounded-full border border-white/20 text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => {
              if (!professionalRoleTitle.trim()) {
                toast.error('Please enter your professional role title before proceeding.');
                return;
              }
              setCurrentStep(9);
            }}
            className="px-7 py-2.5 rounded-full bg-[#6A54F4] hover:bg-[#5844E5] text-white font-bold text-xs shadow-sm transition-all"
          >
            Next, add your experience
          </button>
        </footer>
      </div>
    );
  }

  // ==========================================================================
  // STEP 9: CREATE YOUR PROFILE 5/10
  // ==========================================================================
  if (currentStep === 9) {
    return (
      <div className="min-h-screen w-full bg-black text-white font-sans antialiased flex flex-col justify-between">
        <div>
          <div className="w-full bg-slate-900 h-1.5">
            <div className="bg-[#6A54F4] h-1.5 w-[50%] transition-all duration-300" />
          </div>
          <header className="w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-white">Create your profile</span>
              <span className="text-xs font-semibold text-slate-400">5/10</span>
            </div>
            <Logo size="sm" to="/" />
          </header>
        </div>

        <main className="max-w-5xl mx-auto w-full px-6 py-8 my-auto space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
              If you have relevant work experience, add it here.
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              Freelancers who add their experience are twice as likely to win work. But if you're just starting out, you can still create a great profile. Just head on to the next page.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button
              type="button"
              onClick={() => setIsAddingExperienceModal(true)}
              className="rounded-3xl border-2 border-dashed border-white/20 hover:border-[#6A54F4] p-8 flex flex-col items-center justify-center text-center space-y-3 min-h-[180px] bg-[#16152B]/60 hover:bg-[#16152B] transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[#6A54F4] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Plus size={20} strokeWidth={3} />
              </div>
              <span className="text-base font-bold text-white">Add experience</span>
            </button>

            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="rounded-3xl border border-white/10 p-6 bg-[#16152B] shadow-md flex flex-col justify-between relative group text-white"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">{exp.title}</h3>
                      <p className="text-xs font-medium text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building2 size={13} className="text-emerald-400" />
                        <span>{exp.company}</span>
                        {exp.period && <span className="text-slate-500">• {exp.period}</span>}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExperiences(experiences.filter((e) => e.id !== exp.id))}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {exp.description && (
                    <p className="text-xs text-slate-400 mt-3 line-clamp-2">{exp.description}</p>
                  )}
                  {exp.documentName && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/20 w-fit">
                      <FileText size={14} className="text-[#6A54F4]" />
                      <span className="font-semibold">{exp.documentName}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>

        <AnimatePresence>
          {isAddingExperienceModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg rounded-3xl bg-[#16152B] p-6 shadow-2xl space-y-4 border border-white/15 text-white"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-base font-bold text-white">Add Work Experience</h3>
                  <button
                    type="button"
                    onClick={() => setIsAddingExperienceModal(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleAddExperienceSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Title *</label>
                    <input
                      type="text"
                      placeholder="Senior Software Engineer"
                      value={newExp.title}
                      onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
                      className="w-full rounded-xl border border-white/15 bg-black px-3.5 py-2 text-xs text-white outline-none focus:border-[#6A54F4]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Company *</label>
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={newExp.company}
                      onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                      className="w-full rounded-xl border border-white/15 bg-black px-3.5 py-2 text-xs text-white outline-none focus:border-[#6A54F4]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Dates / Period</label>
                    <input
                      type="text"
                      placeholder="Period (Jan 2022 - Present)"
                      value={newExp.period}
                      onChange={(e) => setNewExp({ ...newExp, period: e.target.value })}
                      className="w-full rounded-xl border border-white/15 bg-black px-3.5 py-2 text-xs text-white outline-none focus:border-[#6A54F4]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
                    <textarea
                      rows={3}
                      placeholder="Describe your responsibilities..."
                      value={newExp.description}
                      onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                      className="w-full rounded-xl border border-white/15 bg-black px-3.5 py-2 text-xs text-white outline-none focus:border-[#6A54F4]"
                    />
                  </div>

                  {/* Upload PDF Section */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Attach Proof / Document (PDF)
                    </label>
                    <input
                      type="file"
                      ref={expPdfInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setNewExp({ ...newExp, documentName: e.target.files[0].name });
                        }
                      }}
                      accept=".pdf"
                      className="hidden"
                    />

                    {newExp.documentName ? (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-white text-xs">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText size={16} className="text-[#6A54F4] flex-shrink-0" />
                          <span className="truncate font-medium">{newExp.documentName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNewExp({ ...newExp, documentName: '' })}
                          className="text-rose-400 hover:underline text-[11px] font-bold ml-2 flex-shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => expPdfInputRef.current?.click()}
                        className="w-full py-2.5 px-4 rounded-xl border border-white/15 bg-black hover:border-[#6A54F4] hover:bg-black/60 text-slate-300 text-xs font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        <Upload size={14} className="text-[#6A54F4]" />
                        <span>Upload Experience PDF</span>
                      </button>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingExperienceModal(false)}
                      className="px-5 py-2 rounded-full border border-white/20 text-xs font-semibold text-slate-300 hover:bg-white/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-full bg-[#6A54F4] hover:bg-[#14a800] text-white text-xs font-bold shadow-xs"
                    >
                      Save Experience
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <footer className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-t border-white/10">
          <button
            type="button"
            onClick={() => setCurrentStep(8)}
            className="px-6 py-2 rounded-full border border-white/20 text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors"
          >
            Back
          </button>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setCurrentStep(10)}
              className="text-xs font-bold text-[#6A54F4] hover:underline"
            >
              Skip for now
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(10)}
              className="px-7 py-2.5 rounded-full bg-[#6A54F4] hover:bg-[#14a800] text-white font-bold text-xs shadow-sm transition-all"
            >
              Next, add your education
            </button>
          </div>
        </footer>
      </div>
    );
  }

  // ==========================================================================
  // STEP 10: CREATE YOUR PROFILE 6/10
  // ==========================================================================
  if (currentStep === 10) {
    return (
      <div className="min-h-screen w-full bg-black text-white font-sans antialiased flex flex-col justify-between">
        <div>
          <div className="w-full bg-slate-900 h-1.5">
            <div className="bg-[#6A54F4] h-1.5 w-[60%] transition-all duration-300" />
          </div>
          <header className="w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-white">Create your profile</span>
              <span className="text-xs font-semibold text-slate-400">6/10</span>
            </div>
            <Logo size="sm" to="/" />
          </header>
        </div>

        <main className="max-w-5xl mx-auto w-full px-6 py-8 my-auto space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
              Clients like to know what you know - add your education here.
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              You don't have to have a degree. Adding any relevant education helps make your profile more visible.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button
              type="button"
              onClick={() => setIsAddingEducationModal(true)}
              className="rounded-3xl border-2 border-dashed border-white/20 hover:border-[#6A54F4] p-8 flex flex-col items-center justify-center text-center space-y-3 min-h-[180px] bg-[#16152B]/60 hover:bg-[#16152B] transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[#6A54F4] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Plus size={20} strokeWidth={3} />
              </div>
              <span className="text-base font-bold text-white">Add education</span>
            </button>

            {educations.map((edu) => (
              <div
                key={edu.id}
                className="rounded-3xl border border-white/10 p-6 bg-[#16152B] shadow-md flex flex-col justify-between relative group text-white"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">{edu.degree}</h3>
                      <p className="text-xs font-medium text-slate-400 flex items-center gap-1 mt-1">
                        <GraduationCap size={14} className="text-emerald-400" />
                        <span>{edu.school}</span>
                        {edu.dates && <span className="text-slate-500">• {edu.dates}</span>}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEducations(educations.filter((e) => e.id !== edu.id))}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        <AnimatePresence>
          {isAddingEducationModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg rounded-3xl bg-[#16152B] p-6 shadow-2xl space-y-4 border border-white/15 text-white"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-base font-bold text-white">Add Education</h3>
                  <button
                    type="button"
                    onClick={() => setIsAddingEducationModal(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleAddEducationSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Degree / Certificate *</label>
                    <input
                      type="text"
                      placeholder="Degree or Certificate Title"
                      value={newEdu.degree}
                      onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                      className="w-full rounded-xl border border-white/15 bg-black px-3.5 py-2 text-xs text-white outline-none focus:border-[#6A54F4]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">School / University *</label>
                    <input
                      type="text"
                      placeholder="School / University Name"
                      value={newEdu.school}
                      onChange={(e) => setNewEdu({ ...newEdu, school: e.target.value })}
                      className="w-full rounded-xl border border-white/15 bg-black px-3.5 py-2 text-xs text-white outline-none focus:border-[#6A54F4]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Dates Attended</label>
                    <input
                      type="text"
                      placeholder="Dates Attended"
                      value={newEdu.dates}
                      onChange={(e) => setNewEdu({ ...newEdu, dates: e.target.value })}
                      className="w-full rounded-xl border border-white/15 bg-black px-3.5 py-2 text-xs text-white outline-none focus:border-[#6A54F4]"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingEducationModal(false)}
                      className="px-5 py-2 rounded-full border border-white/20 text-xs font-semibold text-slate-300 hover:bg-white/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-full bg-[#6A54F4] hover:bg-[#14a800] text-white text-xs font-bold shadow-xs"
                    >
                      Save Education
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <footer className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-t border-white/10">
          <button
            type="button"
            onClick={() => setCurrentStep(9)}
            className="px-6 py-2 rounded-full border border-white/20 text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors"
          >
            Back
          </button>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setCurrentStep(11)}
              className="text-xs font-bold text-[#6A54F4] hover:underline"
            >
              Skip for now
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(11)}
              className="px-7 py-2.5 rounded-full bg-[#6A54F4] hover:bg-[#14a800] text-white font-bold text-xs shadow-sm transition-all"
            >
              Next, add languages
            </button>
          </div>
        </footer>
      </div>
    );
  }

  // ==========================================================================
  // STEP 11: CREATE YOUR PROFILE 7/10
  // ==========================================================================
  if (currentStep === 11) {
    return (
      <div className="min-h-screen w-full bg-black text-white font-sans antialiased flex flex-col justify-between">
        <div>
          <div className="w-full bg-slate-900 h-1.5">
            <div className="bg-[#6A54F4] h-1.5 w-[70%] transition-all duration-300" />
          </div>
          <header className="w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-white">Create your profile</span>
              <span className="text-xs font-semibold text-slate-400">7/10</span>
            </div>
            <Logo size="sm" to="/" />
          </header>
        </div>

        <main className="max-w-4xl mx-auto w-full px-6 py-8 my-auto space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
              Looking good. Next, tell us which languages you speak.
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              FlexiStaff is global, so clients are often interested to know what languages you speak. English is a must, but do you speak any other languages?
            </p>
          </div>

          <div className="space-y-4 max-w-2xl border-t border-white/10 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Language</span>
              <span>Proficiency</span>
            </div>

            {languages.map((lang) => (
              <div key={lang.id} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="text-xs sm:text-sm font-semibold text-white py-2">
                  {lang.name}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={lang.proficiency}
                    onChange={(e) => updateLanguageProficiency(lang.id, e.target.value)}
                    className="w-full rounded-2xl border border-white/15 bg-[#16152B] px-4 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-[#6A54F4] transition-all cursor-pointer"
                  >
                    <option value="Native or Bilingual">Native or Bilingual</option>
                    <option value="Fluent">Fluent</option>
                    <option value="Conversational">Conversational</option>
                    <option value="Basic">Basic</option>
                  </select>
                  {lang.name !== 'English (all profiles include this)' && (
                    <button
                      type="button"
                      onClick={() => removeLanguageRow(lang.id)}
                      className="text-slate-400 hover:text-rose-400 p-1"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="pt-2">
              <button
                type="button"
                onClick={addLanguageRow}
                disabled={availableLanguagesToAdd.length === 0}
                className="px-5 py-2.5 rounded-full border-2 border-[#6A54F4] text-[#6A54F4] font-bold text-xs hover:bg-[#6A54F4]/10 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Plus size={14} strokeWidth={3} />
                <span>Add a language</span>
              </button>
            </div>
          </div>
        </main>

        <footer className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-t border-white/10">
          <button
            type="button"
            onClick={() => setCurrentStep(10)}
            className="px-6 py-2 rounded-full border border-white/20 text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep(12)}
            className="px-7 py-2.5 rounded-full bg-[#6A54F4] hover:bg-[#14a800] text-white font-bold text-xs shadow-sm transition-all"
          >
            Next, write an overview
          </button>
        </footer>
      </div>
    );
  }

  // ==========================================================================
  // STEP 12: CREATE YOUR PROFILE 8/10
  // ==========================================================================
  if (currentStep === 12) {
    return (
      <div className="min-h-screen w-full bg-black text-white font-sans antialiased flex flex-col justify-between">
        <div>
          <div className="w-full bg-slate-900 h-1.5">
            <div className="bg-[#6A54F4] h-1.5 w-[80%] transition-all duration-300" />
          </div>
          <header className="w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-white">Create your profile</span>
              <span className="text-xs font-semibold text-slate-400">8/10</span>
            </div>
            <Logo size="sm" to="/" />
          </header>
        </div>

        <main className="max-w-4xl mx-auto w-full px-6 py-8 my-auto space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
              Great. Now write a bio to tell the world about yourself.
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Help people get to know you at a glance. What work do you do best? Tell them clearly, using paragraphs or bullet points. You can always edit later; just make sure you proofread now.
            </p>
          </div>

          <div className="space-y-2">
            <textarea
              rows={8}
              value={bioOverview}
              onChange={(e) => setBioOverview(e.target.value)}
              placeholder="Enter your top skills, experiences, and interests. This is one of the first things clients will see on your profile."
              className="w-full rounded-2xl border border-white/15 bg-[#16152B] p-5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-[#6A54F4] transition-all leading-relaxed"
            />
            <div className="text-right text-[11px] text-slate-400">At least 100 characters</div>
          </div>
        </main>

        <footer className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-t border-white/10">
          <button
            type="button"
            onClick={() => setCurrentStep(11)}
            className="px-6 py-2 rounded-full border border-white/20 text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep(13)}
            className="px-7 py-2.5 rounded-full bg-[#6A54F4] hover:bg-[#14a800] text-white font-bold text-xs shadow-sm transition-all"
          >
            Next, set your rate
          </button>
        </footer>
      </div>
    );
  }

  // ==========================================================================
  // STEP 13: CREATE YOUR PROFILE 9/10
  // ==========================================================================
  if (currentStep === 13) {
    return (
      <div className="min-h-screen w-full bg-black text-white font-sans antialiased flex flex-col justify-between">
        <div>
          <div className="w-full bg-slate-900 h-1.5">
            <div className="bg-[#6A54F4] h-1.5 w-[90%] transition-all duration-300" />
          </div>
          <header className="w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-white">Create your profile</span>
              <span className="text-xs font-semibold text-slate-400">9/10</span>
            </div>
            <Logo size="sm" to="/" />
          </header>
        </div>

        <main className="max-w-4xl mx-auto w-full px-6 py-8 my-auto space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
              Now, let's set your hourly rate.
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              Clients will see this rate on your profile and in search results once you publish your profile. You can adjust your rate every time you submit a proposal.
            </p>
          </div>

          <div className="space-y-6 max-w-3xl border-t border-white/10 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">Hourly rate</h3>
                <p className="text-xs text-slate-400">Total amount the client will see.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-300">₹</span>
                <input
                  type="number"
                  step="10"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                  className="w-36 rounded-2xl border border-white/15 bg-[#16152B] py-2.5 px-4 text-right text-sm font-bold text-white outline-none focus:border-[#6A54F4]"
                />
                <span className="text-xs font-semibold text-slate-400">/hr</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Service fee</h3>
                  <button type="button" className="text-xs font-bold text-[#6A54F4] hover:underline">
                    Learn more
                  </button>
                </div>
                <p className="text-xs text-slate-400 max-w-md mt-1">
                  This helps us run the platform and provide services like payment protection and customer support. Fees vary and are shown before contract acceptance.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-36 rounded-2xl bg-[#16152B] py-2.5 px-4 text-right text-sm font-bold text-slate-400 border border-white/10">
                  ₹{serviceFee}
                </div>
                <span className="text-xs font-semibold text-slate-400">/hr</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white">You'll get</h3>
                <p className="text-xs text-slate-400">The estimated amount you'll receive after service fees</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-36 rounded-2xl border border-emerald-500/40 bg-[#16152B] py-2.5 px-4 text-right text-sm font-bold text-emerald-400">
                  ₹{netEarnings}
                </div>
                <span className="text-xs font-semibold text-slate-400">/hr</span>
              </div>
            </div>
          </div>
        </main>

        <footer className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-t border-white/10">
          <button
            type="button"
            onClick={() => setCurrentStep(12)}
            className="px-6 py-2 rounded-full border border-white/20 text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep(14)}
            className="px-7 py-2.5 rounded-full bg-[#6A54F4] hover:bg-[#14a800] text-white font-bold text-xs shadow-sm transition-all"
          >
            Next, add your photo and location
          </button>
        </footer>
      </div>
    );
  }

  // ==========================================================================
  // STEP 14: CREATE YOUR PROFILE 10/10
  // ==========================================================================
  if (currentStep === 14) {
    return (
      <div className="min-h-screen w-full bg-black text-white font-sans antialiased flex flex-col justify-between">
        <div>
          <div className="w-full bg-slate-900 h-1.5">
            <div className="bg-[#6A54F4] h-1.5 w-full transition-all duration-300" />
          </div>
          <header className="w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-white">Create your profile</span>
              <span className="text-xs font-semibold text-slate-400">10/10</span>
            </div>
            <Logo size="sm" to="/" />
          </header>
        </div>

        <main className="max-w-5xl mx-auto w-full px-6 py-8 my-auto space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
              A few last details, then you can check and publish your profile.
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              A professional photo helps you build trust with your clients. To keep things safe and simple, they'll pay you through us - which is why we need your personal information.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-t border-white/10 pt-6">
            <div className="md:col-span-4 flex flex-col items-center text-center space-y-4">
              <input
                type="file"
                ref={avatarFileInputRef}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    const imageUrl = URL.createObjectURL(file);
                    setPersonalDetails((prev) => ({ ...prev, avatarUrl: imageUrl }));
                    toast.success('Profile photo uploaded successfully!');
                  }
                }}
                accept="image/*"
                className="hidden"
              />

              <div
                className="relative cursor-pointer group"
                onClick={() => avatarFileInputRef.current?.click()}
              >
                <div className="w-28 h-28 rounded-full overflow-hidden bg-[#16152B] border-2 border-white/20 group-hover:border-[#6A54F4] transition-all flex items-center justify-center shadow-lg">
                  {personalDetails.avatarUrl ? (
                    <img
                      src={personalDetails.avatarUrl}
                      alt="Uploaded Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={48} className="text-slate-400 group-hover:text-white transition-colors" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    avatarFileInputRef.current?.click();
                  }}
                  className="w-8 h-8 rounded-full bg-[#6A54F4] text-white flex items-center justify-center absolute bottom-0 right-0 shadow-md border-2 border-black hover:bg-[#5842E3] transition-all"
                >
                  <Plus size={16} strokeWidth={3} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => avatarFileInputRef.current?.click()}
                className="px-5 py-2 rounded-full border-2 border-[#6A54F4] text-[#6A54F4] font-bold text-xs hover:bg-[#6A54F4]/10 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Camera size={14} />
                <span>{personalDetails.avatarUrl ? 'Change photo' : 'Upload photo'}</span>
              </button>
            </div>

            <div className="md:col-span-8 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">Date of Birth *</label>
                <div className="relative max-w-xs">
                  <input
                    type="date"
                    value={personalDetails.dob}
                    onChange={(e) => setPersonalDetails({ ...personalDetails, dob: e.target.value })}
                    className="w-full rounded-2xl border border-white/15 bg-[#16152B] px-4 py-2.5 text-xs text-white outline-none focus:border-[#6A54F4]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">Country *</label>
                <div className="relative max-w-md">
                  <select
                    value={personalDetails.country}
                    onChange={(e) => setPersonalDetails({ ...personalDetails, country: e.target.value })}
                    className="w-full rounded-2xl border border-white/15 bg-[#16152B] px-4 py-2.5 text-xs text-white outline-none focus:border-[#6A54F4] appearance-none cursor-pointer"
                  >
                    <option value="India">India</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Street address *</label>
                  <input
                    type="text"
                    placeholder="Enter street address"
                    value={personalDetails.streetAddress}
                    onChange={(e) => setPersonalDetails({ ...personalDetails, streetAddress: e.target.value })}
                    className="w-full rounded-2xl border border-white/15 bg-[#16152B] px-4 py-2.5 text-xs text-white outline-none focus:border-[#6A54F4]"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Apt/Suite</label>
                  <input
                    type="text"
                    placeholder="Apt/Suite (Optional)"
                    value={personalDetails.aptSuite}
                    onChange={(e) => setPersonalDetails({ ...personalDetails, aptSuite: e.target.value })}
                    className="w-full rounded-2xl border border-white/15 bg-[#16152B] px-4 py-2.5 text-xs text-white outline-none focus:border-[#6A54F4]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">City *</label>
                  <input
                    type="text"
                    placeholder="Enter city"
                    value={personalDetails.city}
                    onChange={(e) => setPersonalDetails({ ...personalDetails, city: e.target.value })}
                    className="w-full rounded-2xl border border-white/15 bg-[#16152B] px-4 py-2.5 text-xs text-white outline-none focus:border-[#6A54F4]"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">State/Province</label>
                  <input
                    type="text"
                    placeholder="Enter state/province"
                    value={personalDetails.state}
                    onChange={(e) => setPersonalDetails({ ...personalDetails, state: e.target.value })}
                    className="w-full rounded-2xl border border-white/15 bg-[#16152B] px-4 py-2.5 text-xs text-white outline-none focus:border-[#6A54F4]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">ZIP/Postal code</label>
                  <input
                    type="text"
                    placeholder="Enter ZIP/Postal code"
                    value={personalDetails.zipCode}
                    onChange={(e) => setPersonalDetails({ ...personalDetails, zipCode: e.target.value })}
                    className="w-full rounded-2xl border border-white/15 bg-[#16152B] px-4 py-2.5 text-xs text-white outline-none focus:border-[#6A54F4]"
                  />
                </div>
              </div>

              <div className="space-y-1.5 max-w-md">
                <label className="block text-xs font-bold text-slate-300">Phone *</label>
                <div className="flex items-center gap-2">
                  <select
                    value={personalDetails.phoneCode}
                    onChange={(e) => setPersonalDetails({ ...personalDetails, phoneCode: e.target.value })}
                    className="rounded-2xl border border-white/15 bg-[#16152B] px-3 py-2.5 text-xs text-white outline-none focus:border-[#6A54F4]"
                  >
                    <option value="+91">🇮🇳 +91</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="Enter number"
                    value={personalDetails.phoneNumber}
                    onChange={(e) => setPersonalDetails({ ...personalDetails, phoneNumber: e.target.value })}
                    className="flex-1 rounded-2xl border border-white/15 bg-[#16152B] px-4 py-2.5 text-xs text-white outline-none focus:border-[#6A54F4]"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-t border-white/10">
          <button
            type="button"
            onClick={() => setCurrentStep(13)}
            className="px-6 py-2 rounded-full border border-white/20 text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleSubmitFinal}
            disabled={loading}
            className="px-8 py-3 rounded-full bg-[#6A54F4] hover:bg-[#14a800] text-white font-bold text-sm shadow-md transition-all disabled:opacity-75"
          >
            {loading ? 'Publishing Profile...' : 'Review your profile'}
          </button>
        </footer>
      </div>
    );
  }

  // CONFIRMATION VIEW
  return (
    <main className="min-h-screen w-full bg-black text-white font-sans antialiased flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <Logo size="md" to="/login" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#16152B] rounded-3xl p-8 sm:p-10 border border-white/15 shadow-2xl text-center space-y-6 text-white"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner border border-emerald-500/30">
            <CheckCircle2 size={44} />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-extrabold border border-amber-400/30">
              Pending Admin Approval
            </span>
            <h2 className="text-2xl font-black text-white">Profile Created & Published!</h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              Thank you, <strong className="text-white">{formData.fullName}</strong>. Your profile details have been submitted to FlexiStaff Administrators for verification.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black border border-white/10 text-left text-xs space-y-2.5 max-w-md mx-auto">
            <div className="flex justify-between">
              <span className="text-slate-400">Applicant:</span>
              <span className="font-bold text-white">{formData.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Professional Role:</span>
              <span className="font-bold text-white">{professionalRoleTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Hourly Rate:</span>
              <span className="font-bold text-emerald-400">₹{hourlyRate.toFixed(2)}/hr</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Category:</span>
              <span className="font-bold text-white">{selectedCategory}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Skills:</span>
              <div className="flex flex-wrap gap-1">
                {selectedSkills.map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="px-6 py-3 rounded-xl bg-[#6A54F4] hover:bg-[#14a800] text-white font-bold text-xs sm:text-sm shadow-md transition-colors"
            >
              Return to Login Portal
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default FreelancerApply;
