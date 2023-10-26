import { useEffect, useCallback } from "react";
import * as Sentry from "@sentry/nextjs";
import { useSelector } from "react-redux";
import useSwr from "swr";

import { hasLocal } from "@lib/models/common/ModelData";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { isSelectedSliceTouched } from "@src/modules/selectedSlice/selectors";
import { isSelectedCustomTypeTouched } from "@src/modules/selectedCustomType";
import { SliceMachineStoreType } from "@src/redux/type";
import ServerState from "@lib/models/server/ServerState";
import { getState } from "@src/apiClient";

const useServerState = () => {
  const { refreshState, initSliceStore, initCustomTypeStore } =
    useSliceMachineActions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleRefreshState = useCallback(refreshState, []);
  const { data: serverState } = useSwr<ServerState>("getState", async () => {
    return await getState();
  });

  // Whether or not current slice or custom type builder is touched, and its related server state.
  const {
    selectedSlice,
    sliceIsTouched,
    selectedCustomType,
    customTypeIsTouched,
  } = useSelector((store: SliceMachineStoreType) => ({
    selectedSlice: store.selectedSlice,
    sliceIsTouched: isSelectedSliceTouched(
      store,
      store.selectedSlice?.from ?? "",
      store.selectedSlice?.model.id ?? "",
    ),
    selectedCustomType: Boolean(store.selectedCustomType?.initialModel.id)
      ? store.availableCustomTypes[
          store.selectedCustomType?.initialModel.id ?? ""
        ]
      : null,
    customTypeIsTouched: isSelectedCustomTypeTouched(store),
  }));

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

      // If custom type builder is untouched, update from server state.
      if (
        selectedCustomType &&
        hasLocal(selectedCustomType) &&
        !customTypeIsTouched
      ) {
        const serverCustomType = serverState.customTypes.find(
          (customType) => customType.id === selectedCustomType.local.id,
        );

        if (serverCustomType) {
          const remoteCustomType = serverState.remoteCustomTypes.find(
            (customType) => customType.id === selectedCustomType.local.id,
          );

          initCustomTypeStore(serverCustomType, remoteCustomType);
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
