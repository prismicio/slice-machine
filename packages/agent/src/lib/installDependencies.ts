import { execa } from "execa";
import chalk from "chalk";

type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

const RUNTIME_DEPENDENCIES = [
  "@prismicio/client@latest",
  "@prismicio/react@latest",
  "@prismicio/next@latest",
  "@slicemachine/adapter-next@latest",
];

export async function installDependencies(
  packageManager: PackageManager,
  verbose: boolean,
): Promise<void> {
  if (verbose) {
    console.log(
      chalk.gray(
        `📥 Installing Prismic dependencies with ${chalk.cyan(
          packageManager,
        )}...`,
      ),
    );
  }

  const command = getInstallCommand(packageManager);
  const args = getInstallArgs(packageManager);

  try {
    await execa(command, [...args, ...RUNTIME_DEPENDENCIES], {
      stdio: "ignore", // Always suppress npm output
    });

    if (verbose) {
      console.log(
        chalk.green(
          "✅ Installed @prismicio/client, @prismicio/react, @prismicio/next, @slicemachine/adapter-next",
        ),
      );
    }
  } catch (error) {
    throw new Error(
      `Failed to install dependencies with ${packageManager}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

function getInstallCommand(packageManager: PackageManager): string {
  return packageManager;
}

function getInstallArgs(packageManager: PackageManager): string[] {
  switch (packageManager) {
    case "npm":
      return ["install", "--save"];
    case "yarn":
      return ["add"];
    case "pnpm":
      return ["add"];
    case "bun":
      return ["add"];
  }
}
