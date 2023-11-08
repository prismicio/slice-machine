import { useRequest } from "@prismicio/editor-support/Suspense";
import { isPluginError } from "@slicemachine/manager/client";

import { managerClient } from "@src/managerClient";

async function getActiveEnvironmentDomain(): Promise<string | undefined> {
  try {
    const { environment } = await managerClient.project.readEnvironment();

    return environment;
  } catch (error) {
    if (isPluginError(error)) {
      return undefined;
    }

    throw error;
  }
}

export function useActiveEnvironmentDomain() {
  const activeEnvironment = useRequest(getActiveEnvironmentDomain, []);

  return activeEnvironment;
}
