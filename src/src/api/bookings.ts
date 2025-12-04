// /src/api/bookings.ts
import { supabase } from "../../utils/supabase/client";
import { log } from "../lib/logger";

type PublicBookingPayload = {
  full_name: string;
  mobile: string;
  booking_date: string; // YYYY-MM-DD
  start_time: string | null; // "10:00" or null
  end_time: string | null;
  guest_count?: number;
  package_id?: string;
  status?: string; // 'pending' by default
  additional_notes?: string | null;
  special_requests?: string | null;
  email?: string | null;
};

function normalizePublicPayload(payload: any): PublicBookingPayload {
  // Remove admin-only fields: event_type, time_slot, admin_* etc.
  const out: any = {
    full_name: payload.full_name,
    mobile: payload.mobile,
    booking_date: payload.booking_date,
    start_time: payload.start_time ?? null,
    end_time: payload.end_time ?? null,
    guest_count: payload.guest_count ?? 0,
    package_id: payload.package_id ?? null,
    status: payload.status ?? "pending",
    additional_notes: payload.additional_notes ?? null,
    special_requests: payload.special_requests ?? null,
    email: payload.email ?? null,
  };

  // If the UI exposes "slot" selection (morning/evening), the UI MUST convert it to start_time/end_time
  // before calling createBooking. Keep here as last-resort conversion:
  if (!out.start_time && payload.time_slot) {
    switch (payload.time_slot) {
      case "morning":
        out.start_time = "10:00";
        out.end_time = "14:00";
        break;
      case "evening":
        out.start_time = "14:00";
        out.end_time = "18:00";
        break;
      case "night":
        out.start_time = "18:00";
        out.end_time = "22:00";
        break;
      case "full_day":
        out.start_time = "10:00";
        out.end_time = "18:00";
        break;
      case "short_duration":
        out.start_time = payload.start_time ?? "10:00";
        out.end_time = payload.end_time ?? "18:00";
        break;
      default:
        out.start_time = null;
        out.end_time = null;
    }
  }

  return out;
}

export async function createBooking(rawPayload: any) {
  const payload = normalizePublicPayload(rawPayload);
  log.info("createBooking final payload", payload);

  const { data, error } = await supabase.from("bookings").insert(payload).select().single();

  if (error) {
    log.error("createBooking failed", error);
    throw error;
  }
  return data;
}

/**
 * Create public booking with explicit validation (Patch 2)
 * Ensures required times are present and sends only public-allowed fields
 */
export async function createPublicBooking(payload: {
  full_name: string;
  mobile: string;
  booking_date: string; // "YYYY-MM-DD"
  start_time: string;   // "10:00" required
  end_time: string;     // "14:00" required
  guest_count?: number;
  package_id?: string | null;
  special_requests?: string | null;
  additional_notes?: string | null;
  email?: string | null;
}) {
  // ensure required times are scalar strings
  if (!payload.start_time || !payload.end_time) {
    throw new Error('start_time and end_time are required for public booking');
  }

  const row = {
    full_name: payload.full_name,
    mobile: payload.mobile,
    booking_date: payload.booking_date,
    start_time: payload.start_time,
    end_time: payload.end_time,
    guest_count: payload.guest_count ?? 0,
    package_id: payload.package_id ?? null,
    special_requests: payload.special_requests ?? null,
    additional_notes: payload.additional_notes ?? null,
    email: payload.email ?? null,
    status: 'pending',
  };

  console.log('FINAL PUBLIC BOOKING PAYLOAD', row);
  const { data, error } = await supabase.from('bookings').insert(row).select();
  if (error) throw error;
  return data;
}

