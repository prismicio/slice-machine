import { useMemo } from "react";
import { revalidateData, useRequest } from "@prismicio/editor-support/Suspense";
import {
  Environment,
  isPluginError,
  // isUnauthenticatedError,
  // isUnauthorizedError,
} from "@slicemachine/manager/client";

import { managerClient } from "@src/managerClient";
import { buildActiveEnvironmentFallback } from "@src/domain/environment";

async function getEnvironments(): Promise<Environment[] | undefined> {
  return await Promise.resolve([
    {
      name: "Production",
      domain: "example-prismic-repo",
      kind: "prod",
      users: [],
    },
    {
      name: "Staging",
      domain: "example-prismic-repo-staging",
      kind: "stage",
      users: [],
    },
    {
      name: "Development",
      domain: "example-prismic-repo-development",
      kind: "dev",
      users: [],
    },
  ]);

  // TODO: Uncomment once the environments endpoint is deployed.
  // try {
  //   return await managerClient.prismicRepository.fetchEnvironments();
  // } catch (error) {
  //   if (isUnauthenticatedError(error) || isUnauthorizedError(error)) {
  //     return undefined;
  //   }
  //
  //   throw error;
  // }
}

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

async function getRepositoryName(): ReturnType<
  typeof managerClient.project.getRepositoryName
> {
  return await managerClient.project.getRepositoryName();
}

async function setEnvironment(
  environment: Pick<Environment, "domain">,
): Promise<void> {
  await managerClient.project.updateEnvironment({
    environment: environment.domain,
  });
  revalidateData(getActiveEnvironmentDomain, []);
}

export function useEnvironments() {
  const environments = useRequest(getEnvironments, []);
  const activeEnvironmentDomain = useRequest(getActiveEnvironmentDomain, []);
  const repositoryName = useRequest(getRepositoryName, []);

  const activeEnvironment = useMemo(
    () =>
      environments?.find(
        (environment) => environment.domain === activeEnvironmentDomain,
      ) ??
      buildActiveEnvironmentFallback({
        activeEnvironmentDomain,
        productionEnvironmentDomain: repositoryName,
      }),
    [environments, activeEnvironmentDomain, repositoryName],
  );

  return useMemo(
    () => ({
      environments,
      activeEnvironment,
      activeEnvironmentDomain,
      setEnvironment,
    }),
    [environments, activeEnvironment, activeEnvironmentDomain],
  );
}
