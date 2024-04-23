import {
  AppLayout,
  AppLayoutBreadcrumb,
  AppLayoutContent,
  AppLayoutHeader,
} from "@components/AppLayout";
import { Box } from "@prismicio/editor-ui";
import { BreadcrumbItem } from "@src/components/Breadcrumb";
import { ConnectGitRepository } from "@src/features/settings/git/ConnectGitRepository";
import { useGitIntegrationExperiment } from "@src/features/settings/git/useGitIntegrationExperiment";
import Head from "next/head";
import { useRouter } from "next/router";
import { type FC, useEffect } from "react";

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
