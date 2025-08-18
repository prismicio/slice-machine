import { useQuery } from "@tanstack/react-query";

import { getEnvironments } from "./actions/getEnvironments";

export const GetEnvironmentsQueryKey = ["getEnvironments"];

export function useEnvironments() {
  const { data, error, ...rest } = useQuery({
    queryKey: GetEnvironmentsQueryKey,
    queryFn: () => getEnvironments(),
  });
  return {
    environments: data?.environments,
    error: data?.error ?? error ?? undefined,
    ...rest,
  };
}
