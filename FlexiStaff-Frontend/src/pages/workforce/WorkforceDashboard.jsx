import React from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  TrendingUp,
  FolderKanban,
  Award,
  ArrowRight,
  ShieldCheck,
  Zap,
  PlayCircle,
  Building2,
  UserCheck,
  Sparkles,
  Info,
  DollarSign,
  FileCode2,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { toast } from 'react-toastify';

export const WorkforceDashboard = () => {
  const { workforceUserProfile, managerAssignments = [], updateWorkforceUserProfile } = useData() || {};

  const isCompanyEmployee =
    workforceUserProfile?.roleType === 'Professional' ||
    workforceUserProfile?.employmentType?.includes('Partner') ||
    workforceUserProfile?.employmentType?.includes('Company');

  const myAssignments = (managerAssignments || []).filter(
    (a) =>
      a.professionalName?.toLowerCase() === (workforceUserProfile?.name || 'Elena Rostova').toLowerCase() ||
      a.professionalId === workforceUserProfile?.id
  );

  const pendingOffers = myAssignments.filter((a) => a.status === 'Awaiting Workforce Response');
  const activeAssignments = myAssignments.filter((a) => a.status === 'Accepted' || a.status === 'Working');
  const completedAssignments = myAssignments.filter((a) => a.status === 'Completed');

  const handleSwitchToPartnerEmployee = () => {
    updateWorkforceUserProfile({
      name: 'Elena Rostova',
      role: 'Senior Full-Stack Developer',
      roleType: 'Professional',
      employmentType: 'Partner Company Employee',
      partnerCompany: 'Apex Digital Enterprises',
      partnerName: 'Apex Digital Enterprises',
      email: 'elena.rostova@apexdigital.io',
      experience: '6+ Years',
      hourlyRate: '$110/hr',
    });
    toast.success('Switched profile view to: Partner Company Employee (Apex Digital Enterprises)');
  };

  const handleSwitchToFreelancer = () => {
    updateWorkforceUserProfile({
      name: 'Amara Okafor',
      role: 'Mobile Application Specialist',
      roleType: 'Freelancer',
      employmentType: 'Independent Freelancer',
      partnerCompany: 'Independent Talent (Direct Registration)',
      partnerName: 'Direct Freelancer Application',
      email: 'amara.o@talent.flexistaff.ai',
      experience: '6+ Years',
      hourlyRate: '$85/hr',
    });
    toast.success('Switched profile view to: Independent Freelancer (Self-Registered)');
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              {isCompanyEmployee ? (
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold inline-flex items-center gap-1.5 shadow-xs">
                  <Building2 size={13} />
                  <span>{workforceUserProfile?.partnerCompany || 'Apex Digital Enterprises'}</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold inline-flex items-center gap-1.5 shadow-xs">
                  <UserCheck size={13} />
                  <span>Independent Freelancer</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {workforceUserProfile?.name || 'Elena Rostova'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Review Company-approved project invitations, accept assignment offers, track sprint milestones, and maintain your availability.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/workforce/assignments"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] text-white text-xs font-bold shadow-lg shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Briefcase size={16} />
              <span>
                {pendingOffers.length > 0
                  ? `Review ${pendingOffers.length} Project Invitations`
                  : 'View My Assignments'}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Employment Classification Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
                isCompanyEmployee
                  ? 'bg-gradient-to-br from-[#2563eb] to-[#4f46e5]'
                  : 'bg-gradient-to-br from-[#059669] to-[#10b981]'
              }`}
            >
              {isCompanyEmployee ? <Building2 size={24} /> : <UserCheck size={24} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Employment Status
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isCompanyEmployee
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {isCompanyEmployee ? 'Company Employee' : 'Independent Freelancer'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                {isCompanyEmployee
                  ? `Employed by ${workforceUserProfile?.partnerCompany || 'Apex Digital Enterprises'}`
                  : 'Independent Technical Freelancer (Direct Contractor)'}
              </h2>
            </div>
          </div>

          {/* Quick Demo Switcher */}
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 self-start sm:self-auto">
            <span className="text-[10px] font-bold text-slate-400 px-2 uppercase">Switch View:</span>
            <button
              type="button"
              onClick={handleSwitchToPartnerEmployee}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isCompanyEmployee
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Company Employee
            </button>
            <button
              type="button"
              onClick={handleSwitchToFreelancer}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                !isCompanyEmployee
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Freelancer
            </button>
          </div>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Engagement Model</span>
            <p className="font-extrabold text-slate-900">
              {isCompanyEmployee
                ? 'Partner Company Representation'
                : 'Direct FlexiStaff Contract'}
            </p>
            <p className="text-[11px] text-slate-500">
              {isCompanyEmployee
                ? 'Represented by verified vendor partner organization'
                : 'Independently contracted and directly matched'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Payroll & Contract Terms</span>
            <p className="font-extrabold text-slate-900">
              {isCompanyEmployee
                ? 'Managed via Partner Payroll'
                : 'Direct Milestone & Hourly Invoicing'}
            </p>
            <p className="text-[11px] text-slate-500">
              {isCompanyEmployee
                ? `Contract governed by ${workforceUserProfile?.partnerCompany || 'Partner'}`
                : 'Standard independent freelancer agreement'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Bench & Availability</span>
            <p className="font-extrabold text-slate-900">
              {isCompanyEmployee
                ? 'Synchronized with Partner Roster'
                : 'Self-Managed Bench Availability'}
            </p>
            <p className="text-[11px] text-slate-500">
              {isCompanyEmployee
                ? 'Availability status coordinated with Partner Manager'
                : 'You directly toggle live availability for project matching'}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Project Invitations</span>
            <Clock size={16} className="text-indigo-500" />
          </div>
          <p className="text-2xl font-extrabold text-indigo-600 mt-2">{pendingOffers.length}</p>
          <span className="text-[10px] text-indigo-700 font-medium mt-1 block">Awaiting Your Response</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Assignments</span>
            <PlayCircle size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 mt-2">{activeAssignments.length}</p>
          <span className="text-[10px] text-emerald-700 font-medium mt-1 block">Active in Sprints</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Completed Projects</span>
            <CheckCircle2 size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold text-blue-600 mt-2">{completedAssignments.length}</p>
          <span className="text-[10px] text-blue-700 font-medium mt-1 block">Delivered</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Availability Status</span>
            <CheckCircle2 size={16} className="text-purple-500" />
          </div>
          <p className="text-base font-extrabold text-purple-600 mt-2">
            {workforceUserProfile?.availability || 'Available'}
          </p>
          <span className="text-[10px] text-slate-500 font-medium mt-1 block">Live in Talent Pool</span>
        </div>
      </div>

      {/* Pending Offers Callout */}
      {pendingOffers.length > 0 && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-50 via-indigo-50 to-white border border-purple-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-purple-600 text-white shadow-md">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                You have {pendingOffers.length} Company-Approved Project Invitation(s)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                The Organization Manager matched your skills and the Company has authorized the assignment offer.
              </p>
            </div>
          </div>
          <Link
            to="/workforce/assignments"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all self-start sm:self-auto"
          >
            Review & Respond →
          </Link>
        </div>
      )}

      {/* Active Assignments Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Active Project Assignments</h2>
            <p className="text-xs text-slate-500">Milestone deliverables and sprint execution status.</p>
          </div>
          <Link
            to="/workforce/assignments"
            className="text-xs font-bold text-[#7c3aed] hover:underline flex items-center gap-1"
          >
            <span>All Assignments</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeAssignments.length === 0 ? (
            <div className="col-span-2 p-8 rounded-3xl bg-white border border-dashed border-slate-200 text-center text-xs text-slate-500">
              No active project assignments. Review pending invitations to get started.
            </div>
          ) : (
            activeAssignments.map((asg) => (
              <div
                key={asg.id}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400">{asg.projectId}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      {asg.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{asg.projectName}</h3>
                    <p className="text-xs font-bold text-purple-600 mt-0.5">Role: {asg.role}</p>
                    <p className="text-xs text-slate-500 mt-1">Client: {asg.client || asg.partnerName}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                      <span>Sprint Progress</span>
                      <span>{asg.progress || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#7c3aed]"
                        style={{ width: `${asg.progress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Current: {asg.currentTask || 'Sprint Execution'}</span>
                  <span className="font-bold text-slate-900">{asg.hourlyRate || '$95/hr'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkforceDashboard;
