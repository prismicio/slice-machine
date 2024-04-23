import { updateData, useRequest } from "@prismicio/editor-support/Suspense";
import type { SliceMachineConfig } from "@slicemachine/manager";

import { managerClient } from "@/managerClient";

type UseSliceMachineConfigReturnType = [
  config: SliceMachineConfig,
  setConfig: (config: SliceMachineConfig) => Promise<void>,
];

export function useSliceMachineConfig(): UseSliceMachineConfigReturnType {
  const config = useRequest(readSliceMachineConfig, []);

  const setConfig = async (config: SliceMachineConfig) => {
    await managerClient.project.writeSliceMachineConfig({ config });
    updateData(readSliceMachineConfig, [], config);
  };

  return [config, setConfig];
}

async function readSliceMachineConfig(): Promise<SliceMachineConfig> {
  return managerClient.project.getSliceMachineConfig();
}
