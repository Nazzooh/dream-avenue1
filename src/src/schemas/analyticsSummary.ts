// src/schemas/analyticsSummary.ts — Analytics Summary Schema
import { z } from "zod";

export const analyticsSummarySchema = z.object({
  id: z.string().uuid().optional(),
  events_hosted: z.number().int().min(0),
  guests_served: z.number().int().min(0),
  client_satisfaction: z.number().int().min(0).max(100),
  updated_by: z.string().nullable().optional(),
  updated_at: z.string().datetime().nullable().optional(),
});

export const analyticsSummaryUpdateSchema = z.object({
  events_hosted: z.number().int().min(0, "Events must be 0 or greater"),
  guests_served: z.number().int().min(0, "Guests must be 0 or greater"),
  client_satisfaction: z
    .number()
    .int()
    .min(0, "Satisfaction must be between 0-100")
    .max(100, "Satisfaction must be between 0-100"),
});

export type AnalyticsSummary = z.infer<typeof analyticsSummarySchema>;
export type AnalyticsSummaryUpdate = z.infer<typeof analyticsSummaryUpdateSchema>;
