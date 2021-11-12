import React, { useEffect } from "react";

import { ServerState } from "@lib/models/server/ServerState";
import { useDispatch } from "react-redux";
import { getEnvironmentCreator } from "@src/modules/environment";

type StateProviderProps = {
  serverState: ServerState;
};

export const StateDispatcher = React.createContext({});

const StateProvider: React.FunctionComponent<StateProviderProps> = ({
  children,
  serverState,
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      getEnvironmentCreator({
        env: serverState.env,
        warnings: serverState.warnings,
        configErrors: serverState.configErrors,
      })
    );
  }, [serverState]);

  return <>{children}</>;
};

export default StateProvider;
