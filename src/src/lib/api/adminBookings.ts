// /src/lib/api/adminBookings.ts
// Admin booking API functions with proper RPC parameter mapping

import { supabase } from "../../../utils/supabase/client";

export async function adminUpdateBookingDetails(payload: {
  bookingId: string;
  eventType: string;
  packageId: string;
  timeSlot: string;
  startTime: string | null;
  endTime: string | null;
  adminPriceAdjustment: number;
  specialRequests: string;
  adminId: string;
}) {
  const { data, error } = await supabase.rpc(
    "admin_update_booking_details",
    {
      p_booking_id: payload.bookingId,
      p_event_type: payload.eventType,
      p_package_id: payload.packageId,
      p_time_slot: payload.timeSlot,
      p_start_time: payload.startTime,
      p_end_time: payload.endTime,
      p_admin_price_adjustment: payload.adminPriceAdjustment,
      p_special_requests: payload.specialRequests,
      p_admin_id: payload.adminId,
    }
  );

  if (error) {
    console.error("[admin_update_booking_details] RPC failure:", error);
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error("RPC returned null — booking update failed.");
  }

  return data[0]; // full booking row
}

export async function adminUpdateExtras(payload: {
  bookingId: string;
  cookingGas: number;
  garbageBags: number;
  platesLarge: number;
  platesSmall: number;
  adminId: string;
}) {
  const { data, error } = await supabase.rpc("admin_update_extras", {
    p_booking_id: payload.bookingId,
    p_cooking_gas_qty: payload.cookingGas,
    p_garbage_bags: payload.garbageBags,
    p_plates_large: payload.platesLarge,
    p_plates_small: payload.platesSmall,
    p_admin_id: payload.adminId,
  });

  if (error) {
    console.error("[admin_update_extras] RPC failed:", error);
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error("RPC returned null — extras update failed.");
  }

  return data[0];
}