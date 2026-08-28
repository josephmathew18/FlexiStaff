import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  TrendingUp,
  FileText,
  MessageSquare,
  Settings,
  HelpCircle,
  Search,
  Bell,
  Download,
  Plus,
  Rocket,
  Zap,
  UserCheck,
  CheckCircle2,
  Clock,
  UserPlus,
  ChevronDown,
  ExternalLink,
  FolderKanban,
  FilePlus,
  ArrowUpRight,
  Filter,
  Activity,
  Layers,
  Sparkles,
  ShieldCheck,
  Check,
  XCircle,
  PlayCircle,
  X,
} from "lucide-react";
import { useData } from "../../context/DataContext";
import { toast } from "react-toastify";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { clientProfile, projects = [], clientNotifications = [], submitClientProjectRequest } = useData() || {};

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Quick Request Modal State
  const [requestForm, setRequestForm] = useState({
    title: "",
    category: "Software Engineering",
    workforceRequired: 2,
    budget: "$150,000",
    duration: "6 Months",
    requiredSkills: "React.js, Node.js, Cloud",
    description: "",
  });

  // Filter projects belonging to current client
  const clientProjects = useMemo(() => {
    const companyName = (clientProfile?.company || "Finovate Global").toLowerCase();
    const clientId = clientProfile?.id;
    return projects.filter((p) => {
      if (!p) return false;
      const matchName = (p.client || "").toLowerCase().includes("finovate") || (p.client || "").toLowerCase() === companyName;
      const matchId = p.clientId === clientId;
      return matchName || matchId;
    });
  }, [projects, clientProfile]);

  // Filtered projects by search and status
  const filteredProjects = useMemo(() => {
    return clientProjects.filter((prj) => {
      let matchesStatus = true;
      if (statusFilter === "Pending") {
        matchesStatus = prj.status === "Pending Admin Approval" || prj.stage === "Pending Admin Approval";
      } else if (statusFilter === "In Progress") {
        matchesStatus = prj.status === "In Progress" || prj.status === "Approved";
      } else if (statusFilter === "Completed") {
        matchesStatus = prj.status === "Completed";
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (prj.title || prj.name || "").toLowerCase().includes(q);
        const matchesDesc = (prj.description || "").toLowerCase().includes(q);
        const matchesSkills = (prj.requiredSkills || []).some((s) => s.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesSkills) return false;
      }

      return matchesStatus;
    });
  }, [clientProjects, statusFilter, searchQuery]);

  // Compute metrics
  const activeCount = clientProjects.filter(
    (p) => p.status === "In Progress" || p.status === "Approved"
  ).length;
  const pendingCount = clientProjects.filter(
    (p) => p.status === "Pending Admin Approval" || p.stage === "Pending Admin Approval"
  ).length;
  const completedCount = clientProjects.filter((p) => p.status === "Completed").length;

  // Calculate total contractors across projects
  const totalContractors = useMemo(() => {
    return clientProjects.reduce((sum, p) => {
      const assigned = p.workforceAssigned || (p.assignedResources ? p.assignedResources.length : 0) || 0;
      return sum + assigned;
    }, 0) || 48;
  }, [clientProjects]);

  const STATS = [
    {
      title: "Active Contractors",
      value: totalContractors.toString(),
      change: "+12%",
      subtext: "Across active project pods",
      icon: Users,
      color: "from-emerald-500 to-teal-600",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      title: "Active SOW Projects",
      value: activeCount.toString(),
      total: `/ ${clientProjects.length} Total`,
      subtext: `${pendingCount} pending admin review`,
      icon: Rocket,
      color: "from-blue-600 to-indigo-600",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      title: "Sprint Velocity",
      value: "94.8%",
      change: "+3.2%",
      subtext: "Milestones met on schedule",
      icon: Zap,
      color: "from-amber-500 to-orange-600",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      title: "Open SOW Requests",
      value: pendingCount.toString(),
      badge: pendingCount > 0 ? "Reviewing" : "All Clear",
      subtext: "Avg. match SLA: < 24 hours",
      icon: UserCheck,
      color: "from-purple-600 to-violet-600",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    },
  ];

  const handleExport = () => {
    toast.success("Dashboard & Project Report exported successfully!");
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (!requestForm.title.trim()) {
      toast.error("Please enter a project title.");
      return;
    }
    if (submitClientProjectRequest) {
      submitClientProjectRequest(requestForm);
      toast.success("Project Requirement submitted for Admin approval!");
      setIsModalOpen(false);
      setRequestForm({
        title: "",
        category: "Software Engineering",
        workforceRequired: 2,
        budget: "$150,000",
        duration: "6 Months",
        requiredSkills: "React.js, Node.js, Cloud",
        description: "",
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending Admin Approval":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock size={12} className="text-amber-600" />
            <span>Pending Review</span>
          </span>
        );
      case "Approved":
      case "In Progress":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <PlayCircle size={12} className="text-emerald-600" />
            <span>In Progress</span>
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 size={12} className="text-blue-600" />
            <span>Completed</span>
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={12} className="text-rose-600" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span>{status || "Active"}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto">
      {/* Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-6 md:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider">
              {clientProfile?.company || "Finovate Global"}
            </span>
            <span className="text-xs text-slate-400 font-medium">• Enterprise Client Portal</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Workforce & Operations Control
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl">
            Real-time status of deployed engineering pods, active SOW project milestones, and talent availability.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md rounded-xl text-xs font-bold text-white transition-all active:scale-95"
          >
            <Download size={15} />
            <span>Export Report</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 rounded-xl text-xs font-extrabold shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
          >
            <Plus size={16} />
            <span>Request Talent</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="flex justify-between items-center text-slate-500 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {stat.title}
                </span>
                <div className={`p-2 rounded-xl bg-gradient-to-tr ${stat.color} text-white shadow-xs`}>
                  <Icon size={16} />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl lg:text-3xl font-extrabold text-slate-900">
                    {stat.value}
                  </span>
                  {stat.change && (
                    <span className="text-xs font-bold text-emerald-600">
                      {stat.change}
                    </span>
                  )}
                  {stat.total && (
                    <span className="text-xs font-medium text-slate-400">{stat.total}</span>
                  )}
                  {stat.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      {stat.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">{stat.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search active projects, skills, scope..."
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { label: "All Projects", value: "all" },
            { label: "Pending", value: "Pending" },
            { label: "In Progress", value: "In Progress" },
            { label: "Completed", value: "Completed" },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === tab.value
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Columns: Active Projects */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Active Projects & Pod Staffing</h2>
                <p className="text-xs text-slate-500">Live milestone progress and assigned specialist counts</p>
              </div>
              <Link
                to="/client/projects"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                View All Projects <ExternalLink size={13} />
              </Link>
            </div>

            <div className="space-y-3.5">
              {filteredProjects.length === 0 ? (
                <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <FolderKanban className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-600">No project requirements found</p>
                  <p className="text-[11px] text-slate-400">Click "Request Talent" to submit a new requirement.</p>
                </div>
              ) : (
                filteredProjects.map((project) => {
                  const progressVal = project.progress || (project.status === "Completed" ? 100 : 45);
                  const workforceCount =
                    project.workforceAssigned || (project.assignedResources ? project.assignedResources.length : 0) || 4;

                  return (
                    <div
                      key={project.id}
                      onClick={() => navigate(`/client/projects/${project.id}`)}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-emerald-50/20 hover:border-emerald-300 transition-all cursor-pointer"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 font-extrabold text-xs flex items-center justify-center border border-emerald-200">
                            {(project.title || project.name || "PR").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-slate-900 leading-snug">
                              {project.title || project.name}
                            </h3>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {project.category || "Software Engineering"} • {project.budget || "$150,000"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          {getStatusBadge(project.status || project.stage)}
                          <span className="text-[11px] font-bold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded-full">
                            {workforceCount} Specialists
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                          <span>Manager: {project.manager || "Alex Morgan"}</span>
                          <span className="font-extrabold text-slate-900">{progressVal}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                            style={{ width: `${progressVal}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Stream & Rapid CTA */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Live Activity Stream */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 flex flex-col flex-1">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Project Activity Log</h2>

            <div className="space-y-4">
              {clientNotifications.length === 0 ? (
                <p className="text-xs text-slate-400">No recent notifications.</p>
              ) : (
                clientNotifications.slice(0, 4).map((notif) => (
                  <div key={notif.id} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-bold">
                      <CheckCircle2 size={15} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">{notif.title}</p>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{notif.message}</p>
                      <span className="text-[9px] text-slate-400 mt-1 block font-medium">{notif.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Rapid AI Talent Match CTA */}
          <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-[10px] uppercase font-extrabold tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                Rapid Deployment
              </span>
              <h3 className="text-base font-extrabold mt-2">Need immediate talent?</h3>
              <p className="text-xs text-emerald-50 mt-1.5 leading-relaxed font-medium">
                Submit project requirements now to receive AI-matched, verified engineering squads in under 24 hours.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-5 w-full py-2.5 bg-white text-emerald-800 font-extrabold text-xs rounded-xl hover:bg-emerald-50 transition-all shadow-sm active:scale-95 relative z-10"
            >
              Submit Fast Requirement
            </button>
          </div>

        </div>

      </div>

      {/* Quick Project Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <FilePlus size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Request New Talent Requirement</h3>
                  <p className="text-[11px] text-slate-500">Submit project SOW for FlexiStaff Admin review</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Project / SOW Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Smart Credit Scoring Engine"
                  value={requestForm.title}
                  onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Engineers Needed</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={requestForm.workforceRequired}
                    onChange={(e) => setRequestForm({ ...requestForm, workforceRequired: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Budget</label>
                  <input
                    type="text"
                    value={requestForm.budget}
                    onChange={(e) => setRequestForm({ ...requestForm, budget: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Required Tech Stack / Skills</label>
                <input
                  type="text"
                  placeholder="e.g. React.js, Python, PyTorch, AWS"
                  value={requestForm.requiredSkills}
                  onChange={(e) => setRequestForm({ ...requestForm, requiredSkills: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Scope & Objectives Summary</label>
                <textarea
                  rows="3"
                  placeholder="Describe your technical requirements and team deliverable expectations..."
                  value={requestForm.description}
                  onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-500/20"
                >
                  Submit Requirement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}