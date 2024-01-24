import { useRequest } from "@prismicio/editor-support/Suspense";
import { useSliceMachineConfig } from "@src/hooks/useSliceMachineConfig";
import { managerClient } from "@src/managerClient";

type UseLinkedGitReposReturnType =
  | {
      repos: Awaited<
        ReturnType<(typeof managerClient)["git"]["fetchLinkedRepos"]>
      >;
    }
  | { error: unknown };

export const getLinkedGitRepos = async (
  prismicDomain: string,
): Promise<UseLinkedGitReposReturnType> => {
  try {
    const repos = await managerClient.git.fetchLinkedRepos({
      prismic: { domain: prismicDomain },
    });

    return { repos };
  } catch (error) {
    return { error };
  }
};

export const useLinkedGitRepos = () => {
  const [config] = useSliceMachineConfig();

  return useRequest(getLinkedGitRepos, [config.repositoryName]);
};
