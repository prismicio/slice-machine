import { FC } from "react";

import { RightElement } from "@/components/SideNav";
import { useSliceMachineRunningVersion } from "@/hooks/useSliceMachineRunningVersion";

export const RunningVersion: FC = () => {
  const sliceMachineRunningVersion = useSliceMachineRunningVersion();

  return (
    <RightElement data-testid="slicemachine-version">
      v{sliceMachineRunningVersion}
    </RightElement>
  );
};
