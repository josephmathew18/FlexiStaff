import React, { useState, useEffect } from 'react';
import {
  Star,
  CheckCircle2,
  Building2,
  Users,
  ShieldCheck,
  X,
  MessageSquare,
  Award,
  Sparkles,
  Send,
  Loader2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import feedbackApi from '../../services/feedbackApi';

export const RatingFeedbackModal = ({
  isOpen,
  onClose,
  project,
  onFeedbackSubmitted,
}) => {
  const [activeTab, setActiveTab] = useState('company'); // 'company' or 'specialists'
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);

  // Eligibility data from backend
  const [eligibility, setEligibility] = useState(null);

  // Form states
  const [companyRating, setCompanyRating] = useState(5);
  const [companyHover, setCompanyHover] = useState(0);
  const [companyComment, setCompanyComment] = useState('');

  // Per-specialist form state: map of specialistId -> { rating, comment, hover }
  const [specialistForms, setSpecialistForms] = useState({});

  useEffect(() => {
    if (isOpen && project?.id) {
      loadProjectFeedbackState();
    }
  }, [isOpen, project?.id]);

  const loadProjectFeedbackState = async () => {
    try {
      setLoading(true);
      const res = await feedbackApi.getClientEligibility();
      if (res && res.data) {
        const found = res.data.find(
          (item) => String(item.projectId) === String(project.id)
        );
        if (found) {
          setEligibility(found);
          // Initialize specialist form ratings
          const forms = {};
          (found.assignedProfessionals || []).forEach((sp) => {
            forms[sp.professionalId] = {
              rating: sp.feedback?.rating || 5,
              hover: 0,
              comment: sp.feedback?.comment || '',
            };
          });
          setSpecialistForms(forms);

          // If company feedback already submitted, populate it
          if (found.companyFeedbackSubmitted && found.companyFeedback) {
            setCompanyRating(found.companyFeedback.rating);
            setCompanyComment(found.companyFeedback.comment || '');
          }
        }
      }
    } catch (err) {
      console.warn('Could not load feedback state:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !project) return null;

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    if (!companyRating || companyRating < 1 || companyRating > 5) {
      toast.error('Please select a star rating between 1 and 5.');
      return;
    }

    try {
      setSubmittingId('company');
      await feedbackApi.submitCompanyFeedback({
        projectId: project.id,
        rating: companyRating,
        comment: companyComment.trim(),
      });

      toast.success('Thank you! Rating & feedback for FlexiStaff AI submitted successfully.');
      await loadProjectFeedbackState();
      if (onFeedbackSubmitted) onFeedbackSubmitted();
    } catch (err) {
      toast.error(err.message || 'Failed to submit feedback for FlexiStaff AI.');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleSpecialistSubmit = async (profId) => {
    const form = specialistForms[profId] || { rating: 5, comment: '' };
    if (!form.rating || form.rating < 1 || form.rating > 5) {
      toast.error('Please select a rating between 1 and 5 stars.');
      return;
    }

    try {
      setSubmittingId(profId);
      await feedbackApi.submitProfessionalFeedback({
        projectId: project.id,
        professionalId: profId,
        rating: form.rating,
        comment: (form.comment || '').trim(),
      });

      toast.success('Specialist rating and feedback submitted successfully.');
      await loadProjectFeedbackState();
      if (onFeedbackSubmitted) onFeedbackSubmitted();
    } catch (err) {
      toast.error(err.message || 'Failed to submit feedback for specialist.');
    } finally {
      setSubmittingId(null);
    }
  };

  const getRatingLabel = (stars) => {
    switch (stars) {
      case 1:
        return '1 - Needs Improvement';
      case 2:
        return '2 - Fair Experience';
      case 3:
        return '3 - Good & Satisfactory';
      case 4:
        return '4 - Very Good';
      case 5:
        return '5 - Outstanding & Exceptional';
      default:
        return '';
    }
  };

  const assignedSpecs = eligibility?.assignedProfessionals || [];
  const pendingSpecsCount = assignedSpecs.filter((s) => !s.feedbackSubmitted).length;
  const isCompanySubmitted = eligibility?.companyFeedbackSubmitted;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 bg-gradient-to-r from-slate-50 via-blue-50/30 to-indigo-50/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <Star size={18} className="fill-amber-500 text-amber-500" />
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Project Ratings & Feedback
              </h3>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Project #{project.id}: <span className="font-bold text-slate-800">{project.title || project.name}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('company')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'company'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 size={15} />
            <span>FlexiStaff AI (Company)</span>
            {isCompanySubmitted && (
              <span className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">
                ✓
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('specialists')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'specialists'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users size={15} />
            <span>Assigned Specialists ({assignedSpecs.length})</span>
            {pendingSpecsCount > 0 ? (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                {pendingSpecsCount} Pending
              </span>
            ) : assignedSpecs.length > 0 ? (
              <span className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">
                ✓
              </span>
            ) : null}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin text-blue-600 mb-2" />
              <p className="text-xs font-medium">Loading project feedback details...</p>
            </div>
          ) : activeTab === 'company' ? (
            /* TAB 1: COMPANY FEEDBACK */
            <div className="space-y-6">
              <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Rate FlexiStaff AI Corporate Service
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      How was your overall experience with FlexiStaff AI on this project? Your feedback directly informs platform matching, manager oversight, and enterprise service delivery.
                    </p>
                  </div>
                </div>
              </div>

              {isCompanySubmitted ? (
                /* Already Submitted View */
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                      <CheckCircle2 size={14} />
                      Company Review Submitted
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {eligibility?.companyFeedback?.createdAt
                        ? new Date(eligibility.companyFeedback.createdAt).toLocaleDateString()
                        : 'Recorded in PostgreSQL'}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 my-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={22}
                          className={
                            star <= (eligibility?.companyFeedback?.rating || companyRating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200'
                          }
                        />
                      ))}
                      <span className="ml-2 text-sm font-bold text-slate-800">
                        {eligibility?.companyFeedback?.rating || companyRating} / 5 Stars
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-3">
                      Your Written Review:
                    </p>
                    <p className="mt-1 text-sm text-slate-800 bg-white p-3.5 rounded-xl border border-slate-200/80 italic">
                      "{eligibility?.companyFeedback?.comment || companyComment || 'No additional written comment provided.'}"
                    </p>
                  </div>
                </div>
              ) : (
                /* Submission Form */
                <form onSubmit={handleCompanySubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Star Rating (1 to 5) *
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setCompanyRating(star)}
                          onMouseEnter={() => setCompanyHover(star)}
                          onMouseLeave={() => setCompanyHover(0)}
                          className="p-1 rounded-lg hover:scale-110 transition-transform focus:outline-hidden"
                        >
                          <Star
                            size={28}
                            className={`transition-colors ${
                              star <= (companyHover || companyRating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-bold text-slate-700">
                        {getRatingLabel(companyHover || companyRating)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Written Feedback & Comments
                    </label>
                    <textarea
                      rows={4}
                      value={companyComment}
                      onChange={(e) => setCompanyComment(e.target.value)}
                      placeholder="Share your thoughts on staffing velocity, manager coordination, platform communication..."
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden resize-none"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={submittingId === 'company'}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all disabled:opacity-60 cursor-pointer"
                    >
                      {submittingId === 'company' ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          <span>Submit Company Review</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* TAB 2: SPECIALISTS FEEDBACK */
            <div className="space-y-6">
              {assignedSpecs.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Users size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-600">No Specialists Recorded</p>
                  <p className="text-[11px] text-slate-400">
                    No workforce specialists were assigned to this completed project pod.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignedSpecs.map((sp) => {
                    const formState = specialistForms[sp.professionalId] || {
                      rating: 5,
                      comment: '',
                      hover: 0,
                    };
                    const isSubmitted = sp.feedbackSubmitted;

                    return (
                      <div
                        key={sp.professionalId}
                        className={`rounded-2xl border p-5 transition-all ${
                          isSubmitted
                            ? 'border-emerald-200 bg-emerald-50/20'
                            : 'border-slate-200 bg-white hover:border-blue-200 shadow-2xs'
                        }`}
                      >
                        {/* Specialist Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                              {sp.professionalName ? sp.professionalName.charAt(0) : 'P'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900">
                                  {sp.professionalName}
                                </h4>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    sp.workforceType === 'Partner Company'
                                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                                      : 'bg-amber-50 text-amber-700 border-amber-200'
                                  }`}
                                >
                                  {sp.workforceType === 'Partner Company'
                                    ? `Partner: ${sp.partnerCompanyName || 'Enterprise Firm'}`
                                    : 'Independent Freelancer'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Role: <span className="font-semibold text-slate-700">{sp.roleInProject}</span>
                              </p>
                            </div>
                          </div>

                          {isSubmitted ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 self-start sm:self-center">
                              <CheckCircle2 size={13} />
                              Reviewed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold self-start sm:self-center">
                              Pending Review
                            </span>
                          )}
                        </div>

                        {/* Submitted vs Editable View */}
                        {isSubmitted ? (
                          <div className="pt-3">
                            <div className="flex items-center gap-1.5 mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={18}
                                  className={
                                    star <= (sp.feedback?.rating || formState.rating)
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-200'
                                  }
                                />
                              ))}
                              <span className="ml-2 text-xs font-bold text-slate-800">
                                {sp.feedback?.rating || formState.rating} / 5 Stars
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200/80 italic">
                              "{sp.feedback?.comment || 'Exceptional contribution on project delivery.'}"
                            </p>
                          </div>
                        ) : (
                          <div className="pt-3 space-y-3">
                            <div>
                              <span className="block text-[11px] font-bold text-slate-700 mb-1.5">
                                Individual Performance Rating *
                              </span>
                              <div className="flex items-center gap-1.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() =>
                                      setSpecialistForms((prev) => ({
                                        ...prev,
                                        [sp.professionalId]: {
                                          ...(prev[sp.professionalId] || {}),
                                          rating: star,
                                        },
                                      }))
                                    }
                                    onMouseEnter={() =>
                                      setSpecialistForms((prev) => ({
                                        ...prev,
                                        [sp.professionalId]: {
                                          ...(prev[sp.professionalId] || {}),
                                          hover: star,
                                        },
                                      }))
                                    }
                                    onMouseLeave={() =>
                                      setSpecialistForms((prev) => ({
                                        ...prev,
                                        [sp.professionalId]: {
                                          ...(prev[sp.professionalId] || {}),
                                          hover: 0,
                                        },
                                      }))
                                    }
                                    className="p-1 rounded hover:scale-110 transition-transform focus:outline-hidden"
                                  >
                                    <Star
                                      size={22}
                                      className={`transition-colors ${
                                        star <=
                                        (formState.hover || formState.rating)
                                          ? 'fill-amber-400 text-amber-400'
                                          : 'text-slate-200'
                                      }`}
                                    />
                                  </button>
                                ))}
                                <span className="ml-2 text-xs font-bold text-slate-600">
                                  {getRatingLabel(formState.hover || formState.rating)}
                                </span>
                              </div>
                            </div>

                            <div>
                              <input
                                type="text"
                                value={formState.comment}
                                onChange={(e) =>
                                  setSpecialistForms((prev) => ({
                                    ...prev,
                                    [sp.professionalId]: {
                                      ...(prev[sp.professionalId] || {}),
                                      comment: e.target.value,
                                    },
                                  }))
                                }
                                placeholder={`Leave constructive feedback for ${sp.professionalName}...`}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                              />
                            </div>

                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleSpecialistSubmit(sp.professionalId)}
                                disabled={submittingId === sp.professionalId}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-60 cursor-pointer"
                              >
                                {submittingId === sp.professionalId ? (
                                  <>
                                    <Loader2 size={13} className="animate-spin" />
                                    <span>Saving...</span>
                                  </>
                                ) : (
                                  <>
                                    <Send size={13} />
                                    <span>Submit Review</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck size={14} className="text-emerald-600" />
            Backend Verified & Stored in PostgreSQL
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-white font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingFeedbackModal;
