import { useRequest } from "@prismicio/editor-support/Suspense";

import { managerClient } from "@/managerClient";

async function getIsUpdateAvailable() {
  const [sliceMachineUpdateAvailable, adapterUpdateAvailable] =
    await Promise.all([
      managerClient.versions.checkIsSliceMachineUpdateAvailable(),
      managerClient.versions.checkIsAdapterUpdateAvailable(),
    ]);

  return { sliceMachineUpdateAvailable, adapterUpdateAvailable };
}

export function useUpdateAvailable() {
  return useRequest(getIsUpdateAvailable, []);
}
