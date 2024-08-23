import { Box, Toast } from "@prismicio/editor-ui";
import { PushChangesLimit } from "@slicemachine/manager";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { BaseStyles } from "theme-ui";

import { getState, telemetry } from "@/apiClient";
import { BreadcrumbItem } from "@/components/Breadcrumb";
import { NoChangesBlankSlate } from "@/features/changes/BlankSlates";
import { PushChangesButton } from "@/features/changes/PushChangesButton";
import { pushChanges } from "@/features/sync/actions/pushChanges";
import { useAutoSync } from "@/features/sync/AutoSyncProvider";
import { useUnSyncChanges } from "@/features/sync/useUnSyncChanges";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useNetwork } from "@/hooks/useNetwork";
import { usePromptToCreateContentExperiment } from "@/hooks/usePromptToCreateContentExperiment";
import { useRepositoryInformation } from "@/hooks/useRepositoryInformation";
import {
  AppLayout,
  AppLayoutActions,
  AppLayoutBreadcrumb,
  AppLayoutContent,
  AppLayoutHeader,
} from "@/legacy/components/AppLayout";
import {
  AuthErrorPage,
  OfflinePage,
} from "@/legacy/components/ChangesEmptyState";
import { ChangesItems } from "@/legacy/components/ChangesItems";
import {
  HardDeleteDocumentsDrawer,
  SoftDeleteDocumentsDrawer,
} from "@/legacy/components/DeleteDocumentsDrawer";
import { createDocumentsListEndpointFromRepoName } from "@/legacy/lib/utils/repo";
import { AuthStatus } from "@/modules/userContext/types";
import useSliceMachineActions from "@/modules/useSliceMachineActions";

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
  const [isPushed, setIsPushed] = useState(false);
  const [isToastOpen, setIsToastOpen] = useState(false);
  const { eligible: isPromptToCreateContentExperimentEligible } =
    usePromptToCreateContentExperiment();
  const { repositoryName } = useRepositoryInformation();

  const documentsListEndpoint =
    createDocumentsListEndpointFromRepoName(repositoryName);

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

        setIsPushed(true);

        if (isPromptToCreateContentExperimentEligible) {
          setIsToastOpen(true);
        } else {
          toast.success("All slices and types have been pushed");
        }
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
      return (
        <NoChangesBlankSlate
          isPostPush={isPushed}
          documentsListEndpoint={documentsListEndpoint}
          isPromptToCreateContentExperimentEligible={
            isPromptToCreateContentExperimentEligible
          }
        />
      );
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
    isPushed,
    documentsListEndpoint,
    isPromptToCreateContentExperimentEligible,
  ]);

  return (
    <>
      <Head>
        <title>Changes - Slice Machine</title>
      </Head>
      <AppLayout>
        <AppLayoutHeader>
          <AppLayoutBreadcrumb>
            <BreadcrumbItem>Changes</BreadcrumbItem>
          </AppLayoutBreadcrumb>
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
            <Toast
              anchor={<Box position="fixed" top={32} right={32} width={322} />} // 322 is a toast width, needed for the toast to be displayed with proper paddings
              open={isToastOpen}
              variant="card"
              seconds={20}
              title="Success! 🎉"
              subtitle="Your changes have been pushed."
              action={{
                title: "Create content in the Page Builder",
                onClick: () => {
                  void telemetry.track({
                    event: "post-push:toast-cta-clicked",
                  });
                  void window.open(documentsListEndpoint, "_blank");
                },
              }}
              cancel={{
                onClick: () => setIsToastOpen(false),
              }}
              onOpenChange={setIsToastOpen}
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
