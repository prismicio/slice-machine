import { useRequest } from "@prismicio/editor-support/Suspense";

import { managerClient } from "@/managerClient";

async function getAdapterName() {
  try {
    return await managerClient.project.getAdapterName();
  } catch (e) {
    throw new Error("Error while trying to get adapter name");
  }
}

export function useAdapterName(): string {
  return useRequest(getAdapterName, []);
}
