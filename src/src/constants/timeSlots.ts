// src/constants/timeSlots.ts — Centralized time slot definitions

export type TimeSlot = 'morning' | 'evening' | 'night';

export interface TimeSlotDefinition {
  id: TimeSlot;
  label: string;
  startTime: string; // 24-hour format (HH:mm:ss)
  endTime: string;   // 24-hour format (HH:mm:ss)
  displayTime: string; // User-friendly format (12-hour)
  description?: string;
}

/**
 * Centralized time slot definitions for Dream Avenue Convention Center
 * 
 * Time slots:
 * - Morning: 9:00 AM - 1:00 PM (4 hours)
 * - Evening: 1:00 PM - 6:00 PM (5 hours)
 * - Night: 6:00 PM - 10:00 PM (4 hours)
 */
export const TIME_SLOT_DEFINITIONS: Record<TimeSlot, TimeSlotDefinition> = {
  morning: {
    id: 'morning',
    label: 'Morning',
    startTime: '09:00:00',
    endTime: '13:00:00',
    displayTime: '9:00 AM - 1:00 PM',
    description: 'Perfect for breakfast events, morning conferences, and daytime celebrations',
  },
  evening: {
    id: 'evening',
    label: 'Evening',
    startTime: '13:00:00',
    endTime: '18:00:00',
    displayTime: '1:00 PM - 6:00 PM',
    description: 'Ideal for afternoon weddings, corporate events, and tea parties',
  },
  night: {
    id: 'night',
    label: 'Night',
    startTime: '18:00:00',
    endTime: '22:00:00',
    displayTime: '6:00 PM - 10:00 PM',
    description: 'Great for evening receptions, dinner parties, and nighttime celebrations',
  },
};

/**
 * Get the display time for a time slot
 */
export function getTimeSlotDisplay(slot: TimeSlot): string {
  return TIME_SLOT_DEFINITIONS[slot]?.displayTime || slot;
}

/**
 * Get all time slot IDs
 */
export function getTimeSlotIds(): TimeSlot[] {
  return Object.keys(TIME_SLOT_DEFINITIONS) as TimeSlot[];
}

/**
 * Get time slot definition by ID
 */
export function getTimeSlotDefinition(slot: TimeSlot): TimeSlotDefinition | undefined {
  return TIME_SLOT_DEFINITIONS[slot];
}

/**
 * Validate if a string is a valid time slot
 */
export function isValidTimeSlot(slot: string): slot is TimeSlot {
  return slot === 'morning' || slot === 'evening' || slot === 'night';
}
