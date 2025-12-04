// src/lib/queryClient.ts — React Query client configuration (Optimized for Performance)
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes - data stays fresh longer (reduced API calls)
      gcTime: 1000 * 60 * 30, // 30 minutes - keep data in cache longer for faster navigation
      retry: 1, // Retry once on failure
      refetchOnWindowFocus: false, // Don't refetch on every window focus
      refetchOnReconnect: true, // Refetch on network reconnect
      refetchOnMount: false, // Don't refetch if data is fresh
      networkMode: 'online', // Only run queries when online
      // Suspense mode for better loading states
      suspense: false,
    },
    mutations: {
      retry: 0, // Don't retry mutations
      networkMode: 'online',
    },
  },
});