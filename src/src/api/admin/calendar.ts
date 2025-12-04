// src/api/admin/calendar.ts — Admin Calendar API operations
import { supabase } from "../../../utils/supabase/client";

export interface BlockDatePayload {
  date: string;
  reason?: string;
  admin_id: string;
}

export interface ManualBookingPayload {
  full_name: string;
  mobile: string;
  email?: string;
  guest_count?: number;
  event_type?: string;
  package_id?: string;
  special_requests?: string;
  additional_notes?: string;
  time_slot: string;
  start_time?: string; // Only for short_duration
  end_time?: string; // Only for short_duration
  booking_date: string;
  status: string;
}

/**
 * ADMIN: Block a date
 * POST /api/admin/calendar/block_date (simulated via direct insert)
 */
export const blockDate = async (payload: BlockDatePayload) => {
  // Create a blocked event
  const { data, error } = await supabase
    .from("events")
    .insert([{
      event_name: `Blocked: ${payload.reason || "Manual Block"}`,
      event_type: "blocked",
      event_date: payload.date,
      status: "blocked",
      description: payload.reason || "Date manually blocked by admin",
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Log action in booking_actions
  if (data) {
    await supabase.from("booking_actions").insert([{
      booking_id: null,
      admin_id: payload.admin_id,
      action: "block_date",
      notes: `Blocked date: ${payload.date}. Reason: ${payload.reason || "No reason provided"}`,
    }]);
  }

  return data;
};

/**
 * ADMIN: Unblock a date
 * POST /api/admin/calendar/unblock_date
 */
export const unblockDate = async (date: string, admin_id: string) => {
  // Find the blocked event
  const { data: blockedEvent, error: findError } = await supabase
    .from("events")
    .select("*")
    .eq("event_date", date)
    .eq("event_type", "blocked")
    .eq("status", "blocked")
    .single();

  if (findError && findError.code !== "PGRST116") throw new Error(findError.message);
  
  if (!blockedEvent) {
    throw new Error("No blocked event found for this date");
  }

  // Delete the blocked event
  const { error: deleteError } = await supabase
    .from("events")
    .delete()
    .eq("id", blockedEvent.id);

  if (deleteError) throw new Error(deleteError.message);

  // Log action
  await supabase.from("booking_actions").insert([{
    booking_id: null,
    admin_id: admin_id,
    action: "unblock_date",
    notes: `Unblocked date: ${date}`,
  }]);

  return { success: true };
};

/**
 * ADMIN: Create manual booking
 * POST /api/admin/bookings/manual_create
 */
export const createManualBooking = async (payload: ManualBookingPayload) => {
  // Build the booking payload
  const bookingData: any = {
    full_name: payload.full_name,
    mobile: payload.mobile,
    email: payload.email || null,
    guest_count: payload.guest_count || 0,
    event_type: payload.event_type || "other",
    package_id: payload.package_id || null,
    special_requests: payload.special_requests || null,
    additional_notes: payload.additional_notes || null,
    booking_date: payload.booking_date,
    status: payload.status || "confirmed", // Admin bookings are auto-confirmed
  };

  // Handle time slot conversion
  if (payload.time_slot === "short_duration") {
    // For short duration, use custom times or defaults
    bookingData.start_time = payload.start_time || "10:00";
    bookingData.end_time = payload.end_time || "14:00";
  } else if (payload.time_slot === "morning") {
    bookingData.start_time = "10:00";
    bookingData.end_time = "14:00";
  } else if (payload.time_slot === "evening") {
    bookingData.start_time = "14:00";
    bookingData.end_time = "18:00";
  } else if (payload.time_slot === "night") {
    bookingData.start_time = "18:00";
    bookingData.end_time = "22:00";
  } else if (payload.time_slot === "full_day") {
    bookingData.start_time = "10:00";
    bookingData.end_time = "18:00";
  }

  // Insert booking - backend will handle pricing calculation
  const { data, error } = await supabase
    .from("bookings")
    .insert([bookingData])
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
};
