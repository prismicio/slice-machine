import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import { BaseStyles } from "theme-ui";
import { useRouter } from "next/router";

import {
  AppLayout,
  AppLayoutActions,
  AppLayoutBreadcrumb,
  AppLayoutContent,
  AppLayoutHeader,
} from "@components/AppLayout";
import { ChangesItems } from "@components/ChangesItems";
import { AuthErrorPage, OfflinePage } from "@components/ChangesEmptyState";
import { NoChangesBlankSlate } from "@src/features/changes/BlankSlates";
import { PushChangesButton } from "@src/features/changes/PushChangesButton";
import { AuthStatus } from "@src/modules/userContext/types";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import {
  SoftDeleteDocumentsDrawer,
  HardDeleteDocumentsDrawer,
} from "@components/DeleteDocumentsDrawer";
import { PushChangesLimit } from "@slicemachine/manager";
import { getState } from "@src/apiClient";
import { pushChanges } from "@src/features/sync/actions/pushChanges";
import { useUnSyncChanges } from "@src/features/sync/useUnSyncChanges";
import { useNetwork } from "@src/hooks/useNetwork";
import { useAuthStatus } from "@src/hooks/useAuthStatus";
import { useAutoSync } from "@src/features/sync/AutoSyncProvider";

const Changes: React.FunctionComponent = () => {
  const {
    unSyncedSlices,
    unSyncedCustomTypes,
    changedCustomTypes,
    changedSlices,
    modelsStatuses,
  } = useUnSyncChanges();
  const isOnline = useNetwork();
  const authStatus = useAuthStatus();
  const { pushChangesSuccess, refreshState } = useSliceMachineActions();
  const [isSyncing, setIsSyncing] = useState(false);
  const [openModalData, setOpenModalData] = useState<
    PushChangesLimit | undefined
  >(undefined);
  const { autoSyncStatus } = useAutoSync();
  const router = useRouter();

  const numberOfChanges = unSyncedSlices.length + unSyncedCustomTypes.length;

  // Changes page should not be accessible when the autoSyncStatus is syncing, synced or failed
  useEffect(() => {
    if (
      autoSyncStatus === "synced" ||
      autoSyncStatus === "failed" ||
      autoSyncStatus === "syncing"
    ) {
      void router.push("/");
    }
  }, [autoSyncStatus, router]);

  const onPush = async (confirmDeleteDocuments: boolean) => {
    try {
      setIsSyncing(true);
      setOpenModalData(undefined);

      const limit = await pushChanges({
        confirmDeleteDocuments,
        changedCustomTypes,
        changedSlices,
      });

      if (limit !== undefined) {
        setOpenModalData(limit);
      } else {
        const serverState = await getState();
        refreshState(serverState);

        // Update last sync value in local storage
        pushChangesSuccess();

        toast.success("All slices and types have been pushed");
      }
    } catch (error) {
      console.error(
        "Something went wrong when manually pushing your changes",
        error,
      );

      toast.error(
        "Something went wrong when pushing your changes. Check your terminal logs.",
      );
    }

    setIsSyncing(false);
  };

  const PageContent = useMemo(() => {
    if (!isOnline) {
      return <OfflinePage />;
    }
    if (
      authStatus === AuthStatus.UNAUTHORIZED ||
      authStatus === AuthStatus.FORBIDDEN
    ) {
      return <AuthErrorPage authStatus={authStatus} />;
    }
    if (numberOfChanges === 0) {
      return <NoChangesBlankSlate />;
    }
    return (
      <ChangesItems
        unSyncedSlices={unSyncedSlices}
        unSyncedCustomTypes={unSyncedCustomTypes}
        modelsStatuses={modelsStatuses}
        authStatus={authStatus}
        isOnline={isOnline}
      />
    );
  }, [
    isOnline,
    authStatus,
    numberOfChanges,
    unSyncedSlices,
    unSyncedCustomTypes,
    modelsStatuses,
  ]);

  return (
    <>
      <Head>
        <title>Changes - Slice Machine</title>
      </Head>
      <AppLayout>
        <AppLayoutHeader>
          <AppLayoutBreadcrumb folder="Changes" />
          <AppLayoutActions>
            <PushChangesButton
              disabled={
                numberOfChanges === 0 ||
                !isOnline ||
                authStatus === AuthStatus.UNAUTHORIZED ||
                authStatus === AuthStatus.FORBIDDEN ||
                isSyncing
              }
              loading={isSyncing}
              onClick={() => {
                void onPush(false); // not deleting documents by default
              }}
            />
          </AppLayoutActions>
        </AppLayoutHeader>
        <AppLayoutContent>
          <BaseStyles sx={{ display: "flex", flexDirection: "column" }}>
            {PageContent}
            <SoftDeleteDocumentsDrawer
              pushChanges={(confirmDeleteDocuments) =>
                void onPush(confirmDeleteDocuments)
              }
              modalData={openModalData}
              onClose={() => setOpenModalData(undefined)}
            />
            <HardDeleteDocumentsDrawer
              pushChanges={(confirmDeleteDocuments) =>
                void onPush(confirmDeleteDocuments)
              }
              modalData={openModalData}
              onClose={() => setOpenModalData(undefined)}
            />
          </BaseStyles>
        </AppLayoutContent>
      </AppLayout>
    </>
  );
};

export default Changes;
