import { useEffect, useCallback } from "react";
import * as Sentry from "@sentry/nextjs";
import useSwr from "swr";

import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import ServerState from "@lib/models/server/ServerState";
import { getState } from "@src/apiClient";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverState, handleRefreshState]);

  return;
};

export default useServerState;
