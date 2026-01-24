// API service for backend calls
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Generic fetch wrapper
const apiRequest = async (endpoint, token = null, options = {}) => {
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

// ============================================
// AUTH API
// ============================================
export const authAPI = {
  register: (userData) => apiRequest('/auth/register', null, {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  login: (email, password) => apiRequest('/auth/login', null, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  
  getProfile: (token) => apiRequest('/auth/profile', token),
  
  updateProfile: (token, profileData) => apiRequest('/auth/profile', token, {
    method: 'PUT',
    body: JSON.stringify(profileData),
  }),
};

// ============================================
// CROPS API
// ============================================
export const cropsAPI = {
  // Get all crops with search, sort, filters
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/crops${queryParams ? `?${queryParams}` : ''}`);
  },
  
  getById: (id) => apiRequest(`/crops/${id}`),
  
  getCategories: () => apiRequest('/crops/categories'),
  
  // Farmer routes
  getMyCrops: (token) => apiRequest('/crops/farmer/my-crops', token),
  
  create: (token, cropData) => apiRequest('/crops', token, {
    method: 'POST',
    body: JSON.stringify(cropData),
  }),
  
  update: (token, id, cropData) => apiRequest(`/crops/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(cropData),
  }),
  
  delete: (token, id) => apiRequest(`/crops/${id}`, token, {
    method: 'DELETE',
  }),
};

// ============================================
// BIDS API
// ============================================
export const bidsAPI = {
  // Buyer routes
  create: (token, bidData) => apiRequest('/bids', token, {
    method: 'POST',
    body: JSON.stringify(bidData),
  }),
  
  getMyBids: (token) => apiRequest('/bids/my-bids', token),
  
  cancel: (token, id) => apiRequest(`/bids/${id}/cancel`, token, {
    method: 'PUT',
  }),
  
  // Farmer routes
  getFarmerRequests: (token) => apiRequest('/bids/farmer/requests', token),
  
  accept: (token, id) => apiRequest(`/bids/${id}/accept`, token, {
    method: 'PUT',
  }),
  
  reject: (token, id) => apiRequest(`/bids/${id}/reject`, token, {
    method: 'PUT',
  }),
};

// ============================================
// ORDERS API
// ============================================
export const ordersAPI = {
  getMyOrders: (token) => apiRequest('/orders/my-orders', token),
  
  getFarmerOrders: (token) => apiRequest('/orders/farmer/orders', token),
  
  updateStatus: (token, id, status) => apiRequest(`/orders/${id}/status`, token, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
};

// ============================================
// FARMERS API
// ============================================
export const farmersAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/farmers${queryParams ? `?${queryParams}` : ''}`);
  },
  
  getProfile: (id) => apiRequest(`/farmers/${id}`),
};

// ============================================
// RATINGS API
// ============================================
export const ratingsAPI = {
  create: (token, ratingData) => apiRequest('/ratings', token, {
    method: 'POST',
    body: JSON.stringify(ratingData),
  }),
  
  getFarmerRatings: (farmerId) => apiRequest(`/ratings/farmer/${farmerId}`),
};

// ============================================
// ADMIN API
// ============================================
export const adminAPI = {
  getAllUsers: (token, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/admin/users${queryParams ? `?${queryParams}` : ''}`, token);
  },
  
  toggleUserBlock: (token, userId, isBlocked, reason) => apiRequest(`/admin/users/${userId}/block`, token, {
    method: 'PUT',
    body: JSON.stringify({ is_blocked: isBlocked, blocked_reason: reason }),
  }),
  
  getAnalytics: (token) => apiRequest('/admin/analytics', token),
  
  getFarmerPerformance: (token) => apiRequest('/admin/farmers/performance', token),
  
  getTransactionHistory: (token, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/admin/transactions${queryParams ? `?${queryParams}` : ''}`, token);
  },
};
