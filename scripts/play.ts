import mri from "mri";
import chalk from "chalk";
import * as fs from "node:fs/promises";
import * as fsSync from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";

import { exec } from "./utils/commandUtils";

const PLAYGROUNDS_ROOT = path.join(process.cwd(), "playgrounds");
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

  const playgroundRoot = path.join(PLAYGROUNDS_ROOT, playgroundName);
  const playgroundExists = await pathExists(playgroundRoot);

  if (playgroundExists) {
    if (args.new) {
      console.error(
        chalk.red`A playground named ${playgroundName} already exists. Exiting.`,
      );
      process.exit(1);
    }

    if (didProvidePlaygroundName) {
      console.info(`Using playground: ${chalk.blue(playgroundName)}`);
    } else {
      console.info(
        `Reusing most recent playground: ${chalk.blue(playgroundName)}`,
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
    console.log(`Creating a new playground: ${chalk.blue(playgroundName)}`);

    // Ensure dependencies are isolated from the monorepo.
    if (!(await pathExists(path.join(PLAYGROUNDS_ROOT, "yarn.lock")))) {
      await fs.writeFile(path.join(PLAYGROUNDS_ROOT, "yarn.lock"), "");
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
}

/**
 * Creates a new playground.
 *
 * @param name - The name of the playground. It must be unique.
 * @param root - The directory of the playground. It must be unique.
 * @param options - Options that determine the function's behavior.
 */
async function createPlayground(
  name: string,
  root: string,
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
        root,
        { dryRun: options.dryRun },
      );

      await updatePackageJSON(
        root,
        { scripts: { "next:dev": "next dev --port=8001" } },
        { dryRun: options.dryRun },
      );

      await updateSliceMachineConfig(
        root,
        { localSliceSimulatorURL: "http://localhost:8001/slice-simulator" },
        { dryRun: options.dryRun },
      );

      break;
    }

    case "sveltekit": {
      await cloneGitRepo(
        "https://github.com/prismicio-community/sveltekit-starter-prismic-minimal.git",
        root,
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
    await fs.rm(path.join(root, ".git"), { recursive: true });
    await fs.rm(path.join(root, "package-lock.json"));
  }

  await exec("yarn", ["add", "--dev", "cross-env"], {
    cwd: root,
    stdio: "inherit",
    dryRun: options.dryRun,
  });

  await updatePackageJSON(
    root,
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
    root,
    { apiEndpoint: `https://${name}.cdn.wroom.io/api/v2` },
    { dryRun: options.dryRun },
  );

  await exec(
    "npx",
    [
      "@slicemachine/init@latest",
      `--repository="${name}"`,
      "--no-start-slicemachine",
    ],
    {
      cwd: root,
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
  dir: string,
  options?: DryRunOption,
): Promise<void> {
  await exec("git", ["clone", "--depth=1", url, dir], {
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

  return appendRandomHash(`${adjective}-${pastry}`);
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
 * Returns the name of the last modified file or directory in a given directory.
 *
 * @param dir - The directory to search.
 * @param options - Options that determine the function's behavior.
 */
async function getLastModifiedEntry(
  dir: string,
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
      fsSync.statSync(path.join(b.path, b.name)).mtimeMs -
      fsSync.statSync(path.join(a.path, a.name)).mtimeMs
    );
  })[0].name;
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await fs.access(path);

    return true;
  } catch {
    return false;
  }
}

type PackageJSON = {
  name: string;
  scripts: Record<string, string>;
};

async function updatePackageJSON(
  root: string,
  contents: Partial<PackageJSON>,
  options?: DryRunOption,
) {
  await updateJSONFile(path.join(root, "package.json"), contents, options);
}

type SliceMachineConfig = {
  localSliceSimulatorURL?: string;
  apiEndpoint?: string;
};

async function updateSliceMachineConfig(
  root: string,
  contents: Partial<SliceMachineConfig>,
  options?: DryRunOption,
) {
  await updateJSONFile(
    path.join(root, "slicemachine.config.json"),
    contents,
    options,
  );
}

async function updateJSONFile<TSchema extends Record<string, unknown>>(
  filePath: string,
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
