import apiClient from './config';
import { AnalyticsSummary, HeatmapData, SocialFeedItem } from '@/types/api';

// ============================================
// Analytics API
// ============================================

/**
 * Get comprehensive analytics summary
 */
export const getAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  const response = await apiClient.get<AnalyticsSummary>('/analytics/summary');
  return response.data;
};

/**
 * Get heatmap data (GitHub-style contribution graph)
 */
export const getHeatmapData = async (
  startDate: string,
  endDate: string
): Promise<{ data: HeatmapData[]; startDate: string; endDate: string }> => {
  const response = await apiClient.get<{
    data: HeatmapData[];
    startDate: string;
    endDate: string;
  }>('/analytics/heatmap', {
    params: { start_date: startDate, end_date: endDate },
  });
  return response.data;
};

/**
 * Get social activity feed from shared habits
 */
export const getSocialFeed = async (
  limit: number = 20
): Promise<{ feed: SocialFeedItem[]; total: number }> => {
  const response = await apiClient.get<{ feed: SocialFeedItem[]; total: number }>(
    '/analytics/social/feed',
    {
      params: { limit },
    }
  );
  return response.data;
};
