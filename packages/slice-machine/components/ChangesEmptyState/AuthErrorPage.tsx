import React, { FC } from "react";
import { Box, Button, Text, TextLink } from "@prismicio/editor-ui";

import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { AuthStatus } from "@src/modules/userContext/types";

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
          <Text variant="h3">It seems like you are logged out</Text>
          <Text>Log in to connect to your repository.</Text>
        </>
      ) : (
        <>
          <Text variant="h3">
            It seems like you don't have access to this repository
          </Text>
          <Text>
            Check that the repository name is correct, then contact your
            repository administrator.
          </Text>
        </>
      )}
      <Text>
        If that doesn't work, it's possible that Slice Machine is having trouble
        accessing Prismic's servers.{" "}
        <TextLink href="https://community.prismic.io/">
          Contact our support team
        </TextLink>
        .
      </Text>
      {authStatus === AuthStatus.FORBIDDEN && (
        <Button onClick={() => openLoginModal()}>Log in to Prismic</Button>
      )}
    </Box>
  );
};
