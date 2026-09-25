import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  Edit3,
  Calendar,
  CheckCircle2,
  Award,
  Users,
  X,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';

// --- INLINE REUSABLE COMPONENTS ---
const StatusBadge = ({ status = 'Active', size = 'md' }) => {
  const normalized = String(status).toLowerCase().trim();
  let bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (['pending', 'in review'].includes(normalized)) {
    bg = 'bg-amber-50 text-amber-700 border-amber-200';
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${bg}`}>
      <CheckCircle2 size={12} />
      <span>{status}</span>
    </span>
  );
};

const Modal = ({ isOpen = false, onClose, title, subtitle, children, maxWidth = 'max-w-2xl', showCloseButton = true }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
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
            transition={{ duration: 0.2 }}
            className={`relative z-10 w-full ${maxWidth} rounded-2xl bg-white dark:bg-[#14132b] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden my-8`}
          >
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-white/10 px-6 py-4 bg-slate-50/50 dark:bg-[#1c1a36]">
                <div>
                  {title && <h3 className="text-base font-bold text-[#191b23] dark:text-white">{title}</h3>}
                  {subtitle && <p className="mt-0.5 text-xs text-[#737686] dark:text-slate-400">{subtitle}</p>}
                </div>
                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/10 hover:text-[#191b23] dark:hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}
            <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const FormInput = ({ label, name, type = 'text', placeholder, register, error, required = false, options = [], rows = 3, helperText, className = '', disabled = false, ...rest }) => {
  const isError = Boolean(error);
  const inputBaseClasses = `w-full rounded-lg border text-xs md:text-sm text-[#191b23] dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all outline-none ${
    isError
      ? 'border-rose-400 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
      : 'border-[#c3c6d7] dark:border-white/10 bg-white dark:bg-[#1c1a36] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15'
  } ${disabled ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : ''}`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="flex items-center justify-between text-xs font-semibold text-[#434655] dark:text-slate-300">
          <span>
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </span>
          {helperText && !isError && <span className="text-[11px] font-normal text-slate-400">{helperText}</span>}
        </label>
      )}
      <div className="relative">
        {type === 'select' ? (
          <select {...(register ? register(name) : {})} disabled={disabled} className={`${inputBaseClasses} px-3 py-2.5 bg-white dark:bg-[#1c1a36]`} {...rest}>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#1c1a36] text-[#191b23] dark:text-white">{opt.label}</option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea {...(register ? register(name) : {})} rows={rows} disabled={disabled} placeholder={placeholder} className={`${inputBaseClasses} p-3 resize-none`} {...rest} />
        ) : (
          <input type={type} {...(register ? register(name) : {})} disabled={disabled} placeholder={placeholder} className={`${inputBaseClasses} px-3 py-2.5`} {...rest} />
        )}
      </div>
      {isError && (
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-rose-600">
          <AlertCircle size={13} className="shrink-0" />
          <span>{error.message || error}</span>
        </div>
      )}
    </div>
  );
};

const companySchema = yup.object().shape({
  name: yup.string().required('Company name is required'),
  legalName: yup.string().required('Legal entity name is required'),
  registrationNumber: yup.string().required('Registration number is required'),
  taxId: yup.string().required('Tax ID / EIN is required'),
  industry: yup.string().required('Industry is required'),
  employeeCount: yup.string().required('Employee range is required'),
  email: yup.string().email('Enter valid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  website: yup.string().url('Enter valid URL').required('Website is required'),
  overview: yup.string().required('Overview is required').min(20, 'Provide a comprehensive overview'),
  address: yup.string().required('Street address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  postalCode: yup.string().required('Postal code is required'),
  country: yup.string().required('Country is required'),
});

export const CompanyManagement = () => {
  const { companyProfile } = useData();

  return (
    <div className="space-y-6">
      {/* Header Profile Card */}
      <div className="rounded-2xl border border-[#c3c6d7]/70 dark:border-white/10 bg-white dark:bg-[#14132b] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#004ac6] to-[#2563eb] text-white shadow-lg shadow-[#004ac6]/20">
              <Building2 size={36} />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-[#191b23] dark:text-white tracking-tight">
                  {companyProfile.name || 'FlexiStaff Enterprise Platform'}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#565e74] dark:text-slate-300 mt-0.5 font-medium">
                Legal Entity: <span className="text-[#191b23] dark:text-white">{companyProfile.legalName || 'FlexiStaff Solutions LLC'}</span>
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#737686] dark:text-slate-400">
                <span>Founded 2026</span>
                <span>•</span>
                <span>{companyProfile.industry || 'Enterprise Workforce Management'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Details, Compliance, Addresses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Overview & Registration Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Overview */}
          <div className="rounded-2xl border border-[#c3c6d7]/70 dark:border-white/10 bg-white dark:bg-[#14132b] p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#191b23] dark:text-white tracking-tight mb-3">
              About & Enterprise Mission
            </h3>
            <p className="text-xs sm:text-sm text-[#434655] dark:text-slate-300 leading-relaxed">
              {companyProfile.overview || 'FlexiStaff AI is a next-generation enterprise staffing and workforce management platform, enabling seamless talent deployment, automated project tracking, and AI-driven skill matching across global enterprises.'}
            </p>
          </div>

          {/* Registration & Legal Identifiers */}
          <div className="rounded-2xl border border-[#c3c6d7]/70 dark:border-white/10 bg-white dark:bg-[#14132b] p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#191b23] dark:text-white tracking-tight mb-4">
              Corporate Registration & Tax Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl bg-slate-50 dark:bg-[#1c1a36] p-4 border border-slate-100 dark:border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#737686] dark:text-slate-400">
                  Registration Number
                </span>
                <p className="mt-1 font-mono font-bold text-sm text-[#191b23] dark:text-white">
                  {companyProfile.registrationNumber || 'REG-2026-889412'}
                </p>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">
                  ✓ Verified Corporate Entity
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-[#1c1a36] p-4 border border-slate-100 dark:border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#737686] dark:text-slate-400">
                  Federal Tax ID / EIN
                </span>
                <p className="mt-1 font-mono font-bold text-sm text-[#191b23] dark:text-white">
                  {companyProfile.taxId || 'XX-XXX4910'}
                </p>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">
                  ✓ Good Standing
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-[#1c1a36] p-4 border border-slate-100 dark:border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#737686] dark:text-slate-400">
                  Corporate Structure
                </span>
                <p className="mt-1 font-semibold text-sm text-[#191b23] dark:text-white">
                  {companyProfile.companyType || 'Enterprise LLC'}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-[#1c1a36] p-4 border border-slate-100 dark:border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#737686] dark:text-slate-400">
                  Workforce Size
                </span>
                <p className="mt-1 font-semibold text-sm text-[#191b23] dark:text-white">
                  {companyProfile.employeeCount && companyProfile.employeeCount !== '0' ? companyProfile.employeeCount : '500+ Professionals'}
                </p>
              </div>
            </div>
          </div>

          {/* Security & Regulatory Compliance */}
          <div className="rounded-2xl border border-[#c3c6d7]/70 dark:border-white/10 bg-white dark:bg-[#14132b] p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#191b23] dark:text-white tracking-tight mb-4">
              Security Standards & Compliance
            </h3>

            <div className="space-y-3">
              {(companyProfile.certifications && companyProfile.certifications.length > 0
                ? companyProfile.certifications
                : [
                    { name: 'ISO 27001 Security Standard', verifiedDate: 'Jan 2026', status: 'Active' },
                    { name: 'SOC 2 Type II Compliance', verifiedDate: 'Feb 2026', status: 'Active' },
                    { name: 'GDPR Data Protection Certified', verifiedDate: 'Mar 2026', status: 'Active' },
                  ]
              ).map((cert, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-[#1c1a36] p-3.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#191b23] dark:text-white">{cert.name}</h4>
                      <p className="text-[11px] text-[#737686] dark:text-slate-400">Audit verified: {cert.verifiedDate}</p>
                    </div>
                  </div>
                  <StatusBadge status={cert.status} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Contact & Addresses */}
        <div className="space-y-6">
          {/* Contact Details */}
          <div className="rounded-2xl border border-[#c3c6d7]/70 dark:border-white/10 bg-white dark:bg-[#14132b] p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#191b23] dark:text-white tracking-tight mb-4">
              Contact Channels
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#004ac6] dark:text-blue-400">
                  <Mail size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-[#737686] dark:text-slate-400 uppercase font-bold">Email</span>
                  <p className="font-semibold text-[#191b23] dark:text-white truncate">
                    {companyProfile.email || 'contact@flexistaff.ai'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#004ac6] dark:text-blue-400">
                  <Phone size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-[#737686] dark:text-slate-400 uppercase font-bold">Phone</span>
                  <p className="font-semibold text-[#191b23] dark:text-white">
                    {companyProfile.phone || '+1 (800) 555-0199'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#004ac6] dark:text-blue-400">
                  <Globe size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-[#737686] dark:text-slate-400 uppercase font-bold">Website</span>
                  <a
                    href={companyProfile.website || 'https://flexistaff.ai'}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-[#2563eb] dark:text-blue-400 hover:underline block truncate"
                  >
                    {companyProfile.website || 'https://flexistaff.ai'}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Headquarters Location */}
          <div className="rounded-2xl border border-[#c3c6d7]/70 dark:border-white/10 bg-white dark:bg-[#14132b] p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#191b23] dark:text-white tracking-tight mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-[#004ac6] dark:text-blue-400" />
              <span>Global Headquarters</span>
            </h3>

            <div className="rounded-xl bg-slate-50 dark:bg-[#1c1a36] p-4 border border-slate-100 dark:border-white/10 text-xs space-y-1">
              <p className="font-semibold text-[#191b23] dark:text-white">
                {companyProfile.headquarters?.address || '100 Enterprise Way, Suite 500'}
              </p>
              <p className="text-[#565e74] dark:text-slate-300">
                {companyProfile.headquarters?.city || 'San Francisco'}, {companyProfile.headquarters?.state || 'CA'}{' '}
                {companyProfile.headquarters?.postalCode || '94105'}
              </p>
              <p className="text-[#737686] dark:text-slate-400 font-medium">
                {companyProfile.headquarters?.country || 'United States'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyManagement;
