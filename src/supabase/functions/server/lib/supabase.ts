// lib/supabase.ts — Supabase client helper
import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client with SERVICE_ROLE_KEY for admin operations.
 * This bypasses RLS policies and should only be used in Edge Functions.
 * 
 * Environment variables required:
 * - SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_SERVICE_ROLE_KEY: Your service role key (from Settings > API)
 */
export const createSupabaseClient = () => {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!url || !serviceRoleKey) {
    console.error("⚠️ Missing Supabase environment variables");
    console.error("SUPABASE_URL:", url ? "✅ Set" : "❌ Not Set");
    console.error("SUPABASE_SERVICE_ROLE_KEY:", serviceRoleKey ? "✅ Set" : "❌ Not Set");
  }

  return createClient(url, serviceRoleKey);
};
