import {
  BlankSlate,
  BlankSlateDescription,
  BlankSlateIcon,
  BlankSlateTitle,
  Box,
  Button,
  ButtonGroup,
  Text,
} from "@prismicio/editor-ui";
import { isUnauthorizedError } from "@slicemachine/manager/client";
import { useRouter } from "next/router";
import { FC, PropsWithChildren, Suspense, useState } from "react";

import { Breadcrumb } from "@/components/Breadcrumb";
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutHeader,
  PageLayoutPane,
} from "@/components/PageLayout";
import { ErrorBoundary } from "@/ErrorBoundary";
import { LogoutButton } from "@/features/auth/LogoutButton";
import { useActiveEnvironment } from "@/features/environments/useActiveEnvironment";
import { Navigation } from "@/features/navigation/Navigation";

export const AppLayout: FC<PropsWithChildren> = ({
  children,
  ...otherProps
}) => {
  return (
    <ErrorBoundary
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
              <BlankSlateDescription>
                <RenderError error={error} />
              </BlankSlateDescription>
            </BlankSlate>
          </Box>
        );
      }}
    >
      <Suspense>
        <PageLayoutWithActiveEnvironment {...otherProps}>
          <PageLayoutPane>
            <Navigation />
          </PageLayoutPane>
          {children}
        </PageLayoutWithActiveEnvironment>
      </Suspense>
    </ErrorBoundary>
  );
};

function RenderError(args: { error: unknown }) {
  const { error } = args;

  if (isUnauthorizedError(error)) {
    return <UnauthorizedErrorView />;
  }
  return <>{JSON.stringify(error)}</>;
}

function UnauthorizedErrorView() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  return (
    <Box flexDirection="column" gap={16} margin={{ top: 8 }}>
      <Box flexDirection="column" gap={8} alignItems="center">
        <Text variant="h3" align="center">
          It seems like you don't have access to this repository
        </Text>
        <Text align="center">
          Check that the repository name is correct, then contact your
          repository administrator.
        </Text>
      </Box>
      <LogoutButton
        isLoading={isLoggingOut}
        onLogoutSuccess={() => {
          setIsLoggingOut(true);
          window.location.reload();
        }}
        sx={{ alignSelf: "center" }}
      >
        Log out
      </LogoutButton>
    </Box>
  );
}

const environmentTopBorderColorMap = {
  prod: "purple",
  stage: "indigo",
  dev: "amber",
} as const;

const PageLayoutWithActiveEnvironment: FC<PropsWithChildren> = ({
  children,
  ...otherProps
}) => {
  const { activeEnvironment } = useActiveEnvironment();

  const borderTopColor = activeEnvironment
    ? environmentTopBorderColorMap[activeEnvironment.kind]
    : "purple";

  return (
    <PageLayout
      borderTopColor={borderTopColor}
      data-testid={`app-layout-top-border-color-${borderTopColor}`}
      {...otherProps}
    >
      {children}
    </PageLayout>
  );
};

export const AppLayoutHeader: FC<PropsWithChildren> = ({
  children,
  ...otherProps
}) => (
  <PageLayoutHeader {...otherProps}>
    <Box alignItems="center" gap={8}>
      {children}
    </Box>
  </PageLayoutHeader>
);

type AppLayoutBackButtonProps = { url: string };

export const AppLayoutBackButton: FC<AppLayoutBackButtonProps> = ({
  url,
  ...otherProps
}) => {
  const router = useRouter();
  return (
    <Button
      {...otherProps}
      onClick={() => {
        void router.push(url);
      }}
      startIcon="arrowBack"
      color="grey"
    />
  );
};

export const AppLayoutBreadcrumb: FC<PropsWithChildren> = (props) => (
  <Box flexGrow={1}>
    <Breadcrumb {...props} />
  </Box>
);

export const AppLayoutActions: FC<PropsWithChildren> = (props) => (
  <ButtonGroup {...props} />
);

export const AppLayoutContent: FC<PropsWithChildren> = (props) => (
  <PageLayoutContent {...props} />
);
