// src/hooks/useGallery.ts — React Query hooks for gallery
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getGalleryItems,
  getGalleryItem,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  galleryKeys,
} from "../api/gallery";
import { GalleryCreate, GalleryUpdate } from "../schemas/gallery";
import { toast } from "sonner@2.0.3";

// GET all gallery items with optional category filter
export const useGalleryItems = (category?: string) => {
  return useQuery({
    queryKey: galleryKeys.list({ category }),
    queryFn: () => getGalleryItems(category),
  });
};

// GET single gallery item
export const useGalleryItem = (id: string) => {
  return useQuery({
    queryKey: galleryKeys.detail(id),
    queryFn: () => getGalleryItem(id),
    enabled: !!id,
  });
};

// CREATE gallery item
export const useCreateGalleryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GalleryCreate) => createGalleryItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
      toast.success("Gallery item created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create gallery item");
    },
  });
};

// UPDATE gallery item
export const useUpdateGalleryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: GalleryUpdate }) =>
      updateGalleryItem(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
      queryClient.invalidateQueries({ queryKey: galleryKeys.detail(variables.id) });
      toast.success("Gallery item updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update gallery item");
    },
  });
};

// DELETE gallery item
export const useDeleteGalleryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteGalleryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
      toast.success("Gallery item deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete gallery item");
    },
  });
};

// Backward compatibility aliases
export const useGallery = useGalleryItems;
export const useCreateGallery = useCreateGalleryItem;
export const useUpdateGallery = useUpdateGalleryItem;
export const useDeleteGallery = useDeleteGalleryItem;
