import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Clock,
  Check,
  Filter,
  FolderKanban,
  Users,
  Sparkles,
  Layers,
  ChevronRight,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useData } from '../../context/DataContext';

export const PartnerNotifications = () => {
  const {
    partnerNotifications = [],
    markPartnerNotificationRead,
    markAllPartnerNotificationsRead,
  } = useData() || {};
  const navigate = useNavigate();

  const [filterType, setFilterType] = useState('all');

  const filtered = useMemo(() => {
    return (partnerNotifications || []).filter((n) => {
      if (!n) return false;
      if (filterType === 'unread') return n.unread;
      if (filterType !== 'all' && n.type !== filterType) return false;
      return true;
    });
  }, [partnerNotifications, filterType]);

  const unreadCount = (partnerNotifications || []).filter((n) => n && n.unread).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#004ac6] to-[#2563eb] text-white flex items-center justify-center shadow-md">
              <Bell size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Partner Notification Center
              </h1>
              <p className="text-xs text-slate-500">
                Live alerts for project approvals, workforce matching, task progression, and milestone achievements.
              </p>
            </div>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllPartnerNotificationsRead}
            className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#004ac6] text-xs font-bold transition-all self-start sm:self-auto"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
            filterType === 'all' ? 'bg-[#2563eb] text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All ({partnerNotifications.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterType('unread')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
            filterType === 'unread' ? 'bg-[#2563eb] text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Unread ({unreadCount})
        </button>

        <button
          type="button"
          onClick={() => setFilterType('project')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
            filterType === 'project' ? 'bg-[#2563eb] text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Project Approvals
        </button>

        <button
          type="button"
          onClick={() => setFilterType('workforce')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
            filterType === 'workforce' ? 'bg-[#2563eb] text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Workforce & Tasks
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map((notif) => (
          <motion.div
            key={notif.id}
            layout
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => {
              markPartnerNotificationRead(notif.id);
              if (notif.link) navigate(notif.link);
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
              notif.unread
                ? 'bg-blue-50/40 border-blue-200 hover:bg-blue-50/70 shadow-2xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  notif.type === 'project' ? 'bg-indigo-50 text-indigo-600' :
                  notif.type === 'workforce' ? 'bg-emerald-50 text-emerald-600' :
                  'bg-blue-50 text-blue-600'
                }`}
              >
                {notif.type === 'project' ? <FolderKanban size={17} /> : <Users size={17} />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                  {notif.unread && (
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                <span className="text-[10px] text-slate-400 mt-1.5 block">{notif.time}</span>
              </div>
            </div>

            <ChevronRight size={16} className="text-slate-400 shrink-0 self-center" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PartnerNotifications;
