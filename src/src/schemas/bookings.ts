// src/schemas/bookings.ts — Booking validation schemas
import { z } from "zod";

export const bookingStatusSchema = z.enum(["pending", "confirmed", "cancelled", "completed"]);
export const eventTypeSchema = z.enum(["birthday", "meeting_conference", "get_together", "awareness_class", "normal"]);
export const timeSlotSchema = z.enum(["morning", "evening", "night", "full_day", "short_duration"]);

// Schema for fetching bookings from DB (lenient, handles legacy data)
// MATCHES DATABASE SCHEMA EXACTLY
export const bookingSchema = z.object({
  // Primary fields
  id: z.string().uuid().optional(),
  full_name: z.string().nullable().catch(null),
  mobile: z.string().nullable().catch(null),
  email: z.string().nullable().catch(""),
  booking_date: z.string().nullable().catch(null), // date type
  package_id: z.string().uuid().nullable().catch(null),
  status: bookingStatusSchema.catch("pending"),
  final_price: z.number().nullable().catch(0),
  
  // Timestamps
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  is_active: z.boolean().catch(true),
  
  // Time-related fields
  time_slot: timeSlotSchema.nullable().catch(null),
  start_time: z.string().nullable().catch(null), // time without time zone
  end_time: z.string().nullable().catch(null),   // time without time zone
  
  // Floor cleaning (mandatory with fixed cost)
  floor_cleaning: z.boolean().nullable().catch(true),
  floor_cleaning_cost: z.number().nullable().catch(3000),
  
  // Extra services
  cooking_gas_qty: z.number().nullable().catch(0),
  cooking_gas_cost: z.number().nullable().catch(0),
  garbage_bags: z.number().nullable().catch(0),
  garbage_cost: z.number().nullable().catch(0),
  plates: z.number().nullable().catch(0), // DEPRECATED - use plates_small/plates_large
  plates_cost: z.number().nullable().catch(0),
  plates_small: z.number().nullable().catch(0),
  plates_large: z.number().nullable().catch(0),
  extra_services_total: z.number().nullable().catch(0),
  
  // Notes and requests
  admin_notes: z.string().nullable().catch(null),
  admin_notes_history: z.array(z.any()).nullable().catch([]),
  special_requests: z.string().nullable().catch(null),
  additional_notes: z.string().nullable().catch(null),
  
  // User and admin tracking
  user_id: z.string().uuid().nullable().catch(null),
  guest_count: z.number().nullable().catch(0),
  event_type: eventTypeSchema.nullable().catch(null),
  
  // Admin action tracking (set by triggers/RPCs)
  confirmed_by: z.string().uuid().nullable().catch(null),
  cancelled_by: z.string().uuid().nullable().catch(null),
  extras_updated_by: z.string().uuid().nullable().catch(null),
  admin_actor: z.string().uuid().nullable().catch(null),
  performed_by: z.string().uuid().nullable().catch(null),
  
  // Admin profile joins (for displaying names instead of UUIDs)
  confirmed_by_profile: z.object({
    full_name: z.string().nullable(),
    email: z.string().nullable(),
  }).nullable().catch(null),
  cancelled_by_profile: z.object({
    full_name: z.string().nullable(),
    email: z.string().nullable(),
  }).nullable().catch(null),
  extras_updated_by_profile: z.object({
    full_name: z.string().nullable(),
    email: z.string().nullable(),
  }).nullable().catch(null),
  admin_actor_profile: z.object({
    full_name: z.string().nullable(),
    email: z.string().nullable(),
  }).nullable().catch(null),
  
  // Admin price adjustment
  admin_price_adjustment: z.number().nullable().catch(0),
});

// Strict schema for creating new bookings (validates input)
// ONLY INCLUDES FIELDS THAT FRONTEND CAN SET
export const bookingCreateSchema = z.object({
  // Required fields
  full_name: z.string().min(2, "Full name must be at least 2 characters").max(100, "Full name too long"),
  mobile: z.string()
    .min(10, "Mobile number must be at least 10 digits")
    .max(15, "Mobile number too long")
    .regex(/^[\d\s\+\-\(\)]+$/, "Invalid mobile number format"),
  booking_date: z.string().min(1, "Booking date is required"),
  
  // Optional customer fields
  email: z.string().email("Invalid email address").optional().nullable(),
  guest_count: z.number()
    .int("Guest count must be a whole number")
    .positive("Guest count must be positive")
    .min(1, "At least 1 guest is required")
    .max(10000, "Guest count exceeds venue capacity")
    .default(1),
  
  // Package and slot
  package_id: z.string().uuid("Invalid package ID").nullable().optional(),
  time_slot: timeSlotSchema.optional().nullable(),
  start_time: z.string().optional().nullable(), // HH:MM:SS format for short_duration
  end_time: z.string().optional().nullable(),   // HH:MM:SS format for short_duration
  
  // Event type
  event_type: eventTypeSchema.optional().nullable(),
  
  // Notes
  special_requests: z.string().max(1000, "Special requests too long (max 1000 characters)").optional().nullable(),
  additional_notes: z.string().max(1000, "Notes too long (max 1000 characters)").optional().nullable(),
  
  // User tracking (set by auth)
  user_id: z.string().uuid().optional().nullable(),
  
  // Status (default: pending)
  status: bookingStatusSchema.optional().default("pending"),
  
  // Floor cleaning (always true, cost fixed at 3000)
  floor_cleaning: z.boolean().optional().default(true),
  floor_cleaning_cost: z.number().optional().default(3000),
  
  // Extra services (optional)
  cooking_gas_qty: z.number().int().min(0).max(100).optional().default(0),
  cooking_gas_cost: z.number().min(0).max(10000).optional().default(0),
  garbage_bags: z.number().int().min(0).max(100).optional().default(0),
  garbage_cost: z.number().min(0).max(10000).optional().default(0),
  plates: z.number().int().min(0).max(100).optional().default(0), // DEPRECATED
  plates_cost: z.number().min(0).max(10000).optional().default(0),
  plates_small: z.number().int().min(0).max(1000).optional().default(0),
  plates_large: z.number().int().min(0).max(1000).optional().default(0),
  extra_services_total: z.number().min(0).optional().default(0),
  
  // Price (calculated by backend)
  final_price: z.number().optional().nullable(),
  admin_price_adjustment: z.number().optional().default(0),
  
  // Admin notes (admin only)
  admin_notes: z.string().max(1000, "Admin notes too long (max 1000 characters)").optional().nullable(),
  
  // Active flag
  is_active: z.boolean().optional().default(true),
});

export const bookingUpdateSchema = bookingCreateSchema.partial();

export type Booking = z.infer<typeof bookingSchema>;
export type BookingCreate = z.infer<typeof bookingCreateSchema>;
export type BookingUpdate = z.infer<typeof bookingUpdateSchema>;
export type BookingStatus = z.infer<typeof bookingStatusSchema>;

// Helper to get status color
export const getStatusColor = (status: BookingStatus): string => {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Helper to get status badge text
export const getStatusLabel = (status: BookingStatus): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};