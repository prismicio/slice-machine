import { useRequest } from "@prismicio/editor-support/Suspense";

import { getActiveEnvironmentDomain } from "./actions/getActiveEnvironmentDomain";
import { useEnvironments } from "./useEnvironments";

export function useActiveEnvironment() {
  const { environments, error: useEnvironmentsError } = useEnvironments();
  const { activeEnvironmentDomain, error: getActiveEnvironmentError } =
    useRequest(getActiveEnvironmentDomain, []);

  if (useEnvironmentsError !== undefined) {
    return { error: useEnvironmentsError };
  }

  if (getActiveEnvironmentError !== undefined) {
    return { error: getActiveEnvironmentError };
  }

  const activeEnvironment = environments?.find((environment) => {
    if (activeEnvironmentDomain === undefined) {
      return environment.kind === "prod";
    }

    return environment.domain === activeEnvironmentDomain;
  });

  if (!activeEnvironment) {
    return {
      error: new Error(
        `The active environment (${
          activeEnvironmentDomain ?? "Production"
        }) does not match one of the repository's environments.`,
      ),
    };
  }

  return { activeEnvironment };
}
