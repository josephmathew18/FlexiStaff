import React, { useState, useEffect } from 'react';
import {
  Star,
  Users,
  Award,
  Sparkles,
  RefreshCw,
  MessageSquare,
  ShieldCheck,
  Building2,
  Calendar,
} from 'lucide-react';
import feedbackApi from '../../services/feedbackApi';

export const PartnerFeedbackSection = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  const loadPartnerFeedback = async () => {
    try {
      setLoading(true);
      const res = await feedbackApi.getPartnerSummary();
      if (res && res.data) {
        setSummary(res.data);
      }
    } catch (err) {
      console.warn('Failed to load partner employee feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartnerFeedback();
  }, []);

  const reviews = summary?.feedbacks || [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Star size={16} className="fill-amber-500 text-amber-500" />
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Specialist Ratings & Client Feedback
            </h3>
            {summary?.partnerCompanyName && (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                {summary.partnerCompanyName}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Ratings and written feedback exclusively for your company's deployed specialists
          </p>
        </div>

        <button
          type="button"
          onClick={loadPartnerFeedback}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metric Cards (Strictly for Partner's Specialists) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Average Employee Rating */}
        <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
              Average Specialist Rating
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900">
                {summary?.averageRating ? summary.averageRating.toFixed(1) : '0.0'}
              </span>
              <span className="text-xs text-slate-500 font-bold">/ 5.0</span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className={
                    star <= Math.round(summary?.averageRating || 0)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200'
                  }
                />
              ))}
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-xs">
            <Award size={24} />
          </div>
        </div>

        {/* Card 2: Total Verified Reviews */}
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Verified Client Reviews
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900">
                {summary?.reviewCount || 0}
              </span>
              <span className="text-xs text-slate-500 font-bold">Reviews</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-medium mt-2 flex items-center gap-1">
              <ShieldCheck size={13} />
              <span>Completed Client Projects</span>
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xs">
            <Users size={24} />
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Client Reviews for Your Staff ({reviews.length})
        </h4>

        {reviews.length === 0 ? (
          <div className="py-12 text-center text-slate-400 rounded-xl border border-dashed border-slate-200">
            <MessageSquare size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-700">No Specialist Reviews Yet</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1">
              Feedback will appear here once clients complete projects staffed by your specialists and submit their ratings.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                      {rev.professionalName ? rev.professionalName.charAt(0) : 'S'}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">
                        {rev.professionalName}
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        Project: <strong className="text-slate-800">{rev.projectTitle}</strong>
                        {rev.roleInProject && ` • ${rev.roleInProject}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 self-start sm:self-auto">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={
                          star <= rev.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200'
                        }
                      />
                    ))}
                    <span className="ml-1 text-xs font-bold text-slate-800">
                      {rev.rating}.0
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <div className="p-3 rounded-lg bg-white border border-slate-200/80">
                  <p className="text-xs text-slate-800 italic leading-relaxed">
                    "{rev.comment || 'Client left star rating without additional comment.'}"
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>
                    Client: <strong className="text-slate-600">{rev.clientCompanyName || rev.clientName || 'Enterprise Client'}</strong>
                  </span>
                  <span>{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recorded'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerFeedbackSection;
