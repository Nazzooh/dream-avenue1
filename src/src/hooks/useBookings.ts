// src/hooks/useBookings.ts — React Query hooks for bookings
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  checkAvailability,
  bookingKeys,
} from "../api/bookings";
import {
  adminUpdateBookingStatus,
  adminUpdateBooking,
  adminDeleteBooking,
  adminCancelBooking,
} from "../api/adminBookings";
import { BookingCreate, BookingUpdate, BookingStatus } from "../schemas/bookings";
import { toast } from "sonner@2.0.3";
import { supabase } from "../lib/supabase";

// GET all bookings with filters
export const useBookings = (filters?: {
  status?: BookingStatus;
  date?: string;
  start_date?: string;
  end_date?: string;
}) => {
  return useQuery({
    queryKey: bookingKeys.list(filters),
    queryFn: () => getBookings(filters),
  });
};

// GET single booking
export const useBooking = (id: string) => {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => getBooking(id),
    enabled: !!id,
  });
};

// CREATE booking with conflict detection
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BookingCreate) => createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      toast.success("Booking created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create booking");
    },
  });
};

// UPDATE booking
export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BookingUpdate }) =>
      updateBooking(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(variables.id) });
      toast.success("Booking updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update booking");
    },
  });
};

// UPDATE booking status
export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      adminUpdateBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: ['admin_events'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      toast.success("Booking status updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update booking status");
    },
  });
};

// ADMIN UPDATE booking (for extra services, notes, etc.)
export const useAdminUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BookingUpdate> }) =>
      adminUpdateBooking(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: ['admin_events'] });
      toast.success("Booking updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update booking");
    },
  });
};

// DELETE booking
export const useDeleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminDeleteBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      toast.success("Booking deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete booking");
    },
  });
};

// CANCEL booking (updates status + frees calendar + logs action)
export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Get current admin ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .single();
      
      if (!profile || profile.role !== 'admin') {
        throw new Error('Admin access required');
      }
      
      return adminCancelBooking(id, profile.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: ['calendar_availability'] });
      toast.success("Booking cancelled successfully. Date released to calendar.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to cancel booking");
    },
  });
};

// CHECK availability
export const useCheckAvailability = () => {
  return useMutation({
    mutationFn: (data: {
      booking_date: string;
    }) => checkAvailability(data),
  });
};