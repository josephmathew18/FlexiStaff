/**
 * FlexiStaff Universal API Base URL Resolver
 * 1. On Render (https://flexistaff.onrender.com): Always uses relative '/api/v1' for same-origin speed & zero CORS
 * 2. On Localhost (localhost:5173 / localhost:3000): Uses 'http://localhost:8080/api/v1'
 * 3. On Vercel (*.vercel.app): Connects to Render backend 'https://flexistaff.onrender.com/api/v1'
 */
export function getApiBaseUrl() {
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname.toLowerCase();

    // 1. Hosted on Render (same-origin with Spring Boot)
    if (host.includes('onrender.com')) {
      return '/api/v1';
    }

    // 2. Localhost development
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') {
      return 'http://localhost:8080/api/v1';
    }

    // 3. Vercel or custom domain -> Point to Render backend
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl && envUrl.trim() !== '' && !envUrl.includes('localhost')) {
      return envUrl.trim();
    }
    return 'https://flexistaff.onrender.com/api/v1';
  }

  return 'https://flexistaff.onrender.com/api/v1';
}

export const API_BASE_URL = getApiBaseUrl();
export default API_BASE_URL;
