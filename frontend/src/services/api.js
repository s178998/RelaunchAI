// frontend/src/services/api.js
const API_BASE_URL = 'http://127.0.0.1:8000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers
      }
    });

    // Handle 401 Unauthorized - Token expired or invalid
    if (response.status === 401) {
      // Clear all auth data
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      
      // Redirect to login page
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Request failed');
    }

    return response.json();
  }

  async analyzeRisk(profile) {
    return this.request('/ai/analyze-risk', {
      method: 'POST',
      body: JSON.stringify(profile)
    });
  }

  async matchJobs(profile) {
    return this.request('/ai/match-jobs', {
      method: 'POST',
      body: JSON.stringify(profile)
    });
  }

  async analyzeSkills(profile) {
    return this.request('/ai/analyze-skills', {
      method: 'POST',
      body: JSON.stringify(profile)
    });
  }
}

export const apiService = new ApiService();
export default apiService;