// src/schemas/availability.ts — Availability validation schemas
import { z } from "zod";

export const availabilityStatusSchema = z.enum(["available", "partial", "full"]);

export const availabilitySchema = z.object({
  date: z.string(),
  bookings: z.number().default(0),
  totalGuests: z.number().default(0),
  status: availabilityStatusSchema,
  timeSlots: z.array(z.object({
    start: z.string(),
    end: z.string(),
    guests: z.number().optional(),
  })).optional(),
});

export const availabilityCheckSchema = z.object({
  date: z.string().min(1, "Date is required"),
  available: z.boolean(),
  hasConflict: z.boolean(),
  existingBookings: z.number(),
  bookings: z.array(z.any()),
  message: z.string(),
});

export type AvailabilityStatus = z.infer<typeof availabilityStatusSchema>;
export type Availability = z.infer<typeof availabilitySchema>;
export type AvailabilityCheck = z.infer<typeof availabilityCheckSchema>;

// Helper to get status color for calendar
export const getAvailabilityColor = (status: AvailabilityStatus): string => {
  switch (status) {
    case "available":
      return "bg-green-100 border-green-300 text-green-800";
    case "partial":
      return "bg-yellow-100 border-yellow-300 text-yellow-800";
    case "full":
      return "bg-red-100 border-red-300 text-red-800";
    default:
      return "bg-gray-100 border-gray-300 text-gray-800";
  }
};

// Helper to get status label
export const getAvailabilityLabel = (status: AvailabilityStatus): string => {
  switch (status) {
    case "available":
      return "Available";
    case "partial":
      return "Partially Booked";
    case "full":
      return "Fully Booked";
    default:
      return "Unknown";
  }
};
