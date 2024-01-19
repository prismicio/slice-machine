import React from "react";
import Head from "next/head";
import { BaseStyles } from "theme-ui";
import {
  AppLayout,
  AppLayoutBreadcrumb,
  AppLayoutContent,
  AppLayoutHeader,
} from "@components/AppLayout";
import { Button } from "@prismicio/editor-ui";
import { managerClient } from "@src/managerClient";

const Settings: React.FC = () => {
  const connect = async (provider: "gitHub") => {
    switch (provider) {
      case "gitHub": {
        const state = await managerClient.git.createGitHubAuthState();

        const url = new URL(
          "https://github.com/apps/prismic-push-models-poc/installations/new",
        );
        url.searchParams.set("state", state.key);

        window.open(url, "git-hub-app-installation");

        return;
      }
    }
  };

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
            <fieldset>
              <legend>Connected Git Repository</legend>
              <ul>
                <li>
                  <Button onClick={() => void connect("gitHub")}>GitHub</Button>
                </li>
                <li>
                  <Button disabled>GitLab (soon)</Button>
                </li>
                <li>
                  <Button disabled>Bitbucke (soon)</Button>
                </li>
              </ul>
              <p>Learn more about Prismic for Git</p>
            </fieldset>
          </BaseStyles>
        </AppLayoutContent>
      </AppLayout>
    </>
  );
};

export default Settings;
