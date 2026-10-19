import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Building2,
  User,
  Star,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  Sparkles,
  X,
  ShieldCheck,
  Award,
  Globe,
  Link2,
  MapPin,
  DollarSign,
  Mail,
  Phone,
  FileText,
  Download,
  ExternalLink,
} from 'lucide-react';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import StatusBadge from './StatusBadge';
import { useData, getPartnerCompanyName } from '../../context/DataContext';

export const WorkforceProfile = ({ isOpen = false, onClose, candidate }) => {
  const { partners = [], clients = [] } = useData() || {};
  if (!isOpen || !candidate) return null;

  const resolvedPartnerName = getPartnerCompanyName(candidate, partners, clients);

  const isProfessional =
    candidate.roleType === 'Professional' ||
    candidate.source === 'Partner Company' ||
    Boolean(candidate.partnerCompanyId || candidate.partnerCompany || candidate.partner || resolvedPartnerName);

  const partnerName = resolvedPartnerName || candidate.partnerCompany || candidate.partner || candidate.partnerName;

  const skillsList = Array.isArray(candidate.skills)
    ? candidate.skills
    : String(candidate.skills || '')
        .split(/[,+]/)
        .map((s) => s.trim())
        .filter(Boolean);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative z-10 w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 p-6 bg-slate-50/70">
            <div className="flex items-start gap-4">
              <img
                src={
                  candidate.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
                }
                alt={candidate.name || candidate.pseudonym}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white shadow-sm"
              />
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {candidate.name || candidate.pseudonym}
                </h3>
                <p className="text-xs font-bold text-blue-600">{candidate.role || candidate.title}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  {isProfessional ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                      <Building2 size={11} />
                      <span>{partnerName || 'Partner Specialist'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-100">
                      <User size={11} />
                      <span>Independent Freelancer</span>
                    </span>
                  )}
                  <StatusBadge status={candidate.availability || 'Available'} size="sm" />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[70vh] overflow-y-auto">
            {/* Bio */}
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Executive Summary</h4>
              <p className="text-slate-600 leading-relaxed">
                {candidate.bio ||
                  `Dedicated technical specialist with proven proficiency in enterprise delivery and scalable architecture.`}
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Experience</span>
                <span className="block font-black text-slate-900 text-sm mt-0.5">{candidate.experience || '4+ Years'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Billing Rate</span>
                <span className="block font-black text-slate-900 text-sm mt-0.5">{candidate.hourlyRate || '$95/hr'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Workload</span>
                <span className="block font-black text-emerald-600 text-sm mt-0.5">{candidate.workload || 0}%</span>
              </div>
            </div>

            {/* Contact & Location Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              {candidate.email && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail size={13} className="text-slate-400 shrink-0" />
                  <a href={`mailto:${candidate.email}`} className="text-[11px] font-medium hover:text-blue-600 truncate">
                    {candidate.email}
                  </a>
                </div>
              )}
              {candidate.phone && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone size={13} className="text-slate-400 shrink-0" />
                  <a href={`tel:${candidate.phone}`} className="text-[11px] font-medium hover:text-blue-600">
                    {candidate.phone}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-600 sm:col-span-2">
                <MapPin size={13} className="text-slate-400 shrink-0" />
                <span className="text-[11px] font-medium">{candidate.location || 'Remote / Global'}</span>
              </div>
            </div>

            {/* Verified Credentials & Documents */}
            {(candidate.linkedin || candidate.portfolioUrl || candidate.github || candidate.staffBadgeId || candidate.badgeDocumentUrl || candidate.resumeUrl || candidate.resumeName) && (
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-purple-600" />
                  <span>Credentials & Professional Links</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* LinkedIn */}
                  {(candidate.linkedin || candidate.portfolioUrl) && (
                    <a
                      href={(candidate.linkedin || candidate.portfolioUrl).startsWith('http') ? (candidate.linkedin || candidate.portfolioUrl) : `https://${candidate.linkedin || candidate.portfolioUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 transition-colors text-blue-700 font-bold text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        <FaLinkedin size={15} />
                        <span>LinkedIn Profile</span>
                      </div>
                      <ExternalLink size={12} />
                    </a>
                  )}

                  {/* GitHub */}
                  {candidate.github && (
                    <a
                      href={candidate.github.startsWith('http') ? candidate.github : `https://${candidate.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-slate-800 font-bold text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        <FaGithub size={15} />
                        <span>GitHub Profile</span>
                      </div>
                      <ExternalLink size={12} />
                    </a>
                  )}

                  {/* Staff Badge ID */}
                  {(candidate.staffBadgeId || candidate.companyId || candidate.employeeId || candidate.badgeDocumentUrl) && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-purple-200 bg-purple-50/50 text-purple-900 font-bold text-[11px]">
                      <div className="flex items-center gap-2 truncate">
                        <Building2 size={14} className="text-purple-600 shrink-0" />
                        <span className="truncate">Badge: {candidate.staffBadgeId || candidate.companyId || candidate.employeeId || 'Verified'}</span>
                      </div>
                      {candidate.badgeDocumentUrl && (
                        <a
                          href={candidate.badgeDocumentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-purple-700 underline font-mono shrink-0 ml-1"
                        >
                          View
                        </a>
                      )}
                    </div>
                  )}

                  {/* Resume / CV */}
                  {(candidate.resumeUrl || candidate.resumeName) && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 text-emerald-900 font-bold text-[11px]">
                      <div className="flex items-center gap-2 truncate">
                        <FileText size={14} className="text-emerald-600 shrink-0" />
                        <span className="truncate">{candidate.resumeName || 'Resume / CV'}</span>
                      </div>
                      {candidate.resumeUrl && (
                        <a
                          href={candidate.resumeUrl}
                          download={candidate.resumeName || 'Resume.pdf'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-mono shrink-0 ml-1 hover:underline"
                        >
                          <Download size={11} />
                          <span>Get</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Certifications if available */}
            {candidate.certifications && (
              <div>
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Award size={14} className="text-amber-500" />
                  <span>Certifications & Accreditations</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(candidate.certifications)
                    ? candidate.certifications
                    : String(candidate.certifications).split(/[,+]/)
                  ).map((cert, cidx) => (
                    <span
                      key={cidx}
                      className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-medium text-[11px]"
                    >
                      {String(cert).trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2">Technical Competencies & Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {skillsList.map((sk, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-[11px]"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Compliance Badge */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-[11px] text-slate-600">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <span>
                Enterprise Background Verified & NDA Compliant under FlexiStaff Global SLA.
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WorkforceProfile;
