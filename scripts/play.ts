import mri from "mri";
import chalk from "chalk";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as fs from "node:fs/promises";
import * as fsSync from "node:fs";
import * as crypto from "node:crypto";

import {
  CommandError,
  exec,
  handleUncaughtException,
} from "./utils/commandUtils";

const PLAYGROUNDS_ROOT = new URL("../playgrounds/", import.meta.url);
const DEFAULT_FRAMEWORK = "next" satisfies Args["framework"];

run();

type Args = {
  "dry-run": boolean;
  start: boolean;
  new: boolean;
  framework?: "next" | "nuxt" | "sveltekit" | (string & {});
};

type DryRunOption = {
  /**
   * If `true`, commands are not executed.
   */
  dryRun?: boolean;
};

/**
 * The root command.
 */
async function run(): Promise<void> {
  process.on("uncaughtException", handleUncaughtException);

  const args = mri<Args>(process.argv.slice(2), {
    boolean: ["dry-run", "start", "new"],
    string: ["framework"],
    alias: { n: "dry-run", f: "framework" },
    default: { "dry-run": false, start: true, new: false },
  });

  let [playgroundName] = args._;
  const didProvidePlaygroundName = Boolean(playgroundName);

  if (!playgroundName) {
    if (args.new) {
      playgroundName = createRandomName();
    } else {
      playgroundName =
        (await getLastModifiedEntry(PLAYGROUNDS_ROOT, {
          exclude: [".yarn", "node_modules"],
          dirOnly: true,
        })) ?? createRandomName();
    }
  }

  const playgroundRoot = new URL(`./${playgroundName}/`, PLAYGROUNDS_ROOT);
  const playgroundExists = await pathExists(playgroundRoot);

  if (playgroundExists) {
    if (args.new) {
      throw new CommandError(
        `A playground named ${playgroundName} already exists. Exiting.`,
      );
    }

    if (didProvidePlaygroundName) {
      console.info(`Using playground: ${chalk.green(playgroundName)}`);
    } else {
      console.info(
        `Reusing most recent playground: ${chalk.green(playgroundName)}`,
      );
    }

    console.info('  (Use "--new" to create a new playground)');
    console.info();

    if (args.framework) {
      console.warn(
        chalk.yellow`The --framework/-f argument is ignored when a playground already exists.`,
      );
    }
  } else {
    console.log(`Creating a new playground: ${chalk.green(playgroundName)}`);

    // Ensure dependencies are isolated from the monorepo.
    if (!(await pathExists(new URL("./yarn.lock", PLAYGROUNDS_ROOT)))) {
      await fs.writeFile(new URL("./yarn.lock", PLAYGROUNDS_ROOT), "");
    }

    await createPlayground(playgroundName, playgroundRoot, {
      framework: args.framework ?? DEFAULT_FRAMEWORK,
      dryRun: args["dry-run"],
    });
  }

  if (args.start) {
    await exec("yarn", ["dev"], {
      cwd: playgroundRoot,
      stdio: "inherit",
      dryRun: args["dry-run"],
    });
  }

  process.off("uncaughtException", handleUncaughtException);
}

/**
 * Creates a new playground.
 *
 * @param name - The name of the playground. It must be unique.
 * @param dir - The directory of the playground. It must be unique.
 * @param options - Options that determine the function's behavior.
 */
async function createPlayground(
  name: string,
  dir: URL,
  options: DryRunOption & {
    /**
     * The framework used to bootstrap the playground.
     */
    framework: Args["framework"];
  },
) {
  switch (options.framework ?? "next") {
    case "next": {
      await cloneGitRepo(
        "https://github.com/prismicio-community/nextjs-starter-prismic-minimal-ts.git",
        dir,
        { dryRun: options.dryRun },
      );

      await updatePackageJSON(
        dir,
        { scripts: { "next:dev": "next dev --port=8001" } },
        { dryRun: options.dryRun },
      );

      await updateSliceMachineConfig(
        dir,
        { localSliceSimulatorURL: "http://localhost:8001/slice-simulator" },
        { dryRun: options.dryRun },
      );

      break;
    }

    case "sveltekit": {
      await cloneGitRepo(
        "https://github.com/prismicio-community/sveltekit-starter-prismic-minimal.git",
        dir,
        { dryRun: options.dryRun },
      );

      break;
    }

    default: {
      console.error(chalk.red`Framework not supported: ${options.framework}`);
      process.exit(1);
    }
  }

  if (!options.dryRun) {
    await fs.rm(new URL("./.git", dir), { recursive: true });
    await fs.rm(new URL("package-lock.json", dir));
  }

  await exec("yarn", ["add", "--dev", "cross-env"], {
    cwd: dir,
    stdio: "inherit",
    dryRun: options.dryRun,
  });

  await updatePackageJSON(
    dir,
    {
      name,
      scripts: {
        slicemachine:
          "cross-env SM_ENV=staging ../../packages/start-slicemachine/bin/start-slicemachine.js",
      },
    },
    { dryRun: options.dryRun },
  );

  await updateSliceMachineConfig(
    dir,
    { apiEndpoint: `https://${name}.cdn.wroom.io/api/v2` },
    { dryRun: options.dryRun },
  );

  await exec(
    "yarn",
    [
      "dlx",
      "--quiet",
      "@slicemachine/init@latest",
      `--repository="${name}"`,
      "--no-start-slicemachine",
    ],
    {
      cwd: dir,
      env: {
        // Use wroom.io
        SM_ENV: "staging",
      },
      stdio: "inherit",
      dryRun: options?.dryRun,
    },
  );
}

