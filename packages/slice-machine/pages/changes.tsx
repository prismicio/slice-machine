import { Button } from "@prismicio/editor-ui";
import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import { BaseStyles } from "theme-ui";
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

import { AuthStatus } from "@src/modules/userContext/types";
import { unSyncStatuses, useUnSyncChanges } from "@src/hooks/useUnSyncChanges";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import {
  SoftDeleteDocumentsDrawer,
  HardDeleteDocumentsDrawer,
} from "@components/DeleteDocumentsDrawer";
import { hasLocal } from "@lib/models/common/ModelData";
import {
  ChangedCustomType,
  ChangedSlice,
} from "@lib/models/common/ModelStatus";
import { PushChangesLimit } from "@slicemachine/manager";
import { pushChanges } from "@src/features/changes/actions/pushChanges";
import { getState } from "@src/apiClient";

const Changes: React.FunctionComponent = () => {
  const {
    unSyncedSlices,
    unSyncedCustomTypes,
    modelsStatuses,
    authStatus,
    isOnline,
  } = useUnSyncChanges();

  const { changedSlices, changedCustomTypes } = useMemo(() => {
    const changedSlices = unSyncedSlices
      .map((s) => ({
        slice: s,
        status: modelsStatuses.slices[s.model.id],
      }))
      .filter((s): s is ChangedSlice => unSyncStatuses.includes(s.status)); // TODO can we sync unSyncStatuses and ChangedSlice?
    const changedCustomTypes = unSyncedCustomTypes
      .map((model) => (hasLocal(model) ? model.local : model.remote))
      .map((ct) => ({
        customType: ct,
        status: modelsStatuses.customTypes[ct.id],
      }))
      .filter((c): c is ChangedCustomType => unSyncStatuses.includes(c.status));

    return { changedSlices, changedCustomTypes };
  }, [unSyncedSlices, unSyncedCustomTypes, modelsStatuses]);

  const { pushChangesSuccess, refreshState } = useSliceMachineActions();
  const [isSyncing, setIsSyncing] = useState(false);
  const [openModalData, setOpenModalData] = useState<
    PushChangesLimit | undefined
  >(undefined);

  const numberOfChanges = unSyncedSlices.length + unSyncedCustomTypes.length;

  const onPush = async (confirmDeleteDocuments: boolean) => {
    try {
      setIsSyncing(true);
      setOpenModalData(undefined);

      const limit = await pushChanges({
        confirmDeleteDocuments,
        changedSlices,
        changedCustomTypes,
      });

      if (limit !== undefined) {
        setOpenModalData(limit);
      } else {
        // TODO(DT-1737): Remove the use of global getState
        const serverState = await getState();
        refreshState({
          env: serverState.env,
          remoteCustomTypes: serverState.remoteCustomTypes,
          customTypes: serverState.customTypes,
          libraries: serverState.libraries,
          remoteSlices: serverState.remoteSlices,
          clientError: serverState.clientError,
        });

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
            <Button
              onClick={() => void onPush(false)} // not deleting documents by default
              loading={isSyncing}
              disabled={
                numberOfChanges === 0 ||
                !isOnline ||
                authStatus === AuthStatus.UNAUTHORIZED ||
                authStatus === AuthStatus.FORBIDDEN ||
                isSyncing
              }
              data-cy="push-changes"
            >
              Push Changes
            </Button>
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
