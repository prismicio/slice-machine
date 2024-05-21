import { revalidateData, useRequest } from "@prismicio/editor-support/Suspense";
import type { GitRepoSpecifier } from "@slicemachine/manager";

import { useSliceMachineConfig } from "@/hooks/useSliceMachineConfig";
import { managerClient } from "@/managerClient";

type UseLinkedGitReposReturnType = {
  linkedGitRepos: GitRepoSpecifier[];
  linkRepo: (git: GitRepoSpecifier) => Promise<void>;
  unlinkRepo: (git: GitRepoSpecifier) => Promise<void>;
};

export function useLinkedGitRepos(): UseLinkedGitReposReturnType {
  const [config] = useSliceMachineConfig();
  const linkedGitRepos = useRequest(getLinkedGitRepos, [config.repositoryName]);
  return {
    linkedGitRepos,
    linkRepo: async (git) => {
      await managerClient.git.linkRepo({
        prismic: { domain: config.repositoryName },
        git,
      });
      await revalidateData(getLinkedGitRepos, [config.repositoryName]);
    },
    unlinkRepo: async (git) => {
      await managerClient.git.unlinkRepo({
        prismic: { domain: config.repositoryName },
        git,
      });
      await revalidateData(getLinkedGitRepos, [config.repositoryName]);
    },
  };
}

async function getLinkedGitRepos(
  prismicDomain: string,
): Promise<GitRepoSpecifier[]> {
  return await managerClient.git.fetchLinkedRepos({
    prismic: { domain: prismicDomain },
  });
}
