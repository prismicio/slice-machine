import { Box, Button, ButtonGroup, ErrorBoundary } from "@prismicio/editor-ui";
import { useRouter } from "next/router";
import { FC, PropsWithChildren, Suspense } from "react";

import { useActiveEnvironment } from "@src/features/environments/useActiveEnvironment";

import Navigation from "@components/Navigation";
import { Breadcrumb, type BreadcrumbProps } from "@src/components/Breadcrumb";
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutHeader,
  PageLayoutPane,
} from "@src/components/PageLayout";

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

  const maybeBorderColor = activeEnvironment
    ? environmentTopBorderColorMap[activeEnvironment.kind]
    : undefined;

  return (
    <PageLayout borderTopColor={maybeBorderColor} {...otherProps}>
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
      variant="secondary"
    />
  );
};

export const AppLayoutBreadcrumb: FC<BreadcrumbProps> = (props) => (
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
