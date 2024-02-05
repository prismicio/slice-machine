import { Box } from "@prismicio/editor-ui";
import Head from "next/head";
import type { FC } from "react";

import {
  AppLayout,
  AppLayoutBreadcrumb,
  AppLayoutContent,
  AppLayoutHeader,
} from "@components/AppLayout";
import { ConnectGitRepository } from "@src/features/settings/git/ConnectGitRepository";

export const SettingsPage: FC = () => (
  <>
    <Head>
      <title>Settings - Slice Machine</title>
    </Head>
    <AppLayout>
      <AppLayoutHeader>
        <AppLayoutBreadcrumb folder="Settings" />
      </AppLayoutHeader>
      <AppLayoutContent>
        <Box flexDirection="column" maxWidth={600}>
          <ConnectGitRepository />
        </Box>
      </AppLayoutContent>
    </AppLayout>
  </>
);
