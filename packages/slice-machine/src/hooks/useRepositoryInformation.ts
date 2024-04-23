import { getApiEndpoint, getRepoName } from "@src/modules/environment";
import { SliceMachineStoreType } from "@src/redux/type";
import { useSelector } from "react-redux";

// TODO: This hook should be extracted to a new manager endpoint
export function useRepositoryInformation() {
  const { repositoryName, apiEndpoint } = useSelector(
    (store: SliceMachineStoreType) => ({
      repositoryName: getRepoName(store),
      apiEndpoint: getApiEndpoint(store),
    }),
  );
  const repositoryDomain = new URL(apiEndpoint).hostname.replace(".cdn", "");
  const repositoryUrl = apiEndpoint
    .replace(".cdn.", ".")
    .replace("/api/v2", "");

  return {
    repositoryName,
    repositoryDomain,
    repositoryUrl,
  };
}
