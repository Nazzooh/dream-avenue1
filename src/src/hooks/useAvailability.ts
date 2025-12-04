// src/hooks/useAvailability.ts — React Query hooks for availability
import { useQuery } from "@tanstack/react-query";
import {
  getAvailability,
  checkDateAvailability,
  getMonthlyAvailability,
  availabilityKeys,
} from "../api/availability";

// GET availability calendar (date range)
export const useAvailability = (params?: {
  start_date?: string;
  end_date?: string;
}) => {
  return useQuery({
    queryKey: availabilityKeys.calendar(params),
    queryFn: () => getAvailability(params),
    refetchInterval: (query) => {
      // Only refetch if successful, not on error
      return query.state.status === 'success' ? 60000 : false;
    },
    retry: 1, // Only retry once
    retryDelay: 3000, // Wait 3 seconds before retrying
    staleTime: 30000, // Consider data stale after 30 seconds
    // Don't throw errors, let the UI handle them gracefully
    throwOnError: false,
    // Don't refetch on mount/window focus if we have an error
    refetchOnMount: (query) => query.state.status !== 'error',
    refetchOnWindowFocus: (query) => query.state.status !== 'error',
  });
};

// CHECK specific date availability
export const useCheckDateAvailability = (params: {
  date: string;
  start_time?: string;
  end_time?: string;
}) => {
  return useQuery({
    queryKey: availabilityKeys.check(params),
    queryFn: () => checkDateAvailability(params),
    enabled: !!params.date,
  });
};

// GET monthly availability summary
export const useMonthlyAvailability = (year: number, month: number) => {
  return useQuery({
    queryKey: availabilityKeys.monthly(year, month),
    queryFn: () => getMonthlyAvailability(year, month),
    refetchInterval: 60000, // Refetch every minute
  });
};
