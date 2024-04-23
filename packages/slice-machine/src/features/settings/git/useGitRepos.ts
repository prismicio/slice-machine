import { useRequest } from "@prismicio/editor-support/Suspense";
import type { GitRepo } from "@slicemachine/manager";

import { managerClient } from "@/managerClient";

type UseGitReposArgs = Parameters<typeof managerClient.git.fetchRepos>[0];

export function useGitRepos(args: UseGitReposArgs): GitRepo[] {
  return useRequest(getGitRepos, [
    args.provider,
    args.owner,
    args.query,
    args.page,
  ]);
}

async function getGitRepos(
  provider: "gitHub",
  owner: string,
  query?: string,
  page?: number,
): Promise<GitRepo[]> {
  return await managerClient.git.fetchRepos({ provider, owner, query, page });
}
