import { Box } from "@prismicio/editor-ui";
import Head from "next/head";
import { useRouter } from "next/router";
import { type FC, useEffect } from "react";

import { BreadcrumbItem } from "@/components/Breadcrumb";
import { ConnectGitRepository } from "@/features/settings/git/ConnectGitRepository";
import { useGitIntegrationExperiment } from "@/features/settings/git/useGitIntegrationExperiment";
import {
  AppLayout,
  AppLayoutBreadcrumb,
  AppLayoutContent,
  AppLayoutHeader,
} from "@/legacy/components/AppLayout";

export const SettingsPage: FC = () => {
  const gitIntegrationExperiment = useGitIntegrationExperiment();
  const router = useRouter();

  // TODO(DT-1801): implement a 404 page.
  useEffect(() => {
    if (!gitIntegrationExperiment.eligible) {
      void router.replace("/");
    }
  }, [gitIntegrationExperiment.eligible, router]);

  if (!gitIntegrationExperiment.eligible) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Settings - Slice Machine</title>
      </Head>
      <AppLayout>
        <AppLayoutHeader>
          <AppLayoutBreadcrumb>
            <BreadcrumbItem>Settings</BreadcrumbItem>
          </AppLayoutBreadcrumb>
        </AppLayoutHeader>
        <AppLayoutContent>
          <Box flexDirection="column" maxWidth={600}>
            <ConnectGitRepository />
          </Box>
        </AppLayoutContent>
      </AppLayout>
    </>
  );
};
