// src/api/facilities.ts — Facility CRUD API functions
import { supabase } from "../../utils/supabase/client";
import { Facility, FacilityCreate, FacilityUpdate, facilitySchema } from "../schemas/facilities";

// GET all facilities - Direct Supabase
export const getFacilities = async (): Promise<Facility[]> => {
  console.log('🏢 Fetching facilities via direct Supabase...');
  const { data, error } = await supabase
    .from('facilities')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('❌ Supabase error:', error);
    throw new Error(error.message);
  }
  
  console.log('✅ Facilities loaded:', data?.length || 0);
  return facilitySchema.array().parse(data || []);
};

// GET single facility by ID - Direct Supabase
export const getFacility = async (id: string): Promise<Facility> => {
  console.log('🏢 Fetching facility by ID:', id);
  const { data, error } = await supabase
    .from('facilities')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('❌ Supabase error:', error);
    throw new Error(error.message);
  }
  
  return facilitySchema.parse(data);
};

// CREATE new facility - Direct Supabase
export const createFacility = async (facilityData: FacilityCreate): Promise<Facility> => {
  console.log('➕ Creating facility via direct Supabase...');
  const { data, error } = await supabase
    .from('facilities')
    .insert([facilityData])
    .select()
    .single();
  
  if (error) {
    console.error('❌ Supabase error:', error);
    throw new Error(error.message);
  }
  
  console.log('✅ Facility created:', data?.id);
  return facilitySchema.parse(data);
};

// UPDATE facility - Direct Supabase
export const updateFacility = async (id: string, facilityData: FacilityUpdate): Promise<Facility> => {
  console.log('✏️ Updating facility via direct Supabase:', id);
  const { data, error } = await supabase
    .from('facilities')
    .update(facilityData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('❌ Supabase error:', error);
    throw new Error(error.message);
  }
  
  console.log('✅ Facility updated:', data?.id);
  return facilitySchema.parse(data);
};

// DELETE facility - Direct Supabase
export const deleteFacility = async (id: string): Promise<void> => {
  console.log('🗑️ Deleting facility via direct Supabase:', id);
  const { error } = await supabase
    .from('facilities')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('❌ Supabase error:', error);
    throw new Error(error.message);
  }
  
  console.log('✅ Facility deleted:', id);
};

// React Query keys
export const facilityKeys = {
  all: ["facilities"] as const,
  lists: () => [...facilityKeys.all, "list"] as const,
  list: (filters?: any) => [...facilityKeys.lists(), filters] as const,
  details: () => [...facilityKeys.all, "detail"] as const,
  detail: (id: string) => [...facilityKeys.details(), id] as const,
};