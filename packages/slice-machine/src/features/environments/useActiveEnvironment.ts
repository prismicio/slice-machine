import { useRequest } from "@prismicio/editor-support/Suspense";
import { Environment } from "@slicemachine/manager/client";

import { managerClient } from "@src/managerClient";

import { useEnvironments } from "./useEnvironments";

export async function getActiveEnvironment() {
  try {
    const { environment } = await managerClient.project.readEnvironment();

    return { activeEnvironment: environment, error: undefined };
  } catch (error) {
    return { activeEnvironment: undefined, error };
  }
}

export function useActiveEnvironment():
  | {
      activeEnvironment: Environment;
      error: undefined;
    }
  | {
      activeEnvironment: undefined;
      error: unknown;
    } {
  const { environments, error: useEnvironmentsError } = useEnvironments();
  const {
    activeEnvironment: activeEnvironmentDomain,
    error: useActiveEnvironmentDomainError,
  } = useRequest(getActiveEnvironment, []);

  if (useEnvironmentsError !== undefined) {
    return {
      activeEnvironment: undefined,
      error: useEnvironmentsError,
    };
  }

  if (useActiveEnvironmentDomainError !== undefined) {
    return {
      activeEnvironment: undefined,
      error: useActiveEnvironmentDomainError,
    };
  }

  const activeEnvironment = environments?.find((environment) => {
    if (activeEnvironmentDomain === undefined) {
      return environment.kind === "prod";
    }

    return environment.domain === activeEnvironmentDomain;
  });

  if (!activeEnvironment) {
    return {
      activeEnvironment: undefined,
      error: new Error(
        `The active environment (${
          activeEnvironmentDomain ?? "Production"
        }) does not match one of the repository's environments.`,
      ),
    };
  }

  return {
    activeEnvironment,
    error: undefined,
  };
}
