// src/schemas/adminRequests.ts — Admin Access Request Zod schemas
import { z } from 'zod';

// Admin Request from database
export const AdminRequestSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  message: z.string().nullable(),
  status: z.enum(['Pending', 'Approved', 'Rejected']).default('Pending'),
  created_at: z.string(),
});

export type AdminRequest = z.infer<typeof AdminRequestSchema>;

// Create Admin Request input
export const CreateAdminRequestSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export type CreateAdminRequest = z.infer<typeof CreateAdminRequestSchema>;

// Update Admin Request status
export const UpdateAdminRequestStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['Pending', 'Approved', 'Rejected']),
});

export type UpdateAdminRequestStatus = z.infer<typeof UpdateAdminRequestStatusSchema>;
