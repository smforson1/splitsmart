import apiClient from './client';

export const groupsApi = {
  getAll: () => apiClient.get('/api/groups'),
  getById: (id) => apiClient.get(`/api/groups/${id}`),
  create: (data) => apiClient.post('/api/groups', data),
  update: (id, data) => apiClient.put(`/api/groups/${id}`, data),
  delete: (id) => apiClient.delete(`/api/groups/${id}`),
  addMember: (groupId, data) => apiClient.post(`/api/groups/${groupId}/members`, data),
};

export const membersApi = {
  delete: (id) => apiClient.delete(`/api/members/${id}`),
};

export const expensesApi = {
  getAll: (params) => apiClient.get('/api/expenses', { params }),
  getById: (id) => apiClient.get(`/api/expenses/${id}`),
  create: (data) => apiClient.post('/api/expenses', data),
  update: (id, data) => apiClient.put(`/api/expenses/${id}`, data),
  delete: (id) => apiClient.delete(`/api/expenses/${id}`),
  scan: (formData) => apiClient.post('/api/expenses/scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const balancesApi = {
  getByGroup: (groupId) => apiClient.get(`/api/balances/${groupId}`),
};

export const settlementsApi = {
  getAll: (params) => apiClient.get('/api/settlements', { params }),
  create: (data) => apiClient.post('/api/settlements', data),
  confirm: (id) => apiClient.put(`/api/settlements/${id}/confirm`),
};
