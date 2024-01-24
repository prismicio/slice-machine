import { useRequest } from "@prismicio/editor-support/Suspense";
import { managerClient } from "@src/managerClient";

async function getGitRepos(
  provider?: "gitHub",
  owner?: string,
  query?: string,
  page?: number,
) {
  if (provider === undefined || owner === undefined) {
    return;
  }

  return await managerClient.git.fetchRepos({ provider, owner, query, page });
}

export const useGitRepos = (
  args?: Parameters<typeof managerClient.git.fetchRepos>[0],
) => {
  return useRequest(getGitRepos, [
    args?.provider,
    args?.owner,
    args?.query,
    args?.page,
  ]);
};
