/**
 * ULTRA-SIMPLE Analytics Update Function
 * 
 * This is a backup/alternative implementation that's even simpler.
 * Use this if the main implementation still has issues.
 * 
 * Since analytics_summary has exactly ONE row, we don't need to filter by ID.
 * We just update the only row that exists.
 */

import { supabase } from "../../utils/supabase/client";
import { analyticsSummarySchema } from "../schemas/analyticsSummary";
import type { AnalyticsSummary } from "../schemas/analyticsSummary";

export const updateAnalyticsSummarySimple = async (
  updates: Partial<AnalyticsSummary>,
  updatedBy?: string
): Promise<AnalyticsSummary> => {
  const userEmail = updatedBy || 'admin';
  
  console.log('🔄 Starting ultra-simple analytics update...');
  console.log('📝 Updates:', updates);
  
  // Step 1: Update ALL rows (there's only 1, so this is safe)
  // No WHERE clause needed since there's only one row
  const { error: updateError, count } = await supabase
    .from('analytics_summary')
    .update({
      events_hosted: updates.events_hosted,
      guests_served: updates.guests_served,
      client_satisfaction: updates.client_satisfaction,
      updated_by: userEmail,
      updated_at: new Date().toISOString(),
    })
    .not('id', 'is', null); // Update all rows (just needs a WHERE clause syntactically)
  
  if (updateError) {
    console.error('❌ Update failed:', updateError);
    throw new Error(`Update failed: ${updateError.message}`);
  }
  
  console.log(`✅ Updated ${count} row(s)`);
  
  // Step 2: Fetch the updated data
  const { data, error: fetchError } = await supabase
    .from('analytics_summary')
    .select('*')
    .limit(1)
    .maybeSingle();
  
  if (fetchError) {
    console.error('❌ Fetch failed:', fetchError);
    throw new Error(`Fetch failed: ${fetchError.message}`);
  }
  
  if (!data) {
    console.error('❌ No data returned after update');
    throw new Error('No data found in analytics_summary table');
  }
  
  console.log('✅ Analytics updated successfully:', data);
  return analyticsSummarySchema.parse(data);
};

/**
 * GET analytics summary (simple version)
 */
export const getAnalyticsSummarySimple = async (): Promise<AnalyticsSummary> => {
  const { data, error } = await supabase
    .from('analytics_summary')
    .select('*')
    .limit(1)
    .maybeSingle();
  
  if (error) {
    console.error('❌ Failed to fetch analytics:', error);
    throw new Error(error.message);
  }
  
  if (!data) {
    console.warn('⚠️ No analytics row found, returning defaults');
    return {
      events_hosted: 0,
      guests_served: 0,
      client_satisfaction: 100,
    };
  }
  
  return analyticsSummarySchema.parse(data);
};
