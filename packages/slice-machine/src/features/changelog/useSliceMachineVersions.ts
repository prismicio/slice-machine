import { useRequest } from "@prismicio/editor-support/Suspense";
import type { Version } from "@slicemachine/manager";

import { managerClient } from "@/managerClient";

async function getSliceMachineVersions(): Promise<Version[]> {
  const sliceMachineVersions =
    await managerClient.versions.getAllStableSliceMachineVersionsWithKind();

  return sliceMachineVersions;
}

export function useSliceMachineVersions() {
  return useRequest(getSliceMachineVersions, []);
}
