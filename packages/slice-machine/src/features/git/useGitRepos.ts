import { useRequest } from "@prismicio/editor-support/Suspense";
import { managerClient } from "@src/managerClient";

type UseGitReposArgs = Parameters<typeof managerClient.git.fetchRepos>[0];

const getGitRepos = async (args?: UseGitReposArgs) => {
  if (!args) {
    return;
  }

  return await managerClient.git.fetchRepos(args);
};

export const useGitRepos = (args?: UseGitReposArgs) => {
  return useRequest(getGitRepos, [args]);
};
