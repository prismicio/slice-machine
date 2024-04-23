import { GIT_PROVIDER, GitProvider } from "@slicemachine/manager/client";

import { BitbucketIcon } from "@/icons/BitbucketIcon";
import { GitHubIcon } from "@/icons/GitHubIcon";
import { GitLabIcon } from "@/icons/GitLabIcon";
import { managerClient } from "@/managerClient";

export const gitProviderToConfig = {
  gitHub: {
    connect: async () => await openInstallationWindow("gitHub"),
    Icon: GitHubIcon,
    name: "GitHub",
    supported: isSupported("gitHub"),
  },
  bitbucket: {
    connect: async () => await openInstallationWindow("bitbucket"),
    Icon: BitbucketIcon,
    name: "Bitbucket",
    supported: isSupported("bitbucket"),
  },
  gitLab: {
    connect: async () => await openInstallationWindow("gitLab"),
    Icon: GitLabIcon,
    name: "GitLab",
    supported: isSupported("gitLab"),
  },
};

async function openInstallationWindow(provider: string) {
  if (!isSupported(provider)) {
    throw new Error("Not implemented.");
  }

  const url = await managerClient.git.getProviderAppInstallURL({ provider });
  window.open(url, "git-provider-app-installation");
}

function isSupported(provider: string): provider is GitProvider {
  return Boolean(Object.values<string>(GIT_PROVIDER).includes(provider));
}
