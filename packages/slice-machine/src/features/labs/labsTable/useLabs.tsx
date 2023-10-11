import { SliceMachineConfig } from "@slicemachine/manager";

import { useSliceMachineConfig } from "@src/hooks/useSliceMachineConfig";

export function useLabs(): Required<SliceMachineConfig>["labs"] {
  return useSliceMachineConfig().labs ?? {};
}

export function useLab(key: keyof Required<SliceMachineConfig>["labs"]): {
  enabled: boolean;
} {
  return { enabled: useLabs()[key] ?? false };
}