async function cloneGitRepo(
  url: string,
  dir: URL,
  options?: DryRunOption,
): Promise<void> {
  await exec("git", ["clone", "--depth=1", url, fileURLToPath(dir)], {
    stdio: "inherit",
    dryRun: options?.dryRun,
  });
}

/**
 * Returns a random project name. The name is not guaranteed to be unique. Use
 * `appendRandomHash` to virtually guarantee uniqueness.
 *
 * @see {@link appendRandomHash}
 */
function createRandomName() {
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

  return `${adjective}-${pastry}-${generateRandomHash()}`;
}

/**
 * Generates a random 7 digit hash.
 */
function generateRandomHash() {
  return crypto
    .createHash("sha1")
    .update(crypto.randomUUID())
    .digest("hex")
    .toString()
    .slice(-7);
}

/**
 * Returns the name of the last modified file or directory in a given directory.
 *
 * @param dir - The directory to search.
 * @param options - Options that determine the function's behavior.
 */
async function getLastModifiedEntry(
  dir: URL,
  options?: {
    /**
     * A list of file or directory names to exclude.
     */
    exclude?: string[];

    /**
     * Determines if only directories are considered.
     */
    dirOnly?: boolean;
  },
): Promise<string | undefined> {
  let entries = await fs.readdir(dir, { withFileTypes: true });

  if (options?.exclude) {
    entries = entries.filter((entry) => !options.exclude?.includes(entry.name));
  }

  if (options?.dirOnly) {
    entries = entries.filter((entry) => entry.isDirectory());
  }

  if (entries.length < 1) {
    return;
  }

  return entries.sort((a, b) => {
    return (
      fsSync.statSync(new URL(b.name, pathToFileURL(b.path))).mtimeMs -
      fsSync.statSync(new URL(a.name, pathToFileURL(a.path))).mtimeMs
    );
  })[0].name;
}

async function pathExists(path: URL): Promise<boolean> {
  try {
    await fs.access(path);

    return true;
  } catch {
    return false;
  }
}

type PackageJSON = {
  name: string;
  scripts: Partial<Record<string, string>>;
};

async function updatePackageJSON(
  dir: URL,
  contents: Partial<PackageJSON>,
  options?: DryRunOption,
) {
  await updateJSONFile(new URL("package.json", dir), contents, options);
}

type SliceMachineConfig = {
  localSliceSimulatorURL?: string;
  apiEndpoint?: string;
};

async function updateSliceMachineConfig(
  dir: URL,
  contents: Partial<SliceMachineConfig>,
  options?: DryRunOption,
) {
  await updateJSONFile(
    new URL("slicemachine.config.json", dir),
    contents,
    options,
  );
}

async function updateJSONFile<TSchema extends Record<string, unknown>>(
  filePath: URL,
  contents: Partial<TSchema>,
  options?: DryRunOption,
) {
  if (options?.dryRun) {
    console.info(`Update ${filePath} with ${JSON.stringify(contents)}`);

    return;
  }

  const existingContents = JSON.parse(await fs.readFile(filePath, "utf8"));
  const newContents = deepMerge(existingContents, contents);

  await fs.writeFile(filePath, JSON.stringify(newContents, null, 2));
}

function deepMerge(a: any, b: any): Record<PropertyKey, unknown> {
  const result = { ...a, ...b };

  for (const key of Object.keys(result)) {
    result[key] =
      typeof a[key] == "object" && typeof b[key] == "object"
        ? deepMerge(a[key], b[key])
        : structuredClone(result[key]);
  }

  return result;
}
