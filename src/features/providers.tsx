"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
          //   staleTime: 5 * 60 * 1000, // 5 minutes
          //   gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
          //   refetchOnWindowFocus: false,
          //   refetchOnReconnect: true,
          // },
          // mutations: {
          //   retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
