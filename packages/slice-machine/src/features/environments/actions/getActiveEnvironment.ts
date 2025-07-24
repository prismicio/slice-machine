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

export async function getActiveEnvironment(
  isRetry = false,
): Promise<GetActiveEnvironmentReturnType> {
  try {
    const { activeEnvironment, error } =
      await managerClient.project.fetchActiveEnvironment();

    if (error) {
      const errorInstance = new Error(error.message);
      errorInstance.name = error.name;
      throw errorInstance;
    }

    return { activeEnvironment };
  } catch (error) {
    if (isInvalidActiveEnvironmentError(error) && !isRetry) {
      // Reset to the production environment.
      await managerClient.project.updateEnvironment({ environment: undefined });

      // Call recursively with isRetry=true to prevent infinite loop if it fails again and again.
      return await getActiveEnvironment(true);
    }

    return { error };
  }
}
