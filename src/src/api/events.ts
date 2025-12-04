// src/api/events.ts — Event CRUD API functions
import { supabase } from "../../utils/supabase/client";
import { Event, EventCreate, EventUpdate, eventSchema } from "../schemas/events";

// GET events for calendar (optimized query)
export const getEventsForCalendar = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from("events")
    .select(`
      id,
      booking_id,
      title,
      event_date,
      start_time,
      end_time,
      slot,
      status
    `)
    .eq("is_active", true)
    .order("event_date", { ascending: true });

  if (error) {
    console.error("❌ Event fetch error:", error);
    return [];
  }

  if (!Array.isArray(data)) {
    console.warn("⚠️ Event data is not an array");
    return [];
  }

  console.log("📅 Fetched events from DB:", data?.length || 0);
  
  // Map to consistent format with fallbacks
  return data.map(ev => {
    const date = ev.event_date;
    const start = ev.start_time
      ? `${date}T${ev.start_time}`
      : `${date}T10:00`;         // fallback
    const end = ev.end_time
      ? `${date}T${ev.end_time}`
      : `${date}T18:00`;         // fallback

    return {
      id: ev.id,
      title: ev.title ?? "Event",
      start,
      end,
      slot: ev.slot,
      status: ev.status ?? "confirmed",
      bookingId: ev.booking_id,
      event_date: ev.event_date, // Keep for compatibility
    };
  });
};

// GET all events with optional filters
export const getEvents = async (filters?: {
  active?: boolean;
  upcoming?: boolean;
}): Promise<Event[]> => {
  let query = supabase.from('events').select('*').order('event_date', { ascending: false });
  
  if (filters?.active) {
    query = query.eq('is_active', true);
  }
  
  if (filters?.upcoming) {
    const now = new Date().toISOString().split('T')[0];
    query = query.gte('event_date', now);
  }
  
  const { data, error } = await query;
  
  if (error) throw new Error(error.message);
  return eventSchema.array().parse(data || []);
};

// GET single event by ID
export const getEvent = async (id: string): Promise<Event> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw new Error(error.message);
  return eventSchema.parse(data);
};

// CREATE new event
export const createEvent = async (eventData: EventCreate): Promise<Event> => {
  const { data, error } = await supabase
    .from('events')
    .insert([eventData])
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return eventSchema.parse(data);
};

// UPDATE event
export const updateEvent = async (id: string, eventData: EventUpdate): Promise<Event> => {
  const { data, error } = await supabase
    .from('events')
    .update(eventData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return eventSchema.parse(data);
};

// DELETE event
export const deleteEvent = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);
  
  if (error) throw new Error(error.message);
};

// React Query keys
export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (filters?: any) => [...eventKeys.lists(), filters] as const,
  details: () => [...eventKeys.all, "detail"] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
};