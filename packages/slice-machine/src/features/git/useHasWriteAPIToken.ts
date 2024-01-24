import { useRequest } from "@prismicio/editor-support/Suspense";
import { useSliceMachineConfig } from "@src/hooks/useSliceMachineConfig";
import { managerClient } from "@src/managerClient";

import { GitRepoSpecifier } from "./types";

export const getHasWriteAPIToken = async (
  prismicDomain: string,
  gitProvider: "gitHub",
  gitOwner: string,
  gitName: string,
): Promise<boolean> => {
  return await managerClient.git.checkHasWriteAPIToken({
    prismic: {
      domain: prismicDomain,
    },
    git: {
      provider: gitProvider,
      owner: gitOwner,
      name: gitName,
    },
  });
};

export const useHasWriteAPIToken = (args: { git: GitRepoSpecifier }) => {
  const [config] = useSliceMachineConfig();

  return useRequest(getHasWriteAPIToken, [
    config.repositoryName,
    args.git.provider,
    args.git.owner,
    args.git.name,
  ]);
};
