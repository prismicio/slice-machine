import Modal from "react-modal";
import React, { useContext } from "react";
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
import SliceMachineModal from "@components/SliceMachineModal";
import { ConfigContext } from "@src/config-context";
import { useToasts } from "react-toast-notifications";
import { checkAuthStatus, startAuth } from "@src/apiClient";
import { buildEndpoints } from "@slicemachine/core/build/src/utils/endpoints";
import { startPolling } from "@slicemachine/core/build/src/utils/poll";
import { AxiosResponse } from "axios";
import { CheckAuthStatusResponse } from "@models/common/Auth";
import { useDispatch, useSelector } from "react-redux";
import {
  modalCloseCreator,
  isModalOpen,
  ModalKeysEnum,
} from "@src/modules/modal/modal";
import { SliceMachineStoreType } from "@src/redux/type";
import {
  isLoading,
  startLoadingActionCreator,
  stopLoadingActionCreator,
} from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";

Modal.setAppElement("#__next");

const LoginModal: React.FunctionComponent = () => {
  const { isOpen, isLoginLoading } = useSelector(
    (store: SliceMachineStoreType) => ({
      isOpen: isModalOpen(store, ModalKeysEnum.LOGIN),
      isLoginLoading: isLoading(store, LoadingKeysEnum.LOGIN),
    })
  );

  const dispatch = useDispatch();
  const onClose = () =>
    dispatch(modalCloseCreator({ modalKey: ModalKeysEnum.LOGIN }));
  const startLoadingLogin = () =>
    dispatch(startLoadingActionCreator({ key: LoadingKeysEnum.LOGIN }));
  const stopLoadingLogin = () =>
    dispatch(stopLoadingActionCreator({ key: LoadingKeysEnum.LOGIN }));

  const { env } = useContext(ConfigContext);
  const { addToast } = useToasts();
  const prismicBase = !!env ? env.prismicData.base : "https://prismic.io";
  const loginRedirectUrl = !!env
    ? `${buildEndpoints(prismicBase).Dashboard.cliLogin}&port=${
        new URL(env.baseUrl).port
      }&path=/api/auth`
    : "";

  const onClick = async () => {
    if (!loginRedirectUrl) {
      return;
    }

    try {
      startLoadingLogin();
      await startAuth();
      const isAuthStatusOk = (
        response: AxiosResponse<CheckAuthStatusResponse>
      ) => response.data.status === "ok";
      window.open(loginRedirectUrl, "_blank");
      await startPolling<AxiosResponse<CheckAuthStatusResponse>>(
        checkAuthStatus,
        isAuthStatusOk,
        3000,
        60
      );
      addToast("Logged in", { appearance: "success" });
      stopLoadingLogin();
      onClose();
    } catch (e) {
      stopLoadingLogin();
      addToast("Logging fail", { appearance: "error" });
    }
  };

  return (
    <SliceMachineModal
      isOpen={isOpen}
      shouldCloseOnOverlayClick
      onRequestClose={onClose}
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
            borderBottom: (t) => `1px solid ${t.colors?.borders}`,
          }}
        >
          <Heading sx={{ fontSize: "16px" }}>You're not connected</Heading>
          <Close sx={{ p: 0 }} type="button" onClick={onClose} />
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
            onClick={onClick}
          >
            {isLoginLoading ? (
              <Spinner color="#FFF" size={16} />
            ) : (
              <>Signin to Prismic</>
            )}
          </Button>
        </Flex>
      </Card>
    </SliceMachineModal>
  );
};

export default LoginModal;
