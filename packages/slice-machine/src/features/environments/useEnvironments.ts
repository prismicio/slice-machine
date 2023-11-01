import { useRequest } from "@prismicio/editor-support/Suspense";
// import { isUnauthenticatedError } from "@slicemachine/manager/client";
//
import { managerClient } from "@src/managerClient";

async function getEnvironments(): Promise<
  Awaited<ReturnType<typeof managerClient.prismicRepository.fetchEnvironments>>
> {
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
  //   if (isUnauthenticatedError(error)) {
  //     return [];
  //   }
  //
  //   throw error;
  // }
}

export function useEnvironments() {
  const environments = useRequest(getEnvironments, []);

  return environments;
}
