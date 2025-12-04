// src/schemas/gallery.ts — Gallery validation schemas
import { z } from "zod";

export const gallerySchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Title is required"),
  image_url: z.string().url("Valid image URL is required"),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  event_type: z.string().optional().nullable(),
  is_featured: z.boolean().optional().default(false),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const galleryCreateSchema = gallerySchema.omit({ id: true, created_at: true, updated_at: true });
export const galleryUpdateSchema = galleryCreateSchema.partial();

export type GalleryItem = z.infer<typeof gallerySchema>;
export type GalleryCreate = z.infer<typeof galleryCreateSchema>;
export type GalleryUpdate = z.infer<typeof galleryUpdateSchema>;
