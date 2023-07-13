import { managerClient } from "@src/managerClient";

import { useRequest } from "@prismicio/editor-support/Suspense";

async function getAdapterName() {
  try {
    return await managerClient.project.getAdapterName();
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export function useAdapterName(): string | undefined {
  return useRequest(getAdapterName, []);
}
