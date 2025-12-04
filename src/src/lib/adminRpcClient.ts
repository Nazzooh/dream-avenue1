// src/lib/adminRpcClient.ts
// Admin RPC calls matching EXACT backend signatures

import { supabase } from '../../utils/supabase/client';
import { assertAdmin } from './adminAuth';

/**
 * Generic Admin RPC wrapper
 * Automatically injects p_admin_id for all admin RPC calls
 * Use this for any admin RPC function calls
 */
export async function adminRpc<T = any>(
  fnName: string,
  params: Record<string, any> = {}
): Promise<{ data: T | null; error: any }> {
  const profile = await assertAdmin(`RPC: ${fnName}`);

  const enrichedParams = {
    ...params,
    p_admin_id: params.p_admin_id || profile.id,
  };

  console.log('📞 RPC:', fnName, enrichedParams);

  const result = await supabase.rpc(fnName, enrichedParams);

  if (result.error) {
    console.error(`❌ ${fnName} failed:`, result.error);
  } else {
    console.log(`✅ ${fnName} succeeded`);
  }

  return result;
}

/**
 * Admin RPC: Confirm Booking
 * Backend signature: admin_confirm_booking(p_booking_id uuid, p_admin_id uuid)
 * Changes booking status from 'pending' to 'confirmed'
 */
export async function adminConfirmBooking(bookingId: string): Promise<void> {
  const profile = await assertAdmin('confirm booking');

  console.log('📞 RPC: admin_confirm_booking', { p_booking_id: bookingId, p_admin_id: profile.id });

  const { data, error } = await supabase.rpc('admin_confirm_booking', {
    p_booking_id: bookingId,
    p_admin_id: profile.id,
  });

  if (error) {
    console.error('❌ admin_confirm_booking failed:', error);
    throw new Error(error.message || 'Failed to confirm booking');
  }

  console.log('✅ Booking confirmed successfully');
}

/**
 * Admin RPC: Cancel Booking
 * Backend signature: admin_cancel_booking(p_booking_id uuid, p_admin_id uuid)
 * Changes booking status to 'cancelled' and frees calendar slots
 */
export async function adminCancelBooking(bookingId: string): Promise<void> {
  const profile = await assertAdmin('cancel booking');

  console.log('📞 RPC: admin_cancel_booking', { p_booking_id: bookingId, p_admin_id: profile.id });

  const { data, error } = await supabase.rpc('admin_cancel_booking', {
    p_booking_id: bookingId,
    p_admin_id: profile.id,
  });

  if (error) {
    console.error('❌ admin_cancel_booking failed:', error);
    throw new Error(error.message || 'Failed to cancel booking');
  }

  console.log('✅ Booking cancelled successfully');
}

/**
 * Admin RPC: Update Booking Details
 * Backend signature: admin_update_booking_details(
 *   p_booking_id uuid,
 *   p_event_type text,
 *   p_package_id uuid,
 *   p_time_slot text,
 *   p_start_time time,
 *   p_end_time time,
 *   p_admin_price_adjustment numeric,
 *   p_special_requests text,
 *   p_admin_price_adjustment numeric,
 *   p_special_requests text,
 *   p_admin_id uuid
 * )
 * Updates booking fields without changing status
 */
export async function adminUpdateBookingDetails(params: {
  bookingId: string;
  eventType?: string | null;
  packageId?: string | null;
  timeSlot?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  adminPriceAdjustment?: number;
  specialRequests?: string;
  adminPriceAdjustment?: number;
  specialRequests?: string;
}): Promise<anyany> {
  const profile = await assertAdmin('update booking details');

  const rpcPayload = {
    p_booking_id: params.bookingId,
    p_event_type: params.eventType ?? null,
    p_package_id: params.packageId ?? null,
    p_time_slot: params.timeSlot ?? null,
    p_start_time: params.startTime ?? null,
    p_end_time: params.endTime ?? null,
    p_admin_price_adjustment: params.adminPriceAdjustment ?? 0,
    p_special_requests: params.specialRequests ?? null,
    p_admin_price_adjustment: params.adminPriceAdjustment ?? 0,
    p_special_requests: params.specialRequests ?? null,
    p_admin_id: profile.id,
  };

  console.log('📞 RPC: admin_update_booking_details', rpcPayload);

  const { data, error } = await supabase.rpc('admin_update_booking_details', rpcPayload);

  if (error) {
    console.error('❌ admin_update_booking_details failed:', error);
    throw new Error(error.message || 'Failed to update booking details');
  }

  if (!data || data.length === 0) {
    throw new Error("RPC returned null — booking update failed.");
  }

  if (!data || data.length === 0) {
    throw new Error("RPC returned null — booking update failed.");
  }

  console.log('✅ Booking details updated successfully');
  return data[0]; // full booking row
  return data[0]; // full booking row
}

/**
 * Get booking audit trail
 * Backend signature: get_booking_actions(p_booking_id uuid)
 * Returns array of booking_actions records
 */
export async function getBookingActions(bookingId: string): Promise<any[]> {
  console.log('📞 RPC: get_booking_actions', { p_booking_id: bookingId });

  const { data, error } = await supabase.rpc('get_booking_actions', {
    p_booking_id: bookingId,
  });

  if (error) {
    console.error('❌ get_booking_actions failed:', error);
    throw new Error(error.message || 'Failed to fetch booking actions');
  }

  console.log('✅ Fetched booking actions:', data?.length || 0, 'records');
  return data || [];
}