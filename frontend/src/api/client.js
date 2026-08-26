// frontend/src/api/client.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sih-dms.onrender.com';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token'); // Adjust key if stored differently in AuthContext

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  // Do not set Content-Type header when uploading FormData / files (let browser set boundary)
  if (options.body instanceof FormData) {
    delete defaultHeaders['Content-Type'];
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }

  return response.json();
}