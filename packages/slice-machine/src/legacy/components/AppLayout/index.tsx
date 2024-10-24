import { Box, Button, ButtonGroup } from "@prismicio/editor-ui";
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
import { useActiveEnvironment } from "@/features/environments/useActiveEnvironment";
import { Navigation } from "@/features/navigation/Navigation";

export const AppLayout: FC<PropsWithChildren> = ({
  children,
  ...otherProps
}) => {
  return (
    <ErrorBoundary>
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