// GET all bookings with filters
export async function getBookings(filters?: {
  status?: string;
  date?: string;
  start_date?: string;
  end_date?: string;
}) {
  log.info("getBookings", filters);
  
  let query = supabase.from("bookings").select("*");
  
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.date) {
    query = query.eq("booking_date", filters.date);
  }
  if (filters?.start_date) {
    query = query.gte("booking_date", filters.start_date);
  }
  if (filters?.end_date) {
    query = query.lte("booking_date", filters.end_date);
  }
  
  const { data, error } = await query.order("booking_date", { ascending: false });
  
  if (error) {
    log.error("getBookings failed", error);
    throw error;
  }
  return data;
}

// GET single booking
export async function getBooking(id: string) {
  log.info("getBooking", id);
  
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) {
    log.error("getBooking failed", error);
    throw error;
  }
  return data;
}

// UPDATE booking
export async function updateBooking(id: string, payload: any) {
  log.info("updateBooking", { id, payload });
  
  const { data, error } = await supabase
    .from("bookings")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  
  if (error) {
    log.error("updateBooking failed", error);
    throw error;
  }
  return data;
}

// CHECK availability
export async function checkAvailability(params: {
  booking_date: string;
  start_time?: string;
  end_time?: string;
}) {
  log.info("checkAvailability", params);
  
  const { data, error } = await supabase.rpc("check_availability", {
    p_date: params.booking_date,
    p_start_time: params.start_time || null,
    p_end_time: params.end_time || null,
  });
  
  if (error) {
    log.error("checkAvailability failed", error);
    throw error;
  }
  return data;
}

// React Query keys
export const bookingKeys = {
  all: ["bookings"] as const,
  lists: () => [...bookingKeys.all, "list"] as const,
  list: (filters?: any) => [...bookingKeys.lists(), filters] as const,
  details: () => [...bookingKeys.all, "detail"] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
};

// ✅ SECTION 1 — Admin update booking details RPC
export async function adminUpdateBookingDetails({
  bookingId,
  eventType,
  packageId,
  timeSlot,
  startTime,
  endTime,
  adminPriceAdjustment,
  specialRequests,
  adminId,
}: {
  bookingId: string;
  eventType: string;
  packageId: string | null;
  timeSlot: string;
  startTime: string | null;
  endTime: string | null;
  adminPriceAdjustment: number;
  specialRequests: string | null;
  adminId: string;
}): Promise<any> {
  console.log("[API] Calling admin_update_booking_details RPC", {
    bookingId,
    eventType,
    packageId,
    timeSlot,
    startTime,
    endTime,
    adminPriceAdjustment,
    specialRequests,
    adminId,
  });

  const { data, error } = await supabase.rpc("admin_update_booking_details", {
    p_booking_id: bookingId,
    p_event_type: eventType,
    p_package_id: packageId,
    p_time_slot: timeSlot,
    p_start_time: startTime || null,
    p_end_time: endTime || null,
    p_admin_price_adjustment: Number(adminPriceAdjustment) || 0,
    p_special_requests: specialRequests || "",
    p_admin_id: adminId,
  });

  if (error) {
    console.error("[API] admin_update_booking_details RPC ERROR:", error);
    throw error;
  }

  return data;
}

// ✅ SECTION 3 — Confirm booking RPC
export async function confirmBooking(bookingId, adminId) {
  console.log("[API] Calling admin_confirm_booking RPC", {
    bookingId,
    adminId,
  });

  const { data, error } = await supabase.rpc("admin_confirm_booking", {
    p_booking_id: bookingId,
    p_admin_id: adminId,
  });

  if (error) {
    console.error("[API] admin_confirm_booking RPC ERROR:", error);
    throw error;
  }

  return data;
}

// ✅ SECTION 4 — Get booking actions RPC
export async function getBookingActions(bookingId) {
  console.log("[API] Fetching booking actions", { bookingId });

  const { data, error } = await supabase.rpc("get_booking_actions", {
    p_booking_id: bookingId,
  });

  if (error) {
    console.error("[API] get_booking_actions RPC ERROR:", error);
    throw error;
  }

  return data || [];
}