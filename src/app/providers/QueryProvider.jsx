import React, { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * QueryProvider
 * - Central place for React Query configuration.
 * - Makes data fetching consistent + cache-friendly across the dashboard.
 */
export default function QueryProvider({ children }) {
  const client = useMemo(() => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 30_000,              // 30s
          cacheTime: 5 * 60_000,          // 5 min
          refetchOnWindowFocus: false,
          refetchOnReconnect: true,
          retry: (failureCount, error) => {
            const status = error?.response?.status;
            // Don't retry on auth/forbidden
            if (status === 401 || status === 403) return false;
            // retry at most 1 time for network/server errors
            return failureCount < 1;
          }
        },
        mutations: {
          retry: 0
        }
      }
    });
  }, []);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
