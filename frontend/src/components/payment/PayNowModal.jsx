import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CreditCard, AlertCircle, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { openRazorpayCheckout } from '../../services/razorpay';
import { toast } from 'react-toastify';

export const PayNowModal = ({ isOpen, onClose, project, summary, onPaymentSuccess, onSuccess }) => {
  if (!isOpen || !project) return null;

  const [liveSummary, setLiveSummary] = useState(summary);
  const [paymentType, setPaymentType] = useState('full'); // 'full' or 'custom'
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [completedPayment, setCompletedPayment] = useState(null);

  useEffect(() => {
    setLiveSummary(summary);
    setErrorMsg('');
  }, [summary, isOpen]);

  useEffect(() => {
    if (isOpen && project?.id) {
      api.payments.getSummary(project.id)
        .then((res) => {
          if (res?.data) {
            setLiveSummary(res.data);
          }
        })
        .catch((err) => console.warn('Could not refresh payment summary:', err));
    }
  }, [isOpen, project?.id]);

  const activeSummary = liveSummary || summary;
  const remainingBalance = activeSummary?.remainingBalance ?? 0;
  const agreedCost = activeSummary?.totalAgreedCost ?? (project.budget || 0);
  const totalPaid = activeSummary?.totalPaid ?? 0;

  const selectedAmount = paymentType === 'full' ? remainingBalance : Number(customAmount || 0);

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (selectedAmount <= 0) {
      setErrorMsg('Please specify a valid payment amount greater than ₹0.');
      return;
    }

    if (paymentType === 'custom' && selectedAmount > remainingBalance) {
      setErrorMsg(`Payment amount cannot exceed the outstanding balance of ₹${remainingBalance.toLocaleString('en-IN')}.`);
      return;
    }

    setLoading(true);

    try {
      // 1. Create order on backend
      const isFull = paymentType === 'full';
      const orderRes = await api.payments.createOrder({
        projectId: project.id,
        amount: isFull ? remainingBalance : selectedAmount,
        isFullBalance: isFull,
        notes: `Payment for project: ${project.title || project.name}`,
      });

      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.error || 'Failed to create payment order with Razorpay');
      }

      const orderData = orderRes.data;

      // 2. Open Razorpay Checkout modal
      await openRazorpayCheckout(orderData, {
        onSuccess: async (rzpResponse) => {
          // 3. Verify payment signature on backend
          try {
            setLoading(true);
            const verifyRes = await api.payments.verifyPayment({
              razorpayOrderId: rzpResponse.razorpay_order_id,
              razorpayPaymentId: rzpResponse.razorpay_payment_id,
              razorpaySignature: rzpResponse.razorpay_signature,
            });

            if (verifyRes.success && verifyRes.data) {
              toast.success(`Payment of ₹${selectedAmount.toLocaleString('en-IN')} verified successfully!`);
              setCompletedPayment(verifyRes.data);
              if (onPaymentSuccess) {
                onPaymentSuccess(verifyRes.data);
              }
              if (onSuccess) {
                onSuccess(verifyRes.data);
              }
            } else {
              const err = verifyRes.error || 'Payment signature verification failed';
              setErrorMsg(err);
              toast.error(err);
            }
          } catch (verErr) {
            setErrorMsg(verErr.message || 'Verification error');
            toast.error(verErr.message || 'Verification error');
          } finally {
            setLoading(false);
          }
        },
        onFailure: (rzpError) => {
          setLoading(false);
          const desc = rzpError?.error?.description || 'Payment was cancelled or unsuccessful';
          setErrorMsg(desc);
          toast.error(desc);
        },
        onDismiss: () => {
          setLoading(false);
          toast.info('Payment checkout dismissed');
        },
      });
    } catch (err) {
      console.error('Payment checkout error:', err);
      setErrorMsg(err.message || 'Unable to initialize Razorpay checkout');
      toast.error(err.message || 'Unable to initialize payment');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
              <CreditCard size={18} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Razorpay Secure Checkout
              </h3>
              <p className="text-[11px] text-slate-500">
                Phase 1 Client Payment Portal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {completedPayment ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Payment Successful & Verified!
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Your payment of <strong className="text-slate-800">₹{Number(completedPayment.amount || 0).toLocaleString('en-IN')}</strong> has been confirmed by Razorpay and credited to Project #{project.id}.
              </p>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-1 font-mono">
                <div>Receipt: <span className="font-bold text-slate-800">{completedPayment.receiptNumber}</span></div>
                <div>Payment ID: <span className="text-slate-600">{completedPayment.razorpayPaymentId}</span></div>
                <div>Status: <span className="font-bold text-emerald-600">SUCCESS</span></div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleProceedToPayment} className="space-y-5">
              {/* Project Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 line-clamp-1">
                    {project.title || project.name}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Project #{project.id}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-left">
                  <div>
                    <span className="text-[10px] font-medium text-slate-400 block">Agreed Cost</span>
                    <span className="text-xs font-bold text-slate-800">₹{Number(agreedCost).toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-slate-400 block">Paid So Far</span>
                    <span className="text-xs font-bold text-emerald-700">₹{Number(totalPaid).toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-slate-400 block">Balance Due</span>
                    <span className="text-xs font-bold text-rose-700">₹{Number(remainingBalance).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Payment Amount Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 block">
                  Select Payment Amount
                </label>

                <div className="space-y-2">
                  <label className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                    paymentType === 'full' ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentType"
                        value="full"
                        checked={paymentType === 'full'}
                        onChange={() => setPaymentType('full')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Pay Full Remaining Balance</span>
                        <span className="text-[11px] text-slate-500">Clears all outstanding balance for this project</span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-slate-900">
                      ₹{Number(remainingBalance).toLocaleString('en-IN')}
                    </span>
                  </label>

                  <label className={`flex flex-col p-3.5 rounded-2xl border cursor-pointer transition ${
                    paymentType === 'custom' ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <input
                        type="radio"
                        name="paymentType"
                        value="custom"
                        checked={paymentType === 'custom'}
                        onChange={() => setPaymentType('custom')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs font-bold text-slate-900">Pay Partial Amount</span>
                    </div>

                    {paymentType === 'custom' && (
                      <div className="pl-6 pt-1">
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                          <input
                            type="number"
                            min="1"
                            max={remainingBalance}
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                            placeholder={`Max ₹${remainingBalance}`}
                            className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Enter any amount up to ₹{Number(remainingBalance).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Gateway Note */}
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                <span>
                  Payments are encrypted and processed securely by <strong>Razorpay</strong>. Cards, UPI, Net Banking, and Wallets accepted.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || selectedAmount <= 0}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-xs"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Opening Razorpay Checkout...
                  </>
                ) : (
                  <>
                    <span>Proceed to Pay ₹{Number(selectedAmount).toLocaleString('en-IN')}</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayNowModal;
