import { Text } from "@prismicio/editor-ui";

import { useSliceMachineRunningVersion } from "@/hooks/useSliceMachineRunningVersion";

export function SliceMachineVersion() {
  const sliceMachineRunningVersion = useSliceMachineRunningVersion();

  return (
    <Text
      variant="small"
      color="grey11"
      noWrap
      data-testid="slicemachine-version"
    >
      v{sliceMachineRunningVersion}
    </Text>
  );
}
