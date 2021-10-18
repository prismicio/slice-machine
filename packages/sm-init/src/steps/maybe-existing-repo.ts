import * as inquirer from "inquirer";
import Separator from "inquirer/lib/objects/separator";
import { Communication, Utils, FileSystem } from "slicemachine-core";
import { RepoData } from "slicemachine-core/src/core/communication";

export const CREATE_REPO = "$_CREATE_REPO"; // not a valid domain name
const DEFAULT_BASE = Utils.CONSTS.DEFAULT_BASE;

export function prettyRepoName(address: URL, value?: string): string {
  const repoName = value ? Utils.cyan(value) : Utils.dim.cyan("repo-name");
  const msg = [
    Utils.cyan.dim(`${address.protocol}//`),
    repoName,
    Utils.cyan.dim(`.${address.hostname}`),
  ];
  return msg.join("");
}

export async function promptForCreateRepo(base: string): Promise<string> {
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

export function maybeRepoNameFromSMFile(cwd: string, base: string) {
  const baseUrl = new URL(base);
  const maybeSMFile = FileSystem.retrieveManifest(cwd);

  if (maybeSMFile.exists === false) return null;
  if (!maybeSMFile.content?.apiEndpoint) return null;

  const repoUrl = new URL(maybeSMFile.content.apiEndpoint);
  const correctBase = repoUrl.hostname.includes(baseUrl.hostname);
  if (correctBase === false) return null;

  return repoUrl.hostname.split(".")[0];
}

export function canUpdateCustomTypes(role: Communication.Roles) {
  if (role === Communication.Roles.OWNER) return true;
  if (role === Communication.Roles.ADMIN) return true;
  return false;
}

export type RepoPrompt = { name: string; value: string; disabled?: string };

export type PromptOrSeparator = RepoPrompt | Separator;

export type RepoPrompts = Array<PromptOrSeparator>;

export function makeReposPretty(base: string) {
  return function (arg: [string, { role: Communication.Roles }]): RepoPrompt {
    const [repoName, { role }] = arg;
    const address = new URL(base);
    address.hostname = `${repoName}.${address.hostname}`;
    if (canUpdateCustomTypes(role) === false) {
      return {
        name: `${Utils.purple.dim("Use")} ${Utils.bold.dim(
          repoName
        )} ${Utils.purple.dim(address.toString())}`,
        value: repoName,
        disabled: "Unauthorized",
      };
    }

    return {
      name: `${Utils.purple("Use")} ${Utils.bold(repoName)} ${Utils.purple(
        address.toString()
      )}`,
      value: repoName,
    };
  };
}

export function orderPrompts(maybeName?: string | null) {
  return (a: PromptOrSeparator, b: PromptOrSeparator) => {
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

  // const sep: Separator = new inquirer.Separator(
  //   "---- Use an existing Repository ----"
  // );

  const start: RepoPrompts = [
    createNew,
    //  sep
  ];

  const maybeConfiguredRepoName = maybeRepoNameFromSMFile(cwd, base);

  return Object.entries(repos)
    .reverse()
    .map(makeReposPretty(base))
    .reduce(maybeStickTheRepoToTheTopOfTheList(maybeConfiguredRepoName), start)
    .sort(orderPrompts(maybeConfiguredRepoName));
}

export async function maybeExistingRepo(
  cookie: string,
  cwd: string,
  base = DEFAULT_BASE
): Promise<{ name: string; existing: boolean }> {
  const repos = await Communication.listRepositories(cookie, base);

  if (Object.keys(repos).length === 0) {
    const name = await promptForCreateRepo(base);
    return { existing: false, name };
  }

  const choices = sortReposForPrompt(repos, base, cwd);

  const numberOfDisabledRepos = choices.filter((repo) => {
    if (repo instanceof Separator) return false;
    return repo.disabled;
  }).length;

  const maybeConfiguredRepoName = maybeRepoNameFromSMFile(cwd, base);

  const res = await inquirer.prompt<Record<string, string>>([
    {
      type: "list",
      name: "repoName",
      default: maybeConfiguredRepoName || CREATE_REPO,
      required: true,
      message: "Connect a Prismic Repository or create a new one",
      choices,
      pageSize: numberOfDisabledRepos + 2 <= 7 ? 7 : numberOfDisabledRepos + 2,
    },
  ]);

  if (res.repoName === CREATE_REPO) {
    const name = await promptForCreateRepo(base);
    return { existing: false, name };
  }
  return { existing: true, name: res.repoName };
}
