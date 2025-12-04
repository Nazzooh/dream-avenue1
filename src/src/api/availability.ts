// src/api/availability.ts — Availability checking API functions
import { supabase } from "../../utils/supabase/client";
import { Availability, AvailabilityCheck, availabilitySchema, availabilityCheckSchema } from "../schemas/availability";

// GET availability calendar (date range)
export const getAvailability = async (params?: {
  start_date?: string;
  end_date?: string;
}): Promise<Record<string, Availability>> => {
  // Fetch events from public_calendar_events view
  let query = supabase
    .from("public_calendar_events")
    .select("event_date, is_available, status");
  
  // Apply date filters if provided
  if (params?.start_date) {
    query = query.gte("event_date", params.start_date);
  }
  if (params?.end_date) {
    query = query.lte("event_date", params.end_date);
  }
  
  const { data, error } = await query;
  
  if (error) throw new Error(error.message);
  
  // Group events by date and calculate availability status
  const validated: Record<string, Availability> = {};
  const eventsByDate: Record<string, any[]> = {};
  
  (data || []).forEach((event: any) => {
    const date = event.event_date;
    if (!eventsByDate[date]) {
      eventsByDate[date] = [];
    }
    eventsByDate[date].push(event);
  });
  
  // Convert to availability format
  Object.entries(eventsByDate).forEach(([date, events]) => {
    const totalEvents = events.length;
    
    // Determine status - if any event is not available, date is booked
    const isAvailable = events.some(e => e.is_available === true);
    let status: 'available' | 'partial' | 'full' = isAvailable ? 'available' : 'full';
    
    if (totalEvents > 0 && totalEvents < 4 && !isAvailable) {
      status = 'partial';
    }
    
    validated[date] = {
      date,
      bookings: totalEvents,
      totalGuests: 0, // Not exposed in public view
      status,
    };
  });
  
  return validated;
};

// CHECK specific date availability
export const checkDateAvailability = async (params: {
  date: string;
  start_time?: string;
  end_time?: string;
}): Promise<AvailabilityCheck> => {
  // Fetch events for the specific date from the events view
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("event_date", params.date);
  
  if (error) throw new Error(error.message);
  
  const events = data || [];
  const totalEvents = events.length;
  
  // Check if there's a full day booking
  const hasFullDay = events.some((event: any) => event.slot === 'full_day');
  
  // Determine availability based on slots
  let isAvailable = !hasFullDay && totalEvents < 4; // Max 4 slots (morning, afternoon, evening, night)
  let message = isAvailable 
    ? "Date is available for booking" 
    : hasFullDay 
      ? "Date is fully booked (full day event)" 
      : "Date is fully booked (all slots taken)";
  
  return availabilityCheckSchema.parse({
    date: params.date,
    isAvailable,
    bookingsCount: totalEvents,
    totalGuests: 0, // Guest count not exposed in public API
    message,
  });
};

// GET monthly availability summary
export const getMonthlyAvailability = async (year: number, month: number): Promise<{
  year: number;
  month: number;
  summary: Record<string, Availability>;
}> => {
  // Calculate start and end dates for the month
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
  
  // Fetch from public_calendar_events view
  const { data, error } = await supabase
    .from("public_calendar_events")
    .select("event_date, slot, is_available")
    .gte("event_date", startDate)
    .lte("event_date", endDate);
  
  if (error) throw new Error(error.message);
  
  // Group events by date and calculate availability status
  const validated: Record<string, Availability> = {};
  const eventsByDate: Record<string, any[]> = {};
  
  (data || []).forEach((event: any) => {
    const date = event.event_date;
    if (!eventsByDate[date]) {
      eventsByDate[date] = [];
    }
    eventsByDate[date].push(event);
  });
  
  // Convert to availability format
  Object.entries(eventsByDate).forEach(([date, events]) => {
    const totalEvents = events.length;
    
    // Determine status based on number of bookings and availability
    let status: 'available' | 'partial' | 'full' = 'available';
    
    // Check if there's a full day booking or all slots are unavailable
    const hasFullDay = events.some(e => e.slot === 'full_day');
    const allUnavailable = events.every(e => e.is_available === false);
    
    if (hasFullDay || allUnavailable || totalEvents >= 4) {
      // Full day booking or all slots taken = fully booked
      status = 'full';
    } else if (totalEvents > 0) {
      // Some slots taken = partially booked
      status = 'partial';
    }
    
    validated[date] = {
      date,
      bookings: totalEvents,
      totalGuests: 0, // Guest count not needed for public calendar
      status,
    };
  });
  
  return {
    year,
    month,
    summary: validated,
  };
};

// React Query keys
export const availabilityKeys = {
  all: ["availability"] as const,
  calendar: (params?: any) => [...availabilityKeys.all, "calendar", params] as const,
  check: (params: any) => [...availabilityKeys.all, "check", params] as const,
  monthly: (year: number, month: number) => [...availabilityKeys.all, "monthly", year, month] as const,
};