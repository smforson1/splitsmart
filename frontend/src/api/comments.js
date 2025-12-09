import apiClient from './client';

export const commentsApi = {
    getAll: (expenseId) => apiClient.get(`/api/expenses/${expenseId}/comments`),
    create: (expenseId, text) => apiClient.post(`/api/expenses/${expenseId}/comments`, { text }),
};
