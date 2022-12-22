import { useEffect, useCallback } from "react";

import ServerState from "@lib/models/server/ServerState";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import useSwr from "swr";
import axios, { AxiosResponse } from "axios";
import * as Sentry from "@sentry/nextjs";

const fetcher = (url: string): Promise<ServerState> =>
  axios.get(url).then((res: AxiosResponse<ServerState>) => res.data);

const useServerState = () => {
  const { refreshState } = useSliceMachineActions();
  const handleRefreshState = useCallback(refreshState, []);
  const { data: serverState } = useSwr<ServerState>("/api/state", fetcher);

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
