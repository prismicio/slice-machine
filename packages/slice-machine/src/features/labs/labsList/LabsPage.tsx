import { type FC, ReactNode, Suspense } from "react";
import {
  ErrorBoundary,
  Box,
  ProgressCircle,
  DefaultErrorMessage,
} from "@prismicio/editor-ui";
import Head from "next/head";

import {
  AppLayout,
  AppLayoutBreadcrumb,
  AppLayoutContent,
  AppLayoutHeader,
} from "@components/AppLayout";

import { LabsList } from "./LabsList";

export const LabsPage: FC = () => {
  return (
    <>
      <Head>
        <title>Labs - Slice Machine</title>
      </Head>
      <ErrorBoundary
        renderError={() => (
          <LabsPageLayout>
            <Box alignItems="center" justifyContent="center">
              <DefaultErrorMessage
                title="Request failed"
                description="An error occurred while fetching your labs configuration."
              />
            </Box>
          </LabsPageLayout>
        )}
      >
        <Suspense
          fallback={
            <LabsPageLayout withHeader>
              <ProgressCircle />
            </LabsPageLayout>
          }
        >
          <LabsPageLayout withHeader>
            <LabsList />
          </LabsPageLayout>
        </Suspense>
      </ErrorBoundary>
    </>
  );
};

type LabsPageLayoutProps = {
  children: ReactNode;
  withHeader?: boolean;
};

const LabsPageLayout: FC<LabsPageLayoutProps> = ({
  children,
  withHeader = false,
}) => (
  <AppLayout>
    {withHeader ? (
      <AppLayoutHeader>
        <AppLayoutBreadcrumb folder="Labs" />
      </AppLayoutHeader>
    ) : null}
    <AppLayoutContent>{children}</AppLayoutContent>
  </AppLayout>
);
