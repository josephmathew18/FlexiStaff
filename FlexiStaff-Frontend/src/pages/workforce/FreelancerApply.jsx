import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Code2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Layers,
  Check,
  X,
  Send,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { toast } from 'react-toastify';

const AVAILABLE_SKILLS = [
  'React',
  'Node.js',
  'Python',
  'TypeScript',
  'Java',
  'AWS',
  'Docker',
  'Kubernetes',
  'Figma',
  'GraphQL',
  'AI / ML',
  'PostgreSQL',
  'Tailwind CSS',
  'Next.js',
  'Go',
  'Flutter',
  'DevOps',
  'UI/UX Design',
];

export const FreelancerApply = () => {
  const navigate = useNavigate();
  const { addFreelancerApplication } = useData() || {};

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    place: '',
    experience: '3-5 years',
    skills: ['React', 'TypeScript'],
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleSkill = (skill) => {
    setFormData((prev) => {
      const exists = prev.skills.includes(skill);
      if (exists) {
        return { ...prev, skills: prev.skills.filter((s) => s !== skill) };
      } else {
        return { ...prev, skills: [...prev.skills, skill] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error('Please enter your full name.');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Please enter your contact phone number.');
      return;
    }
    if (!formData.place.trim()) {
      toast.error('Please enter your place/location.');
      return;
    }
    if (formData.skills.length === 0) {
      toast.error('Please select at least one primary technical skill.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      if (addFreelancerApplication) {
        addFreelancerApplication(formData);
      }
      setLoading(false);
      setSubmitted(true);
      toast.success('Application submitted successfully! Awaiting Admin review.');
    }, 600);
  };

  return (
    <main className="min-h-screen w-full bg-[#faf8ff] flex flex-col items-center justify-center p-4 sm:p-8 font-sans antialiased">
      <div className="w-full max-w-2xl">
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/login" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7c3aed] to-[#a78bfa] text-white flex items-center justify-center shadow-md">
              <Layers size={22} />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 block leading-tight">
                FlexiStaff<span className="text-[#7c3aed]">AI</span>
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Independent Freelancer Portal
              </span>
            </div>
          </Link>

          <Link
            to="/login"
            className="text-xs font-bold text-[#7c3aed] hover:underline flex items-center gap-1"
          >
            ← Back to Login
          </Link>
        </div>

        {submitted ? (
          /* Confirmation State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl text-center space-y-6"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={44} />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold border border-amber-200">
                Pending Admin Approval
              </span>
              <h2 className="text-2xl font-black text-slate-900">Application Submitted!</h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-slate-900">{formData.fullName}</strong>. Your application details have been submitted to FlexiStaff Administrators for verification.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-bold text-slate-900">{formData.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location (Place):</span>
                <span className="font-bold text-slate-900">{formData.place}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact Email:</span>
                <span className="font-bold text-slate-900">{formData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Experience:</span>
                <span className="font-bold text-slate-900">{formData.experience}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Selected Skills:</span>
                <div className="flex flex-wrap gap-1">
                  {formData.skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold">
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
                className="px-6 py-3 rounded-xl bg-[#7c3aed] text-white font-bold text-xs sm:text-sm shadow-md hover:bg-purple-700 transition-colors"
              >
                Return to Workforce Login
              </button>
            </div>
          </motion.div>
        ) : (
          /* Application Form */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-2">
                <Sparkles size={13} />
                <span>Freelancer Roster Application</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">Form for Freelancer</h1>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Submit your personal details, location, contact, and skills to apply for verified freelancer project opportunities.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/15 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Contact (Email & Phone) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Contact Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="freelancer@example.com"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/15 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Contact Phone <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/15 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Place (Location) & Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Place / Location <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.place}
                      onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                      placeholder="e.g. Austin, TX or London, UK"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/15 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Experience Level <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/15 transition-all"
                    >
                      <option value="1-3 years">1-3 years (Junior / Mid)</option>
                      <option value="3-5 years">3-5 years (Mid / Senior)</option>
                      <option value="5-8 years">5-8 years (Senior Specialist)</option>
                      <option value="8+ years">8+ years (Lead / Architect)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Select Technical Skills <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 max-h-48 overflow-y-auto">
                  {AVAILABLE_SKILLS.map((skill) => {
                    const isSelected = formData.skills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#7c3aed] text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected && <Check size={13} />}
                        <span>{skill}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-purple-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-75"
              >
                {loading ? (
                  <span>Submitting Application...</span>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Submit Form for Freelancer</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Applications are subject to verification and Admin approval.</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default FreelancerApply;
