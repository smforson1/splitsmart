import apiClient from './client';

export const activityApi = {
    getAll: (groupId) => apiClient.get(`/api/activities?groupId=${groupId}`),
};
