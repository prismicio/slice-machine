import { useEffect } from "react";

// import ServerState from "@lib/models/server/ServerState";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import useSwr from "swr";
// import axios, { AxiosResponse } from "axios";
import { managerClient } from "@src/managerClient";

// const fetcher = (url: string): Promise<ServerState> =>
//   axios.get(url).then((res: AxiosResponse<ServerState>) => res.data);

const useServerState = () => {
  const { refreshState } = useSliceMachineActions();
  const { data: serverState } = useSwr("getState", async () => {
    return await managerClient.getState();
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
