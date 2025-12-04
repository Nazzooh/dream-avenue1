// Database-aligned types for booking system
// Matches the Supabase bookings table schema exactly

/**
 * Complete Booking Database Schema
 * Maps to public.bookings table in Supabase
 */
export interface BookingRecord {
  // Core Identification
  id: string; // uuid, primary key
  
  // Customer Information
  full_name: string | null;
  mobile: string | null;
  email: string | null;
  guest_count: number | null;
  
  // Booking Details
  booking_date: string | null; // date (YYYY-MM-DD)
  package_id: string | null; // uuid, FK to packages
  event_type: string | null;
  
  // Time Management
  time_slot: 'morning' | 'evening' | 'night' | 'full_day' | 'short_duration' | null;
  start_time: string | null; // time without time zone (HH:MM:SS)
  end_time: string | null; // time without time zone (HH:MM:SS)
  
  // Status & Activity
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  is_active: boolean;
  
  // Pricing - Floor Cleaning (Auto-applied, fixed cost)
  floor_cleaning: boolean;
  floor_cleaning_cost: number; // numeric(10,2), default 3000
  
  // Pricing - Extra Services
  cooking_gas_qty: number; // default 0
  cooking_gas_cost: number; // numeric(10,2), calculated
  garbage_bags: number; // default 0
  garbage_cost: number; // numeric(10,2), calculated
  plates: number; // DEPRECATED - old single plates field (kept for backwards compatibility)
  plates_small: number | null; // new granular plates tracking
  plates_large: number | null; // new granular plates tracking
  plates_cost: number; // numeric(10,2), calculated from both small and large
  
  // Pricing - Final Totals
  extra_services_total: number; // numeric(12,2), sum of all extras
  admin_price_adjustment: number | null; // numeric(12,2), admin override
  final_price: number; // numeric(12,2), total amount
  
  // Notes & Requests
  special_requests: string | null; // Customer requests (includes Event Type from frontend)
  additional_notes: string | null; // Admin-only internal notes
  admin_notes: string | null; // Legacy admin notes field
  admin_notes_history: any | null; // jsonb[], history of admin notes
  
  // Audit Trail - User Actions
  user_id: string | null; // uuid, customer who created
  confirmed_by: string | null; // uuid, admin who confirmed
  cancelled_by: string | null; // uuid, admin who cancelled
  extras_updated_by: string | null; // uuid, admin who updated extras
  admin_actor: string | null; // uuid, last admin actor
  performed_by: string | null; // uuid, general audit field
  
  // Timestamps
  created_at: string; // timestamp with time zone
  updated_at: string; // timestamp with time zone
  confirmed_at: string | null; // timestamp with time zone
  cancelled_at: string | null; // timestamp with time zone
  extras_updated_at: string | null; // timestamp with time zone
}

/**
 * Public Booking Form Payload
 * Used by public users to create bookings
 * Inserts directly to bookings table
 */
export interface PublicBookingPayload {
  // Required fields
  full_name: string;
  mobile: string;
  booking_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  guest_count: number;
  package_id: string | null;
  status: 'pending';
  
  // Optional fields
  special_requests?: string; // Includes "Event Type: <value>" from frontend
  additional_notes?: string;
}

/**
 * Admin Create Booking RPC Parameters
 * RPC: admin_create_booking
 * All pricing calculated server-side
 */
export interface AdminCreateBookingParams {
  p_booking_date: string; // YYYY-MM-DD
  p_full_name: string;
  p_mobile: string;
  p_email: string | null;
  p_event_type: string;
  p_guest_count: number;
  p_package_id: string;
  p_time_slot: 'morning' | 'evening' | 'night' | 'full_day' | 'short_duration';
  p_start_time: string | null; // HH:MM, required only for short_duration
  p_end_time: string | null; // HH:MM, required only for short_duration
  p_special_requests: string | null;
  p_additional_notes: string | null;
  p_garbage_bags: number;
  p_plates_small: number;
  p_plates_large: number;
  p_cooking_gas_qty: number;
  p_admin_price_adjustment: number;
  p_admin_id: string; // Auto-injected from session
}

/**
 * Admin Update Booking RPC Parameters
 * RPC: admin_update_booking_details
 * Only updates core booking details (NOT pricing)
 */
export interface AdminUpdateBookingParams {
  p_booking_id: string;
  p_event_type: string | null;
  p_package_id: string | null;
  p_time_slot: 'morning' | 'evening' | 'night' | 'full_day' | 'short_duration' | null;
  p_start_time: string | null; // HH:MM scalar or null
  p_end_time: string | null; // HH:MM scalar or null
  p_admin_price_adjustment: number | null; // Added to match backend
  p_special_requests: string | null; // Added to match backend
  p_admin_id: string; // Auto-injected from session
}

