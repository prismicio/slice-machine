import { Box, Button, ButtonGroup } from "@prismicio/editor-ui";
import { useRouter } from "next/router";
import { FC, PropsWithChildren, Suspense } from "react";

import { useActiveEnvironment } from "@src/features/environments/useActiveEnvironment";

import Navigation from "@components/Navigation";
import { Breadcrumb, BreadcrumbItem } from "@src/components/Breadcrumb";
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutHeader,
  PageLayoutPane,
} from "@src/components/PageLayout";
import { ErrorBoundary } from "@src/ErrorBoundary";

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

type AppLayoutBreadcrumbProps = {
  folder: string;
  page?: string;
};

export const AppLayoutBreadcrumb: FC<AppLayoutBreadcrumbProps> = (props) => {
  const { folder, page, ...otherProps } = props;

  return (
    <Box flexGrow={1}>
      <Breadcrumb {...otherProps}>
        <BreadcrumbItem>{folder}</BreadcrumbItem>
        {Boolean(page) ? <BreadcrumbItem active>{page}</BreadcrumbItem> : null}
      </Breadcrumb>
    </Box>
  );
};

export const AppLayoutActions: FC<PropsWithChildren> = (props) => (
  <ButtonGroup {...props} />
);

export const AppLayoutContent: FC<PropsWithChildren> = (props) => (
  <PageLayoutContent {...props} />
);
