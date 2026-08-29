import React, { useState, useMemo } from 'react';
import {
  LifeBuoy,
  Send,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  HardHat,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { toast } from 'react-toastify';

export const WorkforceSupport = () => {
  const { workforceUserProfile, supportTickets = [], submitSupportTicket } = useData() || {};

  const workforceTickets = useMemo(() => {
    return (supportTickets || []).filter(
      (t) => t.senderRole === 'Workforce' || (t.senderEmail && t.senderEmail.includes('talent'))
    );
  }, [supportTickets]);

  const [formData, setFormData] = useState({
    subject: '',
    category: 'Workforce & Billing',
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
      toast.error('Please enter detailed message or feedback.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      if (submitSupportTicket) {
        submitSupportTicket({
          senderRole: 'Workforce',
          senderName: `${workforceUserProfile?.name || 'David Miller'} (Workforce Specialist)`,
          senderEmail: workforceUserProfile?.email || 'talent@flexistaff.com',
          ...formData,
        });
      }
      setLoading(false);
      setFormData({ subject: '', category: 'Workforce & Billing', priority: 'Normal', message: '' });
      toast.success('Workforce support ticket submitted to Admin with full details!');
    }, 500);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7c3aed] to-[#8b5cf6] text-white flex items-center justify-center shadow-md">
              <LifeBuoy size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Workforce Help & Support / Feedback
              </h1>
              <p className="text-xs text-slate-500">
                Submit questions regarding project assignments, timesheets, deliverables, or feedback directly to Admin.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-purple-600" />
            <span>Verified Talent Help Desk</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900">Submit Support Request or Feedback</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Submissions are sent directly to Platform Administrators for verification and response.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Subject / Topic <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Timesheet Verification for Sprint 2 Deliverable"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-900 outline-none focus:border-[#7c3aed] focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#7c3aed] focus:bg-white transition-all"
                  >
                    <option value="Workforce & Billing">Workforce & Billing Inquiry</option>
                    <option value="Assignment Details">Assignment Offer Details</option>
                    <option value="Milestone Verification">Milestone Sign-off Verification</option>
                    <option value="Platform Feedback">Platform Experience Feedback</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Priority Level</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#7c3aed] focus:bg-white transition-all"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent / SLA Critical</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Detailed Message Report <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Provide full description of your query, assignment feedback, or support message..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 outline-none focus:border-[#7c3aed] focus:bg-white transition-all resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] text-white font-bold text-xs shadow-md hover:from-purple-800 hover:to-purple-600 active:scale-99 transition-all flex items-center justify-center gap-2 disabled:opacity-75"
              >
                {loading ? (
                  <span>Sending to Admin...</span>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Submit Workforce Report to Admin</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Your Submitted Tickets</h3>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                {workforceTickets.length} Reports
              </span>
            </div>

            {workforceTickets.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No support reports yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {workforceTickets.map((t) => (
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

export default WorkforceSupport;
