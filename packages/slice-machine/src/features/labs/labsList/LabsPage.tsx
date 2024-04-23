import { Box, DefaultErrorMessage, ProgressCircle } from "@prismicio/editor-ui";
import Head from "next/head";
import { type FC, ReactNode, Suspense } from "react";

import { BreadcrumbItem } from "@/components/Breadcrumb";
import { ErrorBoundary } from "@/ErrorBoundary";
import {
  AppLayout,
  AppLayoutBreadcrumb,
  AppLayoutContent,
  AppLayoutHeader,
} from "@/legacy/components/AppLayout";

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
        <AppLayoutBreadcrumb>
          <BreadcrumbItem>Labs</BreadcrumbItem>
        </AppLayoutBreadcrumb>
      </AppLayoutHeader>
    ) : null}
    <AppLayoutContent>{children}</AppLayoutContent>
  </AppLayout>
);
