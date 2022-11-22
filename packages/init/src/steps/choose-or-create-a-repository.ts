import * as inquirer from "inquirer";
import Separator from "inquirer/lib/objects/separator";
import { Models } from "@prismic-beta/slicemachine-core";
import * as NodeUtils from "@prismic-beta/slicemachine-core/build/node-utils";
import { createRepository } from "../utils/create-repo";
import { validateRepositoryName } from "../utils/validateRepositoryName";
import { InitClient, logs } from "../utils";

export const CREATE_REPO = "$_CREATE_REPO"; // not a valid domain name

export function prettyRepoName(address: URL, domain: string): string {
  return `${logs.cyan.dim(`${address.protocol}//`)}${logs.cyan(
    domain
  )}${logs.cyan.dim(`.${address.hostname}`)}`;
}

export async function promptForRepoDomain(
  client: InitClient,
  defaultValue?: string
): Promise<string> {
  const address = new URL(client.apisEndpoints.Wroom);

  logs.writeInfo(
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
        transformer: (value: string | undefined) =>
          prettyRepoName(address, value || defaultValue || "repository"),
        validate: (name: string) => validateRepositoryName(client, name),
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
        name: `${logs.purple.dim("Use")} ${logs.bold.dim(
          name
        )} ${logs.purple.dim(`"${address.hostname}"`)}`,
        value: domain,
        disabled: "Unauthorized",
      };
    }

    return {
      name: `${logs.purple("Use")} ${logs.bold(name)} ${logs.purple(
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
    name: `${logs.purple("Create a")} ${logs.bold("new")} ${logs.purple(
      "Repository"
    )}`,
    value: CREATE_REPO,
  };

  const maybeConfiguredRepoName = NodeUtils.maybeRepoNameFromSMFile(cwd, base);

  return repos
    .reverse()
    .map(makeReposPretty(base))
    .reduce(maybeStickTheRepoToTheTopOfTheList(maybeConfiguredRepoName), [
      createNew,
    ])
    .sort(orderPrompts(maybeConfiguredRepoName));
}

export async function chooseOrCreateARepository(
  client: InitClient,
  cwd: string,
  framework: Models.Frameworks,
  preSelectedRepository?: string
): Promise<string> {
  const repositories: Models.Repository[] = await client.listRepositories();

  const isPreSelectedValid =
    preSelectedRepository &&
    repositories.find(
      (repository) => repository.domain === preSelectedRepository
    );
  if (isPreSelectedValid) return preSelectedRepository;

  // No repository to display, ask for a new repository name to create it.
  if (repositories.length === 0) {
    const domainName = await promptForRepoDomain(client, preSelectedRepository);
    await createRepository(client, domainName, framework);
    return domainName;
  }

  // prepare the list of repositories to display
  const choices = sortReposForPrompt(
    repositories,
    client.apisEndpoints.Wroom,
    cwd
  );
  const numberOfDisabledRepos = choices.filter((repo) => {
    if (repo instanceof Separator) return false;
    return repo.disabled;
  }).length;

  // display the list of repositories and wait for the user to choose one.
  const promptResult = await inquirer.prompt<{ chosenRepository: string }>([
    {
      type: "list",
      name: "chosenRepository",
      default: 0,
      required: true,
      message: "Connect a Prismic Repository or create a new one",
      choices,
      pageSize: numberOfDisabledRepos + 2 <= 7 ? 7 : numberOfDisabledRepos + 2,
    },
  ]);

  // If the user has chosen to create a new repository.
  if (promptResult.chosenRepository === CREATE_REPO) {
    const domainName = await promptForRepoDomain(client, preSelectedRepository);
    await createRepository(client, domainName, framework);
    return domainName;
  }

  return promptResult.chosenRepository;
}
