// /src/api/actions.ts
import { supabase } from "../../utils/supabase/client";

/**
 * Fetch booking actions history (Patch 4)
 * Calls get_booking_actions(p_booking_id) and expects names
 */
export async function getBookingActions(bookingId: string) {
  console.log('Fetching booking actions for', bookingId);
  const { data, error } = await supabase.rpc('get_booking_actions', { p_booking_id: bookingId });
  if (error) {
    console.error('[API] get_booking_actions error', error);
    throw error;
  }
  return data; // expected rows contain performed_by_name, actor_name if function returns them
}
