import { useEffect, useCallback } from "react";

import ServerState from "@lib/models/server/ServerState";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { getState } from "@src/apiClient";
import useSwr from "swr";
import * as Sentry from "@sentry/nextjs";

const useServerState = () => {
  const { refreshState } = useSliceMachineActions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleRefreshState = useCallback(refreshState, []);
  const { data: serverState } = useSwr<ServerState>("getState", async () => {
    return await getState();
  });

  useEffect(() => {
    let canceled = false;
    if (serverState && !canceled) {
      handleRefreshState(serverState);

      Sentry.setUser({ id: serverState.env.shortId });
      Sentry.setTag("repository", serverState.env.repo);
      Sentry.setContext("Repository Data", {
        name: serverState.env.repo,
      });
    }

    return () => {
      canceled = true;
    };
  }, [serverState, handleRefreshState]);

  return;
};

export default useServerState;
