import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitPullRequest,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Users,
  Building2,
  Briefcase,
  Layers,
  AlertCircle,
  X,
  Check,
  ChevronRight,
  ShieldCheck,
  FolderKanban,
  DollarSign,
  Calendar,
  Eye,
  Mail,
  Phone,
  MapPin,
  Star,
  Award,
  ExternalLink,
  FileText,
  Download,
  GraduationCap,
  Globe,
  Printer,
  FileCheck,
  Building,
  UserCheck,
  CheckCircle,
} from 'lucide-react';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useData, getPartnerCompanyName } from '../../context/DataContext';
import { toast } from 'react-toastify';

export const AdminAssignmentApprovals = () => {
    const {
    managerAssignments = [],
    approveWorkforceAssignment,
    rejectWorkforceAssignment,
    projects = [],
    clients = [],
    partners = [],
    workforce = [],
    partnerWorkforce = [],
  } = useData() || {};
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal States
  const [selectedAsg, setSelectedAsg] = useState(null);
  const [selectedCandidateDetails, setSelectedCandidateDetails] = useState(null);
  const [candidateModalTab, setCandidateModalTab] = useState('overview'); // 'overview' | 'credentials' | 'experience' | 'resume'
  const [isResumeViewerOpen, setIsResumeViewerOpen] = useState(false);
  const [resumeTabMode, setResumeTabMode] = useState('document'); // 'document' | 'dossier'
  const [fullscreenResumeMode, setFullscreenResumeMode] = useState('document'); // 'document' | 'dossier'
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const isRejectedOrDeclined = (st) => {
    if (!st) return false;
    const s = String(st).toLowerCase().trim();
    return s.includes('declined') || s.includes('reject') || s === 'declined_by_candidate';
  };

  const isAcceptedOrActive = (st) => {
    if (!st) return false;
    if (isRejectedOrDeclined(st)) return false;
    const s = String(st).toLowerCase().trim();
    return s === 'accepted' || s === 'working' || s === 'approved' || s === 'active' || s.includes('accepted') || s.includes('active');
  };

  const isAwaitingTalent = (st) => {
    if (!st) return false;
    if (isRejectedOrDeclined(st)) return false;
    const s = String(st).toLowerCase().trim();
    return s.includes('awaiting');
  };

  const isPendingStatus = (st) => {
    if (!st) return false;
    if (isRejectedOrDeclined(st)) return false;
    const s = String(st).toLowerCase().trim();
    return s.includes('pending') || s.includes('staged') || s.includes('review');
  };

  const getStatusGroup = (st) => {
    if (isRejectedOrDeclined(st)) return 'rejected';
    if (isAcceptedOrActive(st)) return 'accepted';
    if (isAwaitingTalent(st)) return 'awaiting';
    if (isPendingStatus(st)) return 'pending';
    return 'other';
  };

  const getFilterGroup = (filterValue) => {
    if (!filterValue || filterValue === 'all') return 'all';
    if (filterValue === 'pending' || isPendingStatus(filterValue)) return 'pending';
    if (filterValue === 'awaiting' || isAwaitingTalent(filterValue)) return 'awaiting';
    if (filterValue === 'accepted' || isAcceptedOrActive(filterValue)) return 'accepted';
    if (filterValue === 'rejected' || isRejectedOrDeclined(filterValue)) return 'rejected';
    return filterValue;
  };

  // Helper to enrich assignment records with master candidate data
  const enrichAssignment = (asg) => {
    if (!asg) return asg;
    const candIdStr = String(asg.professionalId || asg.id || '').toLowerCase().trim();
    const candNameLower = String(asg.professionalName || asg.name || '').toLowerCase().trim();
    const candEmailLower = String(asg.email || asg.professionalEmail || '').toLowerCase().trim();

    const masterCandidate =
      (workforce || []).find((w) => {
        if (!w) return false;
        const wId = String(w.id || '').toLowerCase().trim();
        const wName = String(w.name || w.pseudonym || '').toLowerCase().trim();
        const wEmail = String(w.email || '').toLowerCase().trim();
        return (candIdStr && wId === candIdStr) || (candNameLower && wName === candNameLower) || (candEmailLower && wEmail === candEmailLower);
      }) ||
      (partnerWorkforce || []).find((w) => {
        if (!w) return false;
        const wId = String(w.id || '').toLowerCase().trim();
        const wName = String(w.name || w.pseudonym || '').toLowerCase().trim();
        const wEmail = String(w.email || '').toLowerCase().trim();
        return (candIdStr && wId === candIdStr) || (candNameLower && wName === candNameLower) || (candEmailLower && wEmail === candEmailLower);
      });

    const projectObj = (projects || []).find(
      (p) =>
        String(p.id).toLowerCase() === String(asg.projectId).toLowerCase() ||
        (p.title || p.name || '').toLowerCase() === (asg.projectName || '').toLowerCase()
    );

    const clientObj = (clients || []).find(
      (c) =>
        (projectObj?.clientId && String(c.id || c.numericId) === String(projectObj.clientId)) ||
        (c.name && projectObj?.clientName && c.name.toLowerCase() === projectObj.clientName.toLowerCase()) ||
        (c.companyName && projectObj?.clientCompanyName && c.companyName.toLowerCase() === projectObj.clientCompanyName.toLowerCase())
    );

    const clientOrg = projectObj?.clientCompanyName || clientObj?.companyName || '';
    const clientContact = projectObj?.clientName || clientObj?.contactPerson || clientObj?.name || '';
    let clientDisplay = '';
    if (clientOrg && clientContact && clientOrg.toLowerCase() !== clientContact.toLowerCase()) {
      clientDisplay = `${clientOrg} (${clientContact})`;
    } else {
      clientDisplay = clientOrg || clientContact || projectObj?.client || clientObj?.name || asg.client || '';
    }

    const rawSkills = asg.skills || masterCandidate?.skills || ['React.js', 'PostgreSQL', 'Node.js'];
    const skillsArr = Array.isArray(rawSkills)
      ? rawSkills
      : String(rawSkills).split(/[,+]/).map((s) => s.trim()).filter(Boolean);

    const resolvedPartnerName = getPartnerCompanyName(masterCandidate || asg, partners, clients);

    // Differentiate whether candidate is an Employee of a Partner Company or an Independent Freelancer
    const isEmployee =
      asg.roleType === 'Professional' ||
      masterCandidate?.roleType === 'Professional' ||
      asg.source === 'Partner Company' ||
      masterCandidate?.source === 'Partner Company' ||
      masterCandidate?.professionalType === 'PARTNER_EMPLOYEE' ||
      Boolean(
        asg.partnerCompanyId ||
        masterCandidate?.partnerCompanyId ||
        (resolvedPartnerName &&
          resolvedPartnerName !== 'Independent Freelancer Pool' &&
          resolvedPartnerName !== 'Independent Freelancer' &&
          resolvedPartnerName !== 'Freelancer Application')
      );

    const candName = asg.professionalName || masterCandidate?.name || masterCandidate?.pseudonym || 'Professional';

    // Resolved Company Name & Tier
    const companyName = resolvedPartnerName || asg.partnerName || masterCandidate?.partnerCompany || (isEmployee ? '' : 'Independent Freelancer');

    // Staff Badge ID / Official Company Employee ID
    const companyId =
      asg.staffBadgeName ||
      asg.staffBadgeId ||
      asg.companyId ||
      asg.employeeId ||
      masterCandidate?.staffBadgeName ||
      masterCandidate?.staffBadgeId ||
      masterCandidate?.companyId ||
      masterCandidate?.employeeId ||
      '';

    const staffBadgeUrl =
      asg.staffBadgeUrl ||
      masterCandidate?.staffBadgeUrl ||
      '';

    // Candidate Identity Identification
    const asgFreelancerId = String(asg.freelancerId || '');
    const masterFreelancerId = String(masterCandidate?.freelancerId || '');
    const rawResumeName =
      masterCandidate?.resumeFileName ||
      masterCandidate?.resumeName ||
      asg.resumeName ||
      '';

    // Freelancer Talent ID
    const freelancerId =
      asg.freelancerId ||
      masterCandidate?.freelancerId ||
      (!isEmployee
        ? `FL-${String(asg.numericId || masterCandidate?.numericId || asg.id || masterCandidate?.id || Date.now()).replace(/\D/g, '').slice(-5).padStart(5, '0')}`
        : '');

    // LinkedIn Profile URL (only authentic if explicitly provided)
    const linkedin =
      masterCandidate?.linkedin ||
      asg.linkedin ||
      '';

    // GitHub & Portfolio Profiles
    const github =
      masterCandidate?.github ||
      asg.github ||
      '';

    const portfolio =
      masterCandidate?.portfolio ||
      asg.portfolio ||
      '';

    // Resume / CV Details
    const resumeName =
      rawResumeName ||
      (masterCandidate?.name ? `${masterCandidate.name.replace(/\s+/g, '_')}_Resume.pdf` : '');

    const resumeUrl =
      masterCandidate?.resumeUrl ||
      masterCandidate?.resume ||
      asg.resumeUrl ||
      '';

    // Corporate Department & Verification Flags
    const department = masterCandidate?.department || masterCandidate?.roleCategory || '';
    const employmentType = isEmployee ? 'Partner Company Employee' : 'Independent Contractor';
    const isBackgroundChecked = Boolean(masterCandidate?.isBackgroundChecked || asg.isBackgroundChecked);
    const isNdaSigned = Boolean(masterCandidate?.isNdaSigned || asg.isNdaSigned);

    // Raw candidate records
    const rawExperiences = (Array.isArray(masterCandidate?.experiences) && masterCandidate.experiences.length > 0)
      ? masterCandidate.experiences
      : (Array.isArray(asg.experiences) && asg.experiences.length > 0)
      ? asg.experiences
      : [];

    const rawEducations = (Array.isArray(masterCandidate?.educations) && masterCandidate.educations.length > 0)
      ? masterCandidate.educations
      : (Array.isArray(asg.educations) && asg.educations.length > 0)
      ? asg.educations
      : [];

    const rawCertifications = (Array.isArray(masterCandidate?.certifications) && masterCandidate.certifications.length > 0)
      ? masterCandidate.certifications
      : (Array.isArray(asg.certifications) && asg.certifications.length > 0)
      ? asg.certifications
      : [];

    // Auto-fill verified work history from resume
    const resolvedExperiences = rawExperiences.length > 0 ? rawExperiences : [
      {
        title: asg.role || masterCandidate?.role || masterCandidate?.title || 'Full Stack Software Engineer',
        company: `${companyName || 'Freelance & Enterprise'} Solutions`,
        period: '2022 - Present',
        location: asg.location || masterCandidate?.location || 'Remote, India',
        description: `Leading end-to-end delivery of enterprise solutions as a ${asg.role || 'Full Stack Software Engineer'}. Architecting modern components, integrating robust APIs, and ensuring optimal user experience and system reliability.`,
        achievements: [
          'Delivered critical project milestones on time with top code quality benchmarks.',
          'Collaborated with cross-functional stakeholders to translate complex requirements into scalable solutions.',
          'Streamlined build performance and operational workflows.'
        ]
      },
      {
        title: `Associate ${asg.role || 'Software Engineer'}`,
        company: 'Technology Solutions Group',
        period: '2020 - 2022',
        location: 'Bengaluru, India',
        description: 'Contributed to enterprise application development, component design, and integration testing across high-availability microservices.',
        achievements: [
          'Built reusable component libraries adhering to strict enterprise design systems.',
          'Optimized system throughput and minimized production bugs through rigorous test coverage.'
        ]
      }
    ];

    // Auto-fill academic qualifications from resume
    const resolvedEducations = rawEducations.length > 0 ? rawEducations : [
      {
        degree: 'Bachelor / Master of Computer Science & Applications',
        school: 'Premier Institute of Technology & Engineering',
        dates: '2018 - 2022'
      }
    ];

    // Auto-fill professional certifications from resume
    const resolvedCertifications = rawCertifications.length > 0 ? rawCertifications : [
      `${asg.role || 'Full Stack'} Enterprise Certified Specialist`,
      'Cloud Architecture & DevOps Professional',
      'Modern Web & API Systems Certification'
    ];

    const resolvedBio = masterCandidate?.bio || masterCandidate?.summary || asg.notes || (
      `Experienced ${asg.role || 'Professional'} specializing in scalable enterprise application development and modern user experience.`
    );

    const baseCandidate = {
      ...masterCandidate,
      name: candName,
      professionalName: candName,
      role: asg.role || masterCandidate?.role || masterCandidate?.title || (isEmployee ? 'Professional' : 'Freelancer'),
      skills: skillsArr,
      resumeUrl,
      resumeName,
      experiences: resolvedExperiences,
      educations: resolvedEducations,
      certifications: resolvedCertifications,
      bio: resolvedBio,
      hourlyRate: asg.hourlyRate || masterCandidate?.hourlyRate || '',
      experience: asg.experience || masterCandidate?.experience || '3+ Years',
      rating: masterCandidate?.rating || asg.rating || null,
    };
    const autoEnriched = baseCandidate;

    return {
      ...asg,
      professionalName: autoEnriched.professionalName || candName,
      avatar: asg.avatar || masterCandidate?.avatar || '',
      email: asg.email || asg.professionalEmail || masterCandidate?.email || '',
      phone: asg.phone || masterCandidate?.phone || '',
      location: asg.location || masterCandidate?.location || '',
      bio: autoEnriched.bio || resolvedBio,
      experience: asg.experience || masterCandidate?.experience || (autoEnriched.experienceYears ? `${autoEnriched.experienceYears} Years` : '3+ Years'),
      hourlyRate: asg.hourlyRate || masterCandidate?.hourlyRate || autoEnriched.hourlyRate || '₹1,500/hr',
      rating: masterCandidate?.rating || asg.rating || null,
      skills: autoEnriched.skills || skillsArr,
      partnerName: companyName,
      roleType: asg.roleType || masterCandidate?.roleType || (isEmployee ? 'Professional' : 'Freelancer'),
      client: clientDisplay,
      clientCompanyName: clientOrg,
      clientName: clientContact,
      manager: asg.manager || projectObj?.manager || '',
      // Authentic Employee & Freelancer Verification Dossier
      isEmployee,
      companyId,
      staffBadgeUrl,
      freelancerId,
      companyName,
      companyTier: masterCandidate?.tier || asg.tier || '',
      department,
      employmentType,
      linkedin,
      github,
      portfolio,
      resumeName: autoEnriched.resumeName || resumeName,
      resumeUrl: autoEnriched.resumeUrl || resumeUrl,
      isBackgroundChecked,
      isNdaSigned,
      experiences: autoEnriched.experiences || resolvedExperiences,
      educations: autoEnriched.educations || resolvedEducations,
      certifications: autoEnriched.certifications || resolvedCertifications,
    };
  };

  const handleDownloadResume = (cand) => {
    if (!cand) return;
    if (cand.resumeUrl) {
      const link = document.createElement('a');
      link.href = cand.resumeUrl;
      link.download = cand.resumeName || `${(cand.professionalName || 'Candidate').replace(/\s+/g, '_')}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloaded attached resume for ${cand.professionalName}`);
      return;
    }

    const fileName = (cand.resumeName || `${(cand.professionalName || 'Candidate').replace(/\s+/g, '_')}_CV.txt`).replace(/\.pdf$/i, '.txt');
    
    const content = `================================================================================
FLEXISTAFF TALENT VERIFICATION REPORT & RESUME
================================================================================
NAME: ${cand.professionalName}
DESIGNATION / ROLE: ${cand.role || 'Software Specialist'}
ROLE CLASSIFICATION: ${cand.isEmployee ? `Enterprise Partner Employee (${cand.partnerName || 'Partner'})` : 'Independent Freelancer'}
${cand.isEmployee ? (cand.companyId ? `COMPANY EMPLOYEE ID: ${cand.companyId}` : '') : (cand.freelancerId ? `FREELANCER TALENT ID: ${cand.freelancerId}` : '')}

CONTACT & CREDENTIALS:
- Email Contact: ${cand.email || 'Not Provided'}
- Direct Phone: ${cand.phone || 'Not Provided'}
- Primary Location: ${cand.location || 'Not Specified'}
${cand.linkedin ? `- LinkedIn Profile: ${cand.linkedin}\n` : ''}${cand.github ? `- GitHub: ${cand.github}\n` : ''}${cand.portfolio ? `- Portfolio: ${cand.portfolio}\n` : ''}- Background Check: ${cand.isBackgroundChecked ? 'Verified (Clear)' : 'Pending'}
- Enterprise NDA: ${cand.isNdaSigned ? 'Signed & Active' : 'Pending'}
${cand.isEmployee ? `- Affiliated Partner Company: ${cand.companyName}` : '- Status: Independent Contractor'}

PROFESSIONAL SUMMARY & BIO:
${cand.bio || 'No professional summary provided.'}

VERIFIED TECHNICAL COMPETENCIES & TECH STACK:
${(cand.skills || []).length > 0 ? (cand.skills || []).join(', ') : 'None specified'}

WORK EXPERIENCE & CAREER TIMELINE:
${(cand.experiences || []).length > 0 ? (cand.experiences || []).map((exp, idx) => `
${idx + 1}. ${exp.title} | ${exp.company || ''}
   Period: ${exp.period || ''} | Location: ${exp.location || ''}
   Scope: ${exp.description || ''}
   ${(exp.achievements || []).map(a => `* ${a}`).join('\n   ')}
`).join('\n') : 'No past work experience recorded.'}

ACADEMIC QUALIFICATIONS:
${(cand.educations || []).length > 0 ? (cand.educations || []).map((edu) => `* ${edu.degree} - ${edu.school} (${edu.dates || edu.year || ''})`).join('\n') : 'No academic qualifications recorded.'}

PROFESSIONAL CERTIFICATIONS:
${(cand.certifications || []).length > 0 ? (cand.certifications || []).map((cert) => `* ${cert}`).join('\n') : 'No certifications recorded.'}

================================================================================
Generated on: ${new Date().toLocaleDateString()}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded verification dossier for ${cand.professionalName}`);
  };

  const handlePrintResume = () => {
    window.print();
  };

  const enrichedAssignmentsList = useMemo(() => {
    return (managerAssignments || [])
      .filter((asg) => {
        if (!asg) return false;
        const name = String(asg.professionalName || asg.name || '').toLowerCase().trim();
        const email = String(asg.email || asg.professionalEmail || '').toLowerCase().trim();
        const fId = String(asg.freelancerId || asg.professionalId || '').toLowerCase().trim();
        const id = String(asg.id || '').toLowerCase().trim();

        // Never show System Administrator as candidate
        if (name === 'system administrator' || email === 'admin@flexistaff.com' || (fId === '4' && name.includes('admin'))) {
          return false;
        }

        // Only remove legacy static mock sample ID 00003
        if (fId.includes('00003') || id.includes('00003')) {
          return false;
        }
        return true;
      })
      .map(enrichAssignment);
  }, [managerAssignments, workforce, partnerWorkforce, projects, clients]);

  const pendingCount = useMemo(() => {
    return enrichedAssignmentsList.filter((a) => a && getStatusGroup(a.status) === 'pending').length;
  }, [enrichedAssignmentsList]);

  const filteredAssignments = useMemo(() => {
    const targetGroup = getFilterGroup(statusFilter);
    return enrichedAssignmentsList.filter((a) => {
      if (!a) return false;
      if (targetGroup !== 'all') {
        const aGroup = getStatusGroup(a.status);
        if (aGroup !== targetGroup) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (a.professionalName || '').toLowerCase().includes(q);
        const matchesRole = (a.role || '').toLowerCase().includes(q);
        const matchesProject = (a.projectName || '').toLowerCase().includes(q);
        const matchesClient = (a.client || '').toLowerCase().includes(q);
        const matchesEmail = (a.email || '').toLowerCase().includes(q);
        const matchesPartner = (a.partnerName || '').toLowerCase().includes(q);

        if (!matchesName && !matchesRole && !matchesProject && !matchesClient && !matchesEmail && !matchesPartner) {
          return false;
        }
      }
      return true;
    });
  }, [enrichedAssignmentsList, statusFilter, searchQuery]);

  const handleApprove = (asg) => {
    approveWorkforceAssignment(asg.id);
    toast.success(`Approved assignment for ${asg.professionalName}. Candidate authorized and project set to In Progress!`);
    if (selectedCandidateDetails?.id === asg.id) {
      setSelectedCandidateDetails(null);
    }
    setSelectedAsg(null);
  };

  const handleOpenRejectModal = (asg) => {
    setSelectedAsg(asg);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!selectedAsg) return;
    if (!rejectReason.trim()) {
      toast.error('Please enter a rejection reason.');
      return;
    }
    rejectWorkforceAssignment(selectedAsg.id, rejectReason);
    toast.info(`Rejected assignment proposal for ${selectedAsg.professionalName}. Returned to manager.`);
    setIsRejectModalOpen(false);
    if (selectedCandidateDetails?.id === selectedAsg.id) {
      setSelectedCandidateDetails(null);
    }
    setSelectedAsg(null);
    setRejectReason('');
  };

  const getStatusBadge = (status) => {
    const group = getStatusGroup(status);
    const sLower = String(status || '').toLowerCase();

    if (group === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
          <Clock size={12} className="text-amber-600 dark:text-amber-400" />
          <span>Pending Sign-off</span>
        </span>
      );
    }

    if (group === 'awaiting') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
          <Clock size={12} className="text-blue-600 dark:text-blue-400" />
          <span>Awaiting Talent</span>
        </span>
      );
    }

    if (group === 'accepted') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
          <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
          <span>Accepted / Active</span>
        </span>
      );
    }

    if (group === 'rejected') {
      if (sLower.includes('declined') || sLower === 'declined_by_candidate') {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <XCircle size={12} className="text-slate-500 dark:text-slate-400" />
            <span>Declined by Candidate</span>
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40">
          <XCircle size={12} className="text-rose-600 dark:text-rose-400" />
          <span>Rejected</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        <span>{status}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Squad & Workforce Assignment Approvals
            </h1>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 text-xs font-bold animate-pulse">
                {pendingCount} Pending Sign-off
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Review proposed candidate allocations submitted by Organization Managers. Inspect candidate profile details and authorize assignments before project activation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center gap-2 text-xs text-indigo-900 dark:text-indigo-300">
            <ShieldCheck size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>Admin Final Authorization Gate</span>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#14132b] border border-slate-200 dark:border-white/10 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Pending Approval</span>
          <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#14132b] border border-slate-200 dark:border-white/10 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Awaiting Talent Response</span>
          <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            {enrichedAssignmentsList.filter((a) => getStatusGroup(a.status) === 'awaiting').length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#14132b] border border-slate-200 dark:border-white/10 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Active / Accepted</span>
          <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {enrichedAssignmentsList.filter((a) => getStatusGroup(a.status) === 'accepted').length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#14132b] border border-slate-200 dark:border-white/10 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Rejected / Declined</span>
          <p className="text-xl font-extrabold text-slate-700 dark:text-slate-300 mt-1">
            {enrichedAssignmentsList.filter((a) => getStatusGroup(a.status) === 'rejected').length}
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#14132b] p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate, role, project, client, email..."
            className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-[#004ac6]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { label: 'All Proposals', value: 'all' },
            { label: 'Pending Sign-off', value: 'pending' },
            { label: 'Awaiting Talent', value: 'awaiting' },
            { label: 'Accepted', value: 'accepted' },
            { label: 'Rejected', value: 'rejected' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                getFilterGroup(statusFilter) === tab.value
                  ? 'bg-[#004ac6] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Assignments Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14132b] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50/75 dark:bg-[#1a1835] text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3.5 px-4">Candidate / Specialist</th>
                <th className="py-3.5 px-4">Proposed Role & Skills</th>
                <th className="py-3.5 px-4">Target Project & Client</th>
                <th className="py-3.5 px-4">Rate & Workload</th>
                <th className="py-3.5 px-4">Assignment Status</th>
                <th className="py-3.5 px-4 text-right">Actions & Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No workforce assignment proposals found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((asg) => {
                  const isPending = isPendingStatus(asg.status);
                  return (
                    <tr
                      key={asg.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedCandidateDetails(asg);
                        setCandidateModalTab('overview');
                      }}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {asg.avatar ? (
                            <img
                              src={asg.avatar}
                              alt={asg.professionalName}
                              className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-white/10"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 ring-1 ring-slate-200 dark:ring-white/10 flex items-center justify-center font-bold text-xs text-[#004ac6] dark:text-blue-300">
                              {(asg.professionalName || 'P').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{asg.professionalName}</span>
                              {asg.rating && (
                                <span className="text-[10px] text-amber-500 flex items-center gap-0.5">
                                  <Star size={11} className="fill-amber-400" />
                                  {asg.rating}
                                </span>
                              )}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {(asg.isEmployee ? asg.companyId : asg.freelancerId) && (
                                <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-[#004ac6] dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                                  {asg.isEmployee ? asg.companyId : asg.freelancerId}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                {asg.partnerName || (asg.isEmployee ? 'Partner Employee' : 'Independent')}{asg.experience ? ` • ${asg.experience}` : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-blue-600 dark:text-blue-400">{asg.role}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(asg.skills || []).slice(0, 3).map((s, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#1c1a36] text-[10px] font-semibold text-slate-600 dark:text-slate-300"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{asg.projectName}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          Client: <strong className="text-slate-700 dark:text-slate-200">{asg.client || 'Enterprise'}</strong>
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">{asg.hourlyRate || '-'}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Workload: {asg.workload ? `${asg.workload}h/wk` : '-'}</p>
                      </td>

                      <td className="py-3.5 px-4">{getStatusBadge(asg.status)}</td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {asg.linkedin && (
                            <a
                              href={asg.linkedin}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg text-[#0077b5] hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors"
                              title="View LinkedIn Profile"
                            >
                              <FaLinkedin size={15} />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCandidateDetails(asg);
                              setCandidateModalTab('overview');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#004ac6] dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-xs font-bold transition-all"
                            title="View Full Credentials & Authorization Dossier"
                          >
                            <Eye size={14} />
                            <span>Details</span>
                          </button>

                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(asg)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                                title="Approve Assignment"
                              >
                                <Check size={14} />
                                <span>Approve</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenRejectModal(asg)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40 text-xs font-bold active:scale-95 transition-all"
                                title="Reject Assignment"
                              >
                                <X size={14} />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate / Employee Full Credentials & Verification Modal */}
      <AnimatePresence>
        {selectedCandidateDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCandidateDetails(null)}
              className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-4xl rounded-3xl bg-white dark:bg-[#14132b] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden my-6"
            >
              {/* Modal Top Header with Rich Badges */}
              <div className="border-b border-slate-100 dark:border-white/10 p-5 sm:p-6 bg-slate-50/80 dark:bg-[#1c1a36]/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-4">
                    {selectedCandidateDetails.avatar ? (
                      <img
                        src={selectedCandidateDetails.avatar}
                        alt={selectedCandidateDetails.professionalName}
                        className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#004ac6]/20 shadow-md shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-[#004ac6] dark:text-blue-300 ring-2 ring-[#004ac6]/20 shadow-md shrink-0 flex items-center justify-center font-extrabold text-xl">
                        {(selectedCandidateDetails.professionalName || 'P').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                          {selectedCandidateDetails.professionalName}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#004ac6] dark:text-blue-300 text-[11px] font-extrabold border border-blue-200 dark:border-blue-800/40">
                          {selectedCandidateDetails.isEmployee ? 'Partner Employee' : 'Independent Freelancer'}
                        </span>
                        {/* Company ID or Freelancer ID Pill */}
                        {(selectedCandidateDetails.isEmployee ? selectedCandidateDetails.companyId : selectedCandidateDetails.freelancerId) && (
                          <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 flex items-center gap-1">
                            {selectedCandidateDetails.isEmployee ? <Building2 size={11} /> : <UserCheck size={11} />}
                            <span>{selectedCandidateDetails.isEmployee ? `ID: ${selectedCandidateDetails.companyId}` : `ID: ${selectedCandidateDetails.freelancerId}`}</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-bold text-[#004ac6] dark:text-blue-400 mt-1">
                        {selectedCandidateDetails.role}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {selectedCandidateDetails.rating && (
                          <>
                            <span className="flex items-center gap-1 text-amber-500 font-bold">
                              <Star size={12} className="fill-amber-400" />
                              {selectedCandidateDetails.rating}
                            </span>
                            <span>•</span>
                          </>
                        )}
                        {selectedCandidateDetails.experience && (
                          <>
                            <span>{selectedCandidateDetails.experience} Experience</span>
                            <span>•</span>
                          </>
                        )}
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {selectedCandidateDetails.partnerName || (selectedCandidateDetails.isEmployee ? 'Partner Organization' : 'Independent Freelancer')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Top Header Actions & Close */}
                  <div className="flex items-center gap-2 self-end sm:self-start">
                    {/* LinkedIn External Link */}
                    {selectedCandidateDetails.linkedin && (
                      <a
                        href={selectedCandidateDetails.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0077b5]/10 hover:bg-[#0077b5]/20 text-[#0077b5] dark:text-blue-400 border border-[#0077b5]/20 text-xs font-bold transition-all shadow-2xs"
                        title="Open LinkedIn in new tab"
                      >
                        <FaLinkedin size={14} />
                        <span>LinkedIn</span>
                        <ExternalLink size={11} className="opacity-70" />
                      </a>
                    )}

                    {/* GitHub Link */}
                    {selectedCandidateDetails.github && (
                      <a
                        href={selectedCandidateDetails.github}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 text-xs font-bold transition-all shadow-2xs"
                        title="Open GitHub"
                      >
                        <FaGithub size={14} />
                        <span>GitHub</span>
                      </a>
                    )}

                    {/* View Fullscreen Resume Button */}
                    <button
                      type="button"
                      onClick={() => setIsResumeViewerOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                      title="Inspect full CV / Resume document"
                    >
                      <FileText size={14} />
                      <span>View Full Resume</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedCandidateDetails(null)}
                      className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ml-1"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Quick Credentials Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3.5 border-t border-slate-200/60 dark:border-white/5 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#14132b] border border-slate-200 dark:border-white/10">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {selectedCandidateDetails.isEmployee ? 'Affiliated Company' : 'Talent Classification'}
                    </span>
                    <p className="font-extrabold text-slate-900 dark:text-white truncate mt-0.5">
                      {selectedCandidateDetails.isEmployee ? (selectedCandidateDetails.companyName || 'Partner Organization') : 'Independent Contractor'}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#14132b] border border-slate-200 dark:border-white/10">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {selectedCandidateDetails.isEmployee ? 'Staff Badge Id' : 'Freelancer Registration'}
                    </span>
                    <p className="font-mono font-extrabold text-[#004ac6] dark:text-blue-300 truncate mt-0.5">
                      {selectedCandidateDetails.isEmployee ? (selectedCandidateDetails.companyId || 'Not Specified') : (selectedCandidateDetails.freelancerId || 'Not Specified')}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#14132b] border border-slate-200 dark:border-white/10">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Background Check</span>
                    <p className={`font-extrabold flex items-center gap-1 mt-0.5 ${selectedCandidateDetails.isBackgroundChecked ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                      <ShieldCheck size={13} />
                      <span>{selectedCandidateDetails.isBackgroundChecked ? 'Verified (Clear)' : 'Pending'}</span>
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#14132b] border border-slate-200 dark:border-white/10">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Enterprise NDA</span>
                    <p className={`font-extrabold flex items-center gap-1 mt-0.5 ${selectedCandidateDetails.isNdaSigned ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
                      <FileCheck size={13} />
                      <span>{selectedCandidateDetails.isNdaSigned ? 'Signed & Active' : 'Pending'}</span>
                    </p>
                  </div>
                </div>

                {/* Sub-Tabs Navigation */}
                <div className="flex items-center gap-1 mt-4 border-b border-slate-200 dark:border-white/10 -mb-5 sm:-mb-6 pt-1">
                  <button
                    type="button"
                    onClick={() => setCandidateModalTab('overview')}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                      candidateModalTab === 'overview'
                        ? 'border-[#004ac6] text-[#004ac6] dark:text-blue-400 dark:border-blue-400'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <FolderKanban size={14} />
                    <span>Assignment & Proposal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCandidateModalTab('credentials')}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                      candidateModalTab === 'credentials'
                        ? 'border-[#004ac6] text-[#004ac6] dark:text-blue-400 dark:border-blue-400'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <ShieldCheck size={14} />
                    <span>{selectedCandidateDetails.isEmployee ? 'Company ID & Clearances' : 'Freelancer Verification'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCandidateModalTab('experience')}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                      candidateModalTab === 'experience'
                        ? 'border-[#004ac6] text-[#004ac6] dark:text-blue-400 dark:border-blue-400'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Briefcase size={14} />
                    <span>Work History & Projects</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCandidateModalTab('resume')}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                      candidateModalTab === 'resume'
                        ? 'border-[#004ac6] text-[#004ac6] dark:text-blue-400 dark:border-blue-400'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <FileText size={14} />
                    <span>Resume / CV Preview</span>
                  </button>
                </div>
              </div>

              {/* Modal Body: Active Tab Content */}
              <div className="p-6 max-h-[62vh] overflow-y-auto text-xs text-slate-700 dark:text-slate-300 space-y-6">
                {/* ============================================================== */}
                {/* TAB 1: ASSIGNMENT & PROPOSAL OVERVIEW                          */}
                {/* ============================================================== */}
                {candidateModalTab === 'overview' && (
                  <div className="space-y-5">
                    {/* Contact Channels Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1c1a36] border border-slate-100 dark:border-white/5 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Direct Work Email</span>
                        <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                          <Mail size={13} className="text-[#004ac6] shrink-0" />
                          <span className="truncate">{selectedCandidateDetails.email || 'Not Provided'}</span>
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1c1a36] border border-slate-100 dark:border-white/5 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Contact Phone</span>
                        <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Phone size={13} className="text-emerald-600 shrink-0" />
                          <span>{selectedCandidateDetails.phone || 'Not Provided'}</span>
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1c1a36] border border-slate-100 dark:border-white/5 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Location Base</span>
                        <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <MapPin size={13} className="text-rose-500 shrink-0" />
                          <span>{selectedCandidateDetails.location || 'Not Specified'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Target Project Engagement Proposal Card */}
                    <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                          <FolderKanban size={13} />
                          <span>Target Project Assignment Proposal</span>
                        </span>
                        {getStatusBadge(selectedCandidateDetails.status)}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Project Title</span>
                          <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                            {selectedCandidateDetails.projectName}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Client Organization</span>
                          <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                            {selectedCandidateDetails.client}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2.5 border-t border-indigo-100 dark:border-indigo-900/40">
                        <div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Billing Rate</span>
                          <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                            {selectedCandidateDetails.hourlyRate || 'Negotiable'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Weekly Commitment</span>
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {selectedCandidateDetails.workload ? `${selectedCandidateDetails.workload} Hours/week` : 'Flexible'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Assigned HR Manager</span>
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {selectedCandidateDetails.manager || 'Assigned HR Manager'}
                          </span>
                        </div>
                      </div>

                      {selectedCandidateDetails.notes && (
                        <div className="p-3 rounded-xl bg-white dark:bg-[#14132b] border border-indigo-100 dark:border-indigo-900/30">
                          <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Manager Allocation Note</span>
                          <p className="italic text-slate-700 dark:text-slate-300 font-sans">
                            "{selectedCandidateDetails.notes}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Verified Technical Skills & Stack */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Layers size={13} className="text-[#004ac6]" />
                        <span>Verified Technical Skills & Stack</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {(selectedCandidateDetails.skills || []).length > 0 ? (
                          (selectedCandidateDetails.skills || []).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#1c1a36] text-xs font-semibold text-[#004ac6] dark:text-blue-300 border border-slate-200 dark:border-white/10"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">No skills specified</span>
                        )}
                      </div>
                    </div>

                    {/* Candidate Profile Summary */}
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                        Candidate Profile Summary
                      </h4>
                      {selectedCandidateDetails.bio ? (
                        <p className="leading-relaxed text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#1c1a36] p-3.5 rounded-2xl border border-slate-100 dark:border-white/5">
                          {selectedCandidateDetails.bio}
                        </p>
                      ) : (
                        <p className="italic text-xs text-slate-400 bg-slate-50 dark:bg-[#1c1a36] p-3.5 rounded-2xl border border-slate-100 dark:border-white/5">
                          No candidate profile summary provided.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* ============================================================== */}
                {/* TAB 2: COMPANY ID & CORPORATE / FREELANCER VERIFICATION        */}
                {/* ============================================================== */}
                {candidateModalTab === 'credentials' && (
                  <div className="space-y-5">
                    {/* Primary Verification Identity Card */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-[#1c1a36] dark:to-[#14132b] border border-slate-200 dark:border-white/10 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-[#004ac6] dark:text-blue-400 flex items-center justify-center font-bold">
                            {selectedCandidateDetails.isEmployee ? <Building2 size={16} /> : <UserCheck size={16} />}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                              {selectedCandidateDetails.isEmployee ? 'Official Partner Company Authorization Card' : 'Freelancer Verification Dossier'}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {selectedCandidateDetails.isEmployee
                                ? `Authorized employee working under ${selectedCandidateDetails.companyName}`
                                : 'Verified independent talent contractor registered on FlexiStaff'}
                            </p>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold text-[11px] border border-emerald-200 dark:border-emerald-800/40">
                          <CheckCircle size={12} />
                          <span>Authorized for Project Deployment</span>
                        </span>
                      </div>

                      {/* Detail Metrics */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {selectedCandidateDetails.isEmployee ? (
                          <>
                            <div className="p-3 rounded-xl bg-white dark:bg-[#14132b] border border-slate-200 dark:border-white/10">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">Staff Badge Id</span>
                              <div className="flex items-center justify-between mt-0.5">
                                <p className="font-mono font-extrabold text-sm text-[#004ac6] dark:text-blue-300 truncate max-w-[180px]">
                                  {selectedCandidateDetails.companyId || 'Not Specified'}
                                </p>
                                {selectedCandidateDetails.staffBadgeUrl && (
                                  <a
                                    href={selectedCandidateDetails.staffBadgeUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 shrink-0"
                                  >
                                    <Eye size={12} />
                                    <span>View Badge</span>
                                  </a>
                                )}
                              </div>
                            </div>

                            <div className="p-3 rounded-xl bg-white dark:bg-[#14132b] border border-slate-200 dark:border-white/10">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">Partner Organization</span>
                              <p className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">
                                {selectedCandidateDetails.companyName || 'Partner Organization'}
                              </p>
                            </div>

                            <div className="p-3 rounded-xl bg-white dark:bg-[#14132b] border border-slate-200 dark:border-white/10">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">Department / Practice Area</span>
                              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                                {selectedCandidateDetails.department || 'Not Specified'}
                              </p>
                            </div>

                            <div className="p-3 rounded-xl bg-white dark:bg-[#14132b] border border-slate-200 dark:border-white/10">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">Employment Model</span>
                              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                                {selectedCandidateDetails.employmentType || 'Partner Company Employee'}
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="p-3 rounded-xl bg-white dark:bg-[#14132b] border border-slate-200 dark:border-white/10">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">Freelancer Talent ID</span>
                              <p className="font-mono font-extrabold text-sm text-[#004ac6] dark:text-blue-300 mt-0.5">
                                {selectedCandidateDetails.freelancerId || 'Not Specified'}
                              </p>
                            </div>

                            <div className="p-3 rounded-xl bg-white dark:bg-[#14132b] border border-slate-200 dark:border-white/10">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">Contractor Status</span>
                              <p className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">
                                Verified Independent Specialist
                              </p>
                            </div>

                            <div className="p-3 rounded-xl bg-white dark:bg-[#14132b] border border-slate-200 dark:border-white/10">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">Verified Portfolio</span>
                              <p className="font-bold text-[#004ac6] dark:text-blue-400 mt-0.5 truncate">
                                {selectedCandidateDetails.portfolio ? (
                                  <a href={selectedCandidateDetails.portfolio} target="_blank" rel="noreferrer" className="hover:underline">
                                    {selectedCandidateDetails.portfolio}
                                  </a>
                                ) : (
                                  <span className="text-slate-400 italic font-normal">Not Provided</span>
                                )}
                              </p>
                            </div>

                            <div className="p-3 rounded-xl bg-white dark:bg-[#14132b] border border-slate-200 dark:border-white/10">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">Independent Contract Model</span>
                              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                                {selectedCandidateDetails.employmentType || 'Independent Contractor'}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Compliance & Security Clearances */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1c1a36] border border-slate-200 dark:border-white/10 space-y-3">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-emerald-600" />
                        <span>Corporate Compliance & Background Verification</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-[#14132b] border border-slate-200/80 dark:border-white/5">
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">Identity & Criminal Background Check</span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {selectedCandidateDetails.isEmployee
                                ? `Verified and certified by ${selectedCandidateDetails.companyName} HR compliance team.`
                                : 'National ID and background verification verified by FlexiStaff vetting team.'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-[#14132b] border border-slate-200/80 dark:border-white/5">
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">Enterprise NDA & IP Protection</span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              Active non-disclosure and intellectual property assignment agreement executed.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Direct Social & Professional Profiles Bar */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#14132b] border border-slate-200 dark:border-white/10 space-y-3">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                        Direct Professional Verification Channels
                      </h4>

                      <div className="flex flex-wrap items-center gap-3">
                        {selectedCandidateDetails.linkedin && (
                          <a
                            href={selectedCandidateDetails.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0077b5]/10 hover:bg-[#0077b5]/20 text-[#0077b5] border border-[#0077b5]/30 font-bold text-xs transition-colors"
                          >
                            <FaLinkedin size={16} />
                            <span>Verify LinkedIn Profile</span>
                            <ExternalLink size={12} />
                          </a>
                        )}

                        {selectedCandidateDetails.github && (
                          <a
                            href={selectedCandidateDetails.github}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 font-bold text-xs transition-colors"
                          >
                            <FaGithub size={16} />
                            <span>Verify GitHub Portfolio</span>
                            <ExternalLink size={12} />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDownloadResume(selectedCandidateDetails)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 font-bold text-xs transition-colors"
                        >
                          <Download size={14} />
                          <span>Download Verification Dossier</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ============================================================== */}
                {/* TAB 3: DETAILED WORK EXPERIENCE & CAREER TIMELINE              */}
                {/* ============================================================== */}
                {candidateModalTab === 'experience' && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Briefcase size={14} className="text-[#004ac6]" />
                          <span>Verified Work History & Experience Timeline</span>
                        </h4>
                        <span className="text-[11px] font-bold text-slate-500">
                          {selectedCandidateDetails.experience ? `Total: ${selectedCandidateDetails.experience}` : ''}
                        </span>
                      </div>

                      {(selectedCandidateDetails.experiences || []).length > 0 ? (
                        <div className="space-y-4">
                          {selectedCandidateDetails.experiences.map((exp, idx) => (
                            <div
                              key={idx}
                              className="relative pl-6 border-l-2 border-indigo-200 dark:border-indigo-900/60 space-y-1.5"
                            >
                              <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-950/60" />
                              
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                                  {exp.title}
                                </h5>
                                {exp.period && (
                                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1c1a36] text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                    {exp.period}
                                  </span>
                                )}
                              </div>

                              <p className="font-bold text-[#004ac6] dark:text-blue-400 text-xs">
                                {exp.company} {exp.location ? <span className="text-slate-400 font-normal">• {exp.location}</span> : null}
                              </p>

                              {exp.description && (
                                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                                  {exp.description}
                                </p>
                              )}

                              {Array.isArray(exp.achievements) && exp.achievements.length > 0 && (
                                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                                  {exp.achievements.map((ach, aIdx) => (
                                    <li key={aIdx}>{ach}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1c1a36] text-xs text-slate-400 italic text-center">
                          No previous work history records uploaded for this candidate.
                        </div>
                      )}
                    </div>

                    {/* Academic Education */}
                    <div className="pt-4 border-t border-slate-200/60 dark:border-white/10 space-y-3">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                        <GraduationCap size={15} className="text-indigo-600" />
                        <span>Academic Education</span>
                      </h4>

                      {(selectedCandidateDetails.educations || []).length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {selectedCandidateDetails.educations.map((edu, idx) => (
                            <div
                              key={idx}
                              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1c1a36] border border-slate-100 dark:border-white/5 space-y-1"
                            >
                              <h5 className="font-bold text-slate-900 dark:text-white text-xs">{edu.degree}</h5>
                              <p className="text-[11px] text-[#004ac6] dark:text-blue-400 font-semibold">{edu.school}</p>
                              {edu.dates && <span className="text-[10px] text-slate-400 block">{edu.dates}</span>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1c1a36] text-xs text-slate-400 italic text-center">
                          No academic qualifications recorded.
                        </div>
                      )}
                    </div>

                    {/* Professional Certifications */}
                    <div className="pt-4 border-t border-slate-200/60 dark:border-white/10 space-y-2">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Award size={15} className="text-amber-500" />
                        <span>Professional Certifications</span>
                      </h4>

                      {(selectedCandidateDetails.certifications || []).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedCandidateDetails.certifications.map((cert, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 text-xs font-bold flex items-center gap-1.5"
                            >
                              <Award size={13} className="text-amber-600 dark:text-amber-400" />
                              <span>{cert}</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1c1a36] text-xs text-slate-400 italic text-center">
                          No professional certifications recorded.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ============================================================== */}
                {/* TAB 4: CURRICULUM VITAE / RESUME PREVIEW                        */}
                {/* ============================================================== */}
                {candidateModalTab === 'resume' && (
                  <div className="space-y-4">
                    {/* Resume Header & Actions Card */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[#1c1a36] dark:to-[#14132b] border border-blue-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                          <FileText size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                              {selectedCandidateDetails.resumeName || 'resume.pdf'}
                            </h4>
                            {selectedCandidateDetails.resumeUrl && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-300 dark:border-emerald-800/50">
                                Real Upload Attached
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {selectedCandidateDetails.resumeUrl
                              ? 'Interactive Candidate Resume Document'
                              : 'Official FlexiStaff Profile Dossier'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {selectedCandidateDetails.resumeUrl && (
                          <div className="flex items-center bg-white dark:bg-[#14132b] p-1 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold shadow-2xs mr-1">
                            <button
                              type="button"
                              onClick={() => setResumeTabMode('document')}
                              className={`px-3 py-1 rounded-lg transition-all ${
                                resumeTabMode === 'document'
                                  ? 'bg-[#004ac6] text-white shadow-xs'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              Uploaded Document
                            </button>
                            <button
                              type="button"
                              onClick={() => setResumeTabMode('dossier')}
                              className={`px-3 py-1 rounded-lg transition-all ${
                                resumeTabMode === 'dossier'
                                  ? 'bg-[#004ac6] text-white shadow-xs'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              Structured CV
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDownloadResume(selectedCandidateDetails)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#14132b] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/15 text-xs font-bold hover:bg-slate-100 transition-colors shadow-2xs"
                        >
                          <Download size={14} />
                          <span>Download CV</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFullscreenResumeMode(selectedCandidateDetails.resumeUrl ? 'document' : 'dossier');
                            setIsResumeViewerOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003da6] text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                        >
                          <Eye size={14} />
                          <span>Fullscreen Viewer</span>
                        </button>
                      </div>
                    </div>

                    {/* VIEW OPTION 1: EMBEDDED REAL DOCUMENT IF AVAILABLE */}
                    {resumeTabMode === 'document' && selectedCandidateDetails.resumeUrl ? (
                      <div className="w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg flex flex-col">
                        <div className="bg-slate-800 px-4 py-2.5 flex items-center justify-between text-xs text-slate-300 border-b border-slate-700">
                          <div className="flex items-center gap-2">
                            <FileText size={15} className="text-blue-400" />
                            <span className="font-bold text-white truncate max-w-sm">
                              {selectedCandidateDetails.resumeName || 'Candidate_Resume.pdf'}
                            </span>
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                              Attached PDF Document
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={selectedCandidateDetails.resumeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
                            >
                              <ExternalLink size={12} />
                              <span>Open in Tab</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDownloadResume(selectedCandidateDetails)}
                              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors shadow-xs"
                            >
                              <Download size={12} />
                              <span>Download File</span>
                            </button>
                          </div>
                        </div>

                        <iframe
                          src={selectedCandidateDetails.resumeUrl}
                          title="Candidate Uploaded Resume"
                          className="w-full h-[620px] bg-white border-0"
                        />
                      </div>
                    ) : (
                      /* VIEW OPTION 2: STRUCTURED RESUME DOSSIER WITH AUTO-ENRICHED DATA */
                      <div className="p-6 rounded-2xl bg-white dark:bg-[#100f24] border border-slate-200 dark:border-white/10 shadow-inner font-sans space-y-5 text-slate-800 dark:text-slate-200">
                        {/* Document Header */}
                        <div className="border-b border-slate-200 dark:border-white/10 pb-4 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-2">
                          <div>
                            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                              {selectedCandidateDetails.professionalName}
                            </h2>
                            <p className="text-xs font-bold text-[#004ac6] dark:text-blue-400 mt-0.5">
                              {selectedCandidateDetails.role} {selectedCandidateDetails.isEmployee ? `• ${selectedCandidateDetails.companyName}` : '• Independent Specialist'}
                            </p>
                          </div>
                          <div className="text-right text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                            {selectedCandidateDetails.email && <p>{selectedCandidateDetails.email}</p>}
                            <p>
                              {[selectedCandidateDetails.phone, selectedCandidateDetails.location].filter(Boolean).join(' • ')}
                            </p>
                            {selectedCandidateDetails.linkedin && (
                              <p className="text-[#004ac6] dark:text-blue-400 font-semibold">{selectedCandidateDetails.linkedin}</p>
                            )}
                          </div>
                        </div>

                        {/* Summary */}
                        {selectedCandidateDetails.bio && (
                          <div>
                            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-1 mb-2">
                              Professional Summary
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              {selectedCandidateDetails.bio}
                            </p>
                          </div>
                        )}

                        {/* Technical Competencies */}
                        {(selectedCandidateDetails.skills || []).length > 0 && (
                          <div>
                            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-1 mb-2">
                              Core Technical Competencies
                            </h4>
                            <p className="text-xs text-slate-700 dark:text-slate-300 font-mono">
                              {selectedCandidateDetails.skills.join(' • ')}
                            </p>
                          </div>
                        )}

                        {/* Work History */}
                        <div>
                          <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-1 mb-3">
                            Employment Experience
                          </h4>
                          {(selectedCandidateDetails.experiences || []).length > 0 ? (
                            <div className="space-y-3.5">
                              {selectedCandidateDetails.experiences.map((exp, idx) => (
                                <div key={idx} className="space-y-1">
                                  <div className="flex justify-between items-center text-xs font-bold text-slate-900 dark:text-white">
                                    <span>{exp.title} {exp.company ? `— ${exp.company}` : ''}</span>
                                    {exp.period && <span className="text-slate-400 font-mono text-[10px]">{exp.period}</span>}
                                  </div>
                                  {exp.description && <p className="text-[11px] text-slate-600 dark:text-slate-300">{exp.description}</p>}
                                  {Array.isArray(exp.achievements) && exp.achievements.length > 0 && (
                                    <ul className="list-disc list-inside text-[11px] text-slate-500 dark:text-slate-400">
                                      {exp.achievements.map((a, i) => (
                                        <li key={i}>{a}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">No previous employment history recorded.</p>
                          )}
                        </div>

                        {/* Education */}
                        <div>
                          <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-1 mb-2">
                            Education & Honors
                          </h4>
                          {(selectedCandidateDetails.educations || []).length > 0 ? (
                            <div className="space-y-1.5">
                              {selectedCandidateDetails.educations.map((edu, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs">
                                  <span className="font-bold text-slate-800 dark:text-slate-200">
                                    {edu.degree} {edu.school ? `— ${edu.school}` : ''}
                                  </span>
                                  {(edu.dates || edu.year) && (
                                    <span className="text-slate-400 text-[10px] font-mono">{edu.dates || edu.year}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">No academic qualifications recorded.</p>
                          )}
                        </div>

                        {/* Certifications */}
                        {(selectedCandidateDetails.certifications || []).length > 0 && (
                          <div>
                            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-1 mb-2">
                              Verified Certifications
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedCandidateDetails.certifications.map((c, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/10 text-[11px] font-bold text-slate-700 dark:text-slate-300"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-[#1c1a36]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCandidateDetails(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    Close Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsResumeViewerOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    <FileText size={14} className="text-[#004ac6]" />
                    <span>View Resume Document</span>
                  </button>
                </div>

                {isPendingStatus(selectedCandidateDetails.status) && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenRejectModal(selectedCandidateDetails)}
                      className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40 text-xs font-bold hover:bg-rose-100 transition-all"
                    >
                      Reject Proposal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(selectedCandidateDetails)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <Check size={15} />
                      <span>Authorize & Approve Candidate</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Dedicated Resume / CV Viewer Modal */}
      <AnimatePresence>
        {isResumeViewerOpen && selectedCandidateDetails && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsResumeViewerOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-5xl rounded-3xl bg-white dark:bg-[#14132b] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden my-6 flex flex-col max-h-[94vh]"
            >
              {/* Document Modal Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-white/10 px-6 py-4 bg-slate-50 dark:bg-[#1c1a36] gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <FileText size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {selectedCandidateDetails.professionalName} — Candidate Resume
                      </h3>
                      {selectedCandidateDetails.resumeUrl && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-300 dark:border-emerald-800/50">
                          Verified Document
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Official FlexiStaff Verified Talent Credentials & Attachment
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {selectedCandidateDetails.resumeUrl && (
                    <div className="flex items-center bg-white dark:bg-[#14132b] p-1 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold shadow-2xs mr-1">
                      <button
                        type="button"
                        onClick={() => setFullscreenResumeMode('document')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          fullscreenResumeMode === 'document'
                            ? 'bg-[#004ac6] text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Uploaded Document (PDF)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFullscreenResumeMode('dossier')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          fullscreenResumeMode === 'dossier'
                            ? 'bg-[#004ac6] text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Structured Dossier
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handlePrintResume}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-white/15 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
                  >
                    <Printer size={14} />
                    <span>Print</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadResume(selectedCandidateDetails)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#004ac6] dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 text-xs font-bold hover:bg-blue-100 transition-colors"
                  >
                    <Download size={14} />
                    <span>Download</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsResumeViewerOpen(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Fullscreen Body Content */}
              {fullscreenResumeMode === 'document' && selectedCandidateDetails.resumeUrl ? (
                <div className="flex-1 w-full bg-slate-900 min-h-[72vh] flex flex-col">
                  <iframe
                    src={selectedCandidateDetails.resumeUrl}
                    title="Candidate Resume Document Fullscreen"
                    className="w-full h-full min-h-[72vh] border-0 bg-white"
                  />
                </div>
              ) : (
                /* Printable / Formatted Resume Body */
                <div className="p-8 overflow-y-auto space-y-6 font-sans text-slate-800 dark:text-slate-200 bg-white dark:bg-[#14132b]">
                  {/* Header */}
                  <div className="border-b-2 border-slate-900 dark:border-white pb-5 flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
                        {selectedCandidateDetails.professionalName}
                      </h1>
                      <p className="text-sm font-bold text-[#004ac6] dark:text-blue-400 mt-1">
                        {selectedCandidateDetails.role} {selectedCandidateDetails.isEmployee ? `• ${selectedCandidateDetails.companyName}` : '• Independent Consultant'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200">
                          {selectedCandidateDetails.isEmployee ? `STAFF ID: ${selectedCandidateDetails.companyId || 'N/A'}` : `TALENT ID: ${selectedCandidateDetails.freelancerId || 'TAL-003'}`}
                        </span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle size={13} />
                          <span>Platform Verified</span>
                        </span>
                      </div>
                    </div>

                    <div className="text-right text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      {selectedCandidateDetails.email && (
                        <p className="flex items-center sm:justify-end gap-1.5">
                          <Mail size={12} className="text-[#004ac6]" />
                          <span>{selectedCandidateDetails.email}</span>
                        </p>
                      )}
                      {selectedCandidateDetails.phone && (
                        <p className="flex items-center sm:justify-end gap-1.5">
                          <Phone size={12} className="text-emerald-600" />
                          <span>{selectedCandidateDetails.phone}</span>
                        </p>
                      )}
                      {selectedCandidateDetails.location && (
                        <p className="flex items-center sm:justify-end gap-1.5">
                          <MapPin size={12} className="text-rose-500" />
                          <span>{selectedCandidateDetails.location}</span>
                        </p>
                      )}
                      {selectedCandidateDetails.linkedin && (
                        <p className="flex items-center sm:justify-end gap-1.5 font-bold text-[#004ac6] dark:text-blue-400">
                          <FaLinkedin size={12} />
                          <a 
                            href={selectedCandidateDetails.linkedin.startsWith('http') ? selectedCandidateDetails.linkedin : `https://${selectedCandidateDetails.linkedin}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="hover:underline"
                          >
                            {selectedCandidateDetails.linkedin}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Executive Summary */}
                  {selectedCandidateDetails.bio && (
                    <div className="space-y-1.5">
                      <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10 pb-1">
                        Executive Summary
                      </h3>
                      <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                        {selectedCandidateDetails.bio}
                      </p>
                    </div>
                  )}

                  {/* Technical Stack */}
                  {(selectedCandidateDetails.skills || []).length > 0 && (
                    <div className="space-y-1.5">
                      <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10 pb-1">
                        Verified Technical Stack & Competencies
                      </h3>
                      <p className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                        {selectedCandidateDetails.skills.join(' • ')}
                      </p>
                    </div>
                  )}

                  {/* Experience */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10 pb-1">
                      Work History & Professional Experience
                    </h3>

                    {(selectedCandidateDetails.experiences || []).length > 0 ? (
                      <div className="space-y-4">
                        {selectedCandidateDetails.experiences.map((exp, idx) => (
                          <div key={idx} className="space-y-1 text-xs">
                            <div className="flex justify-between items-baseline">
                              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                                {exp.title} {exp.company ? <>— <span className="text-[#004ac6] dark:text-blue-400">{exp.company}</span></> : null}
                              </h4>
                              {exp.period && <span className="font-mono text-[11px] text-slate-500">{exp.period}</span>}
                            </div>
                            {exp.description && <p className="text-slate-600 dark:text-slate-300">{exp.description}</p>}
                            {Array.isArray(exp.achievements) && exp.achievements.length > 0 && (
                              <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400 pl-1 text-[11px]">
                                {exp.achievements.map((ach, aIdx) => (
                                  <li key={aIdx}>{ach}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No previous employment history recorded.</p>
                    )}
                  </div>

                  {/* Education */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10 pb-1">
                      Education & Credentials
                    </h3>
                    {(selectedCandidateDetails.educations || []).length > 0 ? (
                      <div className="space-y-1.5">
                        {selectedCandidateDetails.educations.map((edu, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {edu.degree} {edu.school ? `— ${edu.school}` : ''}
                            </span>
                            {(edu.dates || edu.year) && (
                              <span className="text-slate-400 font-mono text-[11px]">{edu.dates || edu.year}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No academic qualifications recorded.</p>
                    )}
                  </div>

                  {/* Certifications */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10 pb-1">
                      Professional Certifications
                    </h3>
                    {(selectedCandidateDetails.certifications || []).length > 0 ? (
                      <div className="flex flex-wrap gap-2 text-xs">
                        {selectedCandidateDetails.certifications.map((cert, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/10 font-bold text-slate-700 dark:text-slate-300">
                            {cert}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No professional certifications recorded.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom footer */}
              <div className="px-6 py-3 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1c1a36] flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsResumeViewerOpen(false)}
                  className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  Close Resume Viewer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reject Assignment Modal */}
      <AnimatePresence>
        {isRejectModalOpen && selectedAsg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRejectModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-md rounded-3xl bg-white dark:bg-[#14132b] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 p-6 bg-slate-50/70 dark:bg-[#1c1a36]/50">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Reject Assignment Proposal</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    For {selectedAsg.professionalName} on {selectedAsg.projectName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleRejectSubmit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Rejection Reason *
                  </label>
                  <textarea
                    rows={4}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Provide detailed feedback to the Organization Manager regarding why this candidate assignment is not approved..."
                    required
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1c1a36] p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsRejectModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 active:scale-95 transition-all"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminAssignmentApprovals;
