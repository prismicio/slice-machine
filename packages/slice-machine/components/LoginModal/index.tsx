import Modal from "react-modal";
import React, { useContext, useState } from "react";
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

Modal.setAppElement("#__next");

interface LoginModalProps {
  onClose: () => void;
  isOpen: boolean;
}

const poll = async (
  fn: Function,
  validate: Function,
  interval: number,
  maxAttempts: number
) => {
  let attempts = 0;

  const executePoll = async (resolve: any, reject: any) => {
    const response = await fn();
    attempts++;

    if (validate(response)) {
      return resolve(response);
    } else if (maxAttempts && attempts === maxAttempts) {
      return reject(new Error("Exceeded max attempts"));
    } else {
      setTimeout(executePoll, interval, resolve, reject);
    }
  };

  return new Promise<void>(executePoll);
};

const LoginModal: React.FunctionComponent<LoginModalProps> = ({
  onClose,
  isOpen,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { env } = useContext(ConfigContext);
  const { addToast } = useToasts();
  const loginRedirectUrl = !!env
    ? `https://prismic.io/dashboard/cli/login?port=${
        new URL(env.baseUrl).port
      }&path=/api/auth`
    : "";

  const onClick = async () => {
    if (!loginRedirectUrl) {
      return;
    }

    try {
      setIsLoading(true);
      await startAuth();
      const isAuthStatusOk = ({ status }: { status: string }) =>
        status === "ok";
      window.open(loginRedirectUrl, "_blank");
      await poll(checkAuthStatus, isAuthStatusOk, 3000, 60);
      setIsLoading(false);
      addToast("Logged in", { appearance: "success" });
      onClose();
    } catch (e) {
      setIsLoading(false);
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
            {isLoading ? (
              <>
                Not seeing the browser tab? <br />
                <Link target={"_blank"} href={loginRedirectUrl}>
                  Go back and try again
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
            {isLoading ? (
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
