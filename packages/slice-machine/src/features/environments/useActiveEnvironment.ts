import { useRequest } from "@prismicio/editor-support/Suspense";
import { isUnauthenticatedError } from "@slicemachine/manager/client";

import { managerClient } from "@src/managerClient";

async function getActiveEnvironment(): Promise<
  | Awaited<
      ReturnType<typeof managerClient.prismicRepository.fetchEnvironments>
    >[number]
  | undefined
> {
  try {
    const environments =
      await managerClient.prismicRepository.fetchEnvironments();
    const { environment: environmentDomain } =
      await managerClient.project.readEnvironment();

    return environments.find(
      (environment) => environment.domain === environmentDomain,
    );
  } catch (error) {
    if (isUnauthenticatedError(error)) {
      return {};
    }

    throw error;
  }
}

export function useActiveEnvironment() {
  const activeEnvironment = useRequest(getActiveEnvironment, []);

  return activeEnvironment;
}
