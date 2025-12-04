// src/lib/api/events.ts — Event fetch API for calendars
import { supabase } from "../../../utils/supabase/client";

export async function fetchEvents() {
  const { data, error } = await supabase
    .from("events")
    .select(`
      id,
      booking_id,
      event_date,
      start_time,
      end_time,
      status
    `)
    .order("event_date", { ascending: true });

  if (error) {
    console.error("❌ Event fetch error:", error);
    return [];
  }

  console.log("📅 Fetched events from DB:", data?.length || 0);
  return data || [];
}
