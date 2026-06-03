import api from './axios';

export const analyticsApi = {
  getOverview: () =>
    api.get('/analytics/overview').then((r) => r.data),

  getEventAnalytics: (eventId: string) =>
    api.get(`/analytics/events/${eventId}`).then((r) => r.data),

  getRevenue: (period: 'daily' | 'weekly' | 'monthly') =>
    api.get('/analytics/revenue', { params: { period } }).then((r) => r.data),
};
