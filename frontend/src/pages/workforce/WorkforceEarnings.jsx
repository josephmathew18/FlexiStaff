import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Printer,
  X,
  ExternalLink,
  RefreshCw,
  FolderKanban,
  Award,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import workforcePaymentService from '../../services/workforcePaymentService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const WorkforceEarnings = () => {
  const { user } = useAuth();
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const [isLoading, setIsLoading] = useState(true);
  const [earningsData, setEarningsData] = useState(null);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [earningsRes, historyRes] = await Promise.all([
        workforcePaymentService.getMyEarnings(),
        workforcePaymentService.getMyPayoutHistory(),
      ]);

      if (earningsRes && earningsRes.success && earningsRes.data) {
        setEarningsData(earningsRes.data);
      }
      if (historyRes && historyRes.success && historyRes.data) {
        setPayoutHistory(historyRes.data);
      }
    } catch (err) {
      console.error('Failed to load workforce earnings', err);
      toast.error('Could not retrieve earnings records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleViewReceipt = async (payoutId) => {
    setIsLoadingReceipt(true);
    try {
      const res = await workforcePaymentService.getPayoutReceipt(payoutId);
      if (res && res.success && res.data) {
        setSelectedReceipt(res.data);
      } else {
        toast.error(res?.error || 'Unable to load receipt details.');
      }
    } catch (err) {
      toast.error('Failed to fetch receipt');
    } finally {
      setIsLoadingReceipt(false);
    }
  };

  const isCompanyEmployee = earningsData?.talentType === 'PROFESSIONAL';
  const displayHistory = (payoutHistory && payoutHistory.length > 0) ? payoutHistory : (earningsData?.recentPayouts || []);

  return (
    <div className={`space-y-6 sm:space-y-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${
                isCompanyEmployee
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
              }`}
            >
              {isCompanyEmployee ? <Building2 size={13} /> : <Users size={13} />}
              <span>
                {isCompanyEmployee
                  ? earningsData?.partnerCompanyName || 'Partner Organization Employee'
                  : 'Independent Freelancer'}
              </span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1.5">
            Earnings & Payment History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track your approved sprint compensation, milestone earnings, disbursed payouts, and official receipts.
          </p>
        </div>

        <button
          onClick={() => {
            loadData();
            toast.info('Earnings refreshed');
          }}
          className={`p-2.5 rounded-xl border transition-all self-start sm:self-auto ${
            isDark
              ? 'bg-[#1c1a36] border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
          title="Refresh Earnings"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Approved Earnings */}
        <div className={`p-5 rounded-2xl border ${
          isDark ? 'bg-[#14132b] border-white/10' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Approved Earnings</span>
            <Award size={16} className="text-purple-500" />
          </div>
          <div className="mt-2.5">
            <span className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">
              ₹{Number(earningsData?.totalApprovedEarnings || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <p className="text-[10px] text-slate-400 mt-1">From approved sprint milestones</p>
          </div>
        </div>

        {/* Total Amount Paid */}
        <div className={`p-5 rounded-2xl border ${
          isDark ? 'bg-[#14132b] border-white/10' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Received</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="mt-2.5">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              ₹{Number(earningsData?.totalPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <p className="text-[10px] text-slate-400 mt-1">
              Successfully disbursed to you
              {Number(earningsData?.totalDeductions || 0) > 0 && (
                <span className="block text-[9px] text-slate-400/80 mt-0.5">
                  (-₹{Number(earningsData.totalDeductions).toLocaleString('en-IN', { minimumFractionDigits: 2 })} TDS & fees deducted)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Pending Payout */}
        <div className={`p-5 rounded-2xl border ${
          isDark ? 'bg-[#14132b] border-white/10' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pending Payout</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div className="mt-2.5">
            <span className="text-xl sm:text-2xl font-black text-amber-500">
              ₹{Number(earningsData?.pendingPayout || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <p className="text-[10px] text-slate-400 mt-1">Approved & awaiting release</p>
          </div>
        </div>

        {/* Processing Payout */}
        <div className={`p-5 rounded-2xl border ${
          isDark ? 'bg-[#14132b] border-white/10' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">In Processing</span>
            <TrendingUp size={16} className="text-blue-500" />
          </div>
          <div className="mt-2.5">
            <span className="text-xl sm:text-2xl font-black text-blue-500">
              ₹{Number(earningsData?.processingPayout || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <p className="text-[10px] text-slate-400 mt-1">Banking wire in progress</p>
          </div>
        </div>

        {/* Failed Payout */}
        <div className={`p-5 rounded-2xl border col-span-2 sm:col-span-1 ${
          isDark ? 'bg-[#14132b] border-white/10' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Failed / Attention</span>
            <XCircle size={16} className="text-rose-500" />
          </div>
          <div className="mt-2.5">
            <span className="text-xl sm:text-2xl font-black text-rose-500">
              ₹{Number(earningsData?.failedPayout || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <p className="text-[10px] text-slate-400 mt-1">Check banking credentials</p>
          </div>
        </div>
      </div>

      {/* Project-Wise Earnings Breakdown */}
      <div className={`p-6 rounded-3xl border ${
        isDark ? 'bg-[#14132b] border-white/10' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold">Project-Wise Earnings Breakdown</h3>
            <p className="text-xs text-slate-400">Track approved milestones and outstanding earnings per project allocation</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/5 text-slate-400">
                <th className="p-3.5 font-semibold">Project Title</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold">Approved Progress</th>
                <th className="p-3.5 font-semibold">Agreed Compensation</th>
                <th className="p-3.5 font-semibold">Approved Earnings</th>
                <th className="p-3.5 font-semibold">Paid Amount</th>
                <th className="p-3.5 font-semibold text-right">Pending Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {!earningsData?.projectEarnings || earningsData.projectEarnings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-slate-400">
                    No project allocations found for your account.
                  </td>
                </tr>
              ) : (
                earningsData.projectEarnings.map((p) => (
                  <tr key={`proj_${p.projectId}`} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-3.5 font-bold">{p.projectTitle}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        {p.projectStatus}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="text-emerald-500">{p.approvedMilestonePercentage}%</span>
                        <span className="text-[10px] text-slate-400">completed</span>
                      </div>
                      <div className="w-24 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, p.approvedMilestonePercentage)}%` }}
                        />
                      </div>
                    </td>
                    <td className="p-3.5 font-medium">₹{p.agreedCompensation.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 font-semibold text-purple-600 dark:text-purple-400">
                      ₹{p.approvedEarnings.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 text-slate-400">₹{p.paidAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 text-right font-black text-amber-500">
                      ₹{p.pendingAmount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout History Table */}
      <div className={`p-6 rounded-3xl border ${
        isDark ? 'bg-[#14132b] border-white/10' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold">Detailed Payout History</h3>
            <p className="text-xs text-slate-400">Official disbursements and confirmation receipts</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/5 text-slate-400">
                <th className="p-3.5 font-semibold">Reference #</th>
                <th className="p-3.5 font-semibold">Project & Milestone</th>
                <th className="p-3.5 font-semibold">Gross</th>
                <th className="p-3.5 font-semibold">Deductions</th>
                <th className="p-3.5 font-semibold">Net Disbursed</th>
                <th className="p-3.5 font-semibold">Channel & Gateway Ref</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold">Date</th>
                <th className="p-3.5 font-semibold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {displayHistory.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-400">
                    No payout records found yet. Payouts will appear here as approved milestones are released.
                  </td>
                </tr>
              ) : (
                displayHistory.map((po) => (
                  <tr key={`payout_${po.id}`} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">{po.referenceNumber}</td>
                    <td className="p-3.5 max-w-[180px]">
                      <div className="font-bold truncate">{po.projectTitle}</div>
                      {po.milestoneTitle && (
                        <div className="text-[10px] text-slate-400 truncate">🎯 {po.milestoneTitle}</div>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-400">₹{Number(po.grossAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="p-3.5 text-slate-400">
                      {Number(po.fee || 0) > 0 || Number(po.deductions || 0) > 0
                        ? `-₹${(Number(po.fee || 0) + Number(po.deductions || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                        : '₹0.00'}
                    </td>
                    <td className="p-3.5 font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      ₹{Number(po.netAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-[11px]">
                      <div>{po.payoutMethod}</div>
                      <div className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">
                        {po.gatewayTransactionId || 'N/A'}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        po.status === 'COMPLETED'
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : po.status === 'APPROVED' || po.status === 'PROCESSING'
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400 whitespace-nowrap">
                      {po.completedAt
                        ? new Date(po.completedAt).toLocaleDateString()
                        : po.createdAt
                        ? new Date(po.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleViewReceipt(po.id)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-semibold flex items-center gap-1 ml-auto"
                      >
                        <FileText size={12} />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Confirmation Modal */}
      <AnimatePresence>
        {selectedReceipt && (
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
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                    Official Payout Confirmation
                  </span>
                  <h3 className="text-lg font-black mt-0.5">
                    Receipt #{selectedReceipt.receiptNumber}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Issued by: {selectedReceipt.issuedBy}
                  </p>
                </div>
                <button onClick={() => setSelectedReceipt(null)} className="p-1 rounded-lg text-slate-400">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 my-4 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block uppercase">
                      Net Amount Disbursed
                    </span>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      ₹{Number(selectedReceipt.netAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white">
                    {selectedReceipt.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-100 dark:bg-white/5">
                  <div>
                    <span className="text-slate-400 block">Recipient:</span>
                    <span className="font-bold">{selectedReceipt.recipientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Organization:</span>
                    <span className="font-bold">{selectedReceipt.partnerCompanyName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Project:</span>
                    <span className="font-bold">{selectedReceipt.projectTitle}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Milestone:</span>
                    <span className="font-bold">{selectedReceipt.milestoneTitle}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Disbursement Channel:</span>
                    <span className="font-bold">{selectedReceipt.payoutMethod}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">UTR / Ref:</span>
                    <span className="font-mono font-bold">{selectedReceipt.gatewayTransactionId}</span>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gross Approved:</span>
                    <span>₹{Number(selectedReceipt.grossAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Processing Fee:</span>
                    <span>-₹{Number(selectedReceipt.fee || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>TDS / Deductions:</span>
                    <span>-₹{Number(selectedReceipt.deductions || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400">
                  <span>Disbursed on: </span>
                  <strong className="text-slate-300">
                    {selectedReceipt.completedAt ? new Date(selectedReceipt.completedAt).toLocaleString() : 'N/A'}
                  </strong>
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
                  onClick={() => setSelectedReceipt(null)}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
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

export default WorkforceEarnings;
