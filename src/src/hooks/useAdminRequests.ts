// src/hooks/useAdminRequests.ts — React Query hooks for Admin Access Requests
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchAdminRequests,
  createAdminRequest,
  updateAdminRequestStatus,
  deleteAdminRequest,
  approveAdminRequest,
} from '../api/adminRequests';
import { CreateAdminRequest, UpdateAdminRequestStatus } from '../schemas/adminRequests';
import { toast } from 'sonner@2.0.3';

/**
 * Hook to fetch all admin access requests
 */
export function useAdminRequests() {
  return useQuery({
    queryKey: ['adminRequests'],
    queryFn: fetchAdminRequests,
  });
}

/**
 * Hook to create a new admin access request
 */
export function useCreateAdminRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateAdminRequest) => createAdminRequest(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRequests'] });
      toast.success('Admin access request submitted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit request: ${error.message}`);
    },
  });
}

/**
 * Hook to update admin request status
 */
export function useUpdateAdminRequestStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (update: UpdateAdminRequestStatus) => updateAdminRequestStatus(update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRequests'] });
      toast.success('Request status updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
}

/**
 * Hook to delete admin request
 */
export function useDeleteAdminRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAdminRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRequests'] });
      toast.success('Request deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete request: ${error.message}`);
    },
  });
}

/**
 * Hook to approve admin request and grant admin access
 */
export function useApproveAdminRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, email }: { id: string; email: string }) => 
      approveAdminRequest(id, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRequests'] });
      toast.success('Admin access granted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to grant admin access: ${error.message}`);
    },
  });
}
