import { useEffect } from "react";

import useSliceMachineActions from "@src/modules/useSliceMachineActions";

export const useChangelog = () => {
  const { getChangelog } = useSliceMachineActions();

  useEffect(() => {
    getChangelog();
  }, []);
};
