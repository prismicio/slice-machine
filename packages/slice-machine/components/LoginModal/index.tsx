import Modal from "react-modal";
import React, { useState } from "react";
import { Button, Card, Close, Flex, Heading, Spinner, Text } from "theme-ui";
import Prismic from "components/AppLayout/Navigation/Icons/Prismic";

Modal.setAppElement("#__next");

type LoginModalProps = {
  close: () => void;
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
  close,
  isOpen,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onClick = async () => {
    try {
      setIsLoading(true);
      await fetch("/api/auth/start", { method: "POST" });
      const checkStatus = async () =>
        await fetch("/api/auth/status", { method: "POST" }).then((response) =>
          response.json()
        );
      const isAuthStatusOk = ({ status }: { status: string }) =>
        status === "ok";
      window.open("http://wroom.test/dasboard/api/cli/login", "_blank");
      await poll(checkStatus, isAuthStatusOk, 5000, 10);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      shouldCloseOnOverlayClick
      onRequestClose={() => close()}
      contentLabel={"login_modal"}
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
          <Close type="button" onClick={() => close()} />
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
                <Prismic fill={"white"} />
                Signin to Prismic
              </>
            )}
          </Button>
        </Flex>
      </Card>
    </Modal>
  );
};

export default LoginModal;
