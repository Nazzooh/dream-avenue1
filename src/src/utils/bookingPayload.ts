// src/utils/bookingPayload.ts
// Utility to convert UI slot selections to backend time format and validate payload

export interface BookingFormInput {
  full_name: string;
  mobile: string;
  booking_date: string;
  slot?: string;
  start_time?: string;
  end_time?: string;
  guest_count: number;
  package_id: string | null;
  additional_notes?: string;
  special_requests?: string;
}

export interface BookingPayload {
  full_name: string;
  mobile: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  guest_count: number;
  package_id: string | null;
  status: 'pending';
  additional_notes?: string;
  special_requests?: string;
}

/**
 * Converts user-facing slot names to exact start/end times
 * These times match the backend expectations and event calendar display
 */
export function slotToTimes(slot: string): { start_time: string; end_time: string } | null {
  switch ((slot || '').toLowerCase()) {
    case 'morning':
      return { start_time: '10:00', end_time: '14:00' };
    case 'noon':
      return { start_time: '12:00', end_time: '17:00' };
    case 'evening':
      return { start_time: '14:00', end_time: '18:00' };
    case 'night':
      return { start_time: '18:00', end_time: '22:00' };
    case 'full_day':
      return { start_time: '10:00', end_time: '18:00' };
    case 'half_day_morning':
      return { start_time: '10:00', end_time: '14:00' };
    case 'half_day_evening':
      return { start_time: '14:00', end_time: '18:00' };
    // short_duration is admin-only, not available for public booking
    default:
      return null;
  }
}

/**
 * Validates HH:MM time format (24-hour)
 */
export function isValidHHMM(timeString: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(timeString);
}

/**
 * Validates ISO date format (YYYY-MM-DD)
 */
export function isValidDate(dateString: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
}

/**
 * Checks if date is today or in the future
 */
export function isFutureOrToday(dateString: string): boolean {
  const inputDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate >= today;
}

/**
 * Validates UUID format
 */
export function isValidUUID(uuid: string | null): boolean {
  if (!uuid) return true; // null/empty is allowed for optional package_id
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
}

/**
 * Builds and validates booking payload for backend submission
 * Converts UI slot selection to start_time/end_time
 * Validates all required fields and formats
 * 
 * @throws Error with user-friendly message if validation fails
 */
export function buildBookingPayload(form: BookingFormInput): BookingPayload {
  // Required field validation
  if (!form.full_name || form.full_name.trim().length < 2) {
    throw new Error('Full name is required (minimum 2 characters)');
  }
  
  if (!form.mobile || form.mobile.trim().length < 10) {
    throw new Error('Valid mobile number is required (minimum 10 digits)');
  }
  
  if (!form.booking_date) {
    throw new Error('Booking date is required');
  }
  
  if (!isValidDate(form.booking_date)) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD');
  }
  
  if (!isFutureOrToday(form.booking_date)) {
    throw new Error('Booking date must be today or in the future');
  }

  // Get times from slot or use explicit times
  let start = form.start_time;
  let end = form.end_time;

  if ((!start || !end) && form.slot) {
    const times = slotToTimes(form.slot);
    if (!times) {
      throw new Error(`Invalid slot: ${form.slot}`);
    }
    start = times.start_time;
    end = times.end_time;
  }

  if (!start || !end) {
    throw new Error('Time slot selection is required');
  }

  if (!isValidHHMM(start) || !isValidHHMM(end)) {
    throw new Error('Invalid time format. Expected HH:MM (24-hour format)');
  }

  if (start >= end) {
    throw new Error('Start time must be earlier than end time');
  }

  // Guest count validation
  const guestCount = Number(form.guest_count);
  if (isNaN(guestCount) || guestCount < 1) {
    throw new Error('Guest count must be at least 1');
  }

  // Package ID validation (optional but must be valid UUID if provided)
  if (form.package_id && !isValidUUID(form.package_id)) {
    throw new Error('Invalid package ID format');
  }

  // Build clean payload matching backend schema
  const payload: BookingPayload = {
    full_name: form.full_name.trim(),
    mobile: form.mobile.trim(),
    booking_date: form.booking_date,
    start_time: start,
    end_time: end,
    guest_count: guestCount,
    package_id: form.package_id || null,
    status: 'pending',
  };

  // Optional fields
  if (form.additional_notes && form.additional_notes.trim()) {
    payload.additional_notes = form.additional_notes.trim();
  }

  if (form.special_requests && form.special_requests.trim()) {
    payload.special_requests = form.special_requests.trim();
  }

  return payload;
}
