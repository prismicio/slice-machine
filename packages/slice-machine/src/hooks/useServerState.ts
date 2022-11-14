import { useEffect } from "react";

import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import useSwr from "swr";
import { getState } from "@src/apiClient";

const useServerState = () => {
  const { refreshState } = useSliceMachineActions();
  const { data: serverState } = useSwr("getState", async () => {
    return await getState();
  });

  useEffect(() => {
    if (!serverState) {
      return;
    }

    refreshState(serverState);
  }, [serverState]);

  return;
};

export default useServerState;
