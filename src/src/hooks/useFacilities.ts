// src/hooks/useFacilities.ts — React Query hooks for facilities
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFacilities,
  getFacility,
  createFacility,
  updateFacility,
  deleteFacility,
  facilityKeys,
} from "../api/facilities";
import { FacilityCreate, FacilityUpdate } from "../schemas/facilities";
import { toast } from "sonner@2.0.3";

// GET all facilities
export const useFacilities = () => {
  return useQuery({
    queryKey: facilityKeys.lists(),
    queryFn: getFacilities,
  });
};

// GET single facility
export const useFacility = (id: string) => {
  return useQuery({
    queryKey: facilityKeys.detail(id),
    queryFn: () => getFacility(id),
    enabled: !!id,
  });
};

// CREATE facility
export const useCreateFacility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FacilityCreate) => createFacility(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facilityKeys.all });
      toast.success("Facility created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create facility");
    },
  });
};

// UPDATE facility
export const useUpdateFacility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FacilityUpdate }) =>
      updateFacility(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: facilityKeys.all });
      queryClient.invalidateQueries({ queryKey: facilityKeys.detail(variables.id) });
      toast.success("Facility updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update facility");
    },
  });
};

// DELETE facility
export const useDeleteFacility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFacility(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facilityKeys.all });
      toast.success("Facility deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete facility");
    },
  });
};
