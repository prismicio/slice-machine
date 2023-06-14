import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import React from "react";
import { Button, Flex, Text } from "theme-ui";

export const AuthErrorPage = () => {
  const { openLoginModal } = useSliceMachineActions();
  return (
    <Flex sx={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
      <Flex
        sx={{
          flexDirection: "column",
          alignItems: "center",
          transform: "translateY(-50%)",
        }}
      >
        <Text
          sx={{
            fontWeight: 600,
            fontSize: "24px",
            lineHeight: "32px",
            mb: "8px",
            mt: "2px",
          }}
        >
          Could not access your repository
        </Text>
        <Text sx={{ fontSize: "13px", lineHeight: "24px" }}>
          You need to log in to Prismic in order to push your changes.
        </Text>
        <Button sx={{ mt: "24px" }} onClick={() => openLoginModal()}>
          Log in to Prismic
        </Button>
      </Flex>
    </Flex>
  );
};
