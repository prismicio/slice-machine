import * as inquirer from "inquirer";
import Separator from "inquirer/lib/objects/separator";

import { Repositories, Repository } from "@slicemachine/core/src/models";

import { DEFAULT_BASE } from "@slicemachine/core/build/src/defaults";
import {
  listRepositories,
  canUpdateCustomTypes,
  parsePrismicAuthToken,
  validateRepositoryName,
} from "@slicemachine/core/build/src/prismic";
import { maybeRepoNameFromSMFile } from "@slicemachine/core/build/src/fs-utils";
import {
  cyan,
  dim,
  bold,
  purple,
  writeInfo,
} from "@slicemachine/core/build/src/internals";

export const CREATE_REPO = "$_CREATE_REPO"; // not a valid domain name

export function prettyRepoName(address: URL, value?: string): string {
  const repoName = value ? cyan(value) : dim.cyan("repo-name");
  return `${cyan.dim(`${address.protocol}//`)}${repoName}${cyan.dim(
    `.${address.hostname}`
  )}`;
}

export async function promptForRepoName(base: string): Promise<string> {
  const address = new URL(base);

  writeInfo(
    "The name acts as a domain/endpoint for your content repo and should be completely unique."
  );

  return inquirer
    .prompt<Record<string, string>>([
      {
        name: "repoName",
        message: "Name your Prismic repository",
        type: "input",
        required: true,
        transformer: (value) => prettyRepoName(address, String(value)),
        async validate(name) {
          const result = await validateRepositoryName(name, base, false);
          return result === name || result;
        },
      },
    ])
    .then((res) => res.repoName);
}

export type RepoPrompt = { name: string; value: string; disabled?: string };

export type PromptOrSeparator = RepoPrompt | Separator;

export type RepoPrompts = Array<PromptOrSeparator>;

export function makeReposPretty(base: string) {
  return function ({ name, domain, role }: Repository): RepoPrompt {
    const address = new URL(base);
    address.hostname = `${domain}.${address.hostname}`;
    if (canUpdateCustomTypes(role) === false) {
      return {
        name: `${purple.dim("Use")} ${bold.dim(name)} ${purple.dim(
          `"${address.hostname}"`
        )}`,
        value: domain,
        disabled: "Unauthorized",
      };
    }

    return {
      name: `${purple("Use")} ${bold(name)} ${purple(`"${address.hostname}"`)}`,
      value: name,
    };
  };
}

export function orderPrompts(maybeName?: string | null) {
  return (a: PromptOrSeparator, b: PromptOrSeparator): number => {
    if (a instanceof Separator || b instanceof Separator) return 0;
    if (maybeName && (a.value === maybeName || b.value === maybeName)) return 0;
    if (a.value === CREATE_REPO || b.value === CREATE_REPO) return 0;
    if (a.disabled && !b.disabled) return 1;
    if (!a.disabled && b.disabled) return -1;
    return 0;
  };
}

export function maybeStickTheRepoToTheTopOfTheList(repoName?: string | null) {
  return (acc: RepoPrompts, curr: RepoPrompt): RepoPrompts => {
    if (repoName && curr.value === repoName) {
      return [curr, ...acc];
    }
    return [...acc, curr];
  };
}

export function sortReposForPrompt(
  repos: Repositories,
  base: string,
  cwd: string
): RepoPrompts {
  const createNew = {
    name: `${purple("Create a")} ${bold("new")} ${purple("Repository")}`,
    value: CREATE_REPO,
  };

  const maybeConfiguredRepoName = maybeRepoNameFromSMFile(cwd, base);

  return repos
    .reverse()
    .map(makeReposPretty(base))
    .reduce(maybeStickTheRepoToTheTopOfTheList(maybeConfiguredRepoName), [
      createNew,
    ])
    .sort(orderPrompts(maybeConfiguredRepoName));
}

export async function maybeExistingRepo(
  cookies: string,
  cwd: string,
  base = DEFAULT_BASE
): Promise<{ name: string; existing: boolean }> {
  const token = parsePrismicAuthToken(cookies);
  const repos = await listRepositories(token);

  if (repos.length === 0) {
    const name = await promptForRepoName(base);
    return { existing: false, name };
  }

  const choices = sortReposForPrompt(repos, base, cwd);

  const numberOfDisabledRepos = choices.filter((repo) => {
    if (repo instanceof Separator) return false;
    return repo.disabled;
  }).length;

  const res = await inquirer.prompt<Record<string, string>>([
    {
      type: "list",
      name: "repoName",
      default: 0,
      required: true,
      message: "Connect a Prismic Repository or create a new one",
      choices,
      pageSize: numberOfDisabledRepos + 2 <= 7 ? 7 : numberOfDisabledRepos + 2,
      // loop: false
    },
  ]);

  if (res.repoName === CREATE_REPO) {
    const name = await promptForRepoName(base);
    return { existing: false, name };
  }
  return { existing: true, name: res.repoName };
}
