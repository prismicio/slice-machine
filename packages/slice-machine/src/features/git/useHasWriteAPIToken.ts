import { useRequest } from "@prismicio/editor-support/Suspense";
import { useSliceMachineConfig } from "@src/hooks/useSliceMachineConfig";
import { managerClient } from "@src/managerClient";

import { GitRepoSpecifier, PrismicRepoSpecifier } from "./types";

export const getHasWriteAPIToken = async (args: {
  prismic: PrismicRepoSpecifier;
  git: GitRepoSpecifier;
}): Promise<boolean> => {
  return await managerClient.git.checkHasWriteAPIToken(args);
};

export const useHasWriteAPIToken = (args: { git: GitRepoSpecifier }) => {
  const [config] = useSliceMachineConfig();

  return useRequest(getHasWriteAPIToken, [
    {
      prismic: { domain: config.repositoryName },
      git: args.git,
    },
  ]);
};
