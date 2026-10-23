// FlexiStaff Workforce Earnings & Payout Service
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = localStorage.getItem('flexistaff_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    if (response.status === 401) {
      localStorage.removeItem('flexistaff_token');
    }

    const data = await response.json();
    if (!response.ok) {
      const error = (data && data.message) || response.statusText;
      return { success: false, error, status: response.status };
    }
    return data;
  } catch (err) {
    console.error(`[WorkforcePaymentService] ${endpoint} failed:`, err);
    return { success: false, error: err.message || 'Network connection failed' };
  }
}

export const workforcePaymentService = {
  // 1. Get current talent's total approved earnings, paid, pending, processing, failed, project breakdown, recent payouts
  getMyEarnings: () => request('/payouts/my-earnings'),

  // 2. Get full payment and payout history
  getMyPayoutHistory: () => request('/payouts/my-history'),

  // 3. Get payout receipt / payment confirmation
  getPayoutReceipt: (payoutId) => request(`/payouts/${payoutId}/receipt`),
};

export default workforcePaymentService;
