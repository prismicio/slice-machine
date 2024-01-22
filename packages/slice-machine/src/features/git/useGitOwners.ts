import { useRequest } from "@prismicio/editor-support/Suspense";
import { managerClient } from "@src/managerClient";

const getGitOwners = async () => {
  return await managerClient.git.fetchOwners();
};

export const useGitOwners = () => {
  return useRequest(getGitOwners, []);
};
