// src/hooks/usePackages.ts — React Query hooks for packages
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPackages,
  getAllPackages,
  getPackage,
  createPackage,
  updatePackage,
  deletePackage,
  updatePackageOrder,
  packageKeys,
} from "../api/packages";
import { PackageCreate, PackageUpdate } from "../schemas/packages";
import { toast } from "sonner@2.0.3";

// GET all packages (public - only active)
export const usePackages = () => {
  return useQuery({
    queryKey: packageKeys.lists(),
    queryFn: getPackages,
  });
};

// GET all packages for admin (includes inactive)
export const useAllPackages = () => {
  return useQuery({
    queryKey: [...packageKeys.all, 'admin'],
    queryFn: getAllPackages,
  });
};

// GET single package
export const usePackage = (id: string) => {
  return useQuery({
    queryKey: packageKeys.detail(id),
    queryFn: () => getPackage(id),
    enabled: !!id,
  });
};

// CREATE package
export const useCreatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PackageCreate) => createPackage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packageKeys.all });
      toast.success("Package created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create package");
    },
  });
};

// UPDATE package
export const useUpdatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PackageUpdate }) =>
      updatePackage(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.all });
      queryClient.invalidateQueries({ queryKey: packageKeys.detail(variables.id) });
      toast.success("Package updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update package");
    },
  });
};

// DELETE package
export const useDeletePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packageKeys.all });
      toast.success("Package deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete package");
    },
  });
};

// REORDER packages (bulk update order_index)
export const useReorderPackages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Array<{ id: string; order_index: number }>) =>
      updatePackageOrder(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packageKeys.all });
      toast.success("✅ Package order updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "❌ Failed to update package order");
    },
  });
};
