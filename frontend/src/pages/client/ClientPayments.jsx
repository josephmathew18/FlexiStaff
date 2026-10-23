import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Search,
  Download,
  ShieldCheck,
  RefreshCw,
  FolderKanban,
  ArrowUpRight,
  Printer,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { api } from '../../services/api';
import PayNowModal from '../../components/payment/PayNowModal';
import PaymentReceiptModal from '../../components/payment/PaymentReceiptModal';
import { toast } from 'react-toastify';

export const ClientPayments = () => {
  const { clientProfile, projects = [] } = useData() || {};

  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [selectedProjectForPay, setSelectedProjectForPay] = useState(null);
  const [selectedSummaryForPay, setSelectedSummaryForPay] = useState(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Authenticated Client's Projects
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

  // Load payment history and project summaries
  const loadPaymentData = async () => {
    setLoading(true);
    try {
      // 1. Fetch payment history
      let currentUserId = clientProfile?.id;
      try {
        const savedUserStr = localStorage.getItem('flexistaff_user');
        if (savedUserStr) {
          const u = JSON.parse(savedUserStr);
          if (u && u.id) currentUserId = u.id;
        }
      } catch {}

      const histRes = await api.payments.getHistory(currentUserId);
      if (histRes && (histRes.data || Array.isArray(histRes))) {
        setPaymentHistory(histRes.data || histRes);
      }

      // 2. Fetch project payment summaries
      const sumMap = {};
      await Promise.all(
        clientProjects.map(async (p) => {
          if (!p.id) return;
          try {
            const res = await api.payments.getSummary(p.id);
            if (res && res.data) {
              sumMap[p.id] = res.data;
            }
          } catch (e) {
            console.warn(`Summary fetch failed for project ${p.id}:`, e);
          }
        })
      );
      setSummaries(sumMap);
    } catch (err) {
      console.error('Error loading payment data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentData();
  }, [clientProjects.length]);

  // Financial aggregates
  const financialTotals = useMemo(() => {
    let totalAgreed = 0;
    let totalPaid = 0;
    let totalBalance = 0;

    clientProjects.forEach((p) => {
      const sum = summaries[p.id];
      const agreed = sum?.totalAgreedCost ?? Number(p.budget || 0);
      const paid = sum?.totalPaid ?? 0;
      const bal = sum?.remainingBalance ?? Math.max(0, agreed - paid);

      totalAgreed += agreed;
      totalPaid += paid;
      totalBalance += bal;
    });

    return { totalAgreed, totalPaid, totalBalance };
  }, [clientProjects, summaries]);

  const handleOpenPay = (project) => {
    const summary = summaries[project.id] || {
      totalAgreedCost: Number(project.budget || 0),
      totalPaid: 0,
      remainingBalance: Number(project.budget || 0),
    };
    setSelectedProjectForPay(project);
    setSelectedSummaryForPay(summary);
    setIsPayModalOpen(true);
  };

  const handleOpenReceipt = async (paymentId) => {
    try {
      const res = await api.payments.getReceipt(paymentId);
      if (res && res.data) {
        setSelectedReceipt(res.data);
        setIsReceiptModalOpen(true);
      } else {
        toast.error(res.error || 'Failed to generate receipt');
      }
    } catch (err) {
      toast.error('Unable to retrieve payment receipt');
    }
  };

  const filteredHistory = useMemo(() => {
    return (paymentHistory || []).filter((tx) => {
      if (statusFilter !== 'all' && String(tx.status).toUpperCase() !== statusFilter.toUpperCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesProject = (tx.projectTitle || '').toLowerCase().includes(q);
        const matchesReceipt = (tx.receiptNumber || '').toLowerCase().includes(q);
        const matchesPayId = (tx.razorpayPaymentId || '').toLowerCase().includes(q);
        return matchesProject || matchesReceipt || matchesPayId;
      }
      return true;
    });
  }, [paymentHistory, statusFilter, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-100 text-blue-600">
              <CreditCard size={20} />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Payments & Invoices
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Secure Razorpay payment processing, financial tracking, and downloadable tax receipts
          </p>
        </div>

        <button
          type="button"
          onClick={loadPaymentData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-blue-600' : ''} />
          Refresh Financials
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Agreed Cost</span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
              <DollarSign size={16} />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{financialTotals.totalAgreed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500">Across {clientProjects.length} client projects</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Amount Paid</span>
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={16} />
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-700">
            ₹{financialTotals.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500">Verified Razorpay transactions</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Outstanding Balance</span>
            <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
              <Clock size={16} />
            </span>
          </div>
          <div className="text-2xl font-black text-rose-700">
            ₹{financialTotals.totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500">Balance due for active sprint deliverables</p>
        </div>
      </div>

      {/* Projects Billing Breakdown & Pay Now */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Project Payment Status & Actions
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pay project deliverables directly through Razorpay gateway
          </p>
        </div>

        {clientProjects.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No projects found for your client account.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {clientProjects.map((proj) => {
              const sum = summaries[proj.id];
              const agreed = sum?.totalAgreedCost ?? Number(proj.budget || 0);
              const paid = sum?.totalPaid ?? 0;
              const remaining = sum?.remainingBalance ?? Math.max(0, agreed - paid);
              const isPaid = agreed > 0 && remaining <= 0;
              const isEligible = sum?.isEligibleForPayment ?? (agreed > 0 && remaining > 0);

              return (
                <div key={proj.id} className="p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/70 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 hover:text-blue-600 cursor-pointer">
                        {proj.title || proj.name}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        #{proj.id}
                      </span>
                      {isPaid ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Fully Paid
                        </span>
                      ) : remaining > 0 ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          Payment Due
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          Price Approval Pending
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {proj.description || 'Sprint deliverables and staffing allocations'}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] font-medium text-slate-400 block uppercase">Agreed Cost</span>
                      <span className="text-xs font-bold text-slate-800">
                        ₹{agreed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="text-left md:text-right">
                      <span className="text-[10px] font-medium text-slate-400 block uppercase">Paid Amount</span>
                      <span className="text-xs font-bold text-emerald-600">
                        ₹{paid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="text-left md:text-right">
                      <span className="text-[10px] font-medium text-slate-400 block uppercase">Balance Due</span>
                      <span className={`text-xs font-bold ${remaining > 0 ? 'text-rose-600 font-black' : 'text-slate-400'}`}>
                        ₹{remaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div>
                      {remaining > 0 && isEligible ? (
                        <button
                          type="button"
                          onClick={() => handleOpenPay(proj)}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                        >
                          <CreditCard size={14} />
                          Pay Now
                        </button>
                      ) : isPaid ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200">
                          <CheckCircle2 size={13} />
                          Settled
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium px-3 py-1.5 bg-slate-100 rounded-xl">
                          Under Review
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment History & Invoices Table */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Payment History & Receipts
            </h2>
            <p className="text-xs text-slate-500">
              Verified Razorpay transactions with downloadable tax receipts
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by receipt or project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 w-48 sm:w-60"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white font-medium focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="SUCCESS">Verified (SUCCESS)</option>
              <option value="CREATED">Created</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <CreditCard size={32} className="text-slate-300 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-800">No Transaction Records Found</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Completed Razorpay payments will generate verified transaction logs and receipts here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((tx) => {
                  const isSuccess = tx.status === 'SUCCESS';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {tx.receiptNumber}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {tx.projectTitle}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(tx.paidAt || tx.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="py-3.5 px-4 capitalize text-slate-600 font-medium">
                        {tx.paymentMethod || 'Online'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSuccess
                            ? 'bg-emerald-100 text-emerald-800'
                            : tx.status === 'FAILED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isSuccess && <CheckCircle2 size={11} />}
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm">
                        ₹{Number(tx.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isSuccess ? (
                          <button
                            type="button"
                            onClick={() => handleOpenReceipt(tx.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-[11px] transition"
                          >
                            <FileText size={12} />
                            Receipt
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pay Now Modal */}
      {selectedProjectForPay && (
        <PayNowModal
          isOpen={isPayModalOpen}
          onClose={() => {
            setIsPayModalOpen(false);
            setSelectedProjectForPay(null);
          }}
          project={selectedProjectForPay}
          summary={selectedSummaryForPay}
          onPaymentSuccess={() => {
            loadPaymentData();
          }}
        />
      )}

      {/* Receipt View Modal */}
      {selectedReceipt && (
        <PaymentReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => {
            setIsReceiptModalOpen(false);
            setSelectedReceipt(null);
          }}
          receipt={selectedReceipt}
        />
      )}
    </div>
  );
};

export default ClientPayments;
