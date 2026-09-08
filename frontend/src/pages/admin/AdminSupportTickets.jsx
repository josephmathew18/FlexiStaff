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
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { toast } from 'react-toastify';

export const AdminSupportTickets = () => {
  const { supportTickets = [], updateSupportTicketStatus } = useData() || {};

  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'Client' | 'Manager' | 'Partner' | 'Workforce'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Open' | 'Pending Admin Review' | 'Resolved'
  const [searchQuery, setSearchQuery] = useState('');

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
          t.subject.toLowerCase().includes(q) ||
          t.senderName.toLowerCase().includes(q) ||
          t.message.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q);
      }

      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [supportTickets, roleFilter, statusFilter, searchQuery]);

  const handleUpdateStatus = (ticketId, newStatus, senderName) => {
    if (updateSupportTicketStatus) {
      updateSupportTicketStatus(ticketId, newStatus);
      toast.success(`Support ticket for ${senderName} updated to "${newStatus}"!`);
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
            Review full-detail support reports, SLA feedback, and technical inquiries submitted across all 4 portal roles.
          </p>
        </div>
      </div>

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

                {/* Admin Status Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
                  {!isResolved ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(ticket.id, 'In Progress', ticket.senderName)}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#004ac6] dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 text-xs font-bold transition-all"
                      >
                        Mark In Progress
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(ticket.id, 'Resolved', ticket.senderName)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1"
                      >
                        <Check size={14} />
                        <span>Mark Resolved</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(ticket.id, 'Pending Admin Review', ticket.senderName)}
                      className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
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
    </div>
  );
};

export default AdminSupportTickets;
