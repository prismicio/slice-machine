import { useEffect } from "react";

import ServerState from "@lib/models/server/ServerState";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";

const useServerState = (serverState: ServerState) => {
  const { getEnvironment } = useSliceMachineActions();

  useEffect(() => {
    getEnvironment(serverState);
  }, [serverState.env, serverState.warnings, serverState.configErrors]);

  return;
};

export default useServerState;
