// src/hooks/useAdminEvents.ts — React Query hook for admin events view
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../utils/supabase/client";

export interface AdminEvent {
  id: string;
  booking_id: string;
  booking_date: string;
  event_type: string;
  full_name: string;
  mobile: string;
  guest_count: number | null;
  final_price: number;
  package_name: string | null;
  status: string;
  slot: string | null;
  floor_cleaning: boolean | null;
  floor_cleaning_cost: number | null;
  cooking_gas_qty: number | null;
  garbage_bags: number | null;
  plates: number | null;
  admin_notes: string | null;
  special_requests: string | null;
  created_at: string;
  updated_at: string | null;
}

// Fetch all admin events from admin_events_view
export const getAdminEvents = async (): Promise<AdminEvent[]> => {
  const { data, error } = await supabase
    .from('admin_events_view')
    .select('*')
    .order('booking_date', { ascending: true });
  
  if (error) {
    console.error('Error fetching admin events:', error);
    throw new Error(error.message);
  }
  
  return data || [];
};

// React Query hook
export const useAdminEvents = () => {
  return useQuery({
    queryKey: ['admin_events'],
    queryFn: getAdminEvents,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};