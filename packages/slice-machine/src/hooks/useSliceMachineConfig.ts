import { useRequest, revalidateData } from "@prismicio/editor-support/Suspense";
import type { SliceMachineConfig } from "@slicemachine/manager";

import { managerClient } from "@src/managerClient";

export function useSliceMachineConfig(): SliceMachineConfig {
  return useRequest(readSliceMachineConfig, []);
}

export async function writeSliceMachineConfig(args: {
  config: SliceMachineConfig;
  skipRevalidation?: boolean;
}) {
  await managerClient.project.writeSliceMachineConfig({ config: args.config });

  (args.skipRevalidation ?? false) ||
    revalidateData(readSliceMachineConfig, []);
}

async function readSliceMachineConfig(): Promise<SliceMachineConfig> {
  return managerClient.project.getSliceMachineConfig();
}
