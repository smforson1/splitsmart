import apiClient from './client';

export const analyticsApi = {
    getSpendingByCategory: (groupId) => apiClient.get(`/api/analytics/groups/${groupId}/spending-by-category`),
    getSpendingTrend: (groupId) => apiClient.get(`/api/analytics/groups/${groupId}/spending-trend`),
};
