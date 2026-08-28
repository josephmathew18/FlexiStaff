import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  FolderKanban,
  Users,
  CheckCircle2,
  Clock,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const ManagerProjectProgress = () => {
  const { projects = [], partnerProjects = [], managerAssignments = [] } = useData() || {};
  const navigate = useNavigate();

  const allProjects = [...(projects || []), ...(partnerProjects || [])].filter(
    (p, i, self) => p && p.id && i === self.findIndex((t) => t && t.id === p.id)
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#004ac6] to-[#2563eb] text-white flex items-center justify-center shadow-md">
              <TrendingUp size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Project Sprint & Progress Tracking
              </h1>
              <p className="text-xs text-slate-500">
                Monitor engineering burn-up rates, workforce milestone progress, and SLA compliance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {allProjects.map((prj) => {
          const currentProgress = prj.progress || 70;
          const assigned = prj.workforceAssigned || 3;
          const required = prj.workforceRequired || 6;

          return (
            <div
              key={prj.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {prj.id}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{prj.name}</h3>
                  <p className="text-xs text-slate-500">{prj.client || prj.partner || 'Apex Digital'}</p>
                </div>
                <span className="text-2xl font-black text-[#004ac6]">{currentProgress}%</span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>Sprint Velocity Completion</span>
                  <span>{currentProgress}% / 100%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#004ac6] to-[#2563eb] transition-all duration-500"
                    style={{ width: `${currentProgress}%` }}
                  />
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px]">Workforce</span>
                  <p className="font-bold text-slate-900 mt-0.5">{assigned} / {required} Active</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Status</span>
                  <p className="font-bold text-emerald-700 mt-0.5">{prj.status}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Target Date</span>
                  <p className="font-bold text-slate-900 mt-0.5">{prj.expectedEndDate || '2027-01-31'}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Live progress synchronized across portals</span>
                <button
                  type="button"
                  onClick={() => navigate(`/manager/projects/${prj.id}`)}
                  className="text-xs font-bold text-[#004ac6] hover:underline flex items-center gap-1"
                >
                  <span>Inspect Details</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ManagerProjectProgress;
