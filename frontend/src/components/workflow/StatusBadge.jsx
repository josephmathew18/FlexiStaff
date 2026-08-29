import React from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlayCircle,
  Check,
  Hourglass,
  CheckCheck,
} from 'lucide-react';

/**
 * Standard StatusBadge Component for FlexiStaff Exact Workflow
 * Supports:
 * - Project Status: 'Pending Admin Approval', 'Approved', 'In Progress', 'Completed', 'Rejected'
 * - Workforce Request Status: 'Pending', 'Accepted', 'Rejected', 'Completed'
 * - Assignment Status: 'Pending Admin Approval', 'Approved', 'Rejected', 'Awaiting Workforce Response', 'Accepted', 'Declined', 'Completed'
 */
export const StatusBadge = ({ status = 'Pending Admin Approval', size = 'sm', className = '' }) => {
  const norm = String(status || '').toLowerCase().trim();

  let config = {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: Clock,
    label: status,
  };

  // 1. Pending / Awaiting States
  if (norm.includes('pending admin approval') || norm === 'pending approval' || norm === 'pending review') {
    config = {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      icon: Clock,
      label: 'Pending Admin Approval',
    };
  } else if (norm === 'awaiting workforce response' || norm.includes('awaiting')) {
    config = {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: Hourglass,
      label: 'Awaiting Workforce Response',
    };
  } else if (norm === 'pending') {
    config = {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: Clock,
      label: 'Pending',
    };
  }
  // 2. Approved States
  else if (norm === 'approved') {
    config = {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      icon: CheckCircle2,
      label: 'Approved',
    };
  }
  // 3. In Progress / Active / Accepted States
  else if (norm === 'in progress' || norm === 'working' || norm === 'active') {
    config = {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: PlayCircle,
      label: 'In Progress',
    };
  } else if (norm === 'accepted') {
    config = {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: CheckCircle2,
      label: 'Accepted',
    };
  }
  // 4. Completed States
  else if (norm === 'completed') {
    config = {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      icon: CheckCheck,
      label: 'Completed',
    };
  }
  // 5. Rejected / Declined States
  else if (norm === 'rejected' || norm.includes('rejected')) {
    config = {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: XCircle,
      label: 'Rejected',
    };
  } else if (norm === 'declined') {
    config = {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: XCircle,
      label: 'Declined',
    };
  }

  const Icon = config.icon;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-bold ${config.bg} ${config.text} ${config.border} ${
        isSm ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
      } ${className}`}
    >
      <Icon size={isSm ? 12 : 14} className="shrink-0" />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
