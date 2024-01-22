import { useRequest } from "@prismicio/editor-support/Suspense";
import { managerClient } from "@src/managerClient";

type PrismicRepoSpecifier = {
  domain: string;
};

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

export const useLinkedGitRepos = (args: { prismic: PrismicRepoSpecifier }) => {
  return useRequest(getLinkedGitRepos, [args]);
};
