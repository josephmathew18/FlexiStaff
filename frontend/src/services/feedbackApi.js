import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('flexistaff_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent response data extraction
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('flexistaff_token');
    }
    const message = error.response?.data?.message || error.message || 'API request failed';
    return Promise.reject(new Error(message));
  }
);

export const feedbackApi = {
  // Client endpoints
  submitCompanyFeedback: (data) => axiosClient.post('/feedback/company', data),
  submitProfessionalFeedback: (data) => axiosClient.post('/feedback/professional', data),
  getClientEligibility: () => axiosClient.get('/feedback/client/eligibility'),
  getClientSubmittedFeedbacks: () => axiosClient.get('/feedback/client/my'),

  // Admin endpoints
  getAdminSummary: () => axiosClient.get('/feedback/admin/summary'),
  getAllCompanyFeedbacks: () => axiosClient.get('/feedback/admin/company'),
  getAllProfessionalFeedbacks: (filter = 'all') =>
    axiosClient.get(`/feedback/admin/professionals?filter=${encodeURIComponent(filter)}`),

  // Partner Company endpoints (strictly limited to partner's own employees)
  getPartnerSummary: () => axiosClient.get('/feedback/partner/summary'),
  getPartnerEmployeeFeedbacks: () => axiosClient.get('/feedback/partner/my-employees'),
};

export default feedbackApi;
