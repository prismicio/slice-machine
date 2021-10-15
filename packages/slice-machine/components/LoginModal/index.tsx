import Modal from "react-modal";
import React, { useContext, useState } from "react";
import { Button, Card, Close, Flex, Heading, Spinner, Text } from "theme-ui";
import Prismic from "components/AppLayout/Navigation/Icons/Prismic";
import SliceMachineModal from "@components/SliceMachineModal";
import { ConfigContext } from "@src/config-context";
import { useToasts } from "react-toast-notifications";

Modal.setAppElement("#__next");

type LoginModalProps = {
  onClose: () => void;
  isOpen: boolean;
};

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

  const onClick = async () => {
    if (!env) {
      return;
    }

    try {
      setIsLoading(true);
      await fetch("/api/auth/start", { method: "POST" });
      const checkStatus = async () =>
        await fetch("/api/auth/status", { method: "POST" }).then((response) =>
          response.json()
        );
      const isAuthStatusOk = ({ status }: { status: string }) =>
        status === "ok";
      const apiUrl = new URL(env.baseUrl);

      window.open(
        `https://prismic.io/dashboard/cli/login?port=${apiUrl.port}&path=/api/auth`,
        "_blank"
      );
      await poll(checkStatus, isAuthStatusOk, 3000, 60);
      setIsLoading(false);
      addToast("Logging successfully", { appearance: "success" });
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
            pl: 4,
            bg: "headSection",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: "8px 8px 0px 0px",
            borderBottom: (t) => `1px solid ${t.colors?.borders}`,
          }}
        >
          <Heading sx={{ fontSize: "20px" }}>You're not connected</Heading>
          <Close type="button" onClick={onClose} />
        </Flex>
        <Flex
          sx={{
            flexDirection: "column",
            p: 3,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            variant={"xs"}
            sx={{
              mb: 3,
              maxWidth: 280,
            }}
          >
            In to order to perform this action, you’ve to be connected into your
            Prismic account.
          </Text>
          <Button
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            onClick={onClick}
          >
            {isLoading ? (
              <Spinner color="#FFF" size={16} />
            ) : (
              <>
                <Flex sx={{ mr: 2 }}>
                  <Prismic fill={"white"} />
                </Flex>
                Signin to Prismic
              </>
            )}
          </Button>
        </Flex>
      </Card>
    </SliceMachineModal>
  );
};

export default LoginModal;
