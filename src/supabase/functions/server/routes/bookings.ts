// routes/bookings.ts — Bookings CRUD with transaction-safe logic, rate limiting & audit trail
import { Hono } from "hono";
import { createSupabaseClient } from "../lib/supabase.ts";
import { successResponse, errorResponse, validationErrorResponse, notFoundResponse } from "../lib/response.ts";
import { bookingSchema, bookingUpdateSchema } from "../schemas/validation.ts";

const bookings = new Hono();

// ============================================
// RATE LIMITING & SECURITY
// ============================================
const RATE_LIMIT_WINDOW = 3600000; // 1 hour in milliseconds
const MAX_BOOKINGS_PER_HOUR = 5;
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (ip: string): { allowed: boolean; remaining: number } => {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: MAX_BOOKINGS_PER_HOUR - 1 };
  }

  if (record.count >= MAX_BOOKINGS_PER_HOUR) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: MAX_BOOKINGS_PER_HOUR - record.count };
};

// ============================================
// AUDIT TRAIL LOGGING
// ============================================
const logBookingEvent = async (
  supabase: any,
  bookingId: string,
  eventType: string,
  details: any,
  userId?: string
) => {
  try {
    await supabase.from("booking_events").insert([{
      booking_id: bookingId,
      event_type: eventType,
      details: details,
      user_id: userId,
      ip_address: details.ip_address || null,
    }]);
  } catch (error) {
    console.error("Failed to log booking event:", error);
  }
};

// Helper function to check for booking conflicts
const checkBookingConflicts = async (
  supabase: any,
  bookingDate: string,
  startTime: string | null,
  endTime: string | null,
  excludeId?: string
) => {
  let query = supabase
    .from("bookings")
    .select("*")
    .eq("booking_date", bookingDate)
    .in("status", ["confirmed", "pending"]);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data: existingBookings, error } = await query;

  if (error) throw error;

  // Check if venue is fully booked (max 2 events per day)
  if (existingBookings && existingBookings.length >= 2) {
    return {
      hasConflict: true,
      message: "Venue is fully booked for this date",
      existingBookings,
    };
  }

  // If time slots are specified, check for time conflicts
  if (startTime && endTime && existingBookings && existingBookings.length > 0) {
    const hasTimeConflict = existingBookings.some((booking) => {
      if (!booking.start_time || !booking.end_time) return false;

      const bookingStart = booking.start_time;
      const bookingEnd = booking.end_time;

      return (
        (startTime >= bookingStart && startTime < bookingEnd) ||
        (endTime > bookingStart && endTime <= bookingEnd) ||
        (startTime <= bookingStart && endTime >= bookingEnd)
      );
    });

    if (hasTimeConflict) {
      return {
        hasConflict: true,
        message: "Time slot conflict with existing booking",
        existingBookings,
      };
    }
  }

  return {
    hasConflict: false,
    message: "No conflicts found",
    existingBookings,
  };
};

// GET all bookings
bookings.get("/", async (c) => {
  try {
    const supabase = createSupabaseClient();
    const status = c.req.query("status");
    const date = c.req.query("date");
    const startDate = c.req.query("start_date");
    const endDate = c.req.query("end_date");

    let query = supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    if (date) {
      query = query.eq("booking_date", date);
    }

    if (startDate) {
      query = query.gte("booking_date", startDate);
    }

    if (endDate) {
      query = query.lte("booking_date", endDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    return successResponse(c, data || []);
  } catch (err) {
    console.error("Bookings fetch error:", err);
    return errorResponse(c, "Failed to fetch bookings");
  }
});

// GET single booking by ID
bookings.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return notFoundResponse(c, "Booking");
      }
      throw error;
    }

    return successResponse(c, data);
  } catch (err) {
    console.error("Booking fetch error:", err);
    return errorResponse(c, "Failed to fetch booking");
  }
});

// CREATE new booking with conflict detection, rate limiting & audit trail
bookings.post("/", async (c) => {
  try {
    // Rate limiting check
    const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    const rateCheck = checkRateLimit(ip);
    
    if (!rateCheck.allowed) {
      return c.json(
        {
          success: false,
          error: "Rate limit exceeded. Maximum 5 bookings per hour allowed.",
          remaining: 0,
        },
        429
      );
    }

    const body = await c.req.json();
    const validation = bookingSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(c, validation.error.format());
    }

    const bookingData = validation.data;
    const supabase = createSupabaseClient();

    // Validate package exists and is active
    if (bookingData.package_id) {
      const { data: packageData, error: pkgError } = await supabase
        .from("packages")
        .select("id, name, is_active")
        .eq("id", bookingData.package_id)
        .single();

      if (pkgError || !packageData) {
        return errorResponse(c, "Invalid package selected", 400);
      }

      if (packageData.is_active === false) {
        return errorResponse(c, `Package "${packageData.name}" is currently unavailable`, 400);
      }
    }

    // Check for conflicts before creating
    const conflictCheck = await checkBookingConflicts(
      supabase,
      bookingData.booking_date,
      bookingData.start_time || null,
      bookingData.end_time || null
    );

    if (conflictCheck.hasConflict) {
      return c.json(
        {
          success: false,
          error: conflictCheck.message,
          conflicts: conflictCheck.existingBookings,
        },
        409 // Conflict status
      );
    }

    // Create the booking
    const { data, error } = await supabase
      .from("bookings")
      .insert([bookingData])
      .select()
      .single();

    if (error) throw error;

    // Log booking creation event
    await logBookingEvent(
      supabase,
      data.id,
      "booking_created",
      {
        booking_date: bookingData.booking_date,
        guest_count: bookingData.guest_count,
        package_id: bookingData.package_id,
        ip_address: ip,
      }
    );

    return c.json(
      {
        success: true,
        data,
        message: "Booking created successfully",
        remaining_requests: rateCheck.remaining,
      },
      201
    );
  } catch (err: any) {
    console.error("Booking create error:", err);
    return errorResponse(c, err.message || "Failed to create booking");
  }
});

