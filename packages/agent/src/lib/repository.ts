import type { SliceMachineManager } from "@slicemachine/manager";
import chalk from "chalk";
import { prompt } from "./prompt";

export async function selectRepository(
  manager: SliceMachineManager,
  verbose: boolean,
): Promise<{ domain: string; exists: boolean }> {
  if (verbose) {
    console.log(chalk.gray("📋 Fetching your repositories..."));
  }

  const repositories = await manager.prismicRepository.readAll();

  if (repositories.length === 0) {
    throw new Error(
      "You don't have access to any Prismic repositories. Please create one at https://prismic.io/dashboard",
    );
  }

  if (verbose) {
    console.log(
      chalk.gray(
        `✅ Found ${repositories.length} ${
          repositories.length === 1 ? "repository" : "repositories"
        }`,
      ),
    );
  }

  const { maybeDomain } = await prompt<string, "maybeDomain">({
    type: "select",
    name: "maybeDomain",
    message: "Select a repository to connect to:",
    warn: "You don't have write access to this repository",
    choices: repositories
      .map((repository) => {
        const hasWriteAccess =
          manager.prismicRepository.hasWriteAccess(repository);

        return {
          title: `${repository.domain}${
            hasWriteAccess ? "" : " (Unauthorized)"
          }`,
          description: repository.name || repository.domain,
          value: repository.domain,
          disabled: !hasWriteAccess,
        };
      })
      .sort((a, b) => (a.value > b.value ? 1 : -1)),
  });

  if (!maybeDomain) {
    throw new Error("No repository selected");
  }

  if (verbose) {
    console.log(
      chalk.green(`✅ Selected repository: ${chalk.cyan(maybeDomain)}`),
    );
  }

  return {
    domain: maybeDomain,
    exists: true,
  };
}
