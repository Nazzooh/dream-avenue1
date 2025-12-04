// routes/facilities.ts — Facilities CRUD endpoints
import { Hono } from "hono";
import { createSupabaseClient } from "../lib/supabase.ts";
import { successResponse, errorResponse, validationErrorResponse, notFoundResponse } from "../lib/response.ts";
import { facilitySchema, facilityUpdateSchema } from "../schemas/validation.ts";