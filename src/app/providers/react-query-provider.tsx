"use client";

  import React, { PropsWithChildren, useState } from "react";
  import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
  // Devtools (optional)
  // import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

  export default function ReactQueryProvider({ children }: PropsWithChildren) {
    const [client] = useState(
      () =>
        new QueryClient({
          defaultOptions: {
            queries: {
              // Treat cached data as fresh for 5 minutes
              staleTime: 5 * 60 * 1000,
              // Keep in cache for 30 minutes after becoming unused
              gcTime: 30 * 60 * 1000,
              refetchOnWindowFocus: false,
              refetchOnReconnect: false,
              refetchOnMount: false,
              retry: 1,
            },
          },
        })
    );

    return (
      <QueryClientProvider client={client}>
        {children}
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    );
  }