import { useRequest } from "@prismicio/editor-support/Suspense";

import { managerClient } from "@src/managerClient";

type User = { isLoggedIn: boolean };

export function useUser(): User {
  return useRequest(getUser, []);
}

async function getUser(): Promise<User> {
  const isLoggedIn = await managerClient.user.checkIsLoggedIn();
  return { isLoggedIn };
}
