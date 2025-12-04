// src/utils/timeNormalization.ts
/**
 * Time normalization utilities for booking system
 * Converts time slots to scalar start_time/end_time values
 */

export interface TimeRange {
  start: string | null;
  end: string | null;
}

/**
 * Normalizes a time slot to start/end times
 * Returns scalar string values ('HH:MM') or null
 * 
 * For slot-based bookings (morning, evening, night, full_day):
 * - Returns null/null so backend auto-assigns via trigger
 * 
 * For short_duration:
 * - Returns provided times or defaults to '10:00' and '18:00'
 * 
 * @param slot - Time slot value
 * @param providedStart - Optional explicit start time (for short_duration)
 * @param providedEnd - Optional explicit end time (for short_duration)
 */
export function normalizeSlotToTimes(
  slot: string | null,
  providedStart?: string | null,
  providedEnd?: string | null
): TimeRange {
  // For short_duration, use provided times or defaults
  if (slot === 'short_duration') {
    return {
      start: providedStart || '10:00',
      end: providedEnd || '18:00',
    };
  }
  
  // For all other slots, backend will auto-assign times via trigger
  // So we send null to indicate "use default slot times"
  if (slot === 'morning' || slot === 'evening' || slot === 'night' || slot === 'full_day') {
    return {
      start: null,
      end: null,
    };
  }
  
  // Unknown slot or null slot
  return {
    start: null,
    end: null,
  };
}

/**
 * Gets the default time range for a slot (for display purposes only)
 * These match the backend trigger logic
 */
export function getSlotTimeRange(slot: string): { start: string; end: string } {
  switch (slot) {
    case 'morning':
      return { start: '10:00', end: '14:00' };
    case 'evening':
      return { start: '14:00', end: '18:00' };
    case 'night':
      return { start: '18:00', end: '22:00' };
    case 'full_day':
      return { start: '10:00', end: '18:00' };
    case 'short_duration':
      return { start: '10:00', end: '18:00' }; // Default, but should be customized
    default:
      return { start: '10:00', end: '18:00' };
  }
}

/**
 * Validates HH:MM time format (24-hour)
 */
export function isValidTimeFormat(time: string | null): boolean {
  if (!time) return true; // null is valid
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
}

/**
 * Ensures time is in HH:MM format (removes seconds if present)
 */
export function normalizeTimeString(time: string | null): string | null {
  if (!time) return null;
  
  // If already HH:MM, return as-is
  if (/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
    return time;
  }
  
  // If HH:MM:SS, strip seconds
  if (/^([01]\d|2[0-3]):([0-5]\d):[0-5]\d$/.test(time)) {
    return time.substring(0, 5);
  }
  
  return time; // Return as-is if unrecognized format
}
