import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

import { getActiveEnvironment } from "./actions/getActiveEnvironment";

export const GetActiveEnvironmentQueryKey = ["getActiveEnvironment"];

export function useActiveEnvironment(options?: { suspense?: boolean }) {
  const { suspense } = options ?? {};

  const hook = suspense === true ? useSuspenseQuery : useQuery;

  const { data, ...rest } = hook({
    queryKey: GetActiveEnvironmentQueryKey,
    queryFn: () => getActiveEnvironment(),
  });

  return {
    activeEnvironment: data?.activeEnvironment,
    ...rest,
  };
}
