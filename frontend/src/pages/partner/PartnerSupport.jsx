import React, { useState } from 'react';
import {
  HelpCircle,
  MessageSquare,
  Send,
  Paperclip,
  CheckCircle2,
  Clock,
  ChevronDown,
  ShieldCheck,
  LifeBuoy,
  FileQuestion,
  PhoneCall,
  Mail,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useData } from '../../context/DataContext';

export const PartnerSupport = () => {
  const { partnerProjects, partnerSupportTickets, addPartnerSupportTicket } = useData();

  const [subject, setSubject] = useState('');
  const [project, setProject] = useState(partnerProjects[0]?.name || 'General Inquiry');
  const [priority, setPriority] = useState('Medium');
  const [message, setMessage] = useState('');
  const [fileName, setFileName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Please enter a subject and message.');
      return;
    }

    addPartnerSupportTicket({
      subject,
      project,
      priority,
      message,
    });

    toast.success('Support ticket submitted successfully! A dedicated manager will respond within 4 hours.');
    setSubject('');
    setMessage('');
    setFileName('');
  };

  const faqs = [
    {
      q: 'How long does FlexiStaff Company project approval take?',
      a: 'Standard enterprise project staffing reviews are processed within 24–48 business hours. You will receive real-time notifications in your portal once approved.',
    },
    {
      q: 'Can our company reassign or remove employees directly?',
      a: 'To guarantee strict SLA compliance and contract agreements, all talent assignment and bench rotation is managed by your FlexiStaff Manager upon request.',
    },
    {
      q: 'How do we request additional talent for an ongoing sprint?',
      a: 'You can submit a new workforce requirement using the "Create Project Requirement" form or open a priority support ticket linking your active project.',
    },
    {
      q: 'Are all assigned engineers vetted and verified?',
      a: 'Yes. Every engineer in the FlexiStaff workforce pool undergoes a 5-step technical assessment, code quality audit, and background screening.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#004ac6] to-[#2563eb] text-white flex items-center justify-center shadow-md">
              <LifeBuoy size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                FlexiStaff Support Desk & SLA Help
              </h1>
              <p className="text-xs text-slate-500">
                Contact your dedicated enterprise manager, submit staffing inquiries, or report sprint blockers.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span>Priority SLA: &lt; 4 Hours Response</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Support Ticket Submission Form (Section 26) */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Submit Support Ticket or Inquire
            </h3>
            <p className="text-xs text-slate-500">Directly routed to FlexiStaff Partner Operations Desk</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Subject <span className="text-rose-500">*</span></label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Request for additional QA resource on E-Commerce sprint"
                required
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-[#004ac6]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Related Project</label>
                <select
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none"
                >
                  <option value="General Inquiry">General Inquiry / No Project</option>
                  {partnerProjects.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none"
                >
                  <option value="Critical">Critical (Production Blocker)</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Message / Request Details <span className="text-rose-500">*</span></label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe your question or issue in detail..."
                required
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none"
              />
            </div>

            {/* File Attachment Simulation */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Attachment (Optional)</label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors">
                  <Paperclip size={14} />
                  <span>Choose file...</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
                  />
                </label>
                {fileName && <span className="text-xs text-slate-600 font-mono truncate">{fileName}</span>}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:from-[#003da6] hover:to-[#1d4ed8] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Send size={14} />
              <span>Submit Support Ticket</span>
            </button>
          </form>
        </div>

        {/* Right Side: Ticket History & FAQ */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Support Tickets */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Your Support Tickets</h3>
              <span className="text-[10px] font-bold text-slate-400">{partnerSupportTickets.length} Total</span>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              {partnerSupportTickets.map((ticket) => (
                <div key={ticket.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[10px] text-indigo-700">{ticket.id}</span>
                    <span className={`px-2 py-0.2 rounded-md text-[10px] font-bold ${
                      ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900">{ticket.subject}</h4>
                  <p className="text-[10px] text-slate-400">{ticket.lastReply}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick FAQ Accordion */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-3.5">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
              Frequently Asked Questions
            </h3>

            <div className="space-y-2 text-xs">
              {faqs.map((faq, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
                  <p className="font-bold text-slate-900">{faq.q}</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerSupport;
