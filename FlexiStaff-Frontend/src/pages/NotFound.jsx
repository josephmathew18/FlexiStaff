import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, ArrowLeft } from 'lucide-react';
import { MdHub } from 'react-icons/md';

export const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf8ff] px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#004ac6] to-[#2563eb] text-white shadow-lg shadow-[#2563eb]/20 mb-6">
        <MdHub className="text-3xl" />
      </div>

      <h1 className="text-4xl font-extrabold text-[#191b23] tracking-tight">404</h1>
      <h2 className="mt-2 text-xl font-bold text-[#565e74]">Page Not Found</h2>
      <p className="mt-1 max-w-sm text-xs sm:text-sm text-[#737686]">
        The workforce management module or resource link you requested does not exist.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-[#1d4ed8] transition-all"
        >
          <LayoutDashboard size={16} />
          <span>Go to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
