import { useRequest } from "@prismicio/editor-support/Suspense";
import type { GitOwner } from "@slicemachine/manager";

import { managerClient } from "@/managerClient";

export function useGitOwners(): GitOwner[] {
  return useRequest(getGitOwners, []);
}

async function getGitOwners(): Promise<GitOwner[]> {
  return await managerClient.git.fetchOwners();
}
