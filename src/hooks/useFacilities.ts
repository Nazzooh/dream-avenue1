// Dream Avenue — Facilities React Query Hooks
// Manages facilities data with React Query

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase/client';
import { getFacilities, type Facility } from '../api/facilities';

// Query keys factory
const facilityKeys = {
  all: ['facilities'] as const,
  lists: () => [...facilityKeys.all, 'list'] as const,
  list: (filters?: { includeInactive?: boolean }) => [...facilityKeys.lists(), filters] as const,
  details: () => [...facilityKeys.all, 'detail'] as const,
  detail: (id: string) => [...facilityKeys.details(), id] as const,
};

// Get facilities hook
export const useFacilities = (includeInactive: boolean = false) => {
  return useQuery({
    queryKey: facilityKeys.list({ includeInactive }),
    queryFn: () => getFacilities(includeInactive),
  });
};

// Create facility mutation
export const useCreateFacility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Facility, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: facility, error } = await supabase
        .from('facilities')
        .insert([data])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return facility;
    },
    onSuccess: () => {
      // Invalidate all facility queries to refetch
      queryClient.invalidateQueries({ queryKey: facilityKeys.all });
    },
  });
};

// Update facility mutation
export const useUpdateFacility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Facility> }) => {
      const { data: facility, error } = await supabase
        .from('facilities')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return facility;
    },
    onSuccess: () => {
      // Invalidate all facility queries to refetch
      queryClient.invalidateQueries({ queryKey: facilityKeys.all });
    },
  });
};

// Delete facility mutation
export const useDeleteFacility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('facilities')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      return id;
    },
    onSuccess: () => {
      // Invalidate all facility queries to refetch
      queryClient.invalidateQueries({ queryKey: facilityKeys.all });
    },
  });
};

