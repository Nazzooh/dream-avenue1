// src/utils/timeFallbacks.ts — Automatic time fallbacks for slots

export interface TimeRange {
  start: string;
  end: string;
}

/**
 * Returns fallback start/end times for a given slot
 * Used when events don't have explicit start_time/end_time
 */
export function fallbackTimes(slot?: string | null): TimeRange {
  switch ((slot || '').toLowerCase()) {
    case 'morning':
    case 'half_day_morning':
      return { start: '10:00', end: '14:00' };
    
    case 'evening':
    case 'half_day_evening':
      return { start: '14:00', end: '18:00' };
    
    case 'night':
      return { start: '18:00', end: '22:00' };
    
    case 'full_day':
      return { start: '10:00', end: '18:00' };
    
    case 'noon':
      return { start: '12:00', end: '17:00' };
    
    case 'short_duration':
      return { start: '10:00', end: '15:00' };
    
    default:
      // Default to full day if slot is unknown
      return { start: '10:00', end: '18:00' };
  }
}

/**
 * Gets start and end times with automatic fallback
 * Priority: explicit times > slot-based fallback
 */
export function getEventTimes(
  startTime?: string | null,
  endTime?: string | null,
  slot?: string | null
): TimeRange {
  if (startTime && endTime) {
    return { start: startTime, end: endTime };
  }
  
  return fallbackTimes(slot);
}
