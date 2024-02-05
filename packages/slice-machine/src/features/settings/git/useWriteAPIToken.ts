import type { GitRepoSpecifier } from "@slicemachine/manager";

import { useSliceMachineConfig } from "@src/hooks/useSliceMachineConfig";
import { managerClient } from "@src/managerClient";

type UseWriteAPITokenReturnType = {
  updateToken: (token: string) => Promise<void>;
  deleteToken: () => Promise<void>;
};

export function useWriteAPIToken(args: {
  git: GitRepoSpecifier;
}): UseWriteAPITokenReturnType {
  const [config] = useSliceMachineConfig();
  return {
    updateToken: async (token) => {
      await managerClient.git.updateWriteAPIToken({
        prismic: { domain: config.repositoryName },
        git: args.git,
        token,
      });
    },
    deleteToken: async () => {
      await managerClient.git.deleteWriteAPIToken({
        prismic: { domain: config.repositoryName },
        git: args.git,
      });
    },
  };
}
