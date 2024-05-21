import { Box, Button, Text } from "@prismicio/editor-ui";
import React, { FC } from "react";

import { AuthStatus } from "@/modules/userContext/types";
import useSliceMachineActions from "@/modules/useSliceMachineActions";

export type AuthErrorPageProps = {
  authStatus: AuthStatus.UNAUTHORIZED | AuthStatus.FORBIDDEN;
};

export const AuthErrorPage: FC<AuthErrorPageProps> = (props) => {
  const { authStatus } = props;
  const { openLoginModal } = useSliceMachineActions();

  return (
    <Box
      flexDirection="column"
      height="100%"
      alignItems="center"
      justifyContent="center"
      gap={8}
    >
      {authStatus === AuthStatus.FORBIDDEN ? (
        <>
          <Text variant="h3" align="center">
            It seems like you are logged out
          </Text>
          <Text align="center">Log in to connect to your repository.</Text>
        </>
      ) : (
        <>
          <Text variant="h3" align="center">
            It seems like you don't have access to this repository
          </Text>
          <Text align="center">
            Check that the repository name is correct, then contact your
            repository administrator.
          </Text>
        </>
      )}
      <Text align="center">
        If that doesn't work, it's possible that Slice Machine is having trouble
        accessing Prismic's servers.{" "}
        <Text href="https://community.prismic.io/">
          Contact our support team
        </Text>
        .
      </Text>
      {authStatus === AuthStatus.FORBIDDEN && (
        <Button onClick={() => openLoginModal()}>Log in to Prismic</Button>
      )}
    </Box>
  );
};
