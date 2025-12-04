// src/api/analytics.ts — Analytics and dashboard stats API functions
import { supabase } from "../../utils/supabase/client";
import { z } from "zod";

// Analytics schema
const analyticsSchema = z.object({
  totalBookings: z.number(),
  totalGuests: z.number(),
  bookingsByStatus: z.record(z.number()),
  bookingsByPackage: z.record(z.number()),
  recentBookingsCount: z.number(),
  confirmedBookings: z.number(),
  pendingBookings: z.number(),
});

// Analytics summary schema
const analyticsSummarySchema = z.object({
  events_hosted: z.number(),
  guests_served: z.number(),
  client_satisfaction: z.number(),
  updated_at: z.string().optional(),
  updated_by: z.string().optional(),
});

// Dashboard stats schema
const dashboardStatsSchema = z.object({
  packages: z.number(),
  facilities: z.number(),
  gallery: z.number(),
  testimonials: z.number(),
  events: z.number(),
  reviews: z.number(),
  bookings: z.object({
    total: z.number(),
    pending: z.number(),
    confirmed: z.number(),
    cancelled: z.number(),
  }),
});

export type Analytics = z.infer<typeof analyticsSchema>;
export type AnalyticsSummary = z.infer<typeof analyticsSummarySchema>;
export type DashboardStats = z.infer<typeof dashboardStatsSchema>;

// GET analytics data
export const getAnalytics = async (): Promise<Analytics> => {
  // Fetch bookings data directly from Supabase
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("status, guest_count, package_id, created_at");
  
  if (error) throw new Error(error.message);
  
  const totalBookings = bookings?.length || 0;
  const totalGuests = bookings?.reduce((sum, b) => sum + (b.guest_count || 0), 0) || 0;
  
  // Count bookings by status
  const bookingsByStatus: Record<string, number> = {};
  bookings?.forEach(b => {
    bookingsByStatus[b.status] = (bookingsByStatus[b.status] || 0) + 1;
  });
  
  // Count bookings by package
  const bookingsByPackage: Record<string, number> = {};
  bookings?.forEach(b => {
    if (b.package_id) {
      bookingsByPackage[b.package_id] = (bookingsByPackage[b.package_id] || 0) + 1;
    }
  });
  
  // Recent bookings (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentBookingsCount = bookings?.filter(b => 
    new Date(b.created_at || 0) >= thirtyDaysAgo
  ).length || 0;
  
  return analyticsSchema.parse({
    totalBookings,
    totalGuests,
    bookingsByStatus,
    bookingsByPackage,
    recentBookingsCount,
    confirmedBookings: bookingsByStatus['confirmed'] || 0,
    pendingBookings: bookingsByStatus['pending'] || 0,
  });
};

// GET analytics summary
export const getAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  // Fetch from analytics_summary table (only one row exists)
  const { data, error } = await supabase
    .from("analytics_summary")
    .select("*")
    .limit(1)
    .maybeSingle();
  
  if (error) {
    console.error('❌ Failed to fetch analytics summary:', error);
    // If no data, return defaults
    return analyticsSummarySchema.parse({
      events_hosted: 0,
      guests_served: 0,
      client_satisfaction: 0,
    });
  }
  
  if (!data) {
    console.warn('⚠️ No analytics summary row found. Returning defaults.');
    return analyticsSummarySchema.parse({
      events_hosted: 0,
      guests_served: 0,
      client_satisfaction: 0,
    });
  }
  
  // Coerce updated_at to ISO string before validation (Supabase returns PostgreSQL timestamp)
  if (data.updated_at) {
    data.updated_at = new Date(data.updated_at).toISOString();
  }
  
  return analyticsSummarySchema.parse(data);
};

