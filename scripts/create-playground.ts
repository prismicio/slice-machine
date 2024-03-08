import mri from "mri";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as crypto from "node:crypto";

import { exec } from "./utils/commandUtils";
import chalk from "chalk";

const PLAYGROUNDS_ROOT = path.join(process.cwd(), "playgrounds");

createPlayground();

type Args = {
  "dry-run": boolean;
  start: boolean;
  framework: "next" | "nuxt" | "svelte" | (string & {});
};

/**
 * The root command.
 */
async function createPlayground(): Promise<void> {
  const args = mri<Args>(process.argv.slice(2), {
    boolean: ["dry-run", "start"],
    string: ["framework"],
    alias: { n: "dry-run", f: "framework" },
    default: { "dry-run": false, start: true, framework: "next" },
  });

  const projectName = appendRandomHash(args._[0] || createProjectName());
  const projectRoot = getProjectRoot(projectName);

  switch (args.framework) {
    case "next": {
      await createProject({
        projectName,
        npxCommand: [
          "create-next-app@latest",
          projectName,
          "--typescript",
          "--eslint",
          "--no-tailwind",
          "--import-alias=@/*",
          "--app",
          "--src-dir",
          "--use-yarn",
        ],
        adapterName: "@slicemachine/adapter-next",
        dryRun: args["dry-run"],
      });
      break;
    }

    default: {
      console.error(chalk.red(`Framework not supported: ${args.framework}`));
      process.exit(1);
    }
  }

  await patchPackageJSON(projectRoot, { dryRun: args["dry-run"] });
  await patchSliceMachineConfig(projectRoot, { dryRun: args["dry-run"] });

  console.info();
  console.info("Ready to play!");
  console.info(chalk.magenta(`cd playgrounds/${projectName} && yarn dev`));

  if (args.start) {
    console.info();
    await exec("yarn", ["dev"], {
      cwd: projectRoot,
      env: {
        // Use wroom.io
        SM_ENV: "staging",
      },
      dryRun: args["dry-run"],
      stdio: "inherit",
    });
  }
}

/**
 * Creates a project with the given name and `npx` command. By the end of this
 * command, the following are available:
 *
 * - A new website codebase created using the given `npx` command.
 * - An new empty Prismic repository.
 */
async function createProject(args: {
  projectName: string;
  npxCommand: string[];
  adapterName: string;
  dryRun: boolean;
}) {
  const projectRoot = getProjectRoot(args.projectName);

  console.info(
    `[1/3] Creating ${chalk.magenta(args.projectName)} using ${chalk.magenta(
      args.npxCommand[0],
    )}.`,
  );

  await exec("npx", args.npxCommand, {
    cwd: PLAYGROUNDS_ROOT,
    dryRun: args.dryRun,
  });

  console.info(
    `[2/3] Creating the ${chalk.magenta(
      "Prismic repository",
    )} and setting up ${chalk.magenta("Slice Machine")}.`,
  );
  await initSliceMachine(projectRoot, {
    projectName: args.projectName,
    dryRun: args.dryRun,
  });

  console.info(
    `[3/3] Linking ${chalk.magenta("slice-machine-ui")} and ${chalk.magenta(
      args.adapterName,
    )}.`,
  );
  await linkSliceMachinePackages(projectRoot, {
    adapterName: args.adapterName,
    dryRun: args.dryRun,
  });
}

/**
 * Runs `@slicemachine/init` within the project. The following options are
 * applied:
 *
 * - Create a repository using the value of `option.projectName`.
 * - Do not push models.
 * - Do not start Slice Machine.
 *
 * @param projectRoot - The root path of the project.
 * @param options - Options that determine the function's behavior.
 */
async function initSliceMachine(
  projectRoot: string,
  options: { projectName: string; dryRun: boolean },
) {
  await exec(
    "npx",
    [
      "@slicemachine/init@latest",
      `--repository="${options.projectName}"`,
      "--no-push",
      "--no-start-slicemachine",
    ],
    {
      cwd: projectRoot,
      env: {
        // Use wroom.io
        SM_ENV: "staging",
      },
      stdio: "inherit",
      dryRun: options.dryRun,
    },
  );
}

