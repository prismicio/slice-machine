import Modal from "react-modal";
import React from "react";
import {
  Button,
  Card,
  Close,
  Flex,
  Heading,
  Link,
  Spinner,
  Text,
} from "theme-ui";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import SliceMachineModal from "@components/SliceMachineModal";
import { checkAuthStatus, getState, startAuth } from "@src/apiClient";
import { buildEndpoints } from "@lib/prismic/endpoints";
import { startPolling } from "@lib/utils/poll";
import { CheckAuthStatusResponse } from "@models/common/Auth";
import { isModalOpen } from "@src/modules/modal";
import { SliceMachineStoreType } from "@src/redux/type";
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { getEnvironment } from "@src/modules/environment";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import preferWroomBase from "@lib/utils/preferWroomBase";
import { getUnSyncedChanges } from "@src/features/sync/getUnSyncChanges";
import { normalizeFrontendCustomTypes } from "@lib/models/common/normalizers/customType";
import { normalizeFrontendSlices } from "@lib/models/common/normalizers/slices";
import { AuthStatus } from "@src/modules/userContext/types";
import { useAutoSync } from "@src/features/sync/AutoSyncProvider";
import { getActiveEnvironment } from "@src/features/environments/actions/getActiveEnvironment";

interface ValidAuthStatus extends CheckAuthStatusResponse {
  status: "ok";
  shortId: string;
  intercomHash: string;
}

const LoginModal: React.FunctionComponent = () => {
  Modal.setAppElement("#__next");

  const { env, isOpen, isLoginLoading } = useSelector(
    (store: SliceMachineStoreType) => ({
      isOpen: isModalOpen(store, ModalKeysEnum.LOGIN),
      isLoginLoading: isLoading(store, LoadingKeysEnum.LOGIN),
      env: getEnvironment(store),
    }),
  );
  const { syncChanges } = useAutoSync();
  const { closeModals, startLoadingLogin, stopLoadingLogin } =
    useSliceMachineActions();

  const prismicBase = preferWroomBase(env.manifest.apiEndpoint);
  const loginRedirectUrl = `${
    buildEndpoints(prismicBase + "/").Dashboard.cliLogin
  }&port=${window.location.port || "9999"}&path=/api/auth`;
  const onClick = async () => {
    if (!loginRedirectUrl) {
      return;
    }

    try {
      startLoadingLogin();
      await startAuth();
      window.open(loginRedirectUrl, "_blank");
      await startPolling<CheckAuthStatusResponse, ValidAuthStatus>(
        checkAuthStatus,
        (status: CheckAuthStatusResponse): status is ValidAuthStatus =>
          status.status === "ok" &&
          Boolean(status.shortId) &&
          Boolean(status.intercomHash),
        3000,
        60,
      );

      toast.success("Logged in");
      stopLoadingLogin();
      closeModals();

      const serverState = await getState();
      const slices = normalizeFrontendSlices(
        serverState.libraries,
        serverState.remoteSlices,
      );
      const customTypes = Object.values(
        normalizeFrontendCustomTypes(
          serverState.customTypes,
          serverState.remoteCustomTypes,
        ),
      );
      const { changedCustomTypes, changedSlices } = getUnSyncedChanges({
        authStatus: AuthStatus.AUTHORIZED,
        customTypes,
        isOnline: true,
        libraries: serverState.libraries,
        slices,
      });
      const { activeEnvironment } = await getActiveEnvironment();

      if (
        activeEnvironment?.kind === "dev" &&
        (changedCustomTypes.length > 0 || changedSlices.length > 0)
      ) {
        syncChanges({
          environment: activeEnvironment,
          loggedIn: true,
          changedCustomTypes,
          changedSlices,
        });
      }
    } catch (e) {
      stopLoadingLogin();
      toast.error("Login failed");
    }
  };

  return (
    <SliceMachineModal
      isOpen={isOpen}
      shouldCloseOnOverlayClick
      onRequestClose={closeModals}
      contentLabel={"login_modal"}
      style={{
        content: {
          position: "static",
          display: "flex",
          margin: "auto",
          minHeight: "initial",
        },
        overlay: {
          display: "flex",
        },
      }}
    >
      <Card>
        <Flex
          sx={{
            p: "16px",
            bg: "headSection",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: "8px 8px 0px 0px",
            borderBottom: (t) => `1px solid ${String(t.colors?.borders)}`,
          }}
        >
          <Heading sx={{ fontSize: "16px" }}>You're not connected</Heading>
          <Close sx={{ p: 0 }} type="button" onClick={closeModals} />
        </Flex>
        <Flex
          sx={{
            flexDirection: "column",
            p: 3,
            justifyContent: "center",
            alignItems: "stretch",
          }}
        >
          <Text
            variant={"xs"}
            sx={{
              mb: 3,
              maxWidth: 280,
              textAlign: "center",
            }}
          >
            {isLoginLoading ? (
              <>
                Not seeing the browser tab? <br />
                <Link target={"_blank"} href={loginRedirectUrl}>
                  Click here
                </Link>
              </>
            ) : (
              <>
                Your session has expired.
                <br />
                Please log in again.
              </>
            )}
          </Text>
          <Button
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: 240,
              mb: 3,
            }}
            onClick={() => void onClick()}
          >
            {isLoginLoading ? (
              <Spinner color="#FFF" size={16} />
            ) : (
              <>Log in to Prismic</>
            )}
          </Button>
        </Flex>
      </Card>
    </SliceMachineModal>
  );
};

export default LoginModal;
