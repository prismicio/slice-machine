import { type FC, Suspense } from "react";
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

import { LabsTable } from "./LabsTable";

export const LabsPage: FC = () => {
  return (
    <>
      <Head>
        <title>Labs - Slice Machine</title>
      </Head>
      <ErrorBoundary
        renderError={() => (
          <AppLayout>
            <AppLayoutContent>
              <Box alignItems="center" justifyContent="center">
                <DefaultErrorMessage
                  title="Request failed"
                  description={`An error occurred while fetching your labs configuration.`}
                />
              </Box>
            </AppLayoutContent>
          </AppLayout>
        )}
      >
        <Suspense
          fallback={
            <AppLayout>
              <AppLayoutHeader>
                <AppLayoutBreadcrumb folder="Labs" />
              </AppLayoutHeader>
              <AppLayoutContent>
                <ProgressCircle />
              </AppLayoutContent>
            </AppLayout>
          }
        >
          <AppLayout>
            <AppLayoutHeader>
              <AppLayoutBreadcrumb folder="Labs" />
            </AppLayoutHeader>
            <AppLayoutContent>
              <LabsTable />
            </AppLayoutContent>
          </AppLayout>
        </Suspense>
      </ErrorBoundary>
    </>
  );
};
