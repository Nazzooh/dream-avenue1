// schemas/validation.ts — Zod validation schemas for all modules
import { z } from "zod";

/* ========================================
   PACKAGES
   ======================================== */
export const packageSchema = z.object({
  name: z.string().min(1, "Package name is required"),
  price_min: z.number().min(0).optional().nullable(),
  price_max: z.number().min(0).optional().nullable(),
  description: z.string().optional().nullable(),
  features: z.array(z.string()).optional().default([]),
  max_guests: z.number().int().positive().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  is_featured: z.boolean().optional().default(false),
});

export const packageUpdateSchema = packageSchema.partial();

/* ========================================
   FACILITIES
   ======================================== */
export const facilitySchema = z.object({
  title: z.string().min(1, "Facility title is required"),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  is_active: z.boolean().optional().default(true),
});

export const facilityUpdateSchema = facilitySchema.partial();

/* ========================================
   GALLERY
   ======================================== */
export const gallerySchema = z.object({
  title: z.string().min(1, "Title is required"),
  image_url: z.string().url("Valid image URL is required"),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  event_type: z.string().optional().nullable(),
  is_featured: z.boolean().optional().default(false),
});

export const galleryUpdateSchema = gallerySchema.partial();

/* ========================================
   TESTIMONIALS
   ======================================== */
export const testimonialSchema = z.object({
  client_name: z.string().min(1, "Client name is required"),
  event_type: z.string().optional().nullable(),
  rating: z.number().min(1).max(5).optional().default(5),
  testimonial: z.string().min(10, "Testimonial must be at least 10 characters"),
  image_url: z.string().url().optional().nullable(),
  is_featured: z.boolean().optional().default(false),
  event_date: z.string().optional().nullable(),
});

export const testimonialUpdateSchema = testimonialSchema.partial();

/* ========================================
   EVENTS
   ======================================== */
export const eventSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  description: z.string().optional().nullable(),
  event_date: z.string().min(1, "Event date is required"),
  start_time: z.string().optional().nullable(),
  end_time: z.string().optional().nullable(),
  attendees: z.number().int().positive().optional().nullable(),
  package_id: z.string().uuid().optional().nullable(),
  status: z.string().optional().nullable(),
  is_active: z.boolean().optional().default(true),
  type: z.string().optional().nullable(),
  organizer: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
});

export const eventUpdateSchema = eventSchema.partial();

/* ========================================
   REVIEWS
   ======================================== */
export const reviewSchema = z.object({
  client_name: z.string().min(1, "Client name is required"),
  rating: z.number().min(1).max(5),
  review_text: z.string().min(10, "Review must be at least 10 characters"),
  event_type: z.string().optional().nullable(),
  is_approved: z.boolean().optional().default(false),
  review_date: z.string().optional().nullable(),
});

export const reviewUpdateSchema = reviewSchema.partial();

/* ========================================
   BOOKINGS
   ======================================== */
// MATCHES DATABASE SCHEMA EXACTLY
// Public booking creation schema
export const bookingSchema = z.object({
  // Required fields
  full_name: z.string().min(1, "Full name is required"),
  mobile: z.string().min(10, "Valid mobile number is required"),
  booking_date: z.string().min(1, "Booking date is required"),
  
  // Required time fields (converted from slot by frontend)
  start_time: z.string().min(1, "Start time is required"), // HH:MM format
  end_time: z.string().min(1, "End time is required"),     // HH:MM format
  
  // Optional customer fields
  email: z.string().email("Valid email is required").optional().default(""),
  guest_count: z.number().int().positive().optional().default(1),
  
  // Package (optional)
  package_id: z.string().uuid().optional().nullable(),
  
  // Notes (public can provide)
  special_requests: z.string().max(1000).optional().nullable(),
  additional_notes: z.string().max(1000).optional().nullable(),
  
  // Status (always pending for public bookings)
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]).optional().default("pending"),
  
  // Active flag
  is_active: z.boolean().optional().default(true),
});

// Admin booking update schema (for admin_update_booking_details RPC)
export const bookingUpdateSchema = z.object({
  // Admin can update these fields via admin_update_booking_details RPC
  event_type: z.enum(["birthday", "meeting_conference", "get_together", "awareness_class", "normal"]).optional().nullable(),
  package_id: z.string().uuid().optional().nullable(),
  time_slot: z.enum(["morning", "evening", "night", "full_day", "short_duration"]).optional().nullable(),
  start_time: z.string().optional().nullable(), // HH:MM:SS for short_duration
  end_time: z.string().optional().nullable(),   // HH:MM:SS for short_duration
  special_requests: z.string().max(1000).optional().nullable(),
});

/* ========================================
   AVAILABILITY
   ======================================== */
export const availabilityQuerySchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  month: z.string().optional(),
  year: z.string().optional(),
});