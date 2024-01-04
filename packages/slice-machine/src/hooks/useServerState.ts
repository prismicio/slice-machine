import { useEffect, useCallback } from "react";
import * as Sentry from "@sentry/nextjs";
import { useSelector } from "react-redux";
import useSwr from "swr";

import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { isSelectedSliceTouched } from "@src/modules/selectedSlice/selectors";
import { SliceMachineStoreType } from "@src/redux/type";
import ServerState from "@lib/models/server/ServerState";
import { getState } from "@src/apiClient";

const useServerState = () => {
  const { refreshState, initSliceStore } = useSliceMachineActions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleRefreshState = useCallback(refreshState, []);
  const { data: serverState } = useSwr<ServerState>("getState", async () => {
    return await getState();
  });

  // Whether or not current slice or custom type builder is touched, and its related server state.
  const { selectedSlice, sliceIsTouched } = useSelector(
    (store: SliceMachineStoreType) => ({
      selectedSlice: store.selectedSlice,
      sliceIsTouched: isSelectedSliceTouched(
        store,
        store.selectedSlice?.from ?? "",
        store.selectedSlice?.model.id ?? "",
      ),
    }),
  );

  useEffect(() => {
    let canceled = false;
    if (serverState && !canceled) {
      // If slice builder is untouched, update from server state.
      if (selectedSlice && !sliceIsTouched) {
        const serverSlice = serverState.libraries
          .find((l) => l.name === selectedSlice?.from)
          ?.components.find((c) => c.model.id === selectedSlice?.model.id);

        if (serverSlice) {
          initSliceStore(serverSlice);
        }
      }

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
