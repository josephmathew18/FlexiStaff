/**
 * Razorpay Checkout SDK Helper Service
 * Dynamically loads and launches Razorpay modal for Client Payments
 */

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay Checkout SDK');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const openRazorpayCheckout = async (orderData, { onSuccess, onFailure, onDismiss } = {}) => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || !window.Razorpay) {
    if (onFailure) onFailure({ error: { description: 'Razorpay Checkout script could not be loaded. Please check your internet connection.' } });
    return null;
  }

  const options = {
    key: orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TrGBbfauXe7IAK',
    amount: orderData.amountInPaise,
    currency: orderData.currency || 'INR',
    name: orderData.companyName || 'FlexiStaff Technologies',
    description: orderData.description || `Project Payment for: ${orderData.projectTitle} (Receipt: ${orderData.receiptNumber})`,
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=120&q=80',
    ...(orderData.orderId ? { order_id: orderData.orderId } : {}),
    prefill: {
      name: orderData.clientName || '',
      email: orderData.clientEmail || '',
      contact: orderData.clientPhone || '',
    },
    notes: {
      projectId: String(orderData.projectId || ''),
      projectTitle: orderData.projectTitle || '',
      receiptNumber: orderData.receiptNumber || '',
    },
    theme: {
      color: '#2563eb', // FlexiStaff primary blue
    },
    modal: {
      ondismiss: () => {
        if (onDismiss) onDismiss();
      },
      backdropclose: false,
      escape: true,
      handleback: true,
      confirm_close: true,
    },
    handler: (response) => {
      // response: { razorpay_payment_id, razorpay_order_id, razorpay_signature }
      if (onSuccess) {
        onSuccess(response);
      }
    },
  };

  try {
    const rzp = new window.Razorpay(options);
    if (onFailure) {
      rzp.on('payment.failed', (response) => {
        onFailure(response);
      });
    }
    rzp.open();
    return rzp;
  } catch (err) {
    console.error('Error opening Razorpay checkout:', err);
    if (onFailure) onFailure({ error: { description: err.message || 'Failed to open Razorpay modal' } });
    return null;
  }
};
