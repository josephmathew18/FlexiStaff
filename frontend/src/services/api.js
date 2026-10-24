// FlexiStaff API Client Service
// Handles REST communications between FlexiStaff-Frontend and FlexiStaff-Backend (Spring Boot REST API)
import feedbackApi from './feedbackApi';
import { getApiBaseUrl } from './apiConfig';

/**
 * Standard fetch helper with JWT token insertion and error handling
 */
async function request(endpoint, options = {}) {
  const url = `${getApiBaseUrl()}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const token = localStorage.getItem('flexistaff_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const savedUserStr = localStorage.getItem('flexistaff_user');
    if (savedUserStr) {
      const u = JSON.parse(savedUserStr);
      if (u?.id) headers['X-User-Id'] = String(u.id);
      if (u?.email) headers['X-User-Email'] = String(u.email);
    }
  } catch {}

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      // Clear token on 401 Unauthorized
      localStorage.removeItem('flexistaff_token');
    }

    const data = await response.json();

    if (!response.ok) {
      const error = (data && data.message) || response.statusText;
      console.error(`[API Error ${response.status}] ${endpoint}:`, error);
      return { success: false, error, status: response.status };
    }

    return data;
  } catch (err) {
    console.error(`[API Network Error] ${endpoint} failed:`, err);
    return { success: false, error: err.message || 'Network connection failed' };
  }
}

export const api = {
  // Authentication API endpoints
  auth: {
    login: (email, password) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    register: (userData) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),

    getCurrentUser: () => request('/auth/me'),
  },

  // Users API endpoints
  users: {
    getAll: () => request('/users'),
    getById: (id) => request(`/users/${id}`),
    getByRole: (role) => request(`/users/role/${role}`),
    updateProfile: (id, data) =>
      request(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      request(`/users/${id}`, {
        method: 'DELETE',
      }),
  },

  // Professionals API endpoints
  professionals: {
    getAll: () => request('/professionals'),
    getAvailable: () => request('/professionals/available'),
  },

  // Projects API endpoints
  projects: {
    getAll: () => request('/projects'),
    getById: (id) => request(`/projects/${id}`),
    getByClient: (clientId) => request(`/projects/client/${clientId}`),
    getByManager: (managerId) => request(`/projects/manager/${managerId}`),
    create: (projectData) =>
      request('/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      }),
    update: (id, projectData) =>
      request(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(projectData),
      }),
    reject: (id, reason) =>
      request(`/projects/${id}/reject?reason=${encodeURIComponent(reason || '')}`, {
        method: 'PUT',
      }),
  },

  // Workforce API endpoints
  workforce: {
    getAll: () => request('/workforce'),
    assign: (allocationData) =>
      request('/workforce/assign', {
        method: 'POST',
        body: JSON.stringify(allocationData),
      }),
    getByProject: (projectId) => request(`/workforce/project/${projectId}`),
    getByProfessional: (professionalId) => request(`/workforce/professional/${professionalId}`),
    updateStatus: (allocationId, status) =>
      request(`/workforce/${allocationId}/status?status=${status}`, {
        method: 'PATCH',
      }),
  },

  // Milestones API endpoints
  milestones: {
    getByProject: (projectId) => request(`/milestones/project/${projectId}`),
    create: (milestoneData) =>
      request('/milestones', {
        method: 'POST',
        body: JSON.stringify(milestoneData),
      }),
    updateProgress: (milestoneId, data) =>
      request(`/milestones/${milestoneId}/progress`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    update: (milestoneId, data) =>
      request(`/milestones/${milestoneId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (milestoneId) =>
      request(`/milestones/${milestoneId}`, {
        method: 'DELETE',
      }),
  },

  // Partners API endpoints
  partners: {
    getAll: () => request('/partners'),
    getById: (id) => request(`/partners/${id}`),
    register: (partnerData) =>
      request('/partners/register', {
        method: 'POST',
        body: JSON.stringify(partnerData),
      }),
    create: (partnerData) =>
      request('/partners', {
        method: 'POST',
        body: JSON.stringify(partnerData),
      }),
    update: (id, partnerData) =>
      request(`/partners/${id}`, {
        method: 'PUT',
        body: JSON.stringify(partnerData),
      }),
    delete: (id) =>
      request(`/partners/${id}`, {
        method: 'DELETE',
      }),
  },

  // Clients API endpoints
  clients: {
    getAll: () => request('/clients'),
    getById: (id) => request(`/clients/${id}`),
    register: (clientData) =>
      request('/clients/register', {
        method: 'POST',
        body: JSON.stringify(clientData),
      }),
    delete: (id) =>
      request(`/clients/${id}`, {
        method: 'DELETE',
      }),
  },

  // Freelancers API endpoints
  freelancers: {
    getAll: () => request('/freelancers'),
    getById: (id) => request(`/freelancers/${id}`),
    getByPartner: (partnerCompanyId) => request(`/freelancers/partner/${partnerCompanyId}`),
    register: (freelancerData) =>
      request('/freelancers/register', {
        method: 'POST',
        body: JSON.stringify(freelancerData),
      }),
    approve: (id) =>
      request(`/freelancers/${id}/approve`, {
        method: 'POST',
      }),
    reject: (id, reason) =>
      request(`/freelancers/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason: reason || 'Declined by Administrator' }),
      }),
    update: (id, freelancerData) =>
      request(`/freelancers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(freelancerData),
      }),
    updateAvailability: (id, availabilityStatus) =>
      request(`/freelancers/${id}/availability`, {
        method: 'PUT',
        body: JSON.stringify({ availabilityStatus, availability: availabilityStatus }),
      }),
    delete: (id) =>
      request(`/freelancers/${id}`, {
        method: 'DELETE',
      }),
  },

  // Dashboard API endpoints
  dashboard: {
    getAdmin: () => request('/dashboard/admin'),
    getManager: () => request('/dashboard/manager'),
    getClient: () => request('/dashboard/client'),
    getProfessional: () => request('/dashboard/professional'),
  },

  // Managers API endpoints
  managers: {
    getAll: () => request('/managers'),
    getById: (id) => request(`/managers/${id}`),
    create: (managerData) =>
      request('/managers', {
        method: 'POST',
        body: JSON.stringify(managerData),
      }),
    update: (id, managerData) =>
      request(`/managers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(managerData),
      }),
    updateStatus: (id, status, reason) =>
      request(`/managers/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, reason }),
      }),
    delete: (id) =>
      request(`/managers/${id}`, {
        method: 'DELETE',
      }),
  },

  // Support & Feedback Tickets API endpoints
  support: {
    getAll: () => request('/support/tickets'),
    getMy: (email) => request(`/support/tickets/my${email ? `?email=${encodeURIComponent(email)}` : ''}`),
    create: (ticketData) =>
      request('/support/tickets', {
        method: 'POST',
        body: JSON.stringify(ticketData),
      }),
    updateStatus: (id, status, adminResponse) =>
      request(`/support/tickets/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, adminResponse }),
      }),
  },
  
  // Razorpay Payments API endpoints (Client Management Phase 1)
  payments: {
    getSummary: (projectId) => request(`/payments/project/${projectId}/summary`),
    createOrder: (orderData) =>
      request('/payments/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      }),
    verifyPayment: (verifyData) =>
      request('/payments/verify', {
        method: 'POST',
        body: JSON.stringify(verifyData),
      }),
    getHistory: (clientId) =>
      request(clientId ? `/payments/history?clientId=${clientId}` : '/payments/history'),
    getReceipt: (paymentId) => request(`/payments/${paymentId}/receipt`),
    getKeyId: () => request('/payments/config/key-id'),
  },

  // Dashboard Metrics API endpoints
  dashboard: {
    getAdmin: () => request('/dashboard/admin'),
    getManager: () => request('/dashboard/manager'),
    getClient: () => request('/dashboard/client'),
    getProfessional: () => request('/dashboard/professional'),
  },

  // Real-time Chat & Messaging Module API endpoints
  chat: {
    getConversations: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/chat/conversations${query ? `?${query}` : ''}`);
    },
    createConversation: (data) =>
      request('/chat/conversations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getMessages: (conversationId) =>
      request(`/chat/conversations/${conversationId}/messages`),
    sendMessage: (conversationId, messageData) =>
      request(`/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify(messageData),
      }),
    markAsRead: (conversationId) =>
      request(`/chat/conversations/${conversationId}/read`, {
        method: 'PUT',
      }),
    getUnreadCount: () => request('/chat/unread-count'),
    getContacts: () => request('/chat/contacts'),
    uploadAttachment: (formData) =>
      request('/chat/upload', {
        method: 'POST',
        body: formData,
      }),
  },

  // Rating & Feedback API endpoints (Axios Client)
  feedback: feedbackApi,
};

export const payments = api.payments;
export { feedbackApi };
export default api;
