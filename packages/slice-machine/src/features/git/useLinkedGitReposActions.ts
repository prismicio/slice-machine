import { revalidateData } from "@prismicio/editor-support/Suspense";
import { managerClient } from "@src/managerClient";

import { getLinkedGitRepos } from "./useLinkedGitRepos";

type PrismicRepoSpecifier = {
  domain: string;
};
type GitRepoSpecifier = {
  provider: "gitHub";
  owner: string;
  name: string;
};

export const useLinkedGitReposActions = (args: {
  prismic: PrismicRepoSpecifier;
}) => {
  return {
    linkRepo: async (git: GitRepoSpecifier) => {
      await managerClient.git.linkRepo({
        prismic: { domain: args.prismic.domain },
        git,
      });

      revalidateData(getLinkedGitRepos, [args]);
    },
    unlinkRepo: async (git: GitRepoSpecifier) => {
      await managerClient.git.unlinkRepo({
        prismic: { domain: args.prismic.domain },
        git,
      });

      revalidateData(getLinkedGitRepos, [args]);
    },
  };
};
