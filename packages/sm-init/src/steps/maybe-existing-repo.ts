import * as inquirer from "inquirer";
import { Communication, Utils } from "slicemachine-core";

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

export async function maybeExistingRepo(
  cookie: string,
  base = DEFAULT_BASE
): Promise<{ name: string; existing: boolean }> {
  const repos = await Communication.listRepositories(cookie, base);

  if (repos.length === 0) {
    const name = await promptForCreateRepo(base);
    return { existing: false, name };
  }

  const res = await inquirer.prompt<Record<string, string>>([
    {
      type: "list",
      name: "repoName",
      default: 0,
      required: true,
      message: "Connect a Prismic Repository or create a new one",
      choices: [
        { name: "Create a new Repository", value: CREATE_REPO },
        new inquirer.Separator("---- Use an existing Repository ----"),
        ...repos.map((d) => ({ name: d, value: d })),
      ],
    },
  ]);

  if (res.repoName === CREATE_REPO) {
    const name = await promptForCreateRepo(base);
    return { existing: false, name };
  }
  return { existing: true, name: res.repoName };
}
