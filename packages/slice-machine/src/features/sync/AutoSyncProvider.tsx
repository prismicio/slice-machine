import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";

import { AuthStatus } from "@src/modules/userContext/types";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { useStableCallback } from "@prismicio/editor-support/React";
import { useMountEffect } from "@src/hooks/useMountEffect";
import { usePrevious } from "@src/hooks/usePrevious";
import { getState } from "@src/apiClient";
import {
  Environment,
  isUnauthenticatedError,
} from "@slicemachine/manager/client";
import { useNetwork } from "@src/hooks/useNetwork";
import { useAuthStatus } from "@src/hooks/useAuthStatus";
import {
  ChangedCustomType,
  ChangedSlice,
} from "@lib/models/common/ModelStatus";

import { useActiveEnvironment } from "../environments/useActiveEnvironment";
import { ActionQueueStatus, useActionQueue } from "../../hooks/useActionQueue";
import { pushChanges } from "./actions/pushChanges";
import { useUnSyncChanges } from "./useUnSyncChanges";
import { fetchUnSyncChanges } from "./fetchUnSyncChanges";

export type AutoSyncStatus =
  | "not-active"
  | "offline"
  | "not-logged-in"
  | "syncing"
  | "synced"
  | "failed";

type AutoSyncContext = {
  autoSyncStatus: AutoSyncStatus;
  syncChanges: (args?: SyncChangesArgs) => void;
};

type SyncChangesArgs = {
  environment?: Environment;
  loggedIn?: boolean;
  changedCustomTypes?: ChangedCustomType[];
  changedSlices?: ChangedSlice[];
};

const AutoSyncContextValue = createContext<AutoSyncContext | undefined>(
  undefined,
);

export const AutoSyncProvider: FC<PropsWithChildren> = (props) => {
  const { children } = props;
  const { unSyncedCustomTypes, unSyncedSlices } = useUnSyncChanges();
  const isOnline = useNetwork();
  const previousIsOnline = usePrevious(isOnline);
  const authStatus = useAuthStatus();
  const { refreshState, pushChangesSuccess } = useSliceMachineActions();
  const stableRefreshState = useStableCallback(refreshState);
  const stablePushChangesSuccess = useStableCallback(pushChangesSuccess);
  const { activeEnvironment } = useActiveEnvironment();
  const { setNextAction, actionQueueStatus } = useActionQueue({
    errorMessage: "An error occurred while syncing your changes",
  });

  const syncChanges = useCallback(
    (args: SyncChangesArgs = {}) => {
      const {
        // We default to the active environment if not provided.
        // This is useful when we want to sync changes right an environment switch.
        environment = activeEnvironment,

        // We default to a full user logged in with internet access if not provider.
        // This is useful when we want to sync changes right after the user logs in.
        loggedIn = isOnline && authStatus === AuthStatus.AUTHORIZED,
      } = args;

      console.log("1. Just calling syncChanges");

      if (loggedIn && environment?.kind === "dev") {
        setNextAction(async () => {
          console.log("2. Inside setNextSave");

          // We first get the remote models and local models to ensure we need
          // to sync changes.
          const { changedCustomTypes, changedSlices } =
            await fetchUnSyncChanges({
              isOnline,
              authStatus,
            });

          if (changedCustomTypes.length !== 0 || changedSlices.length !== 0) {
            console.log("3. Final call to pushChanges");

            try {
              await pushChanges({
                changedCustomTypes,
                changedSlices,
                // We force the deletion of documents as the auto-sync is only for
                // the dev environment.
                confirmDeleteDocuments: true,
              });

              // Now that the changes have been pushed, we need to update redux with
              // the new remote models.
              const serverState = await getState();
              stableRefreshState(serverState);

              // Update last sync value in local storage
              stablePushChangesSuccess();
            } catch (error) {
              if (isUnauthenticatedError(error)) {
                // If the user is not authenticated, we don't want to let the user
                // retry the sync. We just stop the sync and let the user
                // know that they need to login again.
                // This can easily happen if the the token expires when the user is
                // offline.
              } else {
                // If the sync failed, we want to display the error message with
                // the retry button.
                throw error;
              }
            }
          }
        });
      }
    },
    [
      stableRefreshState,
      stablePushChangesSuccess,
      setNextAction,
      isOnline,
      authStatus,
      activeEnvironment,
    ],
  );

  // We want to sync changes when the user loads the page and there are unsynced changes
  useMountEffect(() => {
    if (unSyncedCustomTypes.length > 0 || unSyncedSlices.length > 0) {
      console.log("Use Mount useEffect");

      syncChanges();
    }
  });

  // We want to sync changes when the user comes back online and there are unsynced changes
  useEffect(() => {
    const isBackOnline = previousIsOnline === false && isOnline === true;

    if (
      isBackOnline &&
      (unSyncedCustomTypes.length > 0 || unSyncedSlices.length > 0)
    ) {
      console.log("isBackOnline useEffect");

      syncChanges();
    }
  }, [
    isOnline,
    previousIsOnline,
    authStatus,
    syncChanges,
    unSyncedCustomTypes,
    unSyncedSlices,
  ]);

  const autoSyncStatus = useMemo(
    () =>
      getAutoSyncStatus({
        activeEnvironment,
        isOnline,
        authStatus,
        actionQueueStatus,
      }),
    [actionQueueStatus, authStatus, isOnline, activeEnvironment],
  );

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

export function useAutoSync(): AutoSyncContext {
  const context = useContext(AutoSyncContextValue);

  // Prevent introducing a lot of implementation details from redux in tests
  if (process.env.NODE_ENV === "test") {
    return { syncChanges: () => void 0, autoSyncStatus: "not-active" };
  }

  if (context === undefined) {
    throw new Error("useAutoSync must be used within a AutoSyncProvider");
  }

  return context;
}

type GetAutoSyncStatusArgs = {
  activeEnvironment?: Environment;
  isOnline: boolean;
  authStatus: AuthStatus;
  actionQueueStatus: ActionQueueStatus;
};

function getAutoSyncStatus(args: GetAutoSyncStatusArgs): AutoSyncStatus {
  const { activeEnvironment, isOnline, authStatus, actionQueueStatus } = args;

  if (activeEnvironment === undefined || activeEnvironment.kind !== "dev") {
    return "not-active";
  }

  if (!isOnline) {
    return "offline";
  }

  if (authStatus !== AuthStatus.AUTHORIZED) {
    return "not-logged-in";
  }

  if (actionQueueStatus === "failed") {
    return "failed";
  }

  if (actionQueueStatus === "pending") {
    return "syncing";
  }

  return "synced";
}
