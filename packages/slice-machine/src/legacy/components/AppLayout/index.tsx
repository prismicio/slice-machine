import {
  BlankSlate,
  BlankSlateDescription,
  BlankSlateIcon,
  BlankSlateTitle,
  Box,
  Button,
  ButtonGroup,
} from "@prismicio/editor-ui";
import { isUnauthorizedError } from "@slicemachine/manager/client";
import { useRouter } from "next/router";
import { FC, PropsWithChildren, Suspense } from "react";

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
                <Box alignItems="center" flexDirection="column" gap={16}>
                  {JSON.stringify(error)}
                  {isUnauthorizedError(error) && (
                    <LogoutButton
                      onLogoutSuccess={() => window.location.reload()}
                    >
                      Log out
                    </LogoutButton>
                  )}
                </Box>
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
