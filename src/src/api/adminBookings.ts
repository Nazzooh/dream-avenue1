import { supabase } from "../../utils/supabase/client";
import { log } from "../lib/logger";

/**
 * Ensure current session is from an admin user
 */
async function ensureAdminSession() {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (!session) throw new Error('Not authenticated');
  // prefer root role; fallback to metadata
  const rootRole = (session.user as any).role;
  const metaRole = (session.user as any)?.user_metadata?.role;
  const isAdmin = rootRole === 'admin' || metaRole === 'admin';
  if (!isAdmin) throw new Error('Admin role required');
  return session;
}

/**
 * Call admin_confirm_booking RPC.
 * Note: RPC signature expected: admin_confirm_booking(p_booking_id uuid, p_admin_id uuid)
 */
export async function adminConfirmBooking(p_booking_id: string, p_admin_id: string) {
  log.info("adminConfirmBooking", { p_booking_id, p_admin_id });
  const { data, error } = await supabase.rpc("admin_confirm_booking", {
    p_booking_id,
    p_admin_id,
  });

  if (error) {
    log.error("admin_confirm_booking rpc error", error);
    throw error;
  }
  return data;
}

/**
 * Call admin_cancel_booking RPC.
 */
export async function adminCancelBooking(p_booking_id: string, p_admin_id: string) {
  log.info("adminCancelBooking", { p_booking_id, p_admin_id });
  const { data, error } = await supabase.rpc("admin_cancel_booking", {
    p_booking_id,
    p_admin_id,
  });

  if (error) {
    log.error("admin_cancel_booking rpc error", error);
    throw error;
  }
  return data;
}

/**
 * Alias for adminCancelBooking (for backwards compatibility)
 */
export async function cancelBooking({ adminId, bookingId }) {
  const payload = { p_booking_id: bookingId, p_admin_id: adminId };
  console.log("[API] cancelBooking PAYLOAD:", payload);
  const { data, error } = await supabase.rpc("admin_cancel_booking", payload);
  if (error) throw error;
  return data;
}

/**
 * Confirm booking with object params and inline auth check
 */
export async function confirmBooking({ bookingId, adminId }: { bookingId: string; adminId: string }): Promise<any> {
  const { data, error } = await supabase.rpc("admin_confirm_booking", {
    p_booking_id: bookingId,
    p_admin_id: adminId,
  });
  if (error) throw error;
  return data;
}

/**
 * Confirm booking (object params - matches SQL: admin_confirm_booking(p_admin_id, p_booking_id))
 */
export async function confirmBookingV2({ adminId, bookingId }: { adminId: string; bookingId: string; }) {
  await ensureAdminSession();
  const payload = { p_admin_id: adminId, p_booking_id: bookingId };
  console.log('FINAL RPC PAYLOAD confirmBooking', payload);
  const { data, error } = await supabase.rpc('admin_confirm_booking', payload);
  if (error) {
    console.error('[API] admin_confirm_booking error', error);
    throw error;
  }
  return data;
}

/**
 * Cancel booking (object params - matches SQL: admin_cancel_booking(p_admin_id, p_booking_id))
 */
export async function cancelBookingV2({ adminId, bookingId }: { adminId: string; bookingId: string; }) {
  await ensureAdminSession();
  const payload = { p_admin_id: adminId, p_booking_id: bookingId };
  console.log('FINAL RPC PAYLOAD cancelBooking', payload);
  const { data, error } = await supabase.rpc('admin_cancel_booking', payload);
  if (error) throw error;
  return data;
}

/**
 * Update extras (object params - matches SQL signature)
 */
export async function adminUpdateExtrasV2(params: {
  adminId: string;
  bookingId: string;
  cookingGasQty: number;
  garbageBags: number;
  platesLarge: number;
  platesSmall: number;
}) {
  await ensureAdminSession();
  const payload = {
    p_admin_id: params.adminId,
    p_booking_id: params.bookingId,
    p_cooking_gas_qty: params.cookingGasQty,
    p_garbage_bags: params.garbageBags,
    p_plates_large: params.platesLarge,
    p_plates_small: params.platesSmall,
  };
  console.log('FINAL RPC PAYLOAD adminUpdateExtras', payload);
  const { data, error } = await supabase.rpc('admin_update_extras', payload);
  if (error) throw error;
  return data;
}

/**
 * Update booking details (object params - matches SQL signature exactly)
 */
export async function adminUpdateBookingDetailsV2(params: {
  adminId: string;
  bookingId: string;
  eventType: string | null;
  packageId: string | null;
  timeSlot: string | null;
  startTime: string | null; // "10:00" or null
  endTime: string | null;   // "18:00" or null
  adminPriceAdjustment: number | null;
  specialRequests: string | null;
}) {
  await ensureAdminSession();

  // Normalize times: ensure scalar strings or null
  const normalizeTime = (t: any) => {
    if (!t) return null;
    if (typeof t === 'string') return t.includes(':') ? t : null;
    return null;
  };

  const payload = {
    p_booking_id: params.bookingId,
    p_event_type: params.eventType ?? null,
    p_package_id: params.packageId ?? null,
    p_time_slot: params.timeSlot ?? null,
    p_start_time: normalizeTime(params.startTime),
    p_end_time: normalizeTime(params.endTime),
    p_admin_price_adjustment: params.adminPriceAdjustment ?? 0,
    p_special_requests: params.specialRequests ?? null,
    p_admin_id: params.adminId,
  };

  console.log('FINAL RPC PAYLOAD adminUpdateBookingDetails', payload);
  const { data, error } = await supabase.rpc('admin_update_booking_details', payload);
  if (error) {
    console.error('[API] admin_update_booking_details error', error);
    throw error;
  }
  return data;
}

