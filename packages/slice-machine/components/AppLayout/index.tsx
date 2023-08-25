import { Box, Button, ButtonGroup } from "@prismicio/editor-ui";
import { useRouter } from "next/router";
import type { FC, PropsWithChildren } from "react";

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
}) => (
  <PageLayout {...otherProps}>
    <PageLayoutPane>
      <Navigation />
    </PageLayoutPane>
    {children}
  </PageLayout>
);

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
