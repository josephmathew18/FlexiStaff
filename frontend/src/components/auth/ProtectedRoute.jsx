import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowRight, LogOut } from 'lucide-react';

export const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Normalize role matching
  const currentRole = role || user.role;
  const isAuthorized =
    allowedRoles.length === 0 ||
    allowedRoles.some(
      (r) =>
        r.toLowerCase() === (currentRole || '').toLowerCase() ||
        (r === 'Admin' && currentRole?.toLowerCase().includes('admin')) ||
        (r === 'Client' && currentRole?.toLowerCase().includes('client')) ||
        (r === 'Partner Company' && currentRole?.toLowerCase().includes('partner')) ||
        (r === 'Manager' && currentRole?.toLowerCase().includes('manager')) ||
        (r === 'Workforce' && (currentRole?.toLowerCase().includes('workforce') || currentRole?.toLowerCase().includes('professional') || currentRole?.toLowerCase().includes('freelancer') || currentRole?.toLowerCase().includes('talent')))
    );

  if (!isAuthorized) {
    // Determine proper redirect for user's actual role
    let correctPath = '/dashboard';
    if (currentRole?.toLowerCase().includes('admin')) correctPath = '/admin/dashboard';
    else if (currentRole?.toLowerCase().includes('client')) correctPath = '/client/dashboard';
    else if (currentRole?.toLowerCase().includes('manager')) correctPath = '/manager/dashboard';
    else if (currentRole?.toLowerCase().includes('partner')) correctPath = '/partner/dashboard';
    else if (currentRole?.toLowerCase().includes('workforce') || currentRole?.toLowerCase().includes('professional') || currentRole?.toLowerCase().includes('freelancer')) correctPath = '/workforce/dashboard';

    return (
      <div className="min-h-screen bg-[#faf8ff] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl border border-rose-200 bg-white p-7 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
            <ShieldAlert size={30} />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Access Denied
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Your account role (<strong className="text-slate-800">{currentRole}</strong>) is not authorized to access this portal route.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-900 block">Role-Based Access Control</span>
            <p>Please return to your assigned portal or sign in with an account having appropriate privileges.</p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Link
              to={correctPath}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#2563eb] text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:bg-[#1d4ed8] active:scale-95 transition-all inline-flex items-center justify-center gap-1.5"
            >
              <span>Go to My Portal</span>
              <ArrowRight size={14} />
            </Link>

            <button
              type="button"
              onClick={logout}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
