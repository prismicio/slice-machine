import { revalidateData } from "@prismicio/editor-support/Suspense";
import { useSliceMachineConfig } from "@src/hooks/useSliceMachineConfig";
import { managerClient } from "@src/managerClient";

import { GitRepoSpecifier } from "./types";
import { getHasWriteAPIToken } from "./useHasWriteAPIToken";

export const useWriteAPITokenActions = (args: { git: GitRepoSpecifier }) => {
  const [config] = useSliceMachineConfig();

  return {
    updateToken: async (token: string) => {
      await managerClient.git.updateWriteAPIToken({
        prismic: { domain: config.repositoryName },
        git: args.git,
        token,
      });

      revalidateData(getHasWriteAPIToken, [
        config.repositoryName,
        args.git.provider,
        args.git.owner,
        args.git.name,
      ]);
    },
    deleteToken: async () => {
      await managerClient.git.deleteWriteAPIToken({
        prismic: { domain: config.repositoryName },
        git: args.git,
      });

      revalidateData(getHasWriteAPIToken, [
        config.repositoryName,
        args.git.provider,
        args.git.owner,
        args.git.name,
      ]);
    },
  };
};
