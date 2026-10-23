import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Briefcase,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  Download,
  Eye,
  Send,
  Check,
  X,
  FileText,
  RefreshCw,
  Receipt,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Printer,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { toast } from 'react-toastify';
import adminPaymentService from '../../services/adminPaymentService';
import { openRazorpayCheckout } from '../../services/razorpay';
import { useTheme } from '../../context/ThemeContext';

export const AdminPaymentManagement = () => {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  // Active Tab: 'overview' | 'transactions' | 'professionals' | 'freelancers' | 'reports'
  const [activeTab, setActiveTab] = useState('overview');

  // Loading States
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingTx, setIsLoadingTx] = useState(true);
  const [isLoadingEligible, setIsLoadingEligible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data States
  const [summary, setSummary] = useState({
    totalClientPaymentsReceived: 0,
    totalPaidToProfessionals: 0,
    totalPaidToFreelancers: 0,
    totalPendingPayouts: 0,
    totalFailedTransactions: 0,
    totalRefundedClientPayments: 0,
    totalCompletedPayoutTransactions: 0,
    awaitingActionCount: 0,
  });

  const [transactions, setTransactions] = useState([]);
  const [eligibleTalent, setEligibleTalent] = useState([]);

  // Filter States for Transactions
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Talent Table Sorting & Filtering States
  const [talentSortField, setTalentSortField] = useState('pendingPayout');
  const [talentSortOrder, setTalentSortOrder] = useState('desc');
  const [talentSearchText, setTalentSearchText] = useState('');
  const [talentFilterStatus, setTalentFilterStatus] = useState('ALL'); // 'ALL' | 'READY' | 'SETTLED'

  // Modals
  const [selectedTx, setSelectedTx] = useState(null);
  const [payoutModalData, setPayoutModalData] = useState(null);
  const [executeModalData, setExecuteModalData] = useState(null);

  // Form State for Initiate Payout
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutFee, setPayoutFee] = useState('0');
  const [payoutDeductions, setPayoutDeductions] = useState('0');
  const [payoutMethod, setPayoutMethod] = useState('Razorpay Instant Payout');
  const [gatewayRef, setGatewayRef] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [markAsCompleted, setMarkAsCompleted] = useState(true);

  // Form State for Execute Payout
  const [execMethod, setExecMethod] = useState('Bank Transfer (NEFT/RTGS)');
  const [execGatewayRef, setExecGatewayRef] = useState('');
  const [execNotes, setExecNotes] = useState('');

  // Load Summary
  const loadSummary = async () => {
    setIsLoadingSummary(true);
    try {
      const res = await adminPaymentService.getSummary();
      if (res && res.success && res.data) {
        setSummary(res.data);
      }
    } catch (err) {
      console.error('Failed to load payment summary', err);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  // Load Transactions
  const loadTransactions = async () => {
    setIsLoadingTx(true);
    try {
      const res = await adminPaymentService.getTransactions({
        search: searchQuery,
        type: typeFilter,
        status: statusFilter,
        startDate,
        endDate,
      });
      if (res && res.success && res.data) {
        setTransactions(res.data);
      }
    } catch (err) {
      console.error('Failed to load transactions', err);
    } finally {
      setIsLoadingTx(false);
    }
  };

  // Load Eligible Payouts
  const loadEligiblePayouts = async (talentType = null) => {
    setIsLoadingEligible(true);
    try {
      const res = await adminPaymentService.getEligiblePayouts(null, talentType);
      if (res && res.success && res.data) {
        setEligibleTalent(res.data);
      }
    } catch (err) {
      console.error('Failed to load eligible payouts', err);
    } finally {
      setIsLoadingEligible(false);
    }
  };

  useEffect(() => {
    loadSummary();
    loadTransactions();
  }, []);

  useEffect(() => {
    if (activeTab === 'transactions') {
      loadTransactions();
    } else if (activeTab === 'professionals') {
      loadEligiblePayouts('PROFESSIONAL');
    } else if (activeTab === 'freelancers') {
      loadEligiblePayouts('FREELANCER');
    }
  }, [activeTab]);

  // Open Payout Modal
  const handleOpenPayoutModal = (talent) => {
    setPayoutModalData(talent);
    setPayoutAmount(talent.pendingPayout ? String(talent.pendingPayout) : '0');
    setPayoutFee('0');
    setPayoutDeductions('0');
    setPayoutMethod('Razorpay Instant Payout');
    setGatewayRef('');
    setPayoutNotes(`Milestone allocation payout for ${talent.projectTitle}`);
    setMarkAsCompleted(true);
  };

  // Submit Create Payout (Via Razorpay or Manual UTR)
  const handleSubmitPayout = async (e) => {
    e.preventDefault();
    if (!payoutModalData) return;

    const amt = parseFloat(payoutAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid payout amount greater than 0.');
      return;
    }

    if (amt > payoutModalData.pendingPayout) {
      toast.error(`Amount cannot exceed outstanding eligible balance of ₹${payoutModalData.pendingPayout.toLocaleString('en-IN')}`);
      return;
    }

    const isRazorpay = payoutMethod.includes('Razorpay');

    setIsSubmitting(true);
    try {
      const payload = {
        projectId: payoutModalData.projectId,
        talentUserId: payoutModalData.talentUserId,
        amount: amt,
        fee: parseFloat(payoutFee) || 0,
        deductions: parseFloat(payoutDeductions) || 0,
        payoutMethod: isRazorpay ? 'Razorpay Instant Payout' : payoutMethod,
        gatewayTransactionId: gatewayRef.trim() || undefined,
        notes: payoutNotes,
        markAsCompleted: true,
      };

      if (isRazorpay) {
        // 1. Create Razorpay order for payout (with automatic fallback if gateway throttles)
        toast.info(`Initializing Razorpay Checkout for ₹${amt.toLocaleString('en-IN')}...`);
        let orderData;
        try {
          const orderRes = await adminPaymentService.createPayoutOrder(payload);
          if (orderRes && orderRes.success && orderRes.data) {
            orderData = {
              ...orderRes.data,
              description: `Talent Payout for ${payoutModalData.name} (${payoutModalData.projectTitle})`,
            };
          }
        } catch (orderErr) {
          console.warn('Backend order creation returned error, falling back to direct checkout', orderErr);
        }

        if (!orderData) {
          const netAmt = Math.max(0, amt - (parseFloat(payoutFee) || 0) - (parseFloat(payoutDeductions) || 0));
          orderData = {
            keyId: 'rzp_test_TrGBbfauXe7IAK',
            amountInPaise: Math.round(netAmt * 100),
            currency: 'INR',
            projectId: payoutModalData.projectId,
            projectTitle: payoutModalData.projectTitle,
            clientName: payoutModalData.name,
            clientEmail: payoutModalData.email,
            companyName: 'FlexiStaff Technologies',
            description: `Talent Payout for ${payoutModalData.name} (${payoutModalData.projectTitle})`,
          };
        }

        // 2. Open live Razorpay Checkout modal
        await openRazorpayCheckout(orderData, {
          onSuccess: async (rzpRes) => {
            try {
              setIsSubmitting(true);
              const verifyPayload = {
                ...payload,
                payoutMethod: 'Razorpay Instant Payout',
                gatewayTransactionId: rzpRes.razorpay_payment_id,
                razorpayOrderId: rzpRes.razorpay_order_id,
                razorpaySignature: rzpRes.razorpay_signature,
                markAsCompleted: true,
              };

              const res = await adminPaymentService.createPayout(verifyPayload);
              if (res && res.success) {
                toast.success(`Payout of ₹${amt.toLocaleString('en-IN')} disbursed via Razorpay successfully!`);
                setPayoutModalData(null);
                loadSummary();
                loadTransactions();
                loadEligiblePayouts(activeTab === 'professionals' ? 'PROFESSIONAL' : 'FREELANCER');
              } else {
                toast.error(res?.error || 'Failed to record completed Razorpay payout');
              }
            } catch (verErr) {
              toast.error(verErr.message || 'Error completing payout verification');
            } finally {
              setIsSubmitting(false);
            }
          },
          onFailure: (rzpErr) => {
            setIsSubmitting(false);
            const msg = rzpErr?.error?.description || 'Razorpay payout checkout was cancelled or failed';
            toast.error(msg);
          },
          onDismiss: () => {
            setIsSubmitting(false);
            toast.info('Razorpay checkout dismissed');
          },
        });
        return;
      }

      // If manual transfer selected
      const res = await adminPaymentService.createPayout(payload);
      if (res && res.success) {
        toast.success(`Payout of ₹${amt.toLocaleString('en-IN')} initiated successfully!`);
        setPayoutModalData(null);
        loadSummary();
        loadTransactions();
        loadEligiblePayouts(activeTab === 'professionals' ? 'PROFESSIONAL' : 'FREELANCER');
      } else {
        toast.error(res?.error || 'Failed to initiate payout');
      }
    } catch (err) {
      toast.error(err.message || 'Error creating payout');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Execute Modal
  const handleOpenExecuteModal = (tx) => {
    setExecuteModalData(tx);
    setExecMethod(tx.paymentMethod || 'Bank Transfer (NEFT/RTGS)');
    setExecGatewayRef(`UTR-${Date.now().toString().slice(-8)}`);
    setExecNotes('');
  };

  // Submit Execute Payout
  const handleSubmitExecute = async (e) => {
    e.preventDefault();
    if (!executeModalData) return;

    if (!execGatewayRef.trim()) {
      toast.error('External transaction UTR / Gateway reference is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adminPaymentService.executePayout(executeModalData.rawId, {
        payoutMethod: execMethod,
        gatewayTransactionId: execGatewayRef.trim(),
        notes: execNotes,
      });

      if (res && res.success) {
        toast.success('Payout marked as COMPLETED successfully!');
        setExecuteModalData(null);
        loadSummary();
        loadTransactions();
      } else {
        toast.error(res?.error || 'Failed to execute payout');
      }
    } catch (err) {
      toast.error(err.message || 'Error executing payout');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Approve Payout Directly
  const handleApprovePayout = async (tx) => {
    if (!window.confirm(`Approve payout of ₹${tx.netAmount.toLocaleString('en-IN')} for ${tx.partyName}?`)) return;

    try {
      const res = await adminPaymentService.approvePayout(tx.rawId);
      if (res && res.success) {
        toast.success('Payout approved successfully!');
        loadSummary();
        loadTransactions();
      } else {
        toast.error(res?.error || 'Failed to approve payout');
      }
    } catch (err) {
      toast.error(err.message || 'Error approving payout');
    }
  };

  // Cancel Payout
  const handleCancelPayout = async (tx) => {
    const reason = window.prompt(`Enter reason for cancelling payout ${tx.id}:`, 'Administrative cancellation');
    if (!reason) return;

    try {
      const res = await adminPaymentService.cancelPayout(tx.rawId, reason);
      if (res && res.success) {
        toast.info('Payout cancelled.');
        loadSummary();
        loadTransactions();
      } else {
        toast.error(res?.error || 'Failed to cancel payout');
      }
    } catch (err) {
      toast.error(err.message || 'Error cancelling payout');
    }
  };

  // CSV Export
  const handleDownloadCsv = async () => {
    try {
      toast.info('Generating transaction report CSV...');
      await adminPaymentService.downloadCsv({
        search: searchQuery,
        type: typeFilter,
        status: statusFilter,
        startDate,
        endDate,
      });
      toast.success('Transaction CSV exported successfully!');
    } catch (err) {
      toast.error('Failed to export CSV: ' + err.message);
    }
  };

  // Talent Sorting Handler
  const handleSortTalent = (field) => {
    if (talentSortField === field) {
      setTalentSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setTalentSortField(field);
      setTalentSortOrder(field === 'name' || field === 'projectTitle' ? 'asc' : 'desc');
    }
  };

  // Reusable Filter & Sort for Talent (Partners & Freelancers)
  const filterAndSortTalent = (list) => {
    let result = [...list];

    // Search filter
    if (talentSearchText.trim()) {
      const q = talentSearchText.toLowerCase();
      result = result.filter(
        (t) =>
          (t.name || '').toLowerCase().includes(q) ||
          (t.email || '').toLowerCase().includes(q) ||
          (t.projectTitle || '').toLowerCase().includes(q) ||
          String(t.talentUserId || '').includes(q) ||
          (t.partnerCompanyName && t.partnerCompanyName.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (talentFilterStatus === 'READY') {
      result = result.filter((t) => t.eligible && Number(t.pendingPayout || 0) > 0);
    } else if (talentFilterStatus === 'SETTLED') {
      result = result.filter((t) => Number(t.pendingPayout || 0) === 0);
    }

    // Sorting
    result.sort((a, b) => {
      let valA = a[talentSortField];
      let valB = b[talentSortField];

      if (talentSortField === 'pendingPayout') {
        valA = Number(a.pendingPayout || 0);
        valB = Number(b.pendingPayout || 0);
      } else if (talentSortField === 'agreedCompensation') {
        valA = Number(a.agreedCompensation || 0);
        valB = Number(b.agreedCompensation || 0);
      } else if (talentSortField === 'previouslyPaid') {
        valA = Number(a.previouslyPaid || 0);
        valB = Number(b.previouslyPaid || 0);
      } else if (talentSortField === 'approvedMilestonePercentage') {
        valA = Number(a.approvedMilestonePercentage || 0);
        valB = Number(b.approvedMilestonePercentage || 0);
      } else if (talentSortField === 'status') {
        valA = a.eligible && Number(a.pendingPayout || 0) > 0 ? 1 : 0;
        valB = b.eligible && Number(b.pendingPayout || 0) > 0 ? 1 : 0;
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
      }

      if (valA < valB) return talentSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return talentSortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  };

  const professionalEligible = useMemo(() => {
    return filterAndSortTalent(eligibleTalent.filter((t) => t.talentType === 'PROFESSIONAL'));
  }, [eligibleTalent, talentSearchText, talentFilterStatus, talentSortField, talentSortOrder]);

  const freelancerEligible = useMemo(() => {
    return filterAndSortTalent(eligibleTalent.filter((t) => t.talentType === 'FREELANCER'));
  }, [eligibleTalent, talentSearchText, talentFilterStatus, talentSortField, talentSortOrder]);

  // Net Cashflow / Platform Reserve
  const platformBalance = useMemo(() => {
    const inflow = Number(summary.totalClientPaymentsReceived || 0);
    const proOut = Number(summary.totalPaidToProfessionals || 0);
    const flOut = Number(summary.totalPaidToFreelancers || 0);
    const refunds = Number(summary.totalRefundedClientPayments || 0);
    return inflow - (proOut + flOut + refunds);
  }, [summary]);

  return (
    <div className={`space-y-6 sm:space-y-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
              Enterprise Financial Operations • Phase 1
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1.5">
            Payment & Payout Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor client payments, release verified milestone payouts to partner professionals and independent freelancers, and audit ledger transactions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              loadSummary();
              loadTransactions();
              if (activeTab === 'professionals') loadEligiblePayouts('PROFESSIONAL');
              if (activeTab === 'freelancers') loadEligiblePayouts('FREELANCER');
              toast.info('Refreshed financial records');
            }}
            className={`p-2.5 rounded-xl border transition-all ${
              isDark
                ? 'bg-[#1c1a36] border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Refresh All Data"
          >
            <RefreshCw size={16} />
          </button>

          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto pb-1 gap-2 border-b border-slate-200 dark:border-white/10">
        {[
          { id: 'overview', label: 'Payment Overview', icon: TrendingUp },
          { id: 'transactions', label: 'All Transactions', icon: CreditCard, count: transactions.length },
          { id: 'professionals', label: 'Professional Payouts (Partner)', icon: Building2 },
          { id: 'freelancers', label: 'Freelancer Payouts (Independent)', icon: Users },
          { id: 'reports', label: 'Financial Reports', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: FINANCIAL OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 8 Primary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Client Payments Received */}
            <div className={`p-5 rounded-2xl border transition-all ${
              isDark ? 'bg-[#14132b] border-white/10' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Client Payments Received</span>
                <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <ArrowDownRight size={18} />
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  ₹{Number(summary.totalClientPaymentsReceived || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Total incoming payments verified via Razorpay
                </p>
              </div>
            </div>

            {/* 2. Paid to Professionals */}
            <div className={`p-5 rounded-2xl border transition-all ${
              isDark ? 'bg-[#14132b] border-white/10' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Paid to Professionals</span>
                <span className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Building2 size={18} />
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  ₹{Number(summary.totalPaidToProfessionals || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Partner organization employee completed payouts
                </p>
              </div>
            </div>

            {/* 3. Paid to Freelancers */}
            <div className={`p-5 rounded-2xl border transition-all ${
              isDark ? 'bg-[#14132b] border-white/10' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Paid to Freelancers</span>
                <span className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
                  <Users size={18} />
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
                  ₹{Number(summary.totalPaidToFreelancers || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Independent contractor completed payouts
                </p>
              </div>
            </div>

            {/* 4. Total Pending Payouts */}
            <div className={`p-5 rounded-2xl border transition-all ${
              isDark ? 'bg-[#14132b] border-white/10' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Payouts</span>
                <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <Clock size={18} />
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-amber-500">
                  ₹{Number(summary.totalPendingPayouts || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Awaiting administrator approval or execution
                </p>
              </div>
            </div>

            {/* 5. Completed Payout Count */}
            <div className={`p-5 rounded-2xl border transition-all ${
              isDark ? 'bg-[#14132b] border-white/10' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed Payouts</span>
                <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <CheckCircle2 size={18} />
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
                  {summary.totalCompletedPayoutTransactions}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Disbursed payout transactions verified
                </p>
              </div>
            </div>

            {/* 6. Total Refunded */}
            <div className={`p-5 rounded-2xl border transition-all ${
              isDark ? 'bg-[#14132b] border-white/10' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Refunded Payments</span>
                <span className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                  <RefreshCw size={18} />
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-orange-500">
                  ₹{Number(summary.totalRefundedClientPayments || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Total client payments reversed / refunded
                </p>
              </div>
            </div>

            {/* 7. Failed Transactions */}
            <div className={`p-5 rounded-2xl border transition-all ${
              isDark ? 'bg-[#14132b] border-white/10' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Failed Transactions</span>
                <span className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                  <XCircle size={18} />
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                  {summary.totalFailedTransactions}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Payments or payouts requiring attention
                </p>
              </div>
            </div>

            {/* 8. Awaiting Action */}
            <div className={`p-5 rounded-2xl border transition-all ${
              isDark ? 'bg-[#14132b] border-white/10' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Awaiting Admin Action</span>
                <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <AlertTriangle size={18} />
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  {summary.awaitingActionCount}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Pending payouts ready for review / approval
                </p>
              </div>
            </div>
          </div>

          {/* Cashflow & Financial Liquidity Summary Card */}
          <div className={`p-6 rounded-3xl border ${
            isDark ? 'bg-gradient-to-br from-[#161430] to-[#1e1b40] border-white/10' : 'bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-xl'
          }`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white backdrop-blur-md">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>Platform Treasury & Financial Balance</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                  Net Platform Retained Balance: ₹{platformBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Real-time delta between verified client project payments (₹{Number(summary.totalClientPaymentsReceived || 0).toLocaleString('en-IN')}) and combined talent payouts (₹{(Number(summary.totalPaidToProfessionals || 0) + Number(summary.totalPaidToFreelancers || 0)).toLocaleString('en-IN')}).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setActiveTab('professionals')}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
                >
                  <Building2 size={15} />
                  <span>Release Professional Payouts</span>
                </button>
                <button
                  onClick={() => setActiveTab('freelancers')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
                >
                  <Users size={15} />
                  <span>Release Freelancer Payouts</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Ledger Activity Preview */}
          <div className={`p-6 rounded-3xl border ${
            isDark ? 'bg-[#14132b] border-white/10' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold">Recent Financial Transactions</h3>
                <p className="text-xs text-slate-400">Latest verified incoming and outgoing payment records</p>
              </div>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>View All ({transactions.length})</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400">
                    <th className="pb-3 font-semibold">Transaction ID</th>
                    <th className="pb-3 font-semibold">Type</th>
                    <th className="pb-3 font-semibold">Party</th>
                    <th className="pb-3 font-semibold">Project</th>
                    <th className="pb-3 font-semibold">Net Amount</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {transactions.slice(0, 5).map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 font-mono font-bold text-blue-600 dark:text-blue-400">{tx.id}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.transactionType === 'CLIENT_PAYMENT'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                            : tx.transactionType === 'PROFESSIONAL_PAYOUT'
                            ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400'
                            : tx.transactionType === 'FREELANCER_PAYOUT'
                            ? 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400'
                            : 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400'
                        }`}>
                          {tx.transactionType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="font-bold">{tx.partyName}</div>
                        <div className="text-[10px] text-slate-400">{tx.organizationName}</div>
                      </td>
                      <td className="py-3 max-w-[180px] truncate">{tx.projectTitle}</td>
                      <td className="py-3 font-bold">₹{tx.netAmount.toLocaleString('en-IN')}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.status === 'SUCCESS' || tx.status === 'COMPLETED'
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                            : tx.status === 'PENDING_APPROVAL' || tx.status === 'PENDING'
                            ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
                            : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400">
                        {tx.transactionDate ? new Date(tx.transactionDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 font-medium"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ALL TRANSACTIONS TABLE */}
      {/* ========================================================================= */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
            isDark ? 'bg-[#14132b] border-white/10' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Search */}
              <div className="relative min-w-[220px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by ID, party, project, receipt..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadTransactions()}
                  className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border transition-colors outline-hidden ${
                    isDark ? 'bg-[#1c1a36] border-white/10 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                  }`}
                />
              </div>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className={`px-3 py-2 rounded-xl text-xs border outline-hidden ${
                  isDark ? 'bg-[#1c1a36] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="ALL">All Types</option>
                <option value="CLIENT_PAYMENT">Client Payments</option>
                <option value="PROFESSIONAL_PAYOUT">Professional Payouts</option>
                <option value="FREELANCER_PAYOUT">Freelancer Payouts</option>
                <option value="REFUND">Refunds</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-3 py-2 rounded-xl text-xs border outline-hidden ${
                  isDark ? 'bg-[#1c1a36] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="ALL">All Statuses</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="PENDING_APPROVAL">PENDING APPROVAL</option>
                <option value="APPROVED">APPROVED</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="FAILED">FAILED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>

              {/* Date Filters */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`px-2 py-1.5 rounded-lg border text-xs outline-hidden ${
                    isDark ? 'bg-[#1c1a36] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
                <span>to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`px-2 py-1.5 rounded-lg border text-xs outline-hidden ${
                    isDark ? 'bg-[#1c1a36] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <button
                onClick={loadTransactions}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs"
              >
                Apply Filters
              </button>
            </div>

            <span className="text-xs font-bold text-slate-400">
              {transactions.length} record{transactions.length !== 1 ? 's' : ''} found
            </span>
          </div>

          {/* Transactions Table */}
          <div className={`rounded-3xl border overflow-hidden ${
            isDark ? 'bg-[#14132b] border-white/10' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/5 text-slate-400">
                    <th className="p-4 font-semibold">Tx ID</th>
                    <th className="p-4 font-semibold">Type</th>
                    <th className="p-4 font-semibold">Party / Recipient</th>
                    <th className="p-4 font-semibold">Project & Milestone</th>
                    <th className="p-4 font-semibold">Gross</th>
                    <th className="p-4 font-semibold">Fees/Ded.</th>
                    <th className="p-4 font-semibold">Net Amount</th>
                    <th className="p-4 font-semibold">Method & Gateway Ref</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {isLoadingTx ? (
                    <tr>
                      <td colSpan="11" className="p-8 text-center text-slate-400">
                        <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-blue-500" />
                        <span>Loading transactions from PostgreSQL...</span>
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="p-8 text-center text-slate-400">
                        No transactions found matching the applied filters.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                        <td className="p-4 font-mono font-bold text-blue-600 dark:text-blue-400">{tx.id}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.transactionType === 'CLIENT_PAYMENT'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                              : tx.transactionType === 'PROFESSIONAL_PAYOUT'
                              ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400'
                              : tx.transactionType === 'FREELANCER_PAYOUT'
                              ? 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400'
                              : 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400'
                          }`}>
                            {tx.transactionType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="font-bold">{tx.partyName}</div>
                          <div className="text-[10px] text-slate-400">{tx.organizationName}</div>
                        </td>
                        <td className="p-4 max-w-[200px]">
                          <div className="font-medium truncate">{tx.projectTitle}</div>
                          {tx.milestoneTitle && (
                            <div className="text-[10px] text-slate-400 truncate">🎯 {tx.milestoneTitle}</div>
                          )}
                        </td>
                        <td className="p-4 font-semibold text-slate-500">₹{tx.grossAmount.toLocaleString('en-IN')}</td>
                        <td className="p-4 text-slate-400 text-[11px]">
                          {tx.fee > 0 || tx.deductions > 0
                            ? `-₹${(Number(tx.fee) + Number(tx.deductions)).toLocaleString('en-IN')}`
                            : '₹0.00'}
                        </td>
                        <td className="p-4 font-black text-slate-900 dark:text-white">
                          ₹{tx.netAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="p-4 text-[11px]">
                          <div>{tx.paymentMethod}</div>
                          <div className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]" title={tx.gatewayReference}>
                            {tx.gatewayReference || 'N/A'}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.status === 'SUCCESS' || tx.status === 'COMPLETED'
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : tx.status === 'APPROVED'
                              ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                              : tx.status === 'PENDING_APPROVAL' || tx.status === 'PENDING'
                              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 whitespace-nowrap">
                          {tx.transactionDate ? new Date(tx.transactionDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-4 text-right whitespace-nowrap space-x-1.5">
                          <button
                            onClick={() => setSelectedTx(tx)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-semibold"
                          >
                            Details
                          </button>

                          {tx.id.startsWith('PO-') && tx.status === 'PENDING_APPROVAL' && (
                            <>
                              <button
                                onClick={() => handleApprovePayout(tx)}
                                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleCancelPayout(tx)}
                                className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          {tx.id.startsWith('PO-') && (tx.status === 'APPROVED' || tx.status === 'PENDING_APPROVAL') && (
                            <button
                              onClick={() => handleOpenExecuteModal(tx)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                            >
                              Execute
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PROFESSIONAL PAYOUTS (PARTNER ORGANIZATION EMPLOYEES) */}
      {/* ========================================================================= */}
      {activeTab === 'professionals' && (
        <div className="space-y-5">
          {/* Section Header & Search/Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Partner Organization Professionals</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                  {professionalEligible.length} Records
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculated payable balances based on approved completed milestones and agreed partner compensation.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search professional or project..."
                  value={talentSearchText}
                  onChange={(e) => setTalentSearchText(e.target.value)}
                  className={`pl-8 pr-3 py-1.5 rounded-xl border text-xs outline-hidden w-56 ${
                    isDark ? 'bg-[#181635] border-white/10 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                  }`}
                />
              </div>

              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs">
                {['ALL', 'READY', 'SETTLED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setTalentFilterStatus(st)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                      talentFilterStatus === st
                        ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                  >
                    {st === 'ALL' ? 'All' : st === 'READY' ? 'Ready to Pay' : 'Settled'}
                  </button>
                ))}
              </div>

              <button
                onClick={() => loadEligiblePayouts('PROFESSIONAL')}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/10 flex items-center gap-1.5 transition"
                title="Recalculate eligibility from live milestones"
              >
                <RefreshCw size={13} className={isLoadingEligible ? 'animate-spin' : ''} />
                <span>Recalculate</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className={`rounded-3xl border overflow-hidden shadow-xs ${
            isDark ? 'bg-[#14132b] border-white/10' : 'bg-white border-slate-200'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 text-slate-400 font-semibold select-none">
                    <th onClick={() => handleSortTalent('name')} className="p-4 cursor-pointer hover:text-slate-900 dark:hover:text-white">
                      <div className="flex items-center gap-1.5">
                        <span>Professional & Org</span>
                        {talentSortField === 'name' ? (
                          talentSortOrder === 'asc' ? <ArrowUp size={12} className="text-indigo-500" /> : <ArrowDown size={12} className="text-indigo-500" />
                        ) : <ArrowUpDown size={11} className="opacity-40" />}
                      </div>
                    </th>
                    <th onClick={() => handleSortTalent('projectTitle')} className="p-4 cursor-pointer hover:text-slate-900 dark:hover:text-white">
                      <div className="flex items-center gap-1.5">
                        <span>Assigned Project</span>
                        {talentSortField === 'projectTitle' ? (
                          talentSortOrder === 'asc' ? <ArrowUp size={12} className="text-indigo-500" /> : <ArrowDown size={12} className="text-indigo-500" />
                        ) : <ArrowUpDown size={11} className="opacity-40" />}
                      </div>
                    </th>
                    <th onClick={() => handleSortTalent('approvedMilestonePercentage')} className="p-4 cursor-pointer hover:text-slate-900 dark:hover:text-white">
                      <div className="flex items-center gap-1.5">
                        <span>Milestone Progress</span>
                        {talentSortField === 'approvedMilestonePercentage' ? (
                          talentSortOrder === 'asc' ? <ArrowUp size={12} className="text-indigo-500" /> : <ArrowDown size={12} className="text-indigo-500" />
                        ) : <ArrowUpDown size={11} className="opacity-40" />}
                      </div>
                    </th>
                    <th onClick={() => handleSortTalent('agreedCompensation')} className="p-4 cursor-pointer hover:text-slate-900 dark:hover:text-white">
                      <div className="flex items-center gap-1.5">
                        <span>Agreed Compensation</span>
                        {talentSortField === 'agreedCompensation' ? (
                          talentSortOrder === 'asc' ? <ArrowUp size={12} className="text-indigo-500" /> : <ArrowDown size={12} className="text-indigo-500" />
                        ) : <ArrowUpDown size={11} className="opacity-40" />}
                      </div>
                    </th>
                    <th onClick={() => handleSortTalent('previouslyPaid')} className="p-4 cursor-pointer hover:text-slate-900 dark:hover:text-white">
                      <div className="flex items-center gap-1.5">
                        <span>Paid to Date</span>
                        {talentSortField === 'previouslyPaid' ? (
                          talentSortOrder === 'asc' ? <ArrowUp size={12} className="text-indigo-500" /> : <ArrowDown size={12} className="text-indigo-500" />
                        ) : <ArrowUpDown size={11} className="opacity-40" />}
                      </div>
                    </th>
                    <th onClick={() => handleSortTalent('pendingPayout')} className="p-4 cursor-pointer hover:text-slate-900 dark:hover:text-white">
                      <div className="flex items-center gap-1.5">
                        <span>Pending Payout</span>
                        {talentSortField === 'pendingPayout' ? (
                          talentSortOrder === 'asc' ? <ArrowUp size={12} className="text-indigo-500" /> : <ArrowDown size={12} className="text-indigo-500" />
                        ) : <ArrowUpDown size={11} className="opacity-40" />}
                      </div>
                    </th>
                    <th onClick={() => handleSortTalent('status')} className="p-4 cursor-pointer hover:text-slate-900 dark:hover:text-white">
                      <div className="flex items-center gap-1.5">
                        <span>Payout Status</span>
                        {talentSortField === 'status' ? (
                          talentSortOrder === 'asc' ? <ArrowUp size={12} className="text-indigo-500" /> : <ArrowDown size={12} className="text-indigo-500" />
                        ) : <ArrowUpDown size={11} className="opacity-40" />}
                      </div>
                    </th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {isLoadingEligible ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-400">
                        <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-indigo-500" />
                        <span>Calculating eligible professional earnings...</span>
                      </td>
                    </tr>
                  ) : professionalEligible.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-400">
                        No partner professionals match the applied filters.
                      </td>
                    </tr>
                  ) : (
                    professionalEligible.map((talent, idx) => (
                      <tr key={`prof_${talent.talentUserId}_${talent.projectId}_${idx}`} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                        {/* 1. Professional & Org */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                              {(talent.name || 'PT').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{talent.name}</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 whitespace-nowrap">
                                  {talent.partnerCompanyName || 'Partner Org'}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                ID #{talent.talentUserId} • {talent.email}
                              </div>
                              {talent.roleInProject && (
                                <div className="text-[10px] text-slate-500 mt-0.5">{talent.roleInProject}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 2. Assigned Project */}
                        <td className="p-4 max-w-[200px]">
                          <div className="font-bold text-slate-800 dark:text-slate-100 truncate" title={talent.projectTitle}>
                            {talent.projectTitle}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-500 font-mono">
                              Proj #{talent.projectId}
                            </span>
                            {talent.projectStatus && (
                              <span className="text-[10px] text-slate-400">• {talent.projectStatus}</span>
                            )}
                          </div>
                        </td>

                        {/* 3. Milestone Progress */}
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 font-bold">
                            <span className="text-emerald-600 dark:text-emerald-400">{talent.approvedMilestonePercentage}%</span>
                            <span className="text-[10px] text-slate-400 font-medium">approved</span>
                          </div>
                          <div className="w-24 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, talent.approvedMilestonePercentage)}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {talent.approvedMilestones?.length || 0} milestone(s) completed
                          </div>
                        </td>

                        {/* 4. Agreed Compensation */}
                        <td className="p-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            ₹{Number(talent.agreedCompensation || 0).toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-slate-400">Agreed Contract</div>
                        </td>

                        {/* 5. Paid to Date */}
                        <td className="p-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-500 dark:text-slate-400">
                            ₹{Number(talent.previouslyPaid || 0).toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-slate-400">Disbursed</div>
                        </td>

                        {/* 6. Pending Payout */}
                        <td className="p-4 whitespace-nowrap">
                          <div className={`font-black text-sm ${
                            Number(talent.pendingPayout || 0) > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                          }`}>
                            ₹{Number(talent.pendingPayout || 0).toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {Number(talent.pendingPayout || 0) > 0 ? 'Available' : 'Fully Cleared'}
                          </div>
                        </td>

                        {/* 7. Payout Status */}
                        <td className="p-4 whitespace-nowrap">
                          {Number(talent.pendingPayout || 0) === 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                              <CheckCircle2 size={11} className="text-emerald-500" />
                              Fully Settled
                            </span>
                          ) : talent.eligible ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Ready for Payout
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                              title={talent.ineligibilityReason}
                            >
                              <AlertTriangle size={11} />
                              Ineligible
                            </span>
                          )}
                        </td>

                        {/* 8. Action */}
                        <td className="p-4 text-right whitespace-nowrap">
                          {talent.eligible && Number(talent.pendingPayout || 0) > 0 ? (
                            <button
                              onClick={() => handleOpenPayoutModal(talent)}
                              className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ml-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white active:scale-95 shadow-indigo-600/20"
                            >
                              <Send size={12} />
                              <span>Release Payout</span>
                            </button>
                          ) : (
                            <button
                              disabled
                              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 cursor-not-allowed ml-auto flex items-center gap-1.5"
                            >
                              <Check size={12} />
                              <span>Settled</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: FREELANCER PAYOUTS (INDEPENDENT FREELANCERS) */}
      {/* ========================================================================= */}
      {activeTab === 'freelancers' && (
        <div className="space-y-5">
          {/* Section Header & Search/Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Independent Freelancers</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
                  {freelancerEligible.length} Records
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculated payable balances for independent contractors with no partner company association.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search freelancer or project..."
                  value={talentSearchText}
                  onChange={(e) => setTalentSearchText(e.target.value)}
                  className={`pl-8 pr-3 py-1.5 rounded-xl border text-xs outline-hidden w-56 ${
                    isDark ? 'bg-[#181635] border-white/10 text-white focus:border-cyan-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-cyan-500'
                  }`}
                />
              </div>

              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs">
                {['ALL', 'READY', 'SETTLED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setTalentFilterStatus(st)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                      talentFilterStatus === st
                        ? 'bg-white dark:bg-cyan-600 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                  >
                    {st === 'ALL' ? 'All' : st === 'READY' ? 'Ready to Pay' : 'Settled'}
                  </button>
                ))}
              </div>

              <button
                onClick={() => loadEligiblePayouts('FREELANCER')}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/10 flex items-center gap-1.5 transition"
                title="Recalculate eligibility from live milestones"
              >
                <RefreshCw size={13} className={isLoadingEligible ? 'animate-spin' : ''} />
                <span>Recalculate</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className={`rounded-3xl border overflow-hidden shadow-xs ${
            isDark ? 'bg-[#14132b] border-white/10' : 'bg-white border-slate-200'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 text-slate-400 font-semibold select-none">
                    <th onClick={() => handleSortTalent('name')} className="p-4 cursor-pointer hover:text-slate-900 dark:hover:text-white">
                      <div className="flex items-center gap-1.5">
                        <span>Freelancer Details</span>
                        {talentSortField === 'name' ? (
                          talentSortOrder === 'asc' ? <ArrowUp size={12} className="text-cyan-500" /> : <ArrowDown size={12} className="text-cyan-500" />
                        ) : <ArrowUpDown size={11} className="opacity-40" />}
                      </div>
                    </th>
                    <th onClick={() => handleSortTalent('projectTitle')} className="p-4 cursor-pointer hover:text-slate-900 dark:hover:text-white">
                      <div className="flex items-center gap-1.5">
                        <span>Assigned Project</span>
                        {talentSortField === 'projectTitle' ? (
                          talentSortOrder === 'asc' ? <ArrowUp size={12} className="text-cyan-500" /> : <ArrowDown size={12} className="text-cyan-500" />
                        ) : <ArrowUpDown size={11} className="opacity-40" />}
                      </div>
                    </th>
                    <th onClick={() => handleSortTalent('approvedMilestonePercentage')} className="p-4 cursor-pointer hover:text-slate-900 dark:hover:text-white">
                      <div className="flex items-center gap-1.5">
                        <span>Milestone Progress</span>
                        {talentSortField === 'approvedMilestonePercentage' ? (
                          talentSortOrder === 'asc' ? <ArrowUp size={12} className="text-cyan-500" /> : <ArrowDown size={12} className="text-cyan-500" />
                        ) : <ArrowUpDown size={11} className="opacity-40" />}
                      </div>
                    </th>
                    <th onClick={() => handleSortTalent('agreedCompensation')} className="p-4 cursor-pointer hover:text-slate-900 dark:hover:text-white">
                      <div className="flex items-center gap-1.5">
                        <span>Agreed Compensation</span>
                        {talentSortField === 'agreedCompensation' ? (
                          talentSortOrder === 'asc' ? <ArrowUp size={12} className="text-cyan-500" /> : <ArrowDown size={12} className="text-cyan-500" />
                        ) : <ArrowUpDown size={11} className="opacity-40" />}
                      </div>
                    </th>
                    <th onClick={() => handleSortTalent('previouslyPaid')} className="p-4 cursor-pointer hover:text-slate-900 dark:hover:text-white">
                      <div className="flex items-center gap-1.5">
                        <span>Paid to Date</span>
                        {talentSortField === 'previouslyPaid' ? (
                          talentSortOrder === 'asc' ? <ArrowUp size={12} className="text-cyan-500" /> : <ArrowDown size={12} className="text-cyan-500" />
                        ) : <ArrowUpDown size={11} className="opacity-40" />}
                      </div>
                    </th>
                    <th onClick={() => handleSortTalent('pendingPayout')} className="p-4 cursor-pointer hover:text-slate-900 dark:hover:text-white">
                      <div className="flex items-center gap-1.5">
                        <span>Pending Payout</span>
                        {talentSortField === 'pendingPayout' ? (
                          talentSortOrder === 'asc' ? <ArrowUp size={12} className="text-cyan-500" /> : <ArrowDown size={12} className="text-cyan-500" />
                        ) : <ArrowUpDown size={11} className="opacity-40" />}
                      </div>
                    </th>
                    <th onClick={() => handleSortTalent('status')} className="p-4 cursor-pointer hover:text-slate-900 dark:hover:text-white">
                      <div className="flex items-center gap-1.5">
                        <span>Payout Status</span>
                        {talentSortField === 'status' ? (
                          talentSortOrder === 'asc' ? <ArrowUp size={12} className="text-cyan-500" /> : <ArrowDown size={12} className="text-cyan-500" />
                        ) : <ArrowUpDown size={11} className="opacity-40" />}
                      </div>
                    </th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {isLoadingEligible ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-400">
                        <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-cyan-500" />
                        <span>Calculating eligible freelancer earnings...</span>
                      </td>
                    </tr>
                  ) : freelancerEligible.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-400">
                        No independent freelancers match the applied filters.
                      </td>
                    </tr>
                  ) : (
                    freelancerEligible.map((talent, idx) => (
                      <tr key={`fl_${talent.talentUserId}_${talent.projectId}_${idx}`} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                        {/* 1. Freelancer Details */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                              {(talent.name || 'FL').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{talent.name}</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 whitespace-nowrap">
                                  Independent Freelancer
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                ID #{talent.talentUserId} • {talent.email}
                              </div>
                              {talent.roleInProject && (
                                <div className="text-[10px] text-slate-500 mt-0.5">{talent.roleInProject}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 2. Assigned Project */}
                        <td className="p-4 max-w-[200px]">
                          <div className="font-bold text-slate-800 dark:text-slate-100 truncate" title={talent.projectTitle}>
                            {talent.projectTitle}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-500 font-mono">
                              Proj #{talent.projectId}
                            </span>
                            {talent.projectStatus && (
                              <span className="text-[10px] text-slate-400">• {talent.projectStatus}</span>
                            )}
                          </div>
                        </td>

                        {/* 3. Milestone Progress */}
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 font-bold">
                            <span className="text-emerald-600 dark:text-emerald-400">{talent.approvedMilestonePercentage}%</span>
                            <span className="text-[10px] text-slate-400 font-medium">approved</span>
                          </div>
                          <div className="w-24 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, talent.approvedMilestonePercentage)}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {talent.approvedMilestones?.length || 0} milestone(s) completed
                          </div>
                        </td>

                        {/* 4. Agreed Compensation */}
                        <td className="p-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            ₹{Number(talent.agreedCompensation || 0).toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-slate-400">Agreed Contract</div>
                        </td>

                        {/* 5. Paid to Date */}
                        <td className="p-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-500 dark:text-slate-400">
                            ₹{Number(talent.previouslyPaid || 0).toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-slate-400">Disbursed</div>
                        </td>

                        {/* 6. Pending Payout */}
                        <td className="p-4 whitespace-nowrap">
                          <div className={`font-black text-sm ${
                            Number(talent.pendingPayout || 0) > 0 ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'
                          }`}>
                            ₹{Number(talent.pendingPayout || 0).toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {Number(talent.pendingPayout || 0) > 0 ? 'Available' : 'Fully Cleared'}
                          </div>
                        </td>

                        {/* 7. Payout Status */}
                        <td className="p-4 whitespace-nowrap">
                          {Number(talent.pendingPayout || 0) === 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                              <CheckCircle2 size={11} className="text-emerald-500" />
                              Fully Settled
                            </span>
                          ) : talent.eligible ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Ready for Payout
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                              title={talent.ineligibilityReason}
                            >
                              <AlertTriangle size={11} />
                              Ineligible
                            </span>
                          )}
                        </td>

                        {/* 8. Action */}
                        <td className="p-4 text-right whitespace-nowrap">
                          {talent.eligible && Number(talent.pendingPayout || 0) > 0 ? (
                            <button
                              onClick={() => handleOpenPayoutModal(talent)}
                              className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ml-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white active:scale-95 shadow-cyan-600/20"
                            >
                              <Send size={12} />
                              <span>Release Payout</span>
                            </button>
                          ) : (
                            <button
                              disabled
                              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 cursor-not-allowed ml-auto flex items-center gap-1.5"
                            >
                              <Check size={12} />
                              <span>Settled</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: REPORTS & AUDIT */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-5 rounded-2xl border ${
              isDark ? 'bg-[#14132b] border-white/10' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Client Payments Total</h4>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                ₹{Number(summary.totalClientPaymentsReceived || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Verified Razorpay receipts from project clients</p>
            </div>

            <div className={`p-5 rounded-2xl border ${
              isDark ? 'bg-[#14132b] border-white/10' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Talent Payouts</h4>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
                ₹{(Number(summary.totalPaidToProfessionals || 0) + Number(summary.totalPaidToFreelancers || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Combined disbursements across professionals & freelancers</p>
            </div>

            <div className={`p-5 rounded-2xl border ${
              isDark ? 'bg-[#14132b] border-white/10' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Disbursed Transaction Count</h4>
              <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-2">
                {summary.totalCompletedPayoutTransactions}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Completed payout records with transaction references</p>
            </div>
          </div>

          {/* Export Report Card */}
          <div className={`p-6 rounded-3xl border ${
            isDark ? 'bg-[#14132b] border-white/10' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <h3 className="text-base font-bold mb-1">Export Comprehensive Financial Report</h3>
            <p className="text-xs text-slate-400 mb-4">
              Download complete ledger records in CSV format, including gross amounts, fees, deductions, net amounts, gateway references, parties, and audit timestamps.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleDownloadCsv}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <Download size={14} />
                <span>Export Full Ledger CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: INITIATE / RELEASE PAYOUT */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {payoutModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 ${
                isDark ? 'bg-[#161430] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-start justify-between border-b pb-4 border-slate-200 dark:border-white/10">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                    {payoutModalData.talentType === 'PROFESSIONAL' ? 'Partner Organization Employee' : 'Independent Freelancer'}
                  </span>
                  <h3 className="text-lg font-black mt-0.5">
                    Release Payout to {payoutModalData.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Project: <span className="font-semibold text-slate-300">{payoutModalData.projectTitle}</span>
                  </p>
                </div>
                <button
                  onClick={() => setPayoutModalData(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitPayout} className="space-y-4 mt-4 text-xs">
                {/* Eligible Balance Indicator */}
                <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/40 space-y-1">
                  <div className="flex items-center justify-between text-indigo-900 dark:text-indigo-200">
                    <span>Approved Completed Work:</span>
                    <span className="font-bold">{payoutModalData.approvedMilestonePercentage}%</span>
                  </div>
                  <div className="flex items-center justify-between text-indigo-900 dark:text-indigo-200">
                    <span>Outstanding Approved Payable:</span>
                    <span className="font-black text-sm">₹{payoutModalData.pendingPayout.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block font-bold mb-1">
                    Gross Payout Amount (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={payoutModalData.pendingPayout}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    required
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-bold text-sm outline-hidden ${
                      isDark ? 'bg-[#1c1a36] border-white/10 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Max payable: ₹{payoutModalData.pendingPayout.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Fee & Deductions */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium mb-1">Processing Fee (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={payoutFee}
                      onChange={(e) => setPayoutFee(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border outline-hidden ${
                        isDark ? 'bg-[#1c1a36] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">TDS / Deductions (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={payoutDeductions}
                      onChange={(e) => setPayoutDeductions(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border outline-hidden ${
                        isDark ? 'bg-[#1c1a36] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Net Payout Calculated */}
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-between font-bold">
                  <span>Net Payout to Recipient:</span>
                  <span className="text-sm text-emerald-600 dark:text-emerald-400">
                    ₹{Math.max(0, (parseFloat(payoutAmount) || 0) - (parseFloat(payoutFee) || 0) - (parseFloat(payoutDeductions) || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Payout Method */}
                <div>
                  <label className="block font-bold mb-1">Disbursement Channel</label>
                  <select
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border outline-hidden font-bold ${
                      isDark ? 'bg-[#1c1a36] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="Razorpay Instant Payout">Razorpay Payment (Instant Live Checkout)</option>
                    <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer (Manual NEFT/RTGS UTR)</option>
                    <option value="UPI">UPI Direct (Manual UTR)</option>
                    <option value="Manual Wire Transfer">Manual Wire Transfer</option>
                  </select>
                </div>

                {/* Razorpay Gateway Info Banner or Manual UTR */}
                {payoutMethod.includes('Razorpay') ? (
                  <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 flex items-start gap-2.5 text-blue-700 dark:text-blue-300">
                    <ShieldCheck size={18} className="shrink-0 text-blue-600 mt-0.5" />
                    <div>
                      <span className="font-bold block text-xs">Razorpay Live Checkout Enabled</span>
                      <span className="text-[11px] text-blue-600/80 dark:text-blue-300/80 leading-relaxed block mt-0.5">
                        Clicking <strong>Pay via Razorpay</strong> opens the Razorpay Checkout modal to process and verify the disbursement. The Razorpay payment ID will be recorded automatically.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold mb-1">Transaction Reference / UTR Number</label>
                    <input
                      type="text"
                      value={gatewayRef}
                      onChange={(e) => setGatewayRef(e.target.value)}
                      placeholder="e.g. UTR12345678"
                      className={`w-full px-3.5 py-2 rounded-xl border outline-hidden font-mono ${
                        isDark ? 'bg-[#1c1a36] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block font-medium mb-1">Administrative Notes</label>
                  <input
                    type="text"
                    value={payoutNotes}
                    onChange={(e) => setPayoutNotes(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border outline-hidden ${
                      isDark ? 'bg-[#1c1a36] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setPayoutModalData(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-md shadow-blue-600/30 active:scale-95 transition-all flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={15} />
                        <span>
                          {payoutMethod.includes('Razorpay')
                            ? `Pay ₹${Math.max(0, (parseFloat(payoutAmount) || 0) - (parseFloat(payoutFee) || 0) - (parseFloat(payoutDeductions) || 0)).toLocaleString('en-IN')} via Razorpay`
                            : 'Confirm & Release Payout'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: EXECUTE APPROVED PAYOUT */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {executeModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 ${
                isDark ? 'bg-[#161430] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-white/10">
                <h3 className="text-base font-bold">Execute & Confirm Payout</h3>
                <button onClick={() => setExecuteModalData(null)} className="text-slate-400">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitExecute} className="space-y-4 mt-4 text-xs">
                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recipient:</span>
                    <span className="font-bold">{executeModalData.partyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Net Amount to Disburse:</span>
                    <span className="font-black text-emerald-500">₹{executeModalData.netAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1">Disbursement Channel</label>
                  <select
                    value={execMethod}
                    onChange={(e) => setExecMethod(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border outline-hidden ${
                      isDark ? 'bg-[#1c1a36] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer (NEFT/RTGS)</option>
                    <option value="UPI">UPI Direct</option>
                    <option value="Manual Wire">Manual Wire</option>
                    <option value="RazorpayX">RazorpayX</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">
                    Gateway Ref / Bank UTR Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={execGatewayRef}
                    onChange={(e) => setExecGatewayRef(e.target.value)}
                    required
                    placeholder="Enter UTR or bank reference"
                    className={`w-full px-3.5 py-2 rounded-xl border font-mono outline-hidden ${
                      isDark ? 'bg-[#1c1a36] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Execution Note</label>
                  <input
                    type="text"
                    value={execNotes}
                    onChange={(e) => setExecNotes(e.target.value)}
                    placeholder="e.g. Cleared via corporate banking"
                    className={`w-full px-3 py-2 rounded-xl border outline-hidden ${
                      isDark ? 'bg-[#1c1a36] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setExecuteModalData(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  >
                    {isSubmitting ? 'Confirming...' : 'Confirm Execution'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 3: TRANSACTION DETAILS & RECEIPT AUDIT */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 ${
                isDark ? 'bg-[#161430] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-start justify-between border-b pb-4 border-slate-200 dark:border-white/10">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                    Official Ledger Record
                  </span>
                  <h3 className="text-lg font-black mt-0.5">
                    Transaction Details: {selectedTx.id}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Ref: {selectedTx.receiptNumber || selectedTx.gatewayReference || 'N/A'}
                  </p>
                </div>
                <button onClick={() => setSelectedTx(null)} className="p-1 rounded-lg text-slate-400">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 my-4 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-100 dark:bg-white/5">
                  <div>
                    <span className="text-slate-400 block">Transaction Type:</span>
                    <span className="font-bold">{selectedTx.transactionType.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Status:</span>
                    <span className="font-bold text-emerald-500">{selectedTx.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Party / Recipient:</span>
                    <span className="font-bold">{selectedTx.partyName} ({selectedTx.partyRole})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Organization:</span>
                    <span className="font-bold">{selectedTx.organizationName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Associated Project:</span>
                    <span className="font-bold truncate block">{selectedTx.projectTitle}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Payment Method:</span>
                    <span className="font-bold">{selectedTx.paymentMethod}</span>
                  </div>
                </div>

                {/* Amounts Breakdown */}
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gross Amount:</span>
                    <span className="font-semibold">₹{selectedTx.grossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Processing Fee:</span>
                    <span className="font-semibold text-slate-400">₹{selectedTx.fee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">TDS / Deductions:</span>
                    <span className="font-semibold text-slate-400">₹{selectedTx.deductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="border-t border-slate-200 dark:border-white/10 pt-1 flex justify-between font-bold text-sm">
                    <span>Net Settled Amount:</span>
                    <span className="text-emerald-500">₹{selectedTx.netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Gateway Reference & Dates */}
                <div className="space-y-1 text-slate-400">
                  <div>
                    <strong className="text-slate-300">Gateway / UTR Reference:</strong>{' '}
                    <span className="font-mono text-slate-200">{selectedTx.gatewayReference || 'N/A'}</span>
                  </div>
                  <div>
                    <strong className="text-slate-300">Created / Initiated:</strong>{' '}
                    {selectedTx.transactionDate ? new Date(selectedTx.transactionDate).toLocaleString() : 'N/A'}
                  </div>
                  {selectedTx.completedDate && (
                    <div>
                      <strong className="text-slate-300">Completed Date:</strong>{' '}
                      {new Date(selectedTx.completedDate).toLocaleString()}
                    </div>
                  )}
                  {selectedTx.notes && (
                    <div>
                      <strong className="text-slate-300">Notes:</strong> {selectedTx.notes}
                    </div>
                  )}
                  {selectedTx.failureReason && (
                    <div className="text-rose-400">
                      <strong>Failure / Cancellation Reason:</strong> {selectedTx.failureReason}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/10 flex items-center gap-1.5"
                >
                  <Printer size={13} />
                  <span>Print Receipt</span>
                </button>

                <button
                  onClick={() => setSelectedTx(null)}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPaymentManagement;
