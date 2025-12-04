// src/utils/mapEvents.ts — Event structure normalizer for calendars

export interface NormalizedEvent {
  id: string;
  title: string;
  bookingId: string | null;
  date: string; // YYYY-MM-DD format
  start: string; // ISO format: YYYY-MM-DDTHH:mm or just HH:mm
  end: string; // ISO format: YYYY-MM-DDTHH:mm or just HH:mm
  status: string;
  slot?: string | null;
}

export function mapEventRow(row: any): NormalizedEvent {
  // Handle both pre-mapped events (from getEventsForCalendar) and raw DB rows
  const date = row.event_date || row.date;
  const hasISOFormat = row.start?.includes('T');
  
  return {
    id: row.id,
    title: row.title || "Event",
    bookingId: row.booking_id || row.bookingId || null,
    date: date,
    start: hasISOFormat ? row.start : (row.start_time || row.start || "10:00"),
    end: hasISOFormat ? row.end : (row.end_time || row.end || "18:00"),
    status: row.status || "confirmed",
    slot: row.slot || null,
  };
}

export function mapEventsArray(events: any[]): NormalizedEvent[] {
  if (process.env.NODE_ENV !== "production") {
    console.log("📅 Mapping events:", events.length);
  }
  
  const normalized = events
    .map(mapEventRow)
    .filter((event) => event.date !== null && event.date !== undefined);
  
  if (process.env.NODE_ENV !== "production") {
    console.log("✅ Normalized events:", normalized);
  }
  
  return normalized;
}