import {
  Environment,
  isInvalidActiveEnvironmentError,
} from "@slicemachine/manager/client";

import { managerClient } from "@/managerClient";

type GetActiveEnvironmentReturnType =
  | {
      activeEnvironment: Environment;
      error?: undefined;
    }
  | {
      activeEnvironment?: undefined;
      error: unknown;
    };

export async function getActiveEnvironment(): Promise<GetActiveEnvironmentReturnType> {
  try {
    const { activeEnvironment } =
      await managerClient.project.fetchActiveEnvironment();

    return { activeEnvironment };
  } catch (error) {
    if (isInvalidActiveEnvironmentError(error)) {
      // Reset to the production environment.
      await managerClient.project.updateEnvironment({ environment: undefined });

      return await getActiveEnvironment();
    }

    return { error };
  }
}
