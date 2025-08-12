import { revalidateData } from "@prismicio/editor-support/Suspense";
import { Environment } from "@slicemachine/manager/client";
import { useQueryClient } from "@tanstack/react-query";

import { getState } from "@/apiClient";
import { GetActiveEnvironmentQueryKey } from "@/features/environments/useActiveEnvironment";
import { managerClient } from "@/managerClient";

export function useSetEnvironment() {
  const queryClient = useQueryClient();

  return async (environment: Pick<Environment, "domain">) => {
    await managerClient.project.updateEnvironment({
      environment: environment.domain,
    });

    void Promise.all([
      queryClient.invalidateQueries({ queryKey: GetActiveEnvironmentQueryKey }),
      revalidateData(getState, []),
    ]);
  };
}
