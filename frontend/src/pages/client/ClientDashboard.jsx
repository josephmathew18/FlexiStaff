import React, { useState, useMemo, useEffect, useCallback } from "react";
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
  CreditCard,
  Receipt,
  IndianRupee,
  RefreshCw,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useData } from "../../context/DataContext";
import { toast } from "react-toastify";
import { payments } from "../../services/api";
import PayNowModal from "../../components/payment/PayNowModal";
import PaymentReceiptModal from "../../components/payment/PaymentReceiptModal";

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
    duration: "6 Months",
    requiredSkills: "React.js, Node.js, Cloud",
    description: "",
  });

  // Razorpay Client Payment States (Phase 1)
  const [projectSummaries, setProjectSummaries] = useState({});
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [selectedProjectForPay, setSelectedProjectForPay] = useState(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedReceiptPaymentId, setSelectedReceiptPaymentId] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Filter projects belonging to current client
  const clientProjects = useMemo(() => {
    let authClientId = clientProfile?.id;
    try {
      const savedUserStr = localStorage.getItem('flexistaff_user');
      if (savedUserStr) {
        const u = JSON.parse(savedUserStr);
        if (u && u.id) authClientId = u.id;
      }
    } catch {}

    const companyName = (clientProfile?.company || clientProfile?.companyName || '').toLowerCase();

    return projects.filter((p) => {
      if (!p) return false;
      const matchName = Boolean(companyName && (p.client || p.clientCompanyName || p.clientName || '').toLowerCase() === companyName);
      const matchProfileId = Boolean(clientProfile?.id && (p.clientId == clientProfile.id || Number(p.clientId) === Number(clientProfile.id)));
      const matchAuthId = Boolean(authClientId && (p.clientId == authClientId || Number(p.clientId) === Number(authClientId)));
      return matchName || matchProfileId || matchAuthId;
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
    }, 0);
  }, [clientProjects]);

  const avgVelocity = useMemo(() => {
    if (!clientProjects || clientProjects.length === 0) return '0%';
    const totalProg = clientProjects.reduce((sum, p) => sum + (Number(p.progress) || 0), 0);
    return `${Math.round(totalProg / clientProjects.length)}%`;
  }, [clientProjects]);

  // Load verified financial summaries and payment history from trusted backend
  const loadFinancialData = useCallback(async () => {
    try {
      setLoadingPayments(true);
      const historyRes = await payments.getHistory().catch(() => ({ data: [] }));
      setPaymentHistory(historyRes?.data || []);

      const summaries = {};
      for (const prj of clientProjects) {
        if (prj?.id) {
          try {
            const res = await payments.getSummary(prj.id);
            if (res?.data) {
              summaries[prj.id] = res.data;
            }
          } catch (e) {
            // Summary fetch catch
          }
        }
      }
      setProjectSummaries(summaries);
    } catch (err) {
      console.error("Error loading client financial data:", err);
    } finally {
      setLoadingPayments(false);
    }
  }, [clientProjects]);

  useEffect(() => {
    if (clientProjects.length > 0) {
      loadFinancialData();
    }
  }, [clientProjects, loadFinancialData]);

  // Aggregate financial metrics across client projects
  const financialTotals = useMemo(() => {
    let totalCost = 0;
    let totalPaid = 0;
    let totalRemaining = 0;

    Object.values(projectSummaries).forEach((s) => {
      totalCost += Number(s.totalAgreedCost || 0);
      totalPaid += Number(s.totalPaid || 0);
      totalRemaining += Number(s.remainingBalance || 0);
    });

    return { totalCost, totalPaid, totalRemaining };
  }, [projectSummaries]);

  const STATS = [
    {
      title: "Active Contractors",
      value: totalContractors.toString(),
      icon: Users,
      color: "from-emerald-500 to-teal-600",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      title: "Active SOW Projects",
      value: activeCount.toString(),
      total: `/ ${clientProjects.length} Total`,
      icon: Rocket,
      color: "from-blue-600 to-indigo-600",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      title: "Sprint Velocity",
      value: avgVelocity,
      icon: Zap,
      color: "from-amber-500 to-orange-600",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      title: "Open SOW Requests",
      value: pendingCount.toString(),
      icon: UserCheck,
      color: "from-purple-600 to-violet-600",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      title: "SOW Outstanding Due",
      value: `₹${financialTotals.totalRemaining.toLocaleString('en-IN')}`,
      icon: CreditCard,
      color: "from-rose-500 to-amber-600",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
      subtext: `Agreed: ₹${financialTotals.totalCost.toLocaleString('en-IN')} • Paid: ₹${financialTotals.totalPaid.toLocaleString('en-IN')}`,
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
              {clientProfile?.company || clientProfile?.companyName || clientProfile?.name || ''}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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

      {/* ========================================================================= */}
      {/* PROJECT PAYMENT SUMMARY & RAZORPAY BILLING (PHASE 1) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-blue-100 text-blue-600">
                <CreditCard size={18} />
              </span>
              <h2 className="text-base font-bold text-slate-900">
                Project Payment Summary & Razorpay Billing
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold uppercase">
                Phase 1 Live
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Agreed deliverables cost, verified transactions, outstanding balance, and Razorpay checkout
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadFinancialData}
              disabled={loadingPayments}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              title="Sync latest payment records"
            >
              <RefreshCw size={13} className={loadingPayments ? "animate-spin" : ""} />
              <span>Sync Status</span>
            </button>
            <Link
              to="/client/payments"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
            >
              <span>Full Billing Portal</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Project Billing Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientProjects.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <CreditCard className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-600">No active client projects</p>
              <p className="text-[11px] text-slate-400">Payment summaries appear when projects are approved.</p>
            </div>
          ) : (
            clientProjects.map((prj) => {
              const summary = projectSummaries[prj.id] || {
                projectId: prj.id,
                projectName: prj.title || prj.name,
                totalAgreedCost: prj.budget || 0,
                totalPaid: 0,
                remainingBalance: prj.budget || 0,
                paymentStatus: "UNPAID",
                isEligibleForPayment: Boolean(prj.budget && Number(prj.budget) > 0),
              };

              const agreedCost = Number(summary.totalAgreedCost || 0);
              const paid = Number(summary.totalPaid || 0);
              const balance = Number(summary.remainingBalance || 0);
              const isDue = balance > 0 && summary.isEligibleForPayment;

              return (
                <div
                  key={prj.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 flex flex-col justify-between hover:border-blue-300 transition-all space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          #{prj.id ? `PRJ-${String(prj.id).padStart(3, '0')}` : 'PRJ-REQ'}
                        </span>
                        <h3 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                          {prj.title || prj.name}
                        </h3>
                      </div>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                          summary.paymentStatus === "PAID"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : summary.paymentStatus === "PARTIALLY_PAID"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {summary.paymentStatus || "UNPAID"}
                      </span>
                    </div>

                    {/* Financial Numbers */}
                    <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Agreed Cost</span>
                        <span className="text-xs font-extrabold text-slate-800">
                          ₹{agreedCost.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-emerald-600 block">Paid</span>
                        <span className="text-xs font-extrabold text-emerald-700">
                          ₹{paid.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-rose-600 block">Balance</span>
                        <span className="text-xs font-extrabold text-rose-700">
                          ₹{balance.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pay Now Button / Settled Badge */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/client/projects/${prj.id}`)}
                      className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                    >
                      <span>Details</span>
                      <ExternalLink size={12} />
                    </button>

                    {isDue ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProjectForPay(prj);
                          setIsPayModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-sm active:scale-95 transition"
                      >
                        <CreditCard size={13} />
                        <span>Pay Now (₹{balance.toLocaleString('en-IN')})</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        <CheckCircle2 size={12} />
                        <span>Settled</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Client Recent Payment History Widget */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Receipt size={14} className="text-blue-600" />
              <span>Recent Payment Transactions</span>
            </h3>
            {paymentHistory.length > 0 && (
              <Link to="/client/payments" className="text-[11px] font-bold text-blue-600 hover:text-blue-700">
                View All Transactions ({paymentHistory.length}) →
              </Link>
            )}
          </div>

          {paymentHistory.length === 0 ? (
            <div className="py-4 px-3 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No payment transactions recorded yet. Use "Pay Now" above to initiate test payment.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Project</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Reference ID</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {paymentHistory.slice(0, 3).map((pmt) => (
                    <tr key={pmt.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2 px-3 text-slate-600 font-medium">
                        {pmt.paymentDate
                          ? new Date(pmt.paymentDate).toLocaleString('en-IN', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })
                          : 'Recent'}
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        {pmt.projectName || `Project #${pmt.projectId}`}
                      </td>
                      <td className="py-2 px-3 font-extrabold text-slate-900">
                        ₹{Number(pmt.amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-slate-500 capitalize">
                        {pmt.paymentMethod || 'Razorpay Gateway'}
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-500">
                        {pmt.razorpayPaymentId || pmt.razorpayOrderId || '-'}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            pmt.status === 'SUCCESS'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : pmt.status === 'FAILED'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {pmt.status === 'SUCCESS' && <CheckCircle2 size={10} />}
                          {pmt.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        {pmt.status === 'SUCCESS' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReceiptPaymentId(pmt.id);
                              setIsReceiptModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] transition"
                          >
                            <Receipt size={12} />
                            <span>Receipt</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
                  const progressVal = project.progress || (project.status === "Completed" ? 100 : 0);
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
                          <span>Manager: {project.manager || "Assigned Manager"}</span>
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
                  placeholder="Enter project name"
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
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Required Tech Stack / Skills</label>
                <input
                  type="text"
                  placeholder="Enter required tech stack / skills"
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

      {/* Pay Now Modal */}
      {isPayModalOpen && selectedProjectForPay && (
        <PayNowModal
          project={selectedProjectForPay}
          isOpen={isPayModalOpen}
          onClose={() => {
            setIsPayModalOpen(false);
            setSelectedProjectForPay(null);
          }}
          onSuccess={() => {
            loadFinancialData();
            toast.success("Payment verified! Project balance updated.");
          }}
        />
      )}

      {/* Payment Receipt Modal */}
      {isReceiptModalOpen && selectedReceiptPaymentId && (
        <PaymentReceiptModal
          paymentId={selectedReceiptPaymentId}
          isOpen={isReceiptModalOpen}
          onClose={() => {
            setIsReceiptModalOpen(false);
            setSelectedReceiptPaymentId(null);
          }}
        />
      )}
    </div>
  );
}