import apiClient from './client';

export const invitesApi = {
    getAll: () => apiClient.get('/api/invites'),
    send: (data) => apiClient.post('/api/invites', data),
    accept: (id) => apiClient.post(`/api/invites/${id}/accept`),
    decline: (id) => apiClient.post(`/api/invites/${id}/decline`),
};
