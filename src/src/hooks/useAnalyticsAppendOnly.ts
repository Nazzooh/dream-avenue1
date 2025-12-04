// src/hooks/useAnalyticsAppendOnly.ts — React Query hooks for Append-Only Analytics
// Features: Realtime sync, optimistic updates, history tracking

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "../../utils/supabase/client";
import {
  getLatestAnalytics,
  getAnalyticsHistory,
  insertAnalyticsSnapshot,
  analyticsAppendOnlyKeys,
} from "../api/analytics-append-only";
import type { AnalyticsSummaryUpdate } from "../schemas/analyticsSummary";

/**
 * Hook to fetch the latest analytics snapshot
 * Automatically refreshes via Realtime when new rows are inserted
 */
export function useLatestAnalytics() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: analyticsAppendOnlyKeys.latest(),
    queryFn: getLatestAnalytics,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  // Setup Realtime subscription for INSERT events only
  useEffect(() => {
    console.log('🔄 Setting up Realtime sync for analytics_summary (INSERT only)...');

    const channel = supabase
      .channel('analytics_summary_inserts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT', // Only listen to new rows
          schema: 'public',
          table: 'analytics_summary',
        },
        (payload) => {
          console.log('📊 New analytics snapshot inserted:', payload);
          
          // Invalidate queries to trigger refetch
          queryClient.invalidateQueries({ 
            queryKey: analyticsAppendOnlyKeys.all 
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Connected to analytics_summary Realtime (INSERT events)');
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
 * Hook to fetch analytics history
 * Shows the last N snapshots for audit/review purposes
 */
export function useAnalyticsHistory(limit: number = 3) {
  return useQuery({
    queryKey: analyticsAppendOnlyKeys.history(limit),
    queryFn: () => getAnalyticsHistory(limit),
    staleTime: 30000,
  });
}

/**
 * Hook to insert a new analytics snapshot
 * Creates a new row instead of updating existing one
 */
export function useInsertAnalyticsSnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      updates, 
      updatedBy 
    }: { 
      updates: AnalyticsSummaryUpdate; 
      updatedBy?: string;
    }) => {
      return insertAnalyticsSnapshot(updates, updatedBy);
    },
    onSuccess: (data) => {
      console.log('✅ Analytics snapshot inserted successfully:', data);
      
      // Invalidate all analytics queries to trigger refetch
      queryClient.invalidateQueries({ 
        queryKey: analyticsAppendOnlyKeys.all 
      });
    },
    onError: (error: any) => {
      console.error('❌ Failed to insert analytics snapshot:', error);
    },
  });
}
