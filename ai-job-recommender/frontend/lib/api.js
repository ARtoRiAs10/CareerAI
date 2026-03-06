const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const getToken = () => {
  if (typeof window !== "undefined") return localStorage.getItem("token");
  return null;
};

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const handle = async (res) => {
  const contentType = res.headers.get("content-type");
  let data = {};
  
  // Only parse if it's actually JSON
  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    throw new Error(text || `Server error: ${res.status}`);
  }

  // Check for your "success" wrapper
  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Request failed");
  }
  return data.data;
};

export const authApi = {
  register: (body) =>
    fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(handle),

  login: (body) =>
    fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(handle),
};

export const profileApi = {
  get: () =>
    fetch(`${API_BASE}/api/profile`, { headers: authHeaders() }).then(handle),

  update: (body) =>
    fetch(`${API_BASE}/api/profile`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(body),
    }).then(handle),
};

export const jobsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString();
    return fetch(`${API_BASE}/api/jobs${query ? "?" + query : ""}`, {
      headers: authHeaders(),
    }).then(handle);
  },

  getById: (id) =>
    fetch(`${API_BASE}/api/jobs/${id}`, { headers: authHeaders() }).then(handle),

  getRecommended: (limit = 8) =>
    fetch(`${API_BASE}/api/jobs/recommended?limit=${limit}`, {
      headers: authHeaders(),
    }).then(handle),
};

export const aiApi = {
  generateCoverLetter: (body) =>
    fetch(`${API_BASE}/api/ai/cover-letter`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    }).then(handle),

  getInsights: (body) =>
    fetch(`${API_BASE}/api/ai/insights`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    }).then(handle),

  getMyCoverLetters: () =>
    fetch(`${API_BASE}/api/ai/cover-letters`, { headers: authHeaders() }).then(handle),
};
