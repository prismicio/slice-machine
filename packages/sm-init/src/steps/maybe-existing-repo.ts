import * as inquirer from "inquirer";
import Separator from "inquirer/lib/objects/separator";
import { Communication, Utils, FileSystem } from "slicemachine-core";
import { RepoData } from "slicemachine-core/src/core/communication";

export const CREATE_REPO = "$_CREATE_REPO"; // not a valid domain name
const DEFAULT_BASE = Utils.CONSTS.DEFAULT_BASE;

export function prettyRepoName(address: URL, value?: string): string {
  const repoName = value ? Utils.cyan(value) : Utils.dim.cyan("repo-name");
  return `${Utils.cyan.dim(`${address.protocol}//`)}${repoName}${Utils.cyan.dim(
    `.${address.hostname}`
  )}`;
}

export async function promptForRepoName(base: string): Promise<string> {
  const address = new URL(base);
  return inquirer
    .prompt<Record<string, string>>([
      {
        name: "repoName",
        message: "Name your Prismic repository",
        type: "input",
        required: true,
        transformer: (value) => prettyRepoName(address, String(value)),
        async validate(name) {
          const result = await Communication.validateRepositoryName(
            name,
            base,
            false
          );
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
  return function (
    arg: [
      string,
      { role: Utils.roles.Roles | Record<string, Utils.roles.Roles> }
    ]
  ): RepoPrompt {
    const [repoName, { role }] = arg;
    const address = new URL(base);
    address.hostname = `${repoName}.${address.hostname}`;
    if (Utils.roles.canUpdateCustomTypes(role) === false) {
      return {
        name: `${Utils.purple.dim("Use")} ${Utils.bold.dim(
          repoName
        )} ${Utils.purple.dim(address.hostname)}`,
        value: repoName,
        disabled: "Unauthorized",
      };
    }

    return {
      name: `${Utils.purple("Use")} ${Utils.bold(repoName)} ${Utils.purple(
        address.hostname
      )}`,
      value: repoName,
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
  repos: RepoData,
  base: string,
  cwd: string
): RepoPrompts {
  const createNew = {
    name: `${Utils.purple("Create a")} ${Utils.bold("New")} ${Utils.purple(
      "Repository"
    )}`,
    value: CREATE_REPO,
  };

  const maybeConfiguredRepoName = FileSystem.maybeRepoNameFromSMFile(cwd, base);

  return Object.entries(repos)
    .reverse()
    .map(makeReposPretty(base))
    .reduce(maybeStickTheRepoToTheTopOfTheList(maybeConfiguredRepoName), [
      createNew,
    ])
    .sort(orderPrompts(maybeConfiguredRepoName));
}

export async function maybeExistingRepo(
  cookie: string,
  cwd: string,
  base = DEFAULT_BASE
): Promise<string> {
  const repos = await Communication.listRepositories(cookie, base);

  if (Object.keys(repos).length === 0) return promptForRepoName(base);

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

  if (res.repoName === CREATE_REPO) return promptForRepoName(base);
  return Promise.resolve(res.repoName);
}
