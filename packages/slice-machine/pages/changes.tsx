import React, { useState } from "react";
import { Box, Button, Flex, Spinner, Text } from "theme-ui";
import Container from "components/Container";
import Header from "components/Header";
import { MdLoop } from "react-icons/md";
import { ChangesItems } from "@components/ChangesItems";
import {
  AuthErrorPage,
  NoChangesPage,
  OfflinePage,
} from "@components/ChangesEmptyPage";
import { AuthStatus } from "@src/modules/userContext/types";
import { useUnSyncChanges } from "@src/hooks/useUnSyncChanges";

const changes: React.FunctionComponent = () => {
  const {
    unSyncedSlices,
    unSyncedCustomTypes,
    modelsStatuses,
    authStatus,
    isOnline,
  } = useUnSyncChanges();

  const [loading] = useState(false); //todo: ass a setLoading method and use it when pushing changes
  const numberOfChanges = unSyncedSlices.length + unSyncedCustomTypes.length;

  const renderPageContent = () => {
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
  };

  return (
    <Container
      sx={{
        display: "flex",
        flex: 1,
      }}
    >
      <Box
        as={"main"}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header
          ActionButton={
            <Button
              onClick={() => console.log("push changes")} //todo: add push changes feature
              data-cy="push-changes"
              disabled={
                numberOfChanges === 0 ||
                !isOnline ||
                authStatus === AuthStatus.UNAUTHORIZED ||
                authStatus === AuthStatus.FORBIDDEN
              }
              sx={{ minWidth: "120px" }}
            >
              {loading ? (
                <Spinner color="#FFF" size={14} />
              ) : (
                <Flex sx={{ alignItems: "center" }}>
                  <MdLoop size={18} />
                  <span>Push Changes</span>
                </Flex>
              )}
            </Button>
          }
          MainBreadcrumb={<Text ml={2}>Changes</Text>}
          breadrumbHref="/changes"
        />
        {renderPageContent()}
      </Box>
    </Container>
  );
};

export default changes;
