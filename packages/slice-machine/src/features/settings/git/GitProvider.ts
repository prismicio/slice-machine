import { BitbucketIcon } from "@src/icons/BitbucketIcon";
import { GitHubIcon } from "@src/icons/GitHubIcon";
import { GitLabIcon } from "@src/icons/GitLabIcon";
import { managerClient } from "@src/managerClient";

export type GitProvider = keyof typeof gitProviderToConfig;

export const gitProviderToConfig = {
  gitHub: {
    connect: async () => {
      const url = await managerClient.git.getProviderAppInstallURL({
        provider: "gitHub",
      });
      window.open(url, "git-hub-app-installation");
    },
    Icon: GitHubIcon,
    name: "GitHub",
    supported: true,
  },
  bitbucket: {
    connect: () => {
      throw new Error("Not implemented.");
    },
    Icon: BitbucketIcon,
    name: "Bitbucket",
    supported: false,
  },
  gitLab: {
    connect: () => {
      throw new Error("Not implemented.");
    },
    Icon: GitLabIcon,
    name: "GitLab",
    supported: false,
  },
};
