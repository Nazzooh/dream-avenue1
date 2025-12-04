// src/hooks/useEvents.ts — React Query hooks for events
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  eventKeys,
} from "../api/events";
import type { EventCreate, EventUpdate } from "../schemas/events";
import { toast } from "sonner@2.0.3";

// GET all events with optional filters
export const useEvents = (filters?: {
  active?: boolean;
  upcoming?: boolean;
}) => {
  return useQuery({
    queryKey: eventKeys.list(filters),
    queryFn: () => getEvents(filters),
  });
};

// GET single event
export const useEvent = (id: string) => {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => getEvent(id),
    enabled: !!id,
  });
};

// CREATE event
export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EventCreate) => createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      toast.success("Event created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create event");
    },
  });
};

// UPDATE event
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EventUpdate }) =>
      updateEvent(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.id) });
      toast.success("Event updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update event");
    },
  });
};

// DELETE event
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      toast.success("Event deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete event");
    },
  });
};