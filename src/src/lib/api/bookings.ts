// src/lib/api/bookings.ts
import { supabase } from '../../utils/supabase/client';

// Re-export confirmBooking from adminBookings
export { confirmBooking } from '../api/adminBookings';

/**
 * Public booking creation payload
 */
export type PublicBookingPayload = {
  full_name: string;
  mobile: string;
  booking_date: string; // YYYY-MM-DD
  start_time: string | null; // "10:00" or null
  end_time: string | null;   // "14:00" or null
  guest_count?: number;
  package_id?: string;
  status?: string; // 'pending' by default
  additional_notes?: string | null;
  special_requests?: string | null;
  email?: string | null;
};

/**
 * Convert slot to times before sending
 */
export function slotToTimes(slot: string | null) {
  switch (slot) {
    case 'morning': return { start_time: '10:00', end_time: '14:00' };
    case 'evening': return { start_time: '14:00', end_time: '18:00' };
    case 'night': return { start_time: '18:00', end_time: '22:00' };
    case 'full_day': return { start_time: '10:00', end_time: '18:00' };
    case 'short_duration': return { start_time: '10:00', end_time: '18:00' };
    default: return { start_time: null, end_time: null };
  }
}

/**
 * Build normalized public booking payload
 * Ensures time_slot is converted to scalar start_time/end_time
 */
export function buildPublicBookingPayload(formValues: any): PublicBookingPayload {
  // formValues may include time_slot/display slot fields — ensure we send times
  const times = formValues.time_slot ? slotToTimes(formValues.time_slot) : {
    start_time: formValues.start_time ?? null,
    end_time: formValues.end_time ?? null,
  };

  return {
    full_name: formValues.full_name,
    mobile: formValues.mobile,
    booking_date: formValues.booking_date,
    start_time: times.start_time,
    end_time: times.end_time,
    guest_count: formValues.guest_count ?? 0,
    package_id: formValues.package_id ?? null,
    status: 'pending',
    additional_notes: formValues.additional_notes ?? null, // maps to DB column
    special_requests: formValues.special_requests ?? null,
    email: formValues.email ?? null,
  };
}

/**
 * Admin Update Booking Payload Type
 * Matches exact RPC signature: admin_update_booking_details(
 *   p_booking_id uuid,
 *   p_event_type text,
 *   p_package_id uuid,
 *   p_time_slot text,
 *   p_start_time time,
 *   p_end_time time,
 *   p_admin_price_adjustment numeric,
 *   p_special_requests text,
 *   p_admin_id uuid
 * )
 * 
 * CRITICAL: p_start_time and p_end_time MUST be scalar values (string | null)
 * NEVER send objects like { start_time: null } or JSON strings
 */
export interface AdminUpdatePayload {
  p_booking_id: string;
  p_event_type: string | null;
  p_package_id: string | null;
  p_time_slot: string | null;
  p_start_time: string | null;  // SCALAR ONLY: "10:00" or null (NEVER objects)
  p_end_time: string | null;    // SCALAR ONLY: "18:00" or null (NEVER objects)
  p_admin_price_adjustment: number;
  p_special_requests: string | null;
  p_admin_id: string;
}

/**
 * RPC wrapper for admin_update_booking_details
 * PostgREST expects keys EXACTLY as function param names
 */
export async function rpcAdminUpdateBooking(payload: AdminUpdatePayload) {
  const { data, error } = await supabase.rpc('admin_update_booking_details', payload);
  return { data, error };
}

/**
 * RPC wrapper for admin_confirm_booking
 * Only 2 parameters: booking ID and admin ID
 */
export async function rpcAdminConfirmBooking(p_booking_id: string, p_admin_id: string) {
  const { data, error } = await supabase.rpc('admin_confirm_booking', {
    p_booking_id,
    p_admin_id,
  });
  return { data, error };
}

/**
 * RPC wrapper for admin_cancel_booking
 * Only 2 parameters: booking ID and admin ID
 */
export async function rpcAdminCancelBooking(p_booking_id: string, p_admin_id: string) {
  const { data, error } = await supabase.rpc('admin_cancel_booking', {
    p_booking_id,
    p_admin_id,
  });
  return { data, error };
}

/**
 * RPC wrapper for admin_update_extras
 * Signature: admin_update_extras(
 *   p_booking_id uuid,
 *   p_admin_id uuid,
 *   p_cooking_gas_qty int,
 *   p_garbage_bags int,
 *   p_plates_large int,
 *   p_plates_small int
 * )
 */
export async function rpcAdminUpdateExtras(
  p_booking_id: string,
  p_admin_id: string,
  p_cooking_gas_qty: number,
  p_garbage_bags: number,
  p_plates_large: number,
  p_plates_small: number
) {
  const { data, error } = await supabase.rpc('admin_update_extras', {
    p_booking_id,
    p_admin_id,
    p_cooking_gas_qty,
    p_garbage_bags,
    p_plates_large,
    p_plates_small,
  });
  return { data, error };
}

/**
 * RPC wrapper for get_booking_actions
 * Signature: get_booking_actions(p_booking_id uuid)
 */
export async function rpcGetBookingActions(p_booking_id: string) {
  const { data, error } = await supabase.rpc('get_booking_actions', {
    p_booking_id,
  });
  return { data, error };
}
