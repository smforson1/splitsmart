import apiClient from './client';

export const notificationsApi = {
    getAll: () => apiClient.get('/api/notifications'),
    markRead: (id) => apiClient.put(`/api/notifications/${id}/read`),
};
