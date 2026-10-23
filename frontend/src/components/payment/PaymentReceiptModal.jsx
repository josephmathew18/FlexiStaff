import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Building2, Calendar, CreditCard, Hash, FileText } from 'lucide-react';
import { payments } from '../../services/api';

export const PaymentReceiptModal = ({ isOpen, onClose, receipt: initialReceipt, paymentId }) => {
  const [receipt, setReceipt] = React.useState(initialReceipt || null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (initialReceipt) {
      setReceipt(initialReceipt);
    } else if (isOpen && paymentId) {
      setLoading(true);
      payments.getReceipt(paymentId)
        .then((res) => {
          if (res && res.data) setReceipt(res.data);
        })
        .catch((err) => console.error('Failed to load receipt', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, initialReceipt, paymentId]);

  if (!isOpen) return null;
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-700">Loading Official Receipt...</span>
        </div>
      </div>
    );
  }
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = receipt.paymentDate
    ? new Date(receipt.paymentDate).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Confirmed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-receipt, #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            background: white !important;
            color: black !important;
            border: none !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Top Action Bar (hidden when printing) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <ShieldCheck size={18} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Official Payment Receipt
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
            >
              <Printer size={14} />
              Print / Save PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div id="printable-receipt" className="p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                  FS
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  FlexiStaff Technologies
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Enterprise Workforce Orchestration Platform
              </p>
              <p className="text-[11px] text-slate-400">
                GSTIN: 29AABCU9603R1ZX • CIN: U72900KA2024PTC123456
              </p>
              <p className="text-[11px] text-slate-400">
                support@flexistaff.com • www.flexistaff.com
              </p>
            </div>

            <div className="sm:text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                <CheckCircle2 size={13} />
                PAID & VERIFIED
              </div>
              <p className="text-xs font-bold text-slate-900 mt-2 font-mono">
                Receipt #{receipt.receiptNumber}
              </p>
              <p className="text-[11px] text-slate-500">
                Date: {formattedDate}
              </p>
            </div>
          </div>

          {/* Client & Project Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Billed To
              </span>
              <p className="text-xs font-bold text-slate-900">
                {receipt.clientCompanyName || receipt.clientName}
              </p>
              <p className="text-[11px] text-slate-600">{receipt.clientName}</p>
              {receipt.clientEmail && (
                <p className="text-[11px] text-slate-500">{receipt.clientEmail}</p>
              )}
              {receipt.clientPhone && (
                <p className="text-[11px] text-slate-500">{receipt.clientPhone}</p>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Project Information
              </span>
              <p className="text-xs font-bold text-slate-900">
                {receipt.projectTitle}
              </p>
              <p className="text-[11px] text-slate-600">
                Project Reference ID: #{receipt.projectId}
              </p>
              <p className="text-[11px] text-slate-500">
                Payment Channel: Razorpay Secure Gateway
              </p>
            </div>
          </div>

          {/* Transaction Breakdown Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Item & Description</th>
                  <th className="py-3 px-4">Gateway Ref</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">Sprint Deliverable Payment</p>
                    <p className="text-[11px] text-slate-500">
                      Payment for {receipt.projectTitle}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                    <div>Pay ID: {receipt.razorpayPaymentId || 'N/A'}</div>
                    <div className="text-[10px] text-slate-400">Order: {receipt.razorpayOrderId || 'N/A'}</div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm">
                    ₹{Number(receipt.amountPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200">
                <tr>
                  <td colSpan={2} className="py-3 px-4 font-bold text-slate-600 text-right">
                    Total Amount Paid (INR):
                  </td>
                  <td className="py-3 px-4 text-right font-black text-base text-emerald-600">
                    ₹{Number(receipt.amountPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Method & Verification Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Payment Method</span>
              <span className="font-semibold text-slate-800 capitalize">{receipt.paymentMethod || 'Online'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Currency</span>
              <span className="font-semibold text-slate-800">{receipt.currency || 'INR'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Status</span>
              <span className="font-bold text-emerald-700">SUCCESS</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Gateway</span>
              <span className="font-semibold text-slate-800">Razorpay Verified</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="border-t border-slate-100 pt-4 text-center space-y-1">
            <p className="text-[11px] text-slate-500">
              This is a computer-generated tax invoice and verified payment receipt. No physical signature is required.
            </p>
            <p className="text-[10px] text-slate-400">
              Thank you for partnering with FlexiStaff Technologies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceiptModal;
