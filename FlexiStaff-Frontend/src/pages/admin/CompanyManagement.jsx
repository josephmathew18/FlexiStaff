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
            className={`relative z-10 w-full ${maxWidth} rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8`}
          >
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
                <div>
                  {title && <h3 className="text-base font-bold text-[#191b23]">{title}</h3>}
                  {subtitle && <p className="mt-0.5 text-xs text-[#737686]">{subtitle}</p>}
                </div>
                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-[#191b23] transition-colors"
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
  const inputBaseClasses = `w-full rounded-lg border text-xs md:text-sm text-[#191b23] placeholder-slate-400 transition-all outline-none ${
    isError
      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
      : 'border-[#c3c6d7] bg-white focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15'
  } ${disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="flex items-center justify-between text-xs font-semibold text-[#434655]">
          <span>
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </span>
          {helperText && !isError && <span className="text-[11px] font-normal text-slate-400">{helperText}</span>}
        </label>
      )}
      <div className="relative">
        {type === 'select' ? (
          <select {...(register ? register(name) : {})} disabled={disabled} className={`${inputBaseClasses} px-3 py-2.5 bg-white`} {...rest}>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
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
  const { companyProfile, updateCompanyProfile } = useData();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(companySchema),
    defaultValues: {
      name: companyProfile.name,
      legalName: companyProfile.legalName,
      registrationNumber: companyProfile.registrationNumber,
      taxId: companyProfile.taxId,
      industry: companyProfile.industry,
      employeeCount: companyProfile.employeeCount,
      email: companyProfile.email,
      phone: companyProfile.phone,
      website: companyProfile.website,
      overview: companyProfile.overview,
      address: companyProfile.headquarters.address,
      city: companyProfile.headquarters.city,
      state: companyProfile.headquarters.state,
      postalCode: companyProfile.headquarters.postalCode,
      country: companyProfile.headquarters.country,
    },
  });

  const onEditSubmit = (data) => {
    updateCompanyProfile({
      name: data.name,
      legalName: data.legalName,
      registrationNumber: data.registrationNumber,
      taxId: data.taxId,
      industry: data.industry,
      employeeCount: data.employeeCount,
      email: data.email,
      phone: data.phone,
      website: data.website,
      overview: data.overview,
      headquarters: {
        address: data.address,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
      },
    });

    toast.success('Company profile updated successfully!');
    setIsEditModalOpen(false);
  };

  const handleOpenModal = () => {
    reset({
      name: companyProfile.name,
      legalName: companyProfile.legalName,
      registrationNumber: companyProfile.registrationNumber,
      taxId: companyProfile.taxId,
      industry: companyProfile.industry,
      employeeCount: companyProfile.employeeCount,
      email: companyProfile.email,
      phone: companyProfile.phone,
      website: companyProfile.website,
      overview: companyProfile.overview,
      address: companyProfile.headquarters.address,
      city: companyProfile.headquarters.city,
      state: companyProfile.headquarters.state,
      postalCode: companyProfile.headquarters.postalCode,
      country: companyProfile.headquarters.country,
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Profile Card */}
      <div className="rounded-2xl border border-[#c3c6d7]/70 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#004ac6] to-[#2563eb] text-white shadow-lg shadow-[#004ac6]/20">
              <Building2 size={36} />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-[#191b23] tracking-tight">
                  {companyProfile.name}
                </h2>
                <StatusBadge status={companyProfile.status} size="sm" />
              </div>
              <p className="text-xs sm:text-sm text-[#565e74] mt-0.5 font-medium">
                Legal Entity: <span className="text-[#191b23]">{companyProfile.legalName}</span>
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#737686]">
                <span>Founded {companyProfile.founded}</span>
                <span>•</span>
                <span>{companyProfile.industry}</span>
                <span>•</span>
                <span>{companyProfile.employeeCount}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#1d4ed8] active:scale-95 transition-all"
          >
            <Edit3 size={15} />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Grid: Details, Compliance, Addresses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Overview & Registration Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Overview */}
          <div className="rounded-2xl border border-[#c3c6d7]/70 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#191b23] tracking-tight mb-3">
              About & Enterprise Mission
            </h3>
            <p className="text-xs sm:text-sm text-[#434655] leading-relaxed">
              {companyProfile.overview}
            </p>
          </div>

          {/* Registration & Legal Identifiers */}
          <div className="rounded-2xl border border-[#c3c6d7]/70 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#191b23] tracking-tight mb-4">
              Corporate Registration & Tax Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#737686]">
                  Registration Number
                </span>
                <p className="mt-1 font-mono font-bold text-sm text-[#191b23]">
                  {companyProfile.registrationNumber}
                </p>
                <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
                  ✓ Verified Corporate Entity
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#737686]">
                  Federal Tax ID / EIN
                </span>
                <p className="mt-1 font-mono font-bold text-sm text-[#191b23]">
                  {companyProfile.taxId}
                </p>
                <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
                  ✓ Good Standing
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#737686]">
                  Corporate Structure
                </span>
                <p className="mt-1 font-semibold text-sm text-[#191b23]">
                  {companyProfile.companyType}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#737686]">
                  Workforce Size
                </span>
                <p className="mt-1 font-semibold text-sm text-[#191b23]">
                  {companyProfile.employeeCount}
                </p>
              </div>
            </div>
          </div>

          {/* Security & Regulatory Compliance */}
          <div className="rounded-2xl border border-[#c3c6d7]/70 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#191b23] tracking-tight mb-4">
              Security Standards & Compliance
            </h3>

            <div className="space-y-3">
              {companyProfile.certifications.map((cert, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#191b23]">{cert.name}</h4>
                      <p className="text-[11px] text-[#737686]">Audit verified: {cert.verifiedDate}</p>
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
          <div className="rounded-2xl border border-[#c3c6d7]/70 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#191b23] tracking-tight mb-4">
              Contact Channels
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#004ac6]">
                  <Mail size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-[#737686] uppercase font-bold">Email</span>
                  <p className="font-semibold text-[#191b23] truncate">{companyProfile.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#004ac6]">
                  <Phone size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-[#737686] uppercase font-bold">Phone</span>
                  <p className="font-semibold text-[#191b23]">{companyProfile.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#004ac6]">
                  <Globe size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-[#737686] uppercase font-bold">Website</span>
                  <a
                    href={companyProfile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-[#2563eb] hover:underline block truncate"
                  >
                    {companyProfile.website}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Headquarters Location */}
          <div className="rounded-2xl border border-[#c3c6d7]/70 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={18} className="text-[#004ac6]" />
              <h3 className="text-base font-bold text-[#191b23] tracking-tight">
                Global Headquarters
              </h3>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 text-xs space-y-1 text-[#434655]">
              <p className="font-bold text-[#191b23]">{companyProfile.headquarters.address}</p>
              <p>
                {companyProfile.headquarters.city}, {companyProfile.headquarters.state}{' '}
                {companyProfile.headquarters.postalCode}
              </p>
              <p className="font-medium text-[#737686]">{companyProfile.headquarters.country}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal with React Hook Form + Yup */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Corporate Information"
        subtitle="Update corporate entity details, registration numbers, and addresses."
        size="xl"
      >
        <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FormInput
              label="Company Name"
              name="name"
              register={register}
              error={errors.name}
              required
            />
            <FormInput
              label="Legal Entity Name"
              name="legalName"
              register={register}
              error={errors.legalName}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FormInput
              label="Registration Number"
              name="registrationNumber"
              register={register}
              error={errors.registrationNumber}
              required
            />
            <FormInput
              label="Tax ID / EIN"
              name="taxId"
              register={register}
              error={errors.taxId}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <FormInput
              label="Industry"
              name="industry"
              register={register}
              error={errors.industry}
              required
            />
            <FormInput
              label="Employee Count"
              name="employeeCount"
              register={register}
              error={errors.employeeCount}
              required
            />
            <FormInput
              label="Phone"
              name="phone"
              register={register}
              error={errors.phone}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FormInput
              label="Contact Email"
              name="email"
              type="email"
              register={register}
              error={errors.email}
              required
            />
            <FormInput
              label="Website URL"
              name="website"
              register={register}
              error={errors.website}
              required
            />
          </div>

          <FormInput
            label="Headquarters Street Address"
            name="address"
            register={register}
            error={errors.address}
            required
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <FormInput label="City" name="city" register={register} error={errors.city} required />
            <FormInput label="State" name="state" register={register} error={errors.state} required />
            <FormInput label="Postal Code" name="postalCode" register={register} error={errors.postalCode} required />
            <FormInput label="Country" name="country" register={register} error={errors.country} required />
          </div>

          <FormInput
            label="Company Mission & Overview"
            name="overview"
            type="textarea"
            rows={3}
            register={register}
            error={errors.overview}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-[#2563eb] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#1d4ed8] active:scale-95 transition-all"
            >
              {isSubmitting ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CompanyManagement;
