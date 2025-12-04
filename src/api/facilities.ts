// Dream Avenue — Facilities API
// Handles fetching facilities from Supabase

import { supabase } from '../utils/supabase/client';

export interface Facility {
  id: string;
  title: string;
  description: string;
  icon: string;
  image_url: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const getFacilities = async (includeInactive: boolean = false): Promise<Facility[]> => {
  console.log('🏢 Fetching facilities via direct Supabase...');
  let query = supabase
    .from('facilities')
    .select('*');
  
  // Only filter for active facilities on public views
  if (!includeInactive) {
    query = query.eq('is_active', true);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    console.error('❌ Supabase error:', error);
    throw new Error(error.message);
  }
  
  console.log('✅ Facilities loaded:', data?.length || 0);
  return (data || []) as Facility[];
};

