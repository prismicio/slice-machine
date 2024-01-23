import { useRequest } from "@prismicio/editor-support/Suspense";
import { useSliceMachineConfig } from "@src/hooks/useSliceMachineConfig";
import { managerClient } from "@src/managerClient";

import { PrismicRepoSpecifier } from "./types";

type UseLinkedGitReposReturnType =
  | {
      repos: Awaited<
        ReturnType<(typeof managerClient)["git"]["fetchLinkedRepos"]>
      >;
    }
  | { error: unknown };

export const getLinkedGitRepos = async (args: {
  prismic: PrismicRepoSpecifier;
}): Promise<UseLinkedGitReposReturnType> => {
  try {
    const repos = await managerClient.git.fetchLinkedRepos(args);

    return { repos };
  } catch (error) {
    return { error };
  }
};

export const useLinkedGitRepos = () => {
  const [config] = useSliceMachineConfig();

  return useRequest(getLinkedGitRepos, [
    { prismic: { domain: config.repositoryName } },
  ]);
};
