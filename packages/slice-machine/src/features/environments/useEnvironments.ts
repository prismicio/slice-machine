import { useRequest } from "@prismicio/editor-support/Suspense";
import { isUnauthenticatedError } from "@slicemachine/manager/client";
import { managerClient } from "@src/managerClient";

async function getEnvironments(): Promise<
  Awaited<ReturnType<typeof managerClient.prismicRepository.fetchEnvironments>>
> {
  try {
    return await managerClient.prismicRepository.fetchEnvironments();
  } catch (error) {
    if (isUnauthenticatedError(error)) {
      return [];
    }

    throw error;
  }
}

export function useEnvironments() {
  const environments = useRequest(getEnvironments, []);

  return environments;
}
