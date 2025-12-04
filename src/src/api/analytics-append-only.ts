// src/api/analytics-append-only.ts — Append-Only Analytics API
// Each update creates a new row instead of updating existing ones

import { supabase } from "../../utils/supabase/client";
import { 
  analyticsSummarySchema, 
  analyticsSummaryUpdateSchema,
  type AnalyticsSummary,
  type AnalyticsSummaryUpdate
} from "../schemas/analyticsSummary";

/**
 * Fetch the latest analytics snapshot
 * Always returns the most recent row based on updated_at
 */
export const getLatestAnalytics = async (): Promise<AnalyticsSummary | null> => {
  const { data, error } = await supabase
    .from('analytics_summary')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('❌ Failed to fetch latest analytics:', error);
    throw new Error(error.message);
  }

  if (!data) {
    console.warn('⚠️ No analytics data found');
    return null;
  }

  // Coerce updated_at to ISO string before validation (Supabase returns PostgreSQL timestamp)
  if (data.updated_at) {
    data.updated_at = new Date(data.updated_at).toISOString();
  }

  return analyticsSummarySchema.parse(data);
};

/**
 * Fetch analytics history (last N entries)
 * Used for displaying recent changes
 */
export const getAnalyticsHistory = async (limit: number = 3): Promise<AnalyticsSummary[]> => {
  const { data, error } = await supabase
    .from('analytics_summary')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('❌ Failed to fetch analytics history:', error);
    throw new Error(error.message);
  }

  return (data || []).map(item => {
    // Coerce updated_at to ISO string before validation (Supabase returns PostgreSQL timestamp)
    if (item.updated_at) {
      item.updated_at = new Date(item.updated_at).toISOString();
    }
    return analyticsSummarySchema.parse(item);
  });
};

/**
 * Insert a new analytics snapshot
 * Creates a new row instead of updating existing one (append-only)
 */
export const insertAnalyticsSnapshot = async (
  updates: AnalyticsSummaryUpdate,
  updatedBy: string = 'dream-avenue'
): Promise<AnalyticsSummary> => {
  // Validate input
  const validated = analyticsSummaryUpdateSchema.parse(updates);

  // Prepare insert payload (let PostgreSQL handle updated_at with DEFAULT now())
  const insertPayload = {
    events_hosted: validated.events_hosted,
    guests_served: validated.guests_served,
    client_satisfaction: validated.client_satisfaction,
    updated_by: updatedBy,
    // ✅ Removed updated_at - PostgreSQL handles it via DEFAULT now()
  };

  // 🔍 Debug: Log data being sent to Supabase
  console.log('📤 Data being sent to Supabase (INSERT):', insertPayload);

  // Insert new row
  const { data, error } = await supabase
    .from('analytics_summary')
    .insert([insertPayload])
    .select()
    .single();

  if (error) {
    console.error('❌ Failed to insert analytics snapshot:', error);
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('No data returned from insert');
  }

  // Coerce updated_at to ISO string before validation (Supabase returns PostgreSQL timestamp)
  if (data.updated_at) {
    data.updated_at = new Date(data.updated_at).toISOString();
  }

  console.log('✅ New analytics snapshot created:', data);
  return analyticsSummarySchema.parse(data);
};

/**
 * React Query keys for append-only analytics
 */
export const analyticsAppendOnlyKeys = {
  all: ['analytics-append-only'] as const,
  latest: () => [...analyticsAppendOnlyKeys.all, 'latest'] as const,
  history: (limit: number) => [...analyticsAppendOnlyKeys.all, 'history', limit] as const,
};
