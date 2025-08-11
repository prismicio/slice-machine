import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getEnvironments } from "./actions/getEnvironments";

export const GetEnvironmentsQueryKey = ["getEnvironments"];

export function useInvalidateEnvironmentsData() {
  const client = useQueryClient();

  return client.invalidateQueries({ queryKey: GetEnvironmentsQueryKey });
}

export function useEnvironments() {
  const { data, ...rest } = useQuery({
    queryKey: GetEnvironmentsQueryKey,
    queryFn: () => getEnvironments(),
  });

  return {
    environments: data,
    ...rest,
  };
}
