/**
 * Shared Supabase Client Instance
 * This is the single source of truth for the Supabase client.
 * All other modules should import this client to avoid multiple GoTrueClient instances.
 */
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

const supabaseUrl = `https://${projectId}.supabase.co`;

// Create a single, shared Supabase client instance
export const supabase = createClient(supabaseUrl, publicAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
