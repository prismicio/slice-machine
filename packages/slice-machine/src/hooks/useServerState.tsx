import { useEffect } from "react";

import { ServerState } from "@lib/models/server/ServerState";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";

const useServerState = (serverState: ServerState | undefined) => {
  const { getEnvironment } = useSliceMachineActions();

  useEffect(() => getEnvironment(serverState), [serverState]);

  return;
};

export default useServerState;
