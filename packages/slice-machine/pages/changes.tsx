import { Button } from "@prismicio/editor-ui";
import React, { useEffect, useMemo } from "react";
import Head from "next/head";
import { BaseStyles } from "theme-ui";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "../src/redux/type";
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
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import {
  SoftDeleteDocumentsDrawer,
  HardDeleteDocumentsDrawer,
  ReferencesErrorDrawer,
} from "@components/DeleteDocumentsDrawer";
import { hasLocal } from "@lib/models/common/ModelData";
import {
  ChangedCustomType,
  ChangedSlice,
} from "@lib/models/common/ModelStatus";

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

  const { pushChanges, closeModals } = useSliceMachineActions();

  const { isSyncing } = useSelector((store: SliceMachineStoreType) => ({
    isSyncing: isLoading(store, LoadingKeysEnum.CHANGES_PUSH),
  }));

  useEffect(() => {
    return () => {
      closeModals();
    };
    // Do not remote the eslint disable, fixing the eslint warning creates a bug that prevent from opening all modals
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const numberOfChanges = unSyncedSlices.length + unSyncedCustomTypes.length;

  const onPush = (confirmDeleteDocuments: boolean) =>
    pushChanges({
      confirmDeleteDocuments: confirmDeleteDocuments,
      changedSlices,
      changedCustomTypes,
    });

  const PageContent = useMemo(() => {
    if (!isOnline) {
      return <OfflinePage />;
    }
    if (
      authStatus === AuthStatus.UNAUTHORIZED ||
      authStatus === AuthStatus.FORBIDDEN
    ) {
      return <AuthErrorPage />;
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
              onClick={() => onPush(false)} // not deleting documents by default
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
            <SoftDeleteDocumentsDrawer pushChanges={onPush} />
            <HardDeleteDocumentsDrawer pushChanges={onPush} />
            <ReferencesErrorDrawer pushChanges={onPush} />
          </BaseStyles>
        </AppLayoutContent>
      </AppLayout>
    </>
  );
};

export default Changes;
