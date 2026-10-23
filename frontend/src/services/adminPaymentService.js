// FlexiStaff Admin Payment & Payout Service
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
    console.error(`[AdminPaymentService] ${endpoint} failed:`, err);
    return { success: false, error: err.message || 'Network connection failed' };
  }
}

export const adminPaymentService = {
  // 1. Dashboard summary cards
  getSummary: () => request('/admin/payments/summary'),

  // 2. Transaction management table
  getTransactions: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.type && filters.type !== 'ALL') params.append('type', filters.type);
    if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters.projectId) params.append('projectId', filters.projectId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const qs = params.toString();
    return request(`/admin/payments/transactions${qs ? `?${qs}` : ''}`);
  },

  // 3. Eligible payouts calculation (for Professionals or Freelancers)
  getEligiblePayouts: (projectId = null, talentType = null) => {
    const params = new URLSearchParams();
    if (projectId) params.append('projectId', projectId);
    if (talentType) params.append('talentType', talentType);
    const qs = params.toString();
    return request(`/admin/payments/payouts/eligible${qs ? `?${qs}` : ''}`);
  },

  // 4. Create Razorpay payout order
  createPayoutOrder: (payoutData) =>
    request('/admin/payments/payouts/create-order', {
      method: 'POST',
      body: JSON.stringify(payoutData),
    }),

  // 5. Create and initiate payout
  createPayout: (payoutData) =>
    request('/admin/payments/payouts', {
      method: 'POST',
      body: JSON.stringify(payoutData),
    }),

  // 5. Approve payout
  approvePayout: (payoutId) =>
    request(`/admin/payments/payouts/${payoutId}/approve`, {
      method: 'PUT',
    }),

  // 6. Execute / record completed payout
  executePayout: (payoutId, executionData) =>
    request(`/admin/payments/payouts/${payoutId}/execute`, {
      method: 'POST',
      body: JSON.stringify(executionData),
    }),

  // 7. Cancel payout
  cancelPayout: (payoutId, reason) =>
    request(`/admin/payments/payouts/${payoutId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    }),

  // 8. Get payout details
  getPayoutById: (payoutId) => request(`/admin/payments/payouts/${payoutId}`),

  // 9. Download CSV export
  downloadCsv: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.type && filters.type !== 'ALL') params.append('type', filters.type);
    if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters.projectId) params.append('projectId', filters.projectId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const token = localStorage.getItem('flexistaff_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const url = `${API_BASE_URL}/admin/payments/export-csv${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error('Failed to download CSV');
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `flexistaff_transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },
};

export default adminPaymentService;
