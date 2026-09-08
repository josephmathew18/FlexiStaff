import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, ArrowLeft } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';

export const NotFound = () => {
  const { user, role, isAuthenticated } = useAuth() || {};
  const currentRole = role || user?.role;

  let dashboardPath = '/';
  if (isAuthenticated && user) {
    if (currentRole?.toLowerCase().includes('admin')) dashboardPath = '/dashboard';
    else if (currentRole?.toLowerCase().includes('client')) dashboardPath = '/client/dashboard';
    else if (currentRole?.toLowerCase().includes('manager')) dashboardPath = '/manager/dashboard';
    else if (currentRole?.toLowerCase().includes('partner')) dashboardPath = '/partner/dashboard';
    else if (currentRole?.toLowerCase().includes('workforce') || currentRole?.toLowerCase().includes('freelancer')) dashboardPath = '/workforce/dashboard';
    else dashboardPath = '/dashboard';
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white px-4 text-center">
      <Logo size="lg" className="mb-6" />

      <h1 className="text-4xl font-extrabold text-white tracking-tight">404</h1>
      <h2 className="mt-2 text-xl font-bold text-slate-300">Page Not Found</h2>
      <p className="mt-1 max-w-sm text-xs sm:text-sm text-[#737686]">
        The workforce management module or resource link you requested does not exist.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Link
          to={dashboardPath}
          className="inline-flex items-center gap-2 rounded-xl bg-[#6A54F4] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-[#5844E5] transition-all"
        >
          <LayoutDashboard size={16} />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
