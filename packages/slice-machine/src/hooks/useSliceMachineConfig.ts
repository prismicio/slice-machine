import { SliceMachineConfig } from "@slicemachine/manager";
import { managerClient } from "@src/managerClient";

import { useRequest } from "@prismicio/editor-support/Suspense";

async function getSliceMachineConfig() {
  try {
    return await managerClient.project.getSliceMachineConfig();
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export function useSliceMachineConfig(): SliceMachineConfig | undefined {
  return useRequest(getSliceMachineConfig, []);
}
