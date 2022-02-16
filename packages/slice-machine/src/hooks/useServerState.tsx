import { useEffect } from "react";

import ServerState from "@lib/models/server/ServerState";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";

const useServerState = (serverState: ServerState) => {
  const { getState } = useSliceMachineActions();

  useEffect(() => {
    getState(serverState);
  }, [
    serverState.env,
    serverState.warnings,
    serverState.configErrors,
    serverState.customTypes,
    serverState.remoteCustomTypes,
    serverState.libraries,
  ]);

  return;
};

export default useServerState;
