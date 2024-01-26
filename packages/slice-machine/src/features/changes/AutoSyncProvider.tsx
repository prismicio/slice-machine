import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";

import {
  getChanges,
  getModelStatus,
  getUnSyncChanges,
  useUnSyncChanges,
} from "@src/hooks/useUnSyncChanges";
import { AuthStatus } from "@src/modules/userContext/types";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { useStableCallback } from "@prismicio/editor-support/React";
import { normalizeFrontendSlices } from "@lib/models/common/normalizers/slices";
import { normalizeFrontendCustomTypes } from "@lib/models/common/normalizers/customType";
import { useMountEffect } from "@src/hooks/useMountEffect";
import { usePrevious } from "@src/hooks/usePrevious";
import { getState } from "@src/apiClient";

import { useAutoSave } from "../autoSave/useAutoSave";
import { pushChanges } from "./actions/pushChanges";

type AutoSyncContext = {
  autoSyncStatus: string;
  syncChanges: () => void;
};

const AutoSyncContextValue = createContext<AutoSyncContext | undefined>(
  undefined,
);

export const AutoSyncProvider: FC<PropsWithChildren> = (props) => {
  const { children } = props;

  const { unSyncedCustomTypes, unSyncedSlices, isOnline, authStatus } =
    useUnSyncChanges();
  const { setNextSave, autoSaveStatus } = useAutoSave({
    errorMessage: "An error occurred while syncing your changes",
  });
  const { refreshState, pushChangesSuccess } = useSliceMachineActions();
  const stableRefreshState = useStableCallback(refreshState);
  const stablePushChangesSuccess = useStableCallback(pushChangesSuccess);
  const previousAuthStatus = usePrevious(authStatus);
  const previousIsOnline = usePrevious(isOnline);

  const syncChanges = useCallback(() => {
    if (isOnline && authStatus === AuthStatus.AUTHORIZED) {
      setNextSave(async () => {
        console.log("Inside setNextSave");

        // We first get the remote models and local models to ensure we need
        // to sync changes and also to get the latest local models as because
        // of redux we might not have the latest models in the store.

        // TODO(DT-1737): Remove the use of global getState
        const initialServerState = await getState();
        const slices = normalizeFrontendSlices(
          initialServerState.libraries,
          initialServerState.remoteSlices,
        );
        const customTypes = Object.values(
          normalizeFrontendCustomTypes(
            initialServerState.customTypes,
            initialServerState.remoteCustomTypes,
          ),
        );
        const modelsStatuses = getModelStatus({
          slices,
          customTypes,
          isOnline,
          authStatus,
        });
        const { unSyncedCustomTypes, unSyncedSlices } = getUnSyncChanges({
          customTypes,
          libraries: initialServerState.libraries,
          modelsStatuses,
          slices,
        });

        // If there are changes to sync, we push them.
        // It can only happen to not need a change if a sync was in progress
        // and the user reloaded the page.
        if (unSyncedCustomTypes.length > 0 || unSyncedSlices.length > 0) {
          console.log("Syncing changes");
          const { changedSlices, changedCustomTypes } = getChanges({
            unSyncedCustomTypes,
            unSyncedSlices,
            modelsStatuses,
          });

          await pushChanges({
            changedCustomTypes,
            changedSlices,
          });

          // Now that the changes have been pushed, we need to update redux for
          // the new remote models.

          // TODO(DT-1737): Remove the use of global getState
          const serverState = await getState();
          stableRefreshState({
            env: serverState.env,
            remoteCustomTypes: serverState.remoteCustomTypes,
            customTypes: serverState.customTypes,
            libraries: serverState.libraries,
            remoteSlices: serverState.remoteSlices,
            clientError: serverState.clientError,
          });

          // Update last sync value in local storage
          stablePushChangesSuccess();
        }
      });
    }
  }, [
    stableRefreshState,
    stablePushChangesSuccess,
    setNextSave,
    isOnline,
    authStatus,
  ]);

  useMountEffect(() => {
    if (
      isOnline &&
      authStatus === AuthStatus.AUTHORIZED &&
      autoSaveStatus === "saved" &&
      (unSyncedCustomTypes.length > 0 || unSyncedSlices.length > 0)
    ) {
      syncChanges();
    }
  });

  useEffect(() => {
    // TODO: This property is not working when:
    // - the user is online and logged in
    // - the user goes offline
    // - the user logs out
    // - the user goes back online
    const isAuthorized = authStatus === AuthStatus.AUTHORIZED;
    const isAfterLogin =
      previousAuthStatus !== AuthStatus.AUTHORIZED && isAuthorized;
    const isBackOnline = previousIsOnline === false && isOnline === true;

    // When the user login, we check if there are changes to sync and we sync
    // them if needed.
    if (
      (isAfterLogin || (isBackOnline && isAuthorized)) &&
      (unSyncedCustomTypes.length > 0 || unSyncedSlices.length > 0)
    ) {
      syncChanges();
    }
  }, [
    isOnline,
    previousIsOnline,
    authStatus,
    previousAuthStatus,
    syncChanges,
    unSyncedCustomTypes,
    unSyncedSlices,
  ]);

  const autoSyncStatus = useMemo(() => {
    let autoSyncStatus;

    if (!isOnline) {
      autoSyncStatus = "offline";
    } else if (authStatus !== AuthStatus.AUTHORIZED) {
      autoSyncStatus = "not-logged-in";
    } else if (autoSaveStatus === "failed") {
      autoSyncStatus = "failed";
    } else if (autoSaveStatus === "saving") {
      autoSyncStatus = "syncing";
    } else {
      autoSyncStatus = "synced";
    }

    return autoSyncStatus;
  }, [autoSaveStatus, authStatus, isOnline]);

  const contextValue = useMemo(
    () => ({
      syncChanges,
      autoSyncStatus,
    }),
    [syncChanges, autoSyncStatus],
  );

  return (
    <AutoSyncContextValue.Provider value={contextValue}>
      {children}
    </AutoSyncContextValue.Provider>
  );
};

export const useAutoSync = () => {
  const context = useContext(AutoSyncContextValue);

  if (context === undefined) {
    throw new Error("useAutoSync must be used within a AutoSyncProvider");
  }

  return context;
};
