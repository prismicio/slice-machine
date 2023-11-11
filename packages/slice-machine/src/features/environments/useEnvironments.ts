import { useRequest } from "@prismicio/editor-support/Suspense";
import { Environment } from "@slicemachine/manager/client";

import { sortEnvironments } from "@src/domain/environment";

import { managerClient } from "@src/managerClient";

async function getEnvironments(): Promise<
  | { environments: Environment[]; error: undefined }
  | { environments: undefined; error: unknown }
> {
  try {
    const environments =
      await managerClient.prismicRepository.fetchEnvironments();

    const sortedEnvironments = sortEnvironments(environments);

    return {
      environments: sortedEnvironments,
      error: undefined,
    };
  } catch (error) {
    return {
      environments: undefined,
      error,
    };
  }
}

export function useEnvironments() {
  const environments = useRequest(getEnvironments, []);

  return environments;
}
