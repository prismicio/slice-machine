import { GitProvider } from "@slicemachine/manager/client";

import { BitbucketIcon } from "@src/icons/BitbucketIcon";
import { GitHubIcon } from "@src/icons/GitHubIcon";
import { GitLabIcon } from "@src/icons/GitLabIcon";
import { managerClient } from "@src/managerClient";

export const gitProviderToConfig = {
  gitHub: {
    connect: async () => await openInstallationWindow("gitHub"),
    Icon: GitHubIcon,
    name: "GitHub",
    supported: true,
  },
  bitbucket: {
    connect: async () => await openInstallationWindow("bitbucket"),
    Icon: BitbucketIcon,
    name: "Bitbucket",
    supported: false,
  },
  gitLab: {
    connect: async () => await openInstallationWindow("gitLab"),
    Icon: GitLabIcon,
    name: "GitLab",
    supported: false,
  },
};

async function openInstallationWindow(provider: GitProvider) {
  const url = await managerClient.git.getProviderAppInstallURL({ provider });
  window.open(url, "git-provider-app-installation");
}
