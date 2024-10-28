import { Text, useMediaQuery } from "@prismicio/editor-ui";

import { useSliceMachineRunningVersion } from "@/hooks/useSliceMachineRunningVersion";

export function SliceMachineVersion() {
  const sliceMachineRunningVersion = useSliceMachineRunningVersion();
  const isCollapsed = useMediaQuery({ max: "medium" });

  if (isCollapsed) {
    return null;
  }

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
