import { useRequest } from "@prismicio/editor-support/Suspense";

import { managerClient } from "@/managerClient";

async function getSliceMachineLatestNonBreakingVersion() {
  const latestNonBreakingVersion =
    await managerClient.versions.getLatestNonBreakingSliceMachineVersion();

  return latestNonBreakingVersion;
}

export function useSliceMachineLatestNonBreakingVersion() {
  return useRequest(getSliceMachineLatestNonBreakingVersion, []);
}
