// /src/hooks/useCalendar.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCalendarMonth, fetchCalendarEvents } from "../api/calendar";
import { fetchPublicCalendarMonth } from "../api/calendarPublic";
import { blockDate, unblockDate, createManualBooking } from "../api/admin/calendar";
import type { BlockDatePayload, ManualBookingPayload } from "../api/admin/calendar";
import { checkDateAvailability } from "../api/availability";
import { log } from "../lib/logger";
import { toast } from "sonner@2.0.3";

// Query key factory
export const calendarKeys = {
  all: ["calendar"] as const,
  months: () => [...calendarKeys.all, "months"] as const,
  month: (year: number, month: number) => [...calendarKeys.months(), year, month] as const,
  events: () => [...calendarKeys.all, "events"] as const,
  eventsByRange: (start: string, end: string) => [...calendarKeys.events(), start, end] as const,
};

/**
 * Fetch calendar month data with retry logic
 */
export function useCalendarMonth(year: number, month: number) {
  return useQuery({
    queryKey: calendarKeys.month(year, month),
    queryFn: async () => {
      log.info(`[useCalendarMonth] Querying ${year}-${month}`);
      const data = await fetchCalendarMonth(year, month);
      
      if (!data || Object.keys(data).length === 0) {
        console.warn("[useCalendarMonth] RPC returned empty, using public fallback");
        const fallback = await fetchPublicCalendarMonth(year, month);
        return fallback;
      }
      
      return data;
    },
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch calendar events for a date range
 */
export function useCalendarEvents(startDate: string, endDate: string) {
  return useQuery({
    queryKey: calendarKeys.eventsByRange(startDate, endDate),
    queryFn: async () => {
      log.info(`[useCalendarEvents] Querying events from ${startDate} to ${endDate}`);
      return await fetchCalendarEvents(startDate, endDate);
    },
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Block a date (admin only)
 */
export function useBlockDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BlockDatePayload) => {
      log.info("[useBlockDate] Blocking date", payload);
      return await blockDate(payload);
    },
    onSuccess: (data, variables) => {
      log.info("[useBlockDate] Date blocked successfully", data);
      toast.success("Date blocked successfully");
      
      // Invalidate calendar queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
    },
    onError: (error: any) => {
      log.error("[useBlockDate] Failed to block date", error);
      toast.error(error.message || "Failed to block date");
    },
  });
}

/**
 * Unblock a date (admin only)
 */
export function useUnblockDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ date, admin_id }: { date: string; admin_id: string }) => {
      log.info("[useUnblockDate] Unblocking date", { date, admin_id });
      return await unblockDate(date, admin_id);
    },
    onSuccess: (data, variables) => {
      log.info("[useUnblockDate] Date unblocked successfully", data);
      toast.success("Date unblocked successfully");
      
      // Invalidate calendar queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
    },
    onError: (error: any) => {
      log.error("[useUnblockDate] Failed to unblock date", error);
      toast.error(error.message || "Failed to unblock date");
    },
  });
}

/**
 * Create manual booking (admin only)
 */
export function useCreateManualBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ManualBookingPayload) => {
      log.info("[useCreateManualBooking] Creating manual booking", payload);
      return await createManualBooking(payload);
    },
    onSuccess: (data, variables) => {
      log.info("[useCreateManualBooking] Manual booking created successfully", data);
      toast.success("Manual booking created successfully");
      
      // Invalidate both calendar and bookings queries
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: any) => {
      log.error("[useCreateManualBooking] Failed to create manual booking", error);
      toast.error(error.message || "Failed to create manual booking");
    },
  });
}

/**
 * Fetch availability for a specific date
 */
export function useAvailabilityForDate(date: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["availability", "date", date],
    queryFn: async () => {
      if (!date) return null;
      log.info(`[useAvailabilityForDate] Checking availability for ${date}`);
      return await checkDateAvailability({ date });
    },
    enabled: enabled && !!date,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}