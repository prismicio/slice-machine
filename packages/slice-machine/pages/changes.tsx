import React, { useEffect, useMemo } from "react";
import { Box, Text } from "theme-ui";
import Container from "../components/Container";
import Header from "../components/Header";
import { MdLoop } from "react-icons/md";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "../src/redux/type";
import { ChangesItems } from "@components/ChangesItems";
import {
  AuthErrorPage,
  NoChangesPage,
  OfflinePage,
} from "@components/ChangesEmptyPage";
import { Button } from "@components/Button";
import { AuthStatus } from "@src/modules/userContext/types";
import { useUnSyncChanges } from "@src/hooks/useUnSyncChanges";
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import {
  SoftDeleteDocumentsDrawer,
  HardDeleteDocumentsDrawer,
  ReferencesErrorDrawer,
} from "@components/DeleteDocumentsDrawer";
import { hasLocal } from "@lib/models/common/ModelData";

const Changes: React.FunctionComponent = () => {
  const {
    unSyncedSlices,
    unSyncedCustomTypes,
    modelsStatuses,
    authStatus,
    isOnline,
  } = useUnSyncChanges();
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
      unSyncedSlices,
      unSyncedCustomTypes: unSyncedCustomTypes.map((model) =>
        hasLocal(model) ? model.local : model.remote
      ),
      modelsStatuses,
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
      return <NoChangesPage />;
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
    <Container sx={{ display: "flex", flex: 1 }}>
      <Box
        as={"main"}
        sx={{ flex: 1, display: "flex", flexDirection: "column" }}
      >
        <Header
          link={{
            Element: <Text>Changes</Text>,
            href: "/changes",
          }}
          Actions={[
            <Button
              key="push-changes"
              label="Push Changes"
              onClick={() => onPush(false)} // not deleting documents by default
              isLoading={isSyncing}
              disabled={
                numberOfChanges === 0 ||
                !isOnline ||
                authStatus === AuthStatus.UNAUTHORIZED ||
                authStatus === AuthStatus.FORBIDDEN ||
                isSyncing
              }
              Icon={MdLoop}
              iconFill="#FFFFFF"
              data-cy="push-changes"
            />,
          ]}
        />
        {PageContent}
      </Box>
      <SoftDeleteDocumentsDrawer pushChanges={onPush} />
      <HardDeleteDocumentsDrawer pushChanges={onPush} />
      <ReferencesErrorDrawer pushChanges={onPush} />
    </Container>
  );
};

export default Changes;
