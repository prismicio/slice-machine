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
  retried = false,
): Promise<GetActiveEnvironmentReturnType> {
  try {
    const activeEnvironmentResult =
      await managerClient.project.fetchActiveEnvironment();

    if (activeEnvironmentResult.type === "error") {
      const errorInstance = new Error(activeEnvironmentResult.error.message);
      errorInstance.name = activeEnvironmentResult.error.name;
      throw errorInstance;
    }

    return { activeEnvironment: activeEnvironmentResult.activeEnvironment };
  } catch (error) {
    if (isInvalidActiveEnvironmentError(error) && !retried) {
      // Reset to the production environment.
      await managerClient.project.updateEnvironment({ environment: undefined });

      // Call recursively with isRetry=true to prevent infinite loop if it fails again and again.
      return await getActiveEnvironment(true);
    }

    return { error };
  }
}
