import { Box, Button, Text } from "@prismicio/editor-ui";

import useSliceMachineActions from "@/modules/useSliceMachineActions";

export const UnauthenticatedView = () => {
  const { openLoginModal } = useSliceMachineActions();

  return (
    <Box
      flexDirection="column"
      height="100%"
      alignItems="center"
      justifyContent="center"
      gap={8}
    >
      <Text variant="h3" align="center">
        It seems like you are logged out
      </Text>
      <Text align="center">Log in to connect to your repository.</Text>
      <Text align="center">
        If that doesn't work, it's possible that Slice Machine is having trouble
        accessing Prismic's servers.{" "}
        <Text href="https://community.prismic.io/">
          Contact our support team
        </Text>
        .
      </Text>
      <Button onClick={() => openLoginModal()}>Log in to Prismic</Button>
    </Box>
  );
};
