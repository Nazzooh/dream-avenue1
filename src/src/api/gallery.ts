// src/api/gallery.ts — Gallery CRUD API functions
import { supabase } from "../../utils/supabase/client";
import { GalleryItem, GalleryCreate, GalleryUpdate, gallerySchema } from "../schemas/gallery";

// GET all gallery items with optional category filter
export const getGalleryItems = async (category?: string): Promise<GalleryItem[]> => {
  let query = supabase.from('gallery').select('*').order('created_at', { ascending: false });
  
  if (category) {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query;
  
  if (error) throw new Error(error.message);
  return gallerySchema.array().parse(data || []);
};

// GET single gallery item by ID
export const getGalleryItem = async (id: string): Promise<GalleryItem> => {
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw new Error(error.message);
  return gallerySchema.parse(data);
};

// CREATE new gallery item
export const createGalleryItem = async (galleryData: GalleryCreate): Promise<GalleryItem> => {
  const { data, error } = await supabase
    .from('gallery')
    .insert([galleryData])
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return gallerySchema.parse(data);
};

// UPDATE gallery item
export const updateGalleryItem = async (id: string, galleryData: GalleryUpdate): Promise<GalleryItem> => {
  const { data, error } = await supabase
    .from('gallery')
    .update(galleryData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return gallerySchema.parse(data);
};

// DELETE gallery item
export const deleteGalleryItem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('gallery')
    .delete()
    .eq('id', id);
  
  if (error) throw new Error(error.message);
};

// React Query keys
export const galleryKeys = {
  all: ["gallery"] as const,
  lists: () => [...galleryKeys.all, "list"] as const,
  list: (filters?: any) => [...galleryKeys.lists(), filters] as const,
  details: () => [...galleryKeys.all, "detail"] as const,
  detail: (id: string) => [...galleryKeys.details(), id] as const,
};
