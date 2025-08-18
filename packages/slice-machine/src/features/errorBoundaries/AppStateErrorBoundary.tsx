import {
  BlankSlate,
  BlankSlateDescription,
  BlankSlateIcon,
  BlankSlateTitle,
  Box,
  ErrorBoundary as EditorUiErrorBoundary,
  Text,
} from "@prismicio/editor-ui";
import {
  isInvalidActiveEnvironmentError,
  isUnauthorizedError,
} from "@slicemachine/manager/client";
import Link from "next/link";
import { PropsWithChildren } from "react";

import { ReloadLogoutButton } from "@/features/auth/LogoutButton";

export function AppStateErrorBoundary(props: PropsWithChildren) {
  return (
    <EditorUiErrorBoundary
      renderError={(error) => {
        return (
          <Box
            position="absolute"
            top={64}
            width="100%"
            justifyContent="center"
            flexDirection="column"
          >
            <BlankSlate>
              <BlankSlateIcon
                lineColor="tomato11"
                backgroundColor="tomato3"
                name="alert"
              />
              <BlankSlateTitle>Failed to load Slice Machine</BlankSlateTitle>
              <RenderErrorDescription error={error} />
            </BlankSlate>
          </Box>
        );
      }}
    >
      {props.children}
    </EditorUiErrorBoundary>
  );
}

function RenderErrorDescription(args: { error: unknown }) {
  const { error } = args;

  if (isUnauthorizedError(error)) {
    return (
      <CommonErrorBox>
        <Box flexDirection="column" gap={8} alignItems="center">
          <Text variant="h3" align="center">
            You don't have access to this repository.
          </Text>
          <Text align="center">
            Check that the repository name is correct, then contact your
            repository administrator.
          </Text>
        </Box>
        <ReloadLogoutButton sx={{ alignSelf: "center" }} />
      </CommonErrorBox>
    );
  }

  if (isInvalidActiveEnvironmentError(error)) {
    return (
      <CommonErrorBox>
        <Box flexDirection="column" gap={8} alignItems="center">
          <Text variant="h3" align="center">
            Your current environment is invalid.
          </Text>
          <Text align="center">
            Check with your repository administrator that you have permissions
            and correctly configured your environment for the current
            repository. For more details, consult the{" "}
            <Link href="https://prismic.io/docs/environments" target="_blank">
              documentation
            </Link>
            .
          </Text>
        </Box>
        <ReloadLogoutButton sx={{ alignSelf: "center" }} />
      </CommonErrorBox>
    );
  }

  return <BlankSlateDescription>{JSON.stringify(error)}</BlankSlateDescription>;
}

function CommonErrorBox(args: { children: React.ReactNode }) {
  const { children } = args;

  return (
    <Box
      flexDirection="column"
      alignItems="center"
      gap={16}
      margin={{ top: 8 }}
      maxWidth={768}
    >
      {children}
    </Box>
  );
}
