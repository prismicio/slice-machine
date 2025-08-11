import {
  QueryClient,
  QueryClientProvider as RCQueryClientProvider,
} from "@tanstack/react-query";
import { ReactNode } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: false,
      refetchOnWindowFocus: "always",
    },
  },
});

export function QueryClientProvider(props: { children: ReactNode }) {
  return (
    <RCQueryClientProvider client={queryClient}>
      {props.children}
    </RCQueryClientProvider>
  );
}
