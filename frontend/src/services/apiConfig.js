/**
 * FlexiStaff Universal API Base URL Resolver
 * Connects frontend across Vercel, Render, and Localhost:
 * 1. Explicit Environment Variable: VITE_API_BASE_URL (if provided)
 * 2. Vercel / External Domain: https://flexistaff.onrender.com/api/v1
 * 3. Render Unified Host: /api/v1
 * 4. Local Development: http://localhost:8080/api/v1
 */
export function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim();
  }

  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname.toLowerCase();

    // Local development
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') {
      return 'http://localhost:8080/api/v1';
    }

    // Hosted inside Spring Boot on Render (same origin)
    if (host.includes('onrender.com')) {
      return '/api/v1';
    }

    // Hosted on Vercel (*.vercel.app) or custom production domain
    return 'https://flexistaff.onrender.com/api/v1';
  }

  return 'https://flexistaff.onrender.com/api/v1';
}

export const API_BASE_URL = getApiBaseUrl();
export default API_BASE_URL;