/**
 * Links Slice Machine packages to the workspace. This process allows the
 * playground to use the locally developed packages.
 *
 * @param projectRoot - The root path of the project.
 * @param options - Options that determine the function's behavior.
 */
async function linkSliceMachinePackages(
  projectRoot: string,
  options: { adapterName: string; dryRun: boolean },
) {
  await exec(
    "yarn",
    [
      "add",
      "-D",
      "slice-machine-ui@workspace:*",
      `${options.adapterName}@workspace:*`,
      "concurrently",
    ],
    {
      cwd: projectRoot,
      dryRun: options.dryRun,
    },
  );
}

/**
 * Patches a project's `package.json` with the following:
 *
 * - Renames the `dev` script to `dev:website`
 * - Adds a `dev:slicemachine` script to start Slice Machine in staging mode.
 * - Updates the `dev` script to run all `dev:*` scripts concurrently.
 *
 * @param projectRoot - The root path of the project.
 * @param options - Options that determine the function's behavior.
 */
async function patchPackageJSON(
  projectRoot: string,
  options: { dryRun: boolean },
): Promise<void> {
  if (options.dryRun) {
    return;
  }

  const originalPackageJSON = await fs.readFile(
    path.join(projectRoot, "package.json"),
    "utf8",
  );
  const newPackageJSON = JSON.parse(originalPackageJSON);
  newPackageJSON.scripts = {
    ...newPackageJSON.scripts,
    dev: 'concurrently --prefix-colors auto "yarn:dev:*"',
    "dev:website": `${newPackageJSON.scripts.dev} --port=8001`,
    "dev:slicemachine": `SM_ENV=staging yarn slicemachine`,
  };
  await fs.writeFile(
    path.join(projectRoot, "package.json"),
    JSON.stringify(newPackageJSON, null, 2),
  );
}

/**
 * Patches a project's Slice Machine configuration file with the following:
 *
 * - Replaces `localSliceSimulatorURL` with `localhost:8001`
 *
 * @param projectRoot - The root path of the project.
 * @param options - Options that determine the function's behavior.
 */
async function patchSliceMachineConfig(
  projectRoot: string,
  options: { dryRun: boolean },
): Promise<void> {
  if (options.dryRun) {
    return;
  }

  const originalSliceMachineConfig = await fs.readFile(
    path.join(projectRoot, "slicemachine.config.json"),
    "utf8",
  );

  const newSliceMachineConfig = JSON.parse(originalSliceMachineConfig);
  newSliceMachineConfig.localSliceSimulatorURL =
    "http://localhost:8001/slice-simulator";

  await fs.writeFile(
    path.join(projectRoot, "slicemachine.config.json"),
    JSON.stringify(newSliceMachineConfig, null, 2),
  );
}

/**
 * Returns a random project name. The name is not guaranteed to be unique. Use
 * `appendRandomHash` to virtually guarantee uniqueness.
 *
 * @see {@link appendRandomHash}
 */
function createProjectName() {
  const ADJECTIVES = [
    "adorable",
    "beautiful",
    "charming",
    "cloudy",
    "delightful",
    "focused",
    "honest",
    "inspiring",
    "lovable",
    "melodious",
    "pleasant",
    "pretty",
    "shiny",
    "sugary",
    "tall",
    "valliant",
  ];

  const PASTRIES = [
    "baguette",
    "briouat",
    "crepe",
    "croissant",
    "donut",
    "eclair",
    "flaons",
    "kolompeh",
    "macaron",
    "paste",
    "pretzel",
    "rustico",
    "semla",
    "strudel",
    "taiyaki",
    "toast",
  ];

  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const pastry = PASTRIES[Math.floor(Math.random() * PASTRIES.length)];

  return `${adjective}-${pastry}`;
}

/**
 * Appends a random 7 digit hash to a string.
 *
 * @param input - The string to which the hash is appended.
 */
function appendRandomHash(input: string) {
  const hash = crypto
    .createHash("sha1")
    .update(crypto.randomUUID())
    .digest("hex")
    .toString()
    .slice(-7);

  return `${input}-${hash}`;
}

/**
 * Returns a project's path. The path is not guaranteed to exist.
 *
 * @param projectName - The directory name of the project.
 */
function getProjectRoot(projectName: string): string {
  return path.join(PLAYGROUNDS_ROOT, projectName);
}
