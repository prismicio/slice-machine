import { useEffect } from "react";

import { ServerState } from "@lib/models/server/ServerState";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";

const useServerState = (serverState: ServerState | undefined) => {
  const { getEnvironment, getCustomTypes } = useSliceMachineActions();

  useEffect(() => {
    if (!serverState) return;

    if (serverState.customTypes && serverState.remoteCustomTypes) {
      getCustomTypes(serverState.customTypes, serverState.remoteCustomTypes);
    }
  }, [serverState?.customTypes, serverState?.remoteCustomTypes]);

  useEffect(() => {
    if (!serverState) return;

    getEnvironment(serverState);
  }, [serverState?.env, serverState?.configErrors, serverState?.warnings]);

  return;
};

export default useServerState;
