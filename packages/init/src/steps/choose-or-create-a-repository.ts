import * as inquirer from "inquirer";
import Separator from "inquirer/lib/objects/separator";
import { Communication, Utils, FileSystem, Models } from "@slicemachine/core";
import { parsePrismicAuthToken } from "@slicemachine/core/build/src/utils/cookie";
import { createRepository } from "../utils/create-repo";

export const CREATE_REPO = "$_CREATE_REPO"; // not a valid domain name
const DEFAULT_BASE = Utils.CONSTS.DEFAULT_BASE;

export function prettyRepoName(address: URL, value?: string): string {
  const repoName = value ? Utils.cyan(value) : Utils.dim.cyan("repo-name");
  return `${Utils.cyan.dim(`${address.protocol}//`)}${repoName}${Utils.cyan.dim(
    `.${address.hostname}`
  )}`;
}

export async function promptForRepoDomain(
  base: string,
  defaultValue?: string
): Promise<string> {
  const address = new URL(base);

  Utils.writeInfo(
    "The name acts as a domain/endpoint for your content repo and should be completely unique."
  );

  return inquirer
    .prompt<Record<string, string>>([
      {
        name: "repoDomain",
        message: "Name your Prismic repository",
        type: "input",
        required: true,
        default: defaultValue,
        transformer: (value) => prettyRepoName(address, String(value)),
        async validate(name: string) {
          const result = await Communication.validateRepositoryName(
            name,
            base,
            false
          );
          return result === name || result;
        },
      },
    ])
    .then((res) => res.repoDomain);
}

export type RepoPrompt = { name: string; value: string; disabled?: string };

export type PromptOrSeparator = RepoPrompt | Separator;

export type RepoPrompts = Array<PromptOrSeparator>;

export function makeReposPretty(base: string) {
  return function ({ name, domain, role }: Models.Repository): RepoPrompt {
    const address = new URL(base);
    address.hostname = `${domain}.${address.hostname}`;
    if (Models.canUpdateCustomTypes(role) === false) {
      return {
        name: `${Utils.purple.dim("Use")} ${Utils.bold.dim(
          name
        )} ${Utils.purple.dim(`"${address.hostname}"`)}`,
        value: domain,
        disabled: "Unauthorized",
      };
    }

    return {
      name: `${Utils.purple("Use")} ${Utils.bold(name)} ${Utils.purple(
        `"${address.hostname}"`
      )}`,
      value: domain,
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
  repos: Models.Repositories,
  base: string,
  cwd: string
): RepoPrompts {
  const createNew = {
    name: `${Utils.purple("Create a")} ${Utils.bold("new")} ${Utils.purple(
      "Repository"
    )}`,
    value: CREATE_REPO,
  };

  const maybeConfiguredRepoName = FileSystem.maybeRepoNameFromSMFile(cwd, base);

  return repos
    .reverse()
    .map(makeReposPretty(base))
    .reduce(maybeStickTheRepoToTheTopOfTheList(maybeConfiguredRepoName), [
      createNew,
    ])
    .sort(orderPrompts(maybeConfiguredRepoName));
}

export async function chooseOrCreateARepository(
  cwd: string,
  framework: Models.Frameworks,
  cookies: string,
  base = DEFAULT_BASE,
  project?: string
): Promise<string> {
  const token = parsePrismicAuthToken(cookies);
  const repos = await Communication.listRepositories(token);

  const hasRepo =
    project && repos.length && repos.map((d) => d.domain).includes(project);
  if (hasRepo) return project;

  if (repos.length === 0) {
    const domainName = await promptForRepoDomain(base, project);
    console.log({ domainName });
    const req = createRepository(domainName, framework, cookies, base);
    const res = await req;
    console.log(res);
    return res || "";
  }

  const choices = sortReposForPrompt(repos, base, cwd);

  const numberOfDisabledRepos = choices.filter((repo) => {
    if (repo instanceof Separator) return false;
    return repo.disabled;
  }).length;

  const res = await inquirer.prompt<{ chosenRepo: string }>([
    {
      type: "list",
      name: "chosenRepo",
      default: 0,
      required: true,
      message: "Connect a Prismic Repository or create a new one",
      choices,
      pageSize: numberOfDisabledRepos + 2 <= 7 ? 7 : numberOfDisabledRepos + 2,
      // loop: false
    },
  ]);

  if (res.chosenRepo === CREATE_REPO) {
    const domainName = await promptForRepoDomain(base);
    return await createRepository(domainName, framework, cookies, base);
  }

  return res.chosenRepo;
}