/**
 * Database Triggers Active on Bookings Table
 * Auto-execute on INSERT/UPDATE operations
 */
export const BOOKING_TRIGGERS = {
  /**
   * trg_assign_time_range
   * - Auto-assigns start_time/end_time based on time_slot
   * - Fires BEFORE INSERT OR UPDATE OF time_slot
   */
  assignTimeRange: 'assign_time_range()',
  
  /**
   * trg_calculate_booking_financials
   * - Calculates all costs from quantities and unit prices
   * - Updates: cooking_gas_cost, garbage_cost, plates_cost, extra_services_total
   * - Fires BEFORE INSERT OR UPDATE OF package_id, garbage_bags, plates_small, plates_large, cooking_gas_qty, floor_cleaning_cost, admin_price_adjustment, plates
   */
  calculateFinancials: 'calculate_booking_financials()',
  
  /**
   * trg_calculate_final_price
   * - Calculates final_price = package_price + floor_cleaning_cost + extra_services_total + admin_price_adjustment
   * - Fires BEFORE INSERT OR UPDATE OF package_id, garbage_bags, plates, plates_cost, cooking_gas_qty, floor_cleaning_cost
   */
  calculateFinalPrice: 'calculate_final_price()',
  
  /**
   * trg_log_booking_admin_action
   * - Logs admin actions to booking_actions table
   * - Tracks: confirmed_by, cancelled_by, extras_updated_by, admin_notes, admin_actor
   * - Fires AFTER UPDATE OF confirmed_by, cancelled_by, extras_updated_by, admin_notes, admin_actor
   */
  logAdminAction: 'log_booking_admin_action()',
  
  /**
   * trg_sync_availability_from_booking
   * - Syncs booking status to availability calendar
   * - Fires AFTER INSERT OR DELETE OR UPDATE
   */
  syncAvailability: 'sync_availability_from_booking()',
  
  /**
   * trg_sync_booking_event_safe
   * - Syncs booking to events table for calendar display
   * - Fires AFTER INSERT OR DELETE OR UPDATE OF status, booking_date, start_time, end_time, event_type
   */
  syncBookingEvent: 'sync_booking_event_safe()',
} as const;

/**
 * Pricing Constants
 * Must match backend pricing logic
 */
export const PRICING_CONSTANTS = {
  FLOOR_CLEANING_COST: 3000, // Fixed cost, auto-applied
  GARBAGE_BAG_COST: 250, // Per bag
  PLATE_SMALL_COST: 2.5, // Per small plate
  PLATE_LARGE_COST: 3.5, // Per large plate
  COOKING_GAS_COST: 150, // Per unit
} as const;

/**
 * Valid time slots
 * Enforced by database constraint: bookings_slot_check
 */
export const VALID_TIME_SLOTS = [
  'morning',
  'evening', 
  'night',
  'full_day',
  'short_duration',
] as const;

/**
 * Valid booking statuses
 * Enforced by database constraint: bookings_status_check
 */
export const VALID_STATUSES = [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
] as const;

/**
 * Time slot to time range mapping
 * Used by assign_time_range() trigger
 */
export const TIME_SLOT_RANGES = {
  morning: { start: '10:00:00', end: '14:00:00' },
  evening: { start: '14:00:00', end: '18:00:00' },
  night: { start: '18:00:00', end: '22:00:00' },
  full_day: { start: '10:00:00', end: '18:00:00' },
  short_duration: { start: null, end: null }, // Admin sets custom times
} as const;

/**
 * Fields that trigger financial recalculation
 * When any of these change, pricing is auto-recalculated
 */
export const FINANCIAL_TRIGGER_FIELDS = [
  'package_id',
  'garbage_bags',
  'plates_small',
  'plates_large',
  'plates', // legacy
  'cooking_gas_qty',
  'floor_cleaning_cost',
  'admin_price_adjustment',
] as const;

/**
 * Fields that require admin authentication
 * Only admins with valid profile can modify these
 */
export const ADMIN_ONLY_FIELDS = [
  'confirmed_by',
  'cancelled_by',
  'extras_updated_by',
  'admin_actor',
  'admin_notes',
  'admin_notes_history',
  'admin_price_adjustment',
  'additional_notes',
  'status', // Can change via RPC only
] as const;

/**
 * Booking Action from booking_actions table
 * Retrieved via get_booking_actions RPC
 */
export interface BookingAction {
  id: string;
  booking_id: string;
  action: string;
  performed_by: string | null;
  performed_by_name: string | null;
  performed_by_email: string | null;
  actor: string | null;
  actor_name: string | null;
  actor_email: string | null;
  performed_at: string;
  notes: string | null;
}