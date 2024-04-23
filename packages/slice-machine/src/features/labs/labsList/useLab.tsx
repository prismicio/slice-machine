import type { SliceMachineConfig } from "@slicemachine/manager";

import { useSliceMachineConfig } from "@/hooks/useSliceMachineConfig";

export type UseLabArgs = keyof Required<SliceMachineConfig>["labs"];

export type UseLabReturnType = [
  lab: { enabled: boolean },
  setLab: (enabled: boolean) => Promise<void>,
];

export function useLab(key: UseLabArgs): UseLabReturnType {
  const [config, setConfig] = useSliceMachineConfig();

  const setLab = async (enabled: boolean) => {
    const updatedConfig = { ...config, labs: { ...config.labs } };

    if (enabled) {
      updatedConfig.labs[key] = enabled;
    } else if (key in updatedConfig.labs) {
      delete updatedConfig.labs[key];
    }

    if (Object.keys(updatedConfig.labs).length === 0) {
      delete (updatedConfig as SliceMachineConfig).labs;
    }

    await setConfig(updatedConfig);
  };

  return [{ enabled: config?.labs?.[key] ?? false }, setLab];
}
