// src/schemas/events.ts — Event validation schemas
import { z } from "zod";

export const eventSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Event title is required"),
  description: z.string().optional().nullable(),
  event_date: z.string().min(1, "Event date is required"),
  start_time: z.string().optional().nullable(),
  end_time: z.string().optional().nullable(),
  attendees: z.number().int().positive("Attendees must be positive").optional().nullable(),
  package_id: z.string().uuid().optional().nullable(),
  status: z.string().optional().nullable(),
  created_at: z.string().optional(),
  is_active: z.boolean().optional().default(true),
  type: z.string().optional().nullable(),
  organizer: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  image_url: z.string().url("Must be a valid URL").optional().nullable(),
});

export const eventCreateSchema = eventSchema.omit({ id: true, created_at: true });
export const eventUpdateSchema = eventCreateSchema.partial();

export type Event = z.infer<typeof eventSchema>;
export type EventCreate = z.infer<typeof eventCreateSchema>;
export type EventUpdate = z.infer<typeof eventUpdateSchema>;
