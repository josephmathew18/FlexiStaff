import React, { useState, useEffect } from 'react';
import {
  Star,
  Building2,
  Users,
  Award,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  MessageSquare,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Briefcase,
  Layers,
} from 'lucide-react';
import feedbackApi from '../../services/feedbackApi';

export const AdminFeedbackSection = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'company', 'employee', 'freelancer'
  const [searchQuery, setSearchQuery] = useState('');

  const loadFeedbackData = async () => {
    try {
      setLoading(true);
      const res = await feedbackApi.getAdminSummary();
      if (res && res.data) {
        setSummary(res.data);
      }
    } catch (err) {
      console.warn('Failed to load admin feedback summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbackData();
  }, []);

  const companyReviews = summary?.companyFeedbacks || [];
  const profReviews = summary?.professionalFeedbacks || [];

  const employeeReviews = profReviews.filter(
    (r) => r.workforceType === 'Partner Company' || r.partnerCompanyId != null
  );
  const freelancerReviews = profReviews.filter(
    (r) => r.workforceType !== 'Partner Company' && r.partnerCompanyId == null
  );

  // Filtered reviews based on active tab & search query
  const displayedReviews = React.useMemo(() => {
    let list = [];
    if (activeTab === 'all') {
      list = [
        ...companyReviews.map((r) => ({ ...r, feedbackType: 'COMPANY' })),
        ...profReviews.map((r) => ({ ...r, feedbackType: 'PROFESSIONAL' })),
      ];
    } else if (activeTab === 'company') {
      list = companyReviews.map((r) => ({ ...r, feedbackType: 'COMPANY' }));
    } else if (activeTab === 'employee') {
      list = employeeReviews.map((r) => ({ ...r, feedbackType: 'PROFESSIONAL' }));
    } else if (activeTab === 'freelancer') {
      list = freelancerReviews.map((r) => ({ ...r, feedbackType: 'PROFESSIONAL' }));
    }

    // Sort by latest createdAt
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter((item) => {
      const matchComment = (item.comment || '').toLowerCase().includes(q);
      const matchClient = (item.clientName || '').toLowerCase().includes(q) || (item.clientCompanyName || '').toLowerCase().includes(q);
      const matchProject = (item.projectTitle || '').toLowerCase().includes(q);
      const matchSpecialist = (item.professionalName || '').toLowerCase().includes(q);
      const matchPartner = (item.partnerCompanyName || '').toLowerCase().includes(q);
      return matchComment || matchClient || matchProject || matchSpecialist || matchPartner;
    });
  }, [activeTab, searchQuery, companyReviews, profReviews, employeeReviews, freelancerReviews]);

  return (
    <div className="rounded-2xl border border-[#c3c6d7]/70 dark:border-white/10 bg-white dark:bg-[#14132b] p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Star size={16} className="fill-amber-500 text-amber-500" />
            </span>
            <h3 className="text-base font-bold text-[#191b23] dark:text-white tracking-tight">
              Client Ratings & Feedback Intelligence
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-[#737686] dark:text-slate-400">
            PostgreSQL verified client evaluations for FlexiStaff AI, partner company employees, and freelancers
          </p>
        </div>

        <button
          type="button"
          onClick={loadFeedbackData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 4 Metric Cards: Company, Partner Employees, Freelancers, Overall */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: FlexiStaff AI (Company) */}
        <div className="rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-950/20 p-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                FlexiStaff AI (Company)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {summary?.companyAverageRating || '0.0'}
                </span>
                <span className="text-xs text-slate-500 font-bold">/ 5.0</span>
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Building2 size={18} />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-blue-100/60 dark:border-blue-900/40">
            <div className="flex items-center gap-1 text-amber-500">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {summary?.companyReviewCount || 0} Reviews
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Corporate Score</span>
          </div>
        </div>

        {/* Card 2: Partner Company Employees */}
        <div className="rounded-xl border border-purple-100 dark:border-purple-900/30 bg-purple-50/30 dark:bg-purple-950/20 p-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                Partner Employees
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {summary?.employeeAverageRating || '0.0'}
                </span>
                <span className="text-xs text-slate-500 font-bold">/ 5.0</span>
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white shadow-xs">
              <Users size={18} />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-purple-100/60 dark:border-purple-900/40">
            <div className="flex items-center gap-1 text-amber-500">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {summary?.employeeReviewCount || 0} Reviews
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Partner Workforce</span>
          </div>
        </div>

        {/* Card 3: Freelancers */}
        <div className="rounded-xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-950/20 p-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Freelancers
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {summary?.freelancerAverageRating || '0.0'}
                </span>
                <span className="text-xs text-slate-500 font-bold">/ 5.0</span>
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600 text-white shadow-xs">
              <Briefcase size={18} />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-amber-100/60 dark:border-amber-900/40">
            <div className="flex items-center gap-1 text-amber-500">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {summary?.freelancerReviewCount || 0} Reviews
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Independent Talent</span>
          </div>
        </div>

        {/* Card 4: Overall Index */}
        <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-950/20 p-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Overall Satisfaction
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {summary?.overallAverageRating || '0.0'}
                </span>
                <span className="text-xs text-slate-500 font-bold">/ 5.0</span>
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <Award size={18} />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-emerald-100/60 dark:border-emerald-900/40">
            <div className="flex items-center gap-1 text-amber-500">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {summary?.totalReviewCount || 0} Total Reviews
              </span>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">100% Verified</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 self-start">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-white dark:bg-[#1f1d3d] text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All Reviews ({companyReviews.length + profReviews.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('company')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'company'
                ? 'bg-white dark:bg-[#1f1d3d] text-blue-700 dark:text-blue-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Company ({companyReviews.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('employee')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'employee'
                ? 'bg-white dark:bg-[#1f1d3d] text-purple-700 dark:text-purple-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Partner Employees ({employeeReviews.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('freelancer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'freelancer'
                ? 'bg-white dark:bg-[#1f1d3d] text-amber-700 dark:text-amber-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Freelancers ({freelancerReviews.length})
          </button>
        </div>

        <div className="relative sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviews, client, project..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* Reviews Stream */}
      {displayedReviews.length === 0 ? (
        <div className="py-12 text-center text-slate-400 dark:text-slate-500">
          <MessageSquare size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No client reviews found</p>
          <p className="text-[11px] text-slate-400">
            Reviews will appear here as enterprise clients submit ratings for completed projects.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedReviews.map((rev) => {
            const isCompany = rev.feedbackType === 'COMPANY';
            const isPartnerEmployee =
              !isCompany && (rev.workforceType === 'Partner Company' || rev.partnerCompanyId != null);

            return (
              <div
                key={`${rev.feedbackType}-${rev.id}`}
                className="p-4 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/40 dark:bg-[#191733]/50 hover:bg-white dark:hover:bg-[#1d1b3d] transition-all space-y-2.5"
              >
                {/* Review Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Badge */}
                    {isCompany ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        <Building2 size={11} />
                        FlexiStaff AI Company
                      </span>
                    ) : isPartnerEmployee ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        <Users size={11} />
                        Partner Employee ({rev.partnerCompanyName || 'Partner Firm'})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <Briefcase size={11} />
                        Independent Freelancer
                      </span>
                    )}

                    {/* Subject Target */}
                    {!isCompany && (
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Specialist: <span className="text-blue-600 dark:text-blue-400">{rev.professionalName}</span>
                        {rev.roleInProject && (
                          <span className="text-[11px] font-medium text-slate-500 ml-1">
                            ({rev.roleInProject})
                          </span>
                        )}
                      </span>
                    )}

                    <span className="text-[11px] text-slate-500 font-medium">
                      on Project: <strong className="text-slate-800 dark:text-slate-200">{rev.projectTitle}</strong>
                    </span>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-1 self-start sm:self-auto">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={15}
                        className={
                          star <= rev.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200 dark:text-slate-700'
                        }
                      />
                    ))}
                    <span className="ml-1 text-xs font-bold text-slate-800 dark:text-white">
                      {rev.rating}.0
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <div className="rounded-lg bg-white dark:bg-[#14132b] p-3 border border-slate-200/70 dark:border-white/10">
                  <p className="text-xs text-slate-800 dark:text-slate-200 italic leading-relaxed">
                    "{rev.comment || 'Client left star rating without additional comment.'}"
                  </p>
                </div>

                {/* Reviewer & Date Footer */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <span>
                    Reviewed by Client: <strong className="text-slate-700 dark:text-slate-300">{rev.clientName || 'Enterprise Client'}</strong>
                    {rev.clientCompanyName && ` (${rev.clientCompanyName})`}
                  </span>
                  <span className="font-mono">
                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recorded'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminFeedbackSection;
