import { useRequest } from "@prismicio/editor-support/Suspense";

import { managerClient } from "@/managerClient";

async function getSliceMachineRunningVersion() {
  const sliceMachineRunningVersion =
    await managerClient.versions.getRunningSliceMachineVersion();

  return sliceMachineRunningVersion;
}

export function useSliceMachineRunningVersion() {
  return useRequest(getSliceMachineRunningVersion, []);
}
