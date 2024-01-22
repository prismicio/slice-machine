import { useRequest } from "@prismicio/editor-support/Suspense";
import { managerClient } from "@src/managerClient";

const getUser = async () => {
  const isLoggedIn = await managerClient.user.checkIsLoggedIn();

  return {
    isLoggedIn,
  };
};

export const useUser = () => {
  return useRequest(getUser, []);
};
