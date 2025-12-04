// src/hooks/useAnalytics.ts — React Query hooks for analytics
import { useQuery } from "@tanstack/react-query";
import {
  getAnalytics,
  getAnalyticsSummary,
  getDashboardStats,
  analyticsKeys,
} from "../api/analytics";

// GET analytics data
export const useAnalytics = () => {
  return useQuery({
    queryKey: analyticsKeys.all,
    queryFn: getAnalytics,
    refetchInterval: 60000, // Refetch every minute
  });
};

// GET analytics summary
export const useAnalyticsSummary = () => {
  return useQuery({
    queryKey: analyticsKeys.summary(),
    queryFn: getAnalyticsSummary,
    refetchInterval: 60000,
  });
};

// GET dashboard stats
export const useDashboardStats = () => {
  return useQuery({
    queryKey: analyticsKeys.dashboard(),
    queryFn: getDashboardStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
