import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Clock,
  FolderKanban,
  FileText,
  UserCheck,
  Check,
  Filter,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { toast } from 'react-toastify';

export const ClientNotifications = () => {
  const navigate = useNavigate();
  const { clientNotifications = [], markAllNotificationsRead } = useData() || {};

  const [filterType, setFilterType] = useState('all');

  const [notificationsList, setNotificationsList] = useState([
    {
      id: 'cn-101',
      title: 'Project In Progress',
      message: 'AI Clinical Decision Support Engine has 3 assigned specialists active on Sprint 4.',
      type: 'project',
      unread: false,
      time: '2 hours ago',
      link: '/client/projects/PRJ-102',
    },
    {
      id: 'cn-102',
      title: 'Project Requirement Review Pending',
      message: 'Your project requirement "AI Smart Credit Scoring Engine" is awaiting Admin sign-off.',
      type: 'approval',
      unread: true,
      time: 'Just now',
      link: '/client/projects/PRJ-REQ-201',
    },
    {
      id: 'cn-103',
      title: 'Workforce Assigned to Squad',
      message: 'Sarah Jenkins (Senior QA Engineer) was assigned to Cloud Modernization pod by Alex Morgan.',
      type: 'workforce',
      unread: true,
      time: '5 hours ago',
      link: '/client/workforce',
    },
    {
      id: 'cn-104',
      title: 'Sprint 3 Milestone Approved',
      message: 'Frontend architecture blueprint was approved by client lead.',
      type: 'project',
      unread: false,
      time: 'Yesterday',
      link: '/client/progress',
    },
    {
      id: 'cn-105',
      title: 'SOW Billing Verified',
      message: 'Q3 Enterprise billing statement ready for invoice download.',
      type: 'billing',
      unread: false,
      time: '2 days ago',
      link: '/client/profile',
    },
  ]);

  const handleMarkRead = (id) => {
    setNotificationsList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
    toast.info('Notification marked as read');
  };

  const handleMarkAllRead = () => {
    setNotificationsList((prev) => prev.map((n) => ({ ...n, unread: false })));
    if (markAllNotificationsRead) markAllNotificationsRead();
    toast.success('All notifications marked as read');
  };

  const filteredNotifications = notificationsList.filter((n) => {
    if (filterType === 'unread') return n.unread;
    if (filterType !== 'all') return n.type === filterType;
    return true;
  });

  const getNotifIcon = (type) => {
    switch (type) {
      case 'project':
        return <FolderKanban size={18} className="text-emerald-600" />;
      case 'workforce':
        return <UserCheck size={18} className="text-blue-600" />;
      case 'approval':
        return <Clock size={18} className="text-amber-600" />;
      case 'billing':
        return <FileText size={18} className="text-purple-600" />;
      default:
        return <Bell size={18} className="text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Bell size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Notifications & Activity Log
              </h1>
              <p className="text-xs text-slate-500">
                Track real-time project milestone approvals, workforce allocations, and SOW updates.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleMarkAllRead}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors self-start sm:self-auto"
        >
          <Check size={15} />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { label: 'All Activity', value: 'all' },
          { label: 'Unread Only', value: 'unread' },
          { label: 'Project Updates', value: 'project' },
          { label: 'Workforce', value: 'workforce' },
          { label: 'Approvals', value: 'approval' },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilterType(tab.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterType === tab.value
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Bell className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-600">No notifications found</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-5 flex items-start justify-between gap-4 transition-colors ${
                notif.unread ? 'bg-emerald-50/40' : 'hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-2xl bg-slate-100 border border-slate-200 shrink-0">
                  {getNotifIcon(notif.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-extrabold text-slate-900">{notif.title}</h4>
                    {notif.unread && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 font-medium block mt-1.5">{notif.time}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {notif.unread && (
                  <button
                    type="button"
                    onClick={() => handleMarkRead(notif.id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                  >
                    Mark Read
                  </button>
                )}
                {notif.link && (
                  <button
                    type="button"
                    onClick={() => navigate(notif.link)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs flex items-center gap-1"
                  >
                    <span>View</span>
                    <ArrowRight size={12} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientNotifications;
