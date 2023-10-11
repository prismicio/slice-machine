import { useRequest, updateData } from "@prismicio/editor-support/Suspense";
import type { SliceMachineConfig } from "@slicemachine/manager";

import { managerClient } from "@src/managerClient";

export function useSliceMachineConfig(): SliceMachineConfig {
  return useRequest(readSliceMachineConfig, []);
}

export async function writeSliceMachineConfig(config: SliceMachineConfig) {
  await managerClient.project.writeSliceMachineConfig({ config });

  updateData(readSliceMachineConfig, [], config);
}

async function readSliceMachineConfig(): Promise<SliceMachineConfig> {
  return managerClient.project.getSliceMachineConfig();
}
