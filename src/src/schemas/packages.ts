// src/schemas/packages.ts — Package validation schemas (shared with backend)
import { z } from "zod";

export const packageSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Package name is required"),
  price: z.number().min(0, "Price must be positive").optional().nullable(),
  price_min: z.number().min(0, "Price must be positive").optional().nullable(),
  price_max: z.number().min(0, "Price must be positive").optional().nullable(),
  description: z.string().optional().nullable(),
  features: z.array(z.string()).optional().default([]),
  max_guests: z.number().int().positive("Max guests must be positive").optional().nullable(),
  image_url: z.string().optional().or(z.literal("")).nullable(),
  is_featured: z.boolean().optional().default(false),
  is_active: z.boolean().optional().default(true),
  order_index: z.number().int().optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const packageCreateSchema = packageSchema.omit({ id: true, created_at: true, updated_at: true });
export const packageUpdateSchema = packageCreateSchema.partial();

export type Package = z.infer<typeof packageSchema>;
export type PackageCreate = z.infer<typeof packageCreateSchema>;
export type PackageUpdate = z.infer<typeof packageUpdateSchema>;

// Helper to format package price range
export const formatPackagePrice = (pkg: Package): string => {
  if (pkg.price_min && pkg.price_max) {
    return `₹${pkg.price_min.toLocaleString()} - ₹${pkg.price_max.toLocaleString()}`;
  }
  if (pkg.price_min) {
    return `From ₹${pkg.price_min.toLocaleString()}`;
  }
  if (pkg.price_max) {
    return `Up to ₹${pkg.price_max.toLocaleString()}`;
  }
  return "Contact for pricing";
};
