import { FC } from "react";

import { RightElement } from "@src/components/SideNav";
import { useSliceMachineRunningVersion } from "@src/hooks/useSliceMachineRunningVersion";

export const RunningVersion: FC = () => {
  const sliceMachineRunningVersion = useSliceMachineRunningVersion();

  return (
    <RightElement data-testid="slicemachine-version">
      v{sliceMachineRunningVersion}
    </RightElement>
  );
};
