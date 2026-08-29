import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  FolderCheck,
  Cpu,
  Clock,
  Check,
  Trash2,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { toast } from 'react-toastify';

export const ManagerNotifications = () => {
  const { managerNotifications, setManagerNotifications } = useData();
  const navigate = useNavigate();

  const handleMarkAllRead = () => {
    setManagerNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    toast.success('All manager notifications marked as read');
  };

  const handleNotificationClick = (notif) => {
    setManagerNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n))
    );
    if (notif.link) navigate(notif.link);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#004ac6] to-[#2563eb] text-white flex items-center justify-center shadow-md">
              <Bell size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Manager Notification Center
              </h1>
              <p className="text-xs text-slate-500">
                Live alerts for admin approvals, workforce assignments, and project milestone updates.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleMarkAllRead}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs self-start md:self-auto"
        >
          <Check size={14} />
          <span>Mark All as Read</span>
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs divide-y divide-slate-100">
        {(managerNotifications || []).map((notif) => (
          <div
            key={notif.id}
            onClick={() => handleNotificationClick(notif)}
            className={`p-4 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors flex items-start justify-between gap-4 ${
              notif.unread ? 'bg-blue-50/50' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl mt-0.5 ${notif.unread ? 'bg-[#2563eb] text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Bell size={16} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">{notif.title}</h4>
                <p className="text-xs text-slate-600 mt-0.5">{notif.message}</p>
                <span className="text-[10px] text-slate-400 mt-1 block">{notif.time}</span>
              </div>
            </div>

            {notif.unread && (
              <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagerNotifications;
