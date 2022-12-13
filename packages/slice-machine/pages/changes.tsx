import React, { useEffect, useMemo, useState } from "react";
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
import { SyncError } from "@src/models/SyncError";

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
  }, []);

  const numberOfChanges = unSyncedSlices.length + unSyncedCustomTypes.length;

  const [changesPushed, setChangesPushed] = useState<string[]>([]);
  const [error, setError] = useState<SyncError | null>(null);

  const handlePush = () => {
    if (error) setError(null); // reset error
    if (changesPushed.length > 0) setChangesPushed([]); // reset changesPushed
    pushChanges(
      unSyncedSlices,
      unSyncedCustomTypes.map((customtype) => customtype.local),
      modelsStatuses,
      (pushed: string | null) =>
        pushed
          ? setChangesPushed([...changesPushed, pushed])
          : setChangesPushed([]),
      setError
    );
  };

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
        changesPushed={changesPushed}
        syncError={error}
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
    changesPushed,
    error,
    modelsStatuses,
  ]);

  return (
    <Container sx={{ display: "flex", flex: 1 }}>
      <Box
        as={"main"}
        sx={{ flex: 1, display: "flex", flexDirection: "column" }}
      >
        <Header
          ActionButton={
            <Button
              label="Push Changes"
              onClick={handlePush}
              isLoading={isSyncing}
              disabled={
                numberOfChanges === 0 ||
                !isOnline ||
                authStatus === AuthStatus.UNAUTHORIZED ||
                authStatus === AuthStatus.FORBIDDEN ||
                isSyncing
              }
              Icon={MdLoop}
              data-cy="push-changes"
            />
          }
          MainBreadcrumb={<Text ml={2}>Changes</Text>}
          breadrumbHref="/changes"
        />
        {PageContent}
      </Box>
    </Container>
  );
};

export default Changes;
