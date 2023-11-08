import { useRequest } from "@prismicio/editor-support/Suspense";

import { managerClient } from "@src/managerClient";

async function getRepositoryName(): ReturnType<
  typeof managerClient.project.getRepositoryName
> {
  return await managerClient.project.getRepositoryName();
}

export function useRepositoryName() {
  const repositoryName = useRequest(getRepositoryName, []);

  return repositoryName;
}
