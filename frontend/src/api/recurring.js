import apiClient from './client';

export const recurringApi = {
    getAll: (groupId) => apiClient.get(`/api/recurring?groupId=${groupId}`),
    create: (data) => apiClient.post('/api/recurring', data),
    delete: (id) => apiClient.delete(`/api/recurring/${id}`),
};
