import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  ShieldCheck,
  LifeBuoy,
  Sparkles,
  Search,
  Filter,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { toast } from 'react-toastify';

export const ClientSupport = () => {
  const { clientProfile, supportTickets = [], submitSupportTicket } = useData() || {};

  const clientTickets = useMemo(() => {
    return (supportTickets || []).filter(
      (t) => t.senderRole === 'Client' || (t.senderEmail && t.senderEmail.includes('client'))
    );
  }, [supportTickets]);

  const [formData, setFormData] = useState({
    subject: '',
    category: 'Project Execution',
    priority: 'Normal',
    message: '',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.subject.trim()) {
      toast.error('Please enter a report subject.');
      return;
    }
    if (!formData.message.trim()) {
      toast.error('Please enter detailed feedback or support message.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      if (submitSupportTicket) {
        submitSupportTicket({
          senderRole: 'Client',
          senderName: `${clientProfile?.company || 'Finovate Global'} (${clientProfile?.contactPerson || 'Client Lead'})`,
          senderEmail: clientProfile?.email || 'client@flexistaff.com',
          ...formData,
        });
      }
      setLoading(false);
      setFormData({ subject: '', category: 'Project Execution', priority: 'Normal', message: '' });
      toast.success('Help & Support ticket submitted to Admin with full details!');
    }, 500);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <LifeBuoy size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Help & Support / Feedback
              </h1>
              <p className="text-xs text-slate-500">
                Submit support requests or feedback reports directly to FlexiStaff Administrators.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>24/7 Priority Support SLA</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Submit Form & FAQ */}
        <div className="lg:col-span-2 space-y-6">
          {/* Submission Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900">Submit Support Request or Feedback</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Fill in the report details below. All submissions are dispatched instantly to Admin with full metadata.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Subject */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Subject / Topic <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Additional React Engineer Request for Sprint 3"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-900 outline-none focus:border-emerald-600 focus:bg-white transition-all"
                  required
                />
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-emerald-600 focus:bg-white transition-all"
                  >
                    <option value="Project Execution">Project Execution</option>
                    <option value="Talent Matching">Talent Matching & Squads</option>
                    <option value="SLA & Milestones">SLA & Milestone Sign-offs</option>
                    <option value="Billing & Invoicing">Billing & Contract SOW</option>
                    <option value="Platform Feedback">Platform Feedback</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Priority Level</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-emerald-600 focus:bg-white transition-all"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent / SLA Critical</option>
                  </select>
                </div>
              </div>

              {/* Message Details */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Detailed Message Report <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Provide full description of your feedback, requirement change, or support question..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 outline-none focus:border-emerald-600 focus:bg-white transition-all resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md hover:from-emerald-700 hover:to-teal-700 active:scale-99 transition-all flex items-center justify-center gap-2 disabled:opacity-75"
              >
                {loading ? (
                  <span>Sending Report to Admin...</span>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Submit Report to FlexiStaff Admin</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Submitted Tickets Feed */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Your Submitted Reports</h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {clientTickets.length} Reports
              </span>
            </div>

            {clientTickets.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No support reports yet</p>
                <p className="text-[11px] text-slate-400">Submissions will appear here with live Admin status.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {clientTickets.map((t) => (
                  <div key={t.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-extrabold text-slate-900 leading-snug">{t.subject}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 shrink-0">
                        {t.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{t.message}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                      <span>Category: {t.category}</span>
                      <span>{t.submittedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientSupport;
