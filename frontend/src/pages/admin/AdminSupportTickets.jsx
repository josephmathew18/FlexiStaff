import React, { useState, useMemo } from 'react';
import {
  LifeBuoy,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  UserCheck,
  Building2,
  Users,
  HardHat,
  Handshake,
  Check,
  X,
  Send,
  Sparkles,
  Star,
  Award,
  RefreshCw,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { toast } from 'react-toastify';
import feedbackApi from '../../services/feedbackApi';

export const AdminSupportTickets = () => {
  const {
    supportTickets = [],
    loadingTickets,
    refreshSupportTickets,
    updateSupportTicketStatus,
    clearAllTicketStatuses,
  } = useData() || {};

  const [activeMainTab, setActiveMainTab] = useState('feedback'); // 'feedback' | 'tickets'
  const [companyFeedbacks, setCompanyFeedbacks] = useState([]);
  const [feedbackSummary, setFeedbackSummary] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'Client' | 'Manager' | 'Partner' | 'Workforce'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Open' | 'Pending Admin Review' | 'In Progress' | 'Resolved'
  const [searchQuery, setSearchQuery] = useState('');
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const loadCompanyFeedback = async () => {
    try {
      setLoadingFeedback(true);
      const [sumRes, compRes] = await Promise.all([
        feedbackApi.getAdminSummary(),
        feedbackApi.getAllCompanyFeedbacks(),
      ]);
      const summaryData = sumRes?.data || sumRes;
      if (summaryData) {
        setFeedbackSummary(summaryData);
      }
      const list = Array.isArray(compRes?.data)
        ? compRes.data
        : Array.isArray(compRes)
        ? compRes
        : (summaryData?.companyFeedbacks || []);
      setCompanyFeedbacks(list);
    } catch (err) {
      console.warn('Could not load company feedback:', err);
    } finally {
      setLoadingFeedback(false);
    }
  };

  React.useEffect(() => {
    loadCompanyFeedback();
  }, []);

  // Filtered support tickets
  const filteredTickets = useMemo(() => {
    return (supportTickets || []).filter((t) => {
      let matchesRole = true;
      if (roleFilter !== 'all') {
        matchesRole = t.senderRole === roleFilter;
      }

      let matchesStatus = true;
      if (statusFilter !== 'all') {
        matchesStatus = t.status === statusFilter;
      }

      let matchesSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        matchesSearch =
          (t.subject && t.subject.toLowerCase().includes(q)) ||
          (t.senderName && t.senderName.toLowerCase().includes(q)) ||
          (t.senderEmail && t.senderEmail.toLowerCase().includes(q)) ||
          (t.message && t.message.toLowerCase().includes(q)) ||
          (t.category && t.category.toLowerCase().includes(q));
      }

      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [supportTickets, roleFilter, statusFilter, searchQuery]);

  const handleUpdateStatus = async (ticketId, newStatus, senderName) => {
    setUpdatingId(ticketId);
    const draftText = replyDrafts[ticketId] || null;

    try {
      if (updateSupportTicketStatus) {
        await updateSupportTicketStatus(ticketId, newStatus, draftText);
        toast.success(`Support ticket for ${senderName} updated to "${newStatus}"!`);
      }
      setReplyingTo(null);
    } catch (err) {
      toast.error('Failed to update status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Client':
        return <Building2 size={14} className="text-emerald-600" />;
      case 'Manager':
        return <Users size={14} className="text-indigo-600" />;
      case 'Partner':
        return <Handshake size={14} className="text-blue-600" />;
      default:
        return <HardHat size={14} className="text-purple-600" />;
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Client':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50';
      case 'Manager':
        return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50';
      case 'Partner':
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/50';
      default:
        return 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/50';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Support & Feedback Reports Desk
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800/50">
              Admin Support Center
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review FlexiStaff AI company feedback & ratings, SLA satisfaction, and technical inquiries saved in PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={async () => {
              try {
                if (clearAllTicketStatuses) {
                  await clearAllTicketStatuses();
                }
                setStatusFilter('all');
                toast.success('All support ticket statuses cleared and reset to "Pending Admin Review"!');
              } catch (err) {
                toast.error('Failed to reset ticket statuses. Please try again.');
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold border border-amber-600 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Reset all ticket statuses to Pending Admin Review"
          >
            <Clock size={14} />
            <span>Clear All Ticket Statuses</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation: Company Feedback & Ratings vs Support Reports */}
      <div className="flex border-b border-slate-200 dark:border-white/10 gap-2">
        <button
          type="button"
          onClick={() => setActiveMainTab('feedback')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeMainTab === 'feedback'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/20 dark:bg-amber-950/20 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Star size={15} className="fill-amber-400 text-amber-400" />
          <span>FlexiStaff AI Company Ratings & Feedback ({companyFeedbacks.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMainTab('tickets')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeMainTab === 'tickets'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/20 dark:bg-blue-950/20 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <LifeBuoy size={15} />
          <span>Support Reports & Technical Inquiries ({(supportTickets || []).length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: FLEXISTAFF AI COMPANY RATINGS & FEEDBACK VIEW (Pic 1) */}
      {/* ========================================================================= */}
      {activeMainTab === 'feedback' && (
        <div className="space-y-6">
          {/* Total Client Evaluations Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#14132b] border border-slate-200 dark:border-white/10 flex items-center justify-between max-w-sm shadow-xs">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Client Evaluations
              </span>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {companyFeedbacks.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Building2 size={24} />
            </div>
          </div>

          {/* Company Feedback Reviews List */}
          <div className="bg-white dark:bg-[#14132b] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Client Written Feedback & Star Evaluations
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Detailed corporate feedback given by clients upon project completion
                </p>
              </div>
            </div>

            {companyFeedbacks.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Building2 size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Company Feedback Recorded Yet</p>
                <p className="text-[11px] text-slate-400">
                  Ratings submitted by clients for FlexiStaff AI will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {companyFeedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    className="p-4 rounded-xl border border-amber-200/70 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/10 space-y-2.5 hover:shadow-xs transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          Project: <span className="text-blue-600 dark:text-blue-400 font-extrabold">{fb.projectTitle}</span>
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">#{fb.projectId}</span>
                      </div>

                      <div className="flex items-center gap-1 self-start sm:self-auto">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={
                              star <= fb.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200 dark:text-slate-700'
                            }
                          />
                        ))}
                        <span className="ml-1 text-xs font-bold text-slate-800 dark:text-white">
                          {fb.rating}.0 / 5.0
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-white dark:bg-[#1c1a36] border border-slate-200/80 dark:border-white/10">
                      <p className="text-xs text-slate-800 dark:text-slate-200 italic leading-relaxed">
                        "{fb.comment || 'Client left star rating without additional comment.'}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                      <span>
                        Client: <strong className="text-slate-700 dark:text-slate-300">{fb.clientName || 'Enterprise Client'}</strong>
                        {fb.clientCompanyName && ` (${fb.clientCompanyName})`}
                      </span>
                      <span className="font-mono">
                        {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : 'Recorded'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: SUPPORT & TECHNICAL INQUIRIES DESK */}
      {/* ========================================================================= */}
      {activeMainTab === 'tickets' && (
        <>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#14132b] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reports by subject, sender, message..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs outline-none focus:border-[#004ac6] bg-slate-50/50 dark:bg-[#1c1a36] text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1c1a36] p-2 text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-[#004ac6]"
          >
            <option value="all">All Portal Roles</option>
            <option value="Client">Client Reports</option>
            <option value="Manager">Manager Reports</option>
            <option value="Partner">Partner Reports</option>
            <option value="Workforce">Workforce Reports</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1c1a36] p-2 text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-[#004ac6]"
          >
            <option value="all">All Ticket Statuses</option>
            <option value="Pending Admin Review">Pending Admin Review</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Tickets List View */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white dark:bg-[#14132b] rounded-3xl border border-dashed border-slate-300 dark:border-white/10 p-12 text-center space-y-2">
          <LifeBuoy className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Support Reports Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Support tickets submitted by Clients, Managers, Partners, or Workforce specialists will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => {
            const isResolved = ticket.status === 'Resolved';
            const isReplying = replyingTo === ticket.id;

            return (
              <div
                key={ticket.id}
                className="bg-white dark:bg-[#14132b] rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-xs space-y-4 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/10 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border flex items-center gap-1 ${getRoleBadge(ticket.senderRole)}`}>
                        {getRoleIcon(ticket.senderRole)}
                        <span>{ticket.senderRole} Report</span>
                      </span>
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500">• {ticket.category}</span>
                      {ticket.priority === 'Urgent' || ticket.priority === 'High' ? (
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 text-[10px] font-black border border-rose-200 dark:border-rose-800/50">
                          {ticket.priority} Priority
                        </span>
                      ) : null}
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{ticket.subject}</h3>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Status:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        isResolved
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50'
                          : ticket.status === 'In Progress'
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50'
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                </div>

                {/* Sender Metadata Box */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs p-3 rounded-xl bg-slate-50 dark:bg-[#1c1a36] border border-slate-100 dark:border-white/10">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold block">Submitted By</span>
                    <span className="font-bold text-slate-900 dark:text-white">{ticket.senderName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold block">Contact Email</span>
                    <span className="font-bold text-slate-900 dark:text-white">{ticket.senderEmail}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold block">Submitted Timestamp</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{ticket.submittedAt}</span>
                  </div>
                </div>

                {/* Report Content */}
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                    Full Report Details
                  </span>
                  <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-[#1c1a36]/60 border border-slate-200/60 dark:border-white/10 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                    {ticket.message}
                  </div>
                </div>

                {/* Official Admin Response Display */}
                {ticket.adminResponse && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1">
                      <MessageSquare size={12} />
                      <span>Administrator Official Reply</span>
                    </span>
                    <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                      {ticket.adminResponse}
                    </div>
                  </div>
                )}

                {/* Inline Admin Reply Box */}
                {isReplying && (
                  <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 space-y-2">
                    <label className="text-[11px] font-bold text-slate-800 dark:text-white block">
                      Type Response to {ticket.senderName}:
                    </label>
                    <textarea
                      rows={3}
                      value={replyDrafts[ticket.id] || ''}
                      onChange={(e) =>
                        setReplyDrafts((prev) => ({ ...prev, [ticket.id]: e.target.value }))
                      }
                      placeholder="Enter official resolution notes or feedback response..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs outline-none focus:border-[#004ac6] bg-white dark:bg-[#1c1a36] text-slate-800 dark:text-white"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setReplyingTo(null)}
                        className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(ticket.id, 'In Progress', ticket.senderName)}
                        className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
                      >
                        Send & Mark In Progress
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(ticket.id, 'Resolved', ticket.senderName)}
                        className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                      >
                        Send & Mark Resolved
                      </button>
                    </div>
                  </div>
                )}

                {/* Admin Status Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
                  {!isReplying && (
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingTo(ticket.id);
                        if (!replyDrafts[ticket.id] && ticket.adminResponse) {
                          setReplyDrafts((prev) => ({ ...prev, [ticket.id]: ticket.adminResponse }));
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-white/10 flex items-center gap-1 transition-all"
                    >
                      <MessageSquare size={13} />
                      <span>{ticket.adminResponse ? 'Edit Response' : 'Reply to Ticket'}</span>
                    </button>
                  )}

                  {!isResolved ? (
                    <>
                      <button
                        type="button"
                        disabled={updatingId === ticket.id}
                        onClick={() => handleUpdateStatus(ticket.id, 'In Progress', ticket.senderName)}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#004ac6] dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 text-xs font-bold transition-all disabled:opacity-50"
                      >
                        Mark In Progress
                      </button>
                      <button
                        type="button"
                        disabled={updatingId === ticket.id}
                        onClick={() => handleUpdateStatus(ticket.id, 'Resolved', ticket.senderName)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1 disabled:opacity-50"
                      >
                        <Check size={14} />
                        <span>Mark Resolved</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      disabled={updatingId === ticket.id}
                      onClick={() => handleUpdateStatus(ticket.id, 'Pending Admin Review', ticket.senderName)}
                      className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
                    >
                      Reopen Ticket
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </>
    )}
  </div>
);
};

export default AdminSupportTickets;
