import React from "react";
import Head from "next/head";
import { BaseStyles } from "theme-ui";
import {
  AppLayout,
  AppLayoutBreadcrumb,
  AppLayoutContent,
  AppLayoutHeader,
} from "@components/AppLayout";
import { ConnectGitRepository } from "@src/features/git/ConnectGitRepository/ConnectGitRepository";

const Settings: React.FC = () => {
  return (
    <>
      <Head>
        <title>Settings - Slice Machine</title>
      </Head>
      <AppLayout>
        <AppLayoutHeader>
          <AppLayoutBreadcrumb folder="Settings" />
        </AppLayoutHeader>
        <AppLayoutContent>
          <BaseStyles sx={{ display: "flex", flexDirection: "column" }}>
            <ConnectGitRepository />
          </BaseStyles>
        </AppLayoutContent>
      </AppLayout>
    </>
  );
};

export default Settings;
