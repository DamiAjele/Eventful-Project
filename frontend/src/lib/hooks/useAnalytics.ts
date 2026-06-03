import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics.api';

export const useCreatorAnalytics = () =>
  useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: analyticsApi.getOverview,
  });

export const useEventAnalytics = (eventId: string) =>
  useQuery({
    queryKey: ['analytics', 'event', eventId],
    queryFn: () => analyticsApi.getEventAnalytics(eventId),
    enabled: !!eventId,
  });

export const useRevenueChart = (period: 'daily' | 'weekly' | 'monthly') =>
  useQuery({
    queryKey: ['analytics', 'revenue', period],
    queryFn: () => analyticsApi.getRevenue(period),
  });
