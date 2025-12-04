// src/hooks/useAnalyticsSummary.ts — React Query hook for Analytics Summary with Realtime
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "../../utils/supabase/client";
import { getAnalyticsSummary, updateAnalyticsSummary, analyticsKeys } from "../api/analytics";
import type { AnalyticsSummary } from "../api/analytics";

export const analyticsSummaryKeys = {
  all: ["analytics-summary"] as const,
  detail: () => [...analyticsSummaryKeys.all, "detail"] as const,
};

/**
 * Hook to fetch analytics summary with Realtime sync
 */
export function useAnalyticsSummary() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: analyticsSummaryKeys.detail(),
    queryFn: getAnalyticsSummary,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  // Setup Realtime subscription for auto-refresh
  useEffect(() => {
    console.log('🔄 Setting up Realtime sync for analytics_summary...');

    const channel = supabase
      .channel('analytics_summary_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'analytics_summary',
        },
        (payload) => {
          console.log('📊 Analytics summary changed:', payload);
          
          // Invalidate query to trigger refetch
          queryClient.invalidateQueries({ 
            queryKey: analyticsSummaryKeys.detail() 
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Connected to analytics_summary Realtime');
        }
      });

    return () => {
      console.log('🔕 Unsubscribing from analytics_summary Realtime');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

/**
 * Hook to update analytics summary (single-row upsert)
 */
export function useUpdateAnalyticsSummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<AnalyticsSummary>) => {
      return updateAnalyticsSummary(updates);
    },
    onMutate: async (updates) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: analyticsSummaryKeys.detail() 
      });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<AnalyticsSummary>(
        analyticsSummaryKeys.detail()
      );

      // Optimistically update
      if (previousData) {
        queryClient.setQueryData<AnalyticsSummary>(
          analyticsSummaryKeys.detail(),
          { ...previousData, ...updates }
        );
      }

      return { previousData };
    },
    onError: (err: any, variables, context) => {
      // Rollback on error (but don't throw for permission errors)
      if (context?.previousData) {
        queryClient.setQueryData(
          analyticsSummaryKeys.detail(),
          context.previousData
        );
      }
      
      // Only log error if not a permission issue
      if (!err.message?.includes('permission denied')) {
        console.error('❌ Failed to update analytics summary:', err);
      } else {
        console.warn('⚠️ Analytics update skipped due to permissions');
      }
    },
    onSuccess: (data) => {
      console.log('✅ Analytics summary updated successfully:', data);
      
      // Update cache with server response
      queryClient.setQueryData(
        analyticsSummaryKeys.detail(),
        data
      );
    },
    onSettled: () => {
      // Always refetch to ensure sync
      queryClient.invalidateQueries({ 
        queryKey: analyticsSummaryKeys.detail() 
      });
    },
  });
}