// GET dashboard stats
export const getDashboardStats = async (): Promise<DashboardStats> => {
  // Fetch counts from all tables
  const [
    packagesResult,
    facilitiesResult,
    galleryResult,
    testimonialsResult,
    eventsResult,
    reviewsResult,
    bookingsResult,
  ] = await Promise.all([
    supabase.from("packages").select("id", { count: "exact", head: true }),
    supabase.from("facilities").select("id", { count: "exact", head: true }),
    supabase.from("gallery").select("id", { count: "exact", head: true }),
    supabase.from("testimonials").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase.from("reviews").select("id", { count: "exact", head: true }),
    supabase.from("bookings").select("status", { count: "exact" }),
  ]);
  
  // Get booking status counts
  const bookings = bookingsResult.data || [];
  const bookingStats = {
    total: bookingsResult.count || 0,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };
  
  return dashboardStatsSchema.parse({
    packages: packagesResult.count || 0,
    facilities: facilitiesResult.count || 0,
    gallery: galleryResult.count || 0,
    testimonials: testimonialsResult.count || 0,
    events: eventsResult.count || 0,
    reviews: reviewsResult.count || 0,
    bookings: bookingStats,
  });
};

// UPDATE analytics summary (single-row update)
// Since analytics_summary has only ONE row, we update it directly without filtering by ID
export const updateAnalyticsSummary = async (
  updates: Partial<AnalyticsSummary>,
  updatedBy?: string
): Promise<AnalyticsSummary> => {
  try {
    // Use 'admin' as default updater for simplified auth
    const userEmail = updatedBy || 'admin';
    
    // Step 1: Get the current row to verify it exists and get its ID
    const { data: currentRow, error: fetchError } = await supabase
      .from('analytics_summary')
      .select('id')
      .limit(1)
      .maybeSingle();
    
    if (fetchError) {
      console.error('❌ Failed to fetch analytics row:', fetchError);
      throw new Error(fetchError.message);
    }
    
    if (!currentRow) {
      console.error('❌ No analytics_summary row found. Please run the migration first.');
      throw new Error('Analytics summary table is empty. Run migration: /supabase/migrations/20251107_fix_analytics_rls_simple.sql');
    }
    
    console.log('📊 Updating analytics summary with ID:', currentRow.id);
    
    // Step 2: Prepare update payload (let PostgreSQL handle updated_at with DEFAULT now())
    const updatePayload = {
      events_hosted: updates.events_hosted,
      guests_served: updates.guests_served,
      client_satisfaction: updates.client_satisfaction,
      updated_by: userEmail,
      // ✅ Removed updated_at - PostgreSQL handles it via DEFAULT now()
    };
    
    // Remove undefined values
    const cleanPayload = Object.fromEntries(
      Object.entries(updatePayload).filter(([_, value]) => value !== undefined)
    );
    
    // 🔍 Debug: Log data being sent to Supabase
    console.log('📤 Data being sent to Supabase (UPDATE):', cleanPayload);
    
    // Step 3: Perform the update (without .select() to avoid RLS issues)
    const { error: updateError } = await supabase
      .from('analytics_summary')
      .update(cleanPayload)
      .eq('id', currentRow.id);
    
    if (updateError) {
      console.error('❌ Analytics summary update failed:', updateError);
      throw new Error(updateError.message);
    }
    
    console.log('✅ Update query executed successfully');
    
    // Step 4: Fetch the updated row separately (to avoid RLS issues with UPDATE...RETURNING)
    const { data: updatedData, error: refetchError } = await supabase
      .from('analytics_summary')
      .select('*')
      .eq('id', currentRow.id)
      .maybeSingle();
    
    if (refetchError) {
      console.error('❌ Failed to refetch updated data:', refetchError);
      throw new Error(refetchError.message);
    }
    
    if (!updatedData) {
      console.error('❌ Refetch returned no data');
      throw new Error('Failed to verify analytics update');
    }
    
    // Coerce updated_at to ISO string before validation (Supabase returns PostgreSQL timestamp)
    if (updatedData.updated_at) {
      updatedData.updated_at = new Date(updatedData.updated_at).toISOString();
    }
    
    console.log('✅ Analytics summary updated successfully:', updatedData);
    return analyticsSummarySchema.parse(updatedData);
  } catch (err: any) {
    console.error('❌ Update error:', err);
    throw err;
  }
};

// React Query keys
export const analyticsKeys = {
  all: ["analytics"] as const,
  summary: () => [...analyticsKeys.all, "summary"] as const,
  dashboard: () => [...analyticsKeys.all, "dashboard"] as const,
};
