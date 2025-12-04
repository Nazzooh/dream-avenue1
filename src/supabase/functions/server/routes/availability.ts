// routes/availability.ts — Availability checking endpoints
import { Hono } from "hono";
import { createSupabaseClient } from "../lib/supabase.ts";
import { successResponse, errorResponse } from "../lib/response.ts";

const availability = new Hono();

// GET availability calendar
// Returns availability status for dates based on bookings
availability.get("/", async (c) => {
  try {
    const supabase = createSupabaseClient();
    const startDate = c.req.query("start_date");
    const endDate = c.req.query("end_date");

    // Build query for bookings
    let query = supabase
      .from("bookings")
      .select("booking_date, start_time, end_time, guest_count, status");

    // Filter by date range if provided
    if (startDate) {
      query = query.gte("booking_date", startDate);
    }
    if (endDate) {
      query = query.lte("booking_date", endDate);
    }

    // Only consider confirmed or pending bookings
    query = query.in("status", ["confirmed", "pending"]);

    const { data: bookings, error } = await query;

    if (error) throw error;

    // Build availability map
    const availabilityMap: Record<string, any> = {};

    (bookings || []).forEach((booking) => {
      const date = booking.booking_date;
      if (!date) return;

      if (!availabilityMap[date]) {
        availabilityMap[date] = {
          date,
          bookings: 0,
          totalGuests: 0,
          status: "available",
          timeSlots: [],
        };
      }

      availabilityMap[date].bookings += 1;
      availabilityMap[date].totalGuests += booking.guest_count || 0;
      
      if (booking.start_time && booking.end_time) {
        availabilityMap[date].timeSlots.push({
          start: booking.start_time,
          end: booking.end_time,
          guests: booking.guest_count,
        });
      }

      // Update status based on booking count
      // Assuming venue can handle 2 simultaneous events with different time slots
      if (availabilityMap[date].bookings >= 2) {
        availabilityMap[date].status = "full";
      } else if (availabilityMap[date].bookings >= 1) {
        availabilityMap[date].status = "partial";
      }
    });

    return successResponse(c, availabilityMap);
  } catch (err) {
    console.error("Availability fetch error:", err);
    return errorResponse(c, "Failed to fetch availability");
  }
});

// CHECK specific date availability
availability.get("/check", async (c) => {
  try {
    const date = c.req.query("date");
    const startTime = c.req.query("start_time");
    const endTime = c.req.query("end_time");

    if (!date) {
      return errorResponse(c, "Date parameter is required", 400);
    }

    const supabase = createSupabaseClient();
    
    let query = supabase
      .from("bookings")
      .select("*")
      .eq("booking_date", date)
      .in("status", ["confirmed", "pending"]);

    const { data: bookings, error } = await query;

    if (error) throw error;

    // Check for conflicts if time is specified
    let hasConflict = false;
    if (startTime && endTime && bookings && bookings.length > 0) {
      hasConflict = bookings.some((booking) => {
        if (!booking.start_time || !booking.end_time) return false;
        
        // Check if time slots overlap
        const bookingStart = booking.start_time;
        const bookingEnd = booking.end_time;
        
        return (
          (startTime >= bookingStart && startTime < bookingEnd) ||
          (endTime > bookingStart && endTime <= bookingEnd) ||
          (startTime <= bookingStart && endTime >= bookingEnd)
        );
      });
    }

    const available = bookings.length === 0 || (!hasConflict && bookings.length < 2);

    return successResponse(c, {
      date,
      available,
      hasConflict,
      existingBookings: bookings.length,
      bookings: bookings || [],
      message: available
        ? "Date is available"
        : hasConflict
        ? "Time slot conflict detected"
        : "Date is fully booked",
    });
  } catch (err) {
    console.error("Availability check error:", err);
    return errorResponse(c, "Failed to check availability");
  }
});

// GET monthly availability summary
availability.get("/month/:year/:month", async (c) => {
  try {
    const year = c.req.param("year");
    const month = c.req.param("month");
    
    const startDate = `${year}-${month.padStart(2, "0")}-01`;
    const endDate = `${year}-${month.padStart(2, "0")}-31`;

    const supabase = createSupabaseClient();
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("booking_date, guest_count, status")
      .gte("booking_date", startDate)
      .lte("booking_date", endDate)
      .in("status", ["confirmed", "pending"]);

    if (error) throw error;

    // Build daily summary
    const summary: Record<string, any> = {};

    (bookings || []).forEach((booking) => {
      const date = booking.booking_date;
      if (!date) return;

      if (!summary[date]) {
        summary[date] = {
          bookings: 0,
          guests: 0,
          status: "available",
        };
      }

      summary[date].bookings += 1;
      summary[date].guests += booking.guest_count || 0;

      if (summary[date].bookings >= 2) {
        summary[date].status = "full";
      } else if (summary[date].bookings >= 1) {
        summary[date].status = "partial";
      }
    });

    return successResponse(c, {
      year: parseInt(year),
      month: parseInt(month),
      summary,
    });
  } catch (err) {
    console.error("Monthly availability error:", err);
    return errorResponse(c, "Failed to fetch monthly availability");
  }
});

export default availability;
