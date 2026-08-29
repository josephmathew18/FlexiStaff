// FlexiStaff API Client Service
// Handles REST communications between FlexiStaff-Frontend and FlexiStaff-Backend (Spring Boot REST API)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

/**
 * Standard fetch helper with JWT token insertion and error handling
 */
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
      // Clear token on 401 Unauthorized
      localStorage.removeItem('flexistaff_token');
    }

    const data = await response.json();

    if (!response.ok) {
      const error = (data && data.message) || response.statusText;
      return { success: false, error, status: response.status };
    }

    return data;
  } catch (err) {
    console.warn(`API request to ${endpoint} failed:`, err.message);
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
  },

  // Workforce API endpoints
  workforce: {
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
  },

  // Dashboard API endpoints
  dashboard: {
    getAdmin: () => request('/dashboard/admin'),
    getManager: () => request('/dashboard/manager'),
    getClient: () => request('/dashboard/client'),
    getProfessional: () => request('/dashboard/professional'),
  },
};

export default api;
