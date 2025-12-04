// src/api/packages.ts — Package CRUD API functions
import { supabase } from "../../utils/supabase/client";
import { Package, PackageCreate, PackageUpdate, packageSchema } from "../schemas/packages";

// GET all packages (public - only active)
export const getPackages = async (): Promise<Package[]> => {
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true });
  
  if (error) throw new Error(error.message);
  return packageSchema.array().parse(data || []);
};

// GET all packages for admin (includes inactive)
export const getAllPackages = async (): Promise<Package[]> => {
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .order('order_index', { ascending: true });
  
  if (error) throw new Error(error.message);
  return packageSchema.array().parse(data || []);
};

// GET single package by ID
export const getPackage = async (id: string): Promise<Package> => {
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw new Error(error.message);
  return packageSchema.parse(data);
};

// CREATE new package
export const createPackage = async (packageData: PackageCreate): Promise<Package> => {
  const { data, error } = await supabase
    .from('packages')
    .insert([packageData])
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return packageSchema.parse(data);
};

// UPDATE package
export const updatePackage = async (id: string, packageData: PackageUpdate): Promise<Package> => {
  const { data, error } = await supabase
    .from('packages')
    .update(packageData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return packageSchema.parse(data);
};

// DELETE package
export const deletePackage = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('packages')
    .delete()
    .eq('id', id);
  
  if (error) throw new Error(error.message);
};

// BULK UPDATE package order (for drag-and-drop reordering)
export const updatePackageOrder = async (
  updates: Array<{ id: string; order_index: number }>
): Promise<void> => {
  // Use atomic RPC call to update all order_index values in a single transaction
  // This prevents unique constraint violations and ensures data consistency
  const { error } = await supabase.rpc('update_package_order', {
    updates: updates,
  });
  
  if (error) {
    throw new Error(`Failed to update package order: ${error.message}`);
  }
};

// React Query keys for caching
export const packageKeys = {
  all: ["packages"] as const,
  lists: () => [...packageKeys.all, "list"] as const,
  list: (filters?: any) => [...packageKeys.lists(), filters] as const,
  details: () => [...packageKeys.all, "detail"] as const,
  detail: (id: string) => [...packageKeys.details(), id] as const,
};
