import { useEffect } from "react";

import ServerState from "@lib/models/server/ServerState";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import useSwr from "swr";
import axios, { AxiosResponse } from "axios";

const fetcher = (url: string): unknown =>
  axios.get(url).then((res: AxiosResponse<unknown>) => res.data);

const useServerState = () => {
  const { refreshState } = useSliceMachineActions();
  const { data: serverState } = useSwr<ServerState>("/api/state", fetcher);

  useEffect(() => {
    if (!serverState) {
      return;
    }

    refreshState(serverState);
  }, [serverState]);

  return;
};

export default useServerState;