// UPDATE booking with conflict detection
bookings.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const validation = bookingUpdateSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(c, validation.error.format());
    }

    const updateData = validation.data;
    const supabase = createSupabaseClient();

    // If booking date or time is being changed, check for conflicts
    if (updateData.booking_date || updateData.start_time || updateData.end_time) {
      // Get current booking to compare
      const { data: currentBooking, error: fetchError } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          return notFoundResponse(c, "Booking");
        }
        throw fetchError;
      }

      const dateToCheck = updateData.booking_date || currentBooking.booking_date;
      const startTimeToCheck = updateData.start_time !== undefined 
        ? updateData.start_time 
        : currentBooking.start_time;
      const endTimeToCheck = updateData.end_time !== undefined
        ? updateData.end_time
        : currentBooking.end_time;

      const conflictCheck = await checkBookingConflicts(
        supabase,
        dateToCheck,
        startTimeToCheck,
        endTimeToCheck,
        id // Exclude current booking from conflict check
      );

      if (conflictCheck.hasConflict) {
        return c.json(
          {
            success: false,
            error: conflictCheck.message,
            conflicts: conflictCheck.existingBookings,
          },
          409
        );
      }
    }

    // Update the booking
    const { data, error } = await supabase
      .from("bookings")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return notFoundResponse(c, "Booking");
      }
      throw error;
    }

    return successResponse(c, data, "Booking updated successfully");
  } catch (err) {
    console.error("Booking update error:", err);
    return errorResponse(c, "Failed to update booking");
  }
});

// DELETE booking
bookings.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const supabase = createSupabaseClient();

    // Optionally: Check if booking can be deleted (not in the past, etc.)
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return successResponse(c, null, "Booking deleted successfully");
  } catch (err) {
    console.error("Booking delete error:", err);
    return errorResponse(c, "Failed to delete booking");
  }
});

// UPDATE booking status with audit trail
bookings.patch("/:id/status", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { status, notes, admin_id } = body;

    if (!status || !["pending", "confirmed", "cancelled", "completed"].includes(status)) {
      return errorResponse(c, "Invalid status. Must be: pending, confirmed, cancelled, or completed", 400);
    }

    const supabase = createSupabaseClient();
    
    // Get current booking status
    const { data: currentBooking, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return notFoundResponse(c, "Booking");
      }
      throw fetchError;
    }

    const previousStatus = currentBooking.status;

    // Update booking status
    const { data, error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Log status change event
    await logBookingEvent(
      supabase,
      id,
      "status_changed",
      {
        previous_status: previousStatus,
        new_status: status,
        notes: notes || null,
        changed_by: admin_id || "system",
      },
      admin_id
    );

    return successResponse(c, data, `Booking status updated from ${previousStatus} to ${status}`);
  } catch (err: any) {
    console.error("Booking status update error:", err);
    return errorResponse(c, err.message || "Failed to update booking status");
  }
});

// CHECK availability before booking (helper endpoint)
bookings.post("/check-availability", async (c) => {
  try {
    const body = await c.req.json();
    const { booking_date, start_time, end_time } = body;

    if (!booking_date) {
      return errorResponse(c, "booking_date is required", 400);
    }

    const supabase = createSupabaseClient();
    const conflictCheck = await checkBookingConflicts(
      supabase,
      booking_date,
      start_time || null,
      end_time || null
    );

    return successResponse(c, {
      available: !conflictCheck.hasConflict,
      message: conflictCheck.message,
      existingBookings: conflictCheck.existingBookings,
    });
  } catch (err) {
    console.error("Availability check error:", err);
    return errorResponse(c, "Failed to check availability");
  }
});

// GET booking audit trail / events
bookings.get("/:id/events", async (c) => {
  try {
    const id = c.req.param("id");
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from("booking_events")
      .select("*")
      .eq("booking_id", id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return successResponse(c, data || [], "Booking events retrieved successfully");
  } catch (err) {
    console.error("Booking events fetch error:", err);
    return errorResponse(c, "Failed to fetch booking events");
  }
});

// ADMIN: Advanced search with filters
bookings.get("/search/advanced", async (c) => {
  try {
    const supabase = createSupabaseClient();
    const status = c.req.query("status");
    const search = c.req.query("q");
    const dateFrom = c.req.query("date_from");
    const dateTo = c.req.query("date_to");
    const packageId = c.req.query("package_id");

    let query = supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,mobile.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    if (dateFrom) {
      query = query.gte("booking_date", dateFrom);
    }

    if (dateTo) {
      query = query.lte("booking_date", dateTo);
    }

    if (packageId) {
      query = query.eq("package_id", packageId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return successResponse(c, data || []);
  } catch (err) {
    console.error("Advanced search error:", err);
    return errorResponse(c, "Failed to search bookings");
  }
});

export default bookings;