/**
 * Call admin_update_booking_details RPC.
 * Signature: admin_update_booking_details(
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
 */
export async function adminUpdateBookingDetails(bookingId: string, payload: any) {
  log.info("adminUpdateBookingDetails", { bookingId, payload });
  
  // Get admin ID from current session if not provided
  let adminId = payload.p_admin_id || payload.admin_id;
  if (!adminId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    adminId = user.id;
  }
  
  // Build RPC payload with exact parameter names and order
  const rpcPayload = {
    p_booking_id: bookingId,
    p_event_type: payload.event_type || payload.p_event_type || null,
    p_package_id: payload.package_id || payload.p_package_id || null,
    p_time_slot: payload.time_slot || payload.p_time_slot || null,
    p_start_time: payload.start_time || payload.p_start_time || null,
    p_end_time: payload.end_time || payload.p_end_time || null,
    p_admin_price_adjustment: payload.admin_price_adjustment || payload.p_admin_price_adjustment || 0,
    p_special_requests: payload.special_requests || payload.p_special_requests || null,
    p_admin_id: adminId,
  };
  
  log.info("RPC payload for admin_update_booking_details", rpcPayload);
  
  const { data, error } = await supabase.rpc("admin_update_booking_details", rpcPayload);

  if (error) {
    log.error("admin_update_booking_details rpc error", error);
    throw error;
  }
  return data;
}

/**
 * Update booking status (admin only)
 */
export async function adminUpdateBookingStatus(bookingId: string, status: string) {
  log.info("adminUpdateBookingStatus", { bookingId, status });
  
  const { data, error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId)
    .select()
    .single();

  if (error) {
    log.error("adminUpdateBookingStatus failed", error);
    throw error;
  }
  return data;
}

/**
 * Update booking (admin only) - generic update
 */
export async function adminUpdateBooking(bookingId: string, payload: any) {
  log.info("adminUpdateBooking", { bookingId, payload });
  
  const { data, error } = await supabase
    .from("bookings")
    .update(payload)
    .eq("id", bookingId)
    .select()
    .single();

  if (error) {
    log.error("adminUpdateBooking failed", error);
    throw error;
  }
  return data;
}

/**
 * Delete booking (admin only)
 */
export async function adminDeleteBooking(bookingId: string) {
  log.info("adminDeleteBooking", { bookingId });
  
  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) {
    log.error("adminDeleteBooking failed", error);
    throw error;
  }
  return { success: true };
}

/**
 * Update booking extras (thin wrapper to admin_update_extras or admin_update_booking_details as available)
 * Signature: admin_update_extras(
 *   p_booking_id uuid,
 *   p_admin_id uuid,
 *   p_cooking_gas_qty int,
 *   p_garbage_bags int,
 *   p_plates_large int,
 *   p_plates_small int
 * )
 */
export async function adminUpdateExtras({
  p_booking_id,
  p_admin_id,
  p_cooking_gas_qty,
  p_garbage_bags,
  p_plates_large,
  p_plates_small,
}: {
  p_booking_id: string;
  p_admin_id: string;
  p_cooking_gas_qty: number;
  p_garbage_bags: number;
  p_plates_large: number;
  p_plates_small: number;
}) {
  log.info("adminUpdateExtras", { p_booking_id });
  
  // Call admin_update_extras RPC with correct parameter order
  const { data, error } = await supabase.rpc("admin_update_extras", {
    p_booking_id,
    p_admin_id,
    p_cooking_gas_qty,
    p_garbage_bags,
    p_plates_large,
    p_plates_small,
  });

  if (error) {
    log.error("admin_update_extras rpc error", error);
    throw error;
  }
  
  return data;
}

/**
 * Update booking extras - alternative signature for compatibility
 */
export async function adminUpdateBookingExtras(
  bookingId: string,
  extras: {
    garbage_bags: number;
    plates_small: number;
    plates_large: number;
    cooking_gas_qty: number;
  }
) {
  log.info("adminUpdateBookingExtras", { bookingId, extras });
  
  // Get admin ID from current session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  
  return adminUpdateExtras({
    p_booking_id: bookingId,
    p_admin_id: user.id,
    p_cooking_gas_qty: extras.cooking_gas_qty,
    p_garbage_bags: extras.garbage_bags,
    p_plates_large: extras.plates_large,
    p_plates_small: extras.plates_small,
  });
}

/**
 * Fetch booking actions history
 * expects get_booking_actions(p_booking_id) to exist
 */
export async function getBookingActions(bookingId: string): Promise<any[]> {
  console.log("[API] getBookingActions bookingId:", bookingId);
  const { data, error } = await supabase.rpc("get_booking_actions", {
    p_booking_id: bookingId,
  });
  if (error) throw error;
  return data;
}

/**
 * Update booking details - simplified version
 */
export async function updateBookingDetails(payload) {
  console.log("[API] updateBookingDetails PAYLOAD:", payload);
  const { data, error } = await supabase.rpc("admin_update_booking_details", payload);
  if (error) throw error;
  return data;
}

/**
 * Update booking extras - simplified version
 */
export async function updateBookingExtras(payload) {
  console.log("[API] updateBookingExtras PAYLOAD:", payload);
  const { data, error } = await supabase.rpc("admin_update_extras", payload);
  if (error) throw error;
  return data;
}