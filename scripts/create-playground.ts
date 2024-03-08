import mri from "mri";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as crypto from "node:crypto";

import { exec } from "./utils/commandUtils";
import chalk from "chalk";

createPlayground();

type Args = {
  "dry-run": boolean;
  framework: "next" | "nuxt" | "svelte";
};

async function createPlayground(): Promise<void> {
  const args = mri<Args>(process.argv.slice(2), {
    boolean: ["dry-run", "tolerate-republish"],
    string: ["framework"],
    alias: { n: "dry-run", f: "framework" },
    default: { "dry-run": false, framework: "next" },
  });

  if (args.framework !== "next") {
    throw new Error(`${args.framework} is not supported. Exiting.`);
  }

  const [projectName] = args._;

  await createNextProject(projectName, { dryRun: args["dry-run"] });
}

async function createNextProject(
  projectName = createProjectName(),
  options: { dryRun: boolean },
) {
  const uniqueProjectName = appendHash(projectName);

  const playgroundsRoot = path.join(process.cwd(), "playgrounds");
  const projectRoot = path.join(playgroundsRoot, uniqueProjectName);

  console.info(
    `[1/3] Creating ${chalk.magenta(uniqueProjectName)} using ${chalk.magenta(
      "create-next-app",
    )}.`,
  );

  await exec(
    "npx",
    [
      "create-next-app@latest",
      uniqueProjectName,
      "--typescript",
      "--eslint",
      "--no-tailwind",
      "--import-alias=@/*",
      "--app",
      "--src-dir",
      "--use-yarn",
    ],
    {
      cwd: playgroundsRoot,
      dryRun: options?.dryRun ?? false,
    },
  );

  console.info(
    `[2/3] Creating the ${chalk.magenta(
      "Prismic repository",
    )} and setting up ${chalk.magenta("Slice Machine")}.`,
  );

  await exec(
    "npx",
    [
      "@slicemachine/init@latest",
      `--repository="${uniqueProjectName}"`,
      "--no-push",
      "--no-start-slicemachine",
    ],
    {
      cwd: projectRoot,
      dryRun: options?.dryRun ?? false,
      env: {
        SM_ENV: "staging",
      },
      stdio: "inherit",
    },
  );

  console.info(
    `[3/3] Linking ${chalk.magenta("slice-machine-ui")} and ${chalk.magenta(
      "@slicemachine/adapter-next",
    )}.`,
  );

  await exec(
    "yarn",
    [
      "add",
      "-D",
      "slice-machine-ui@workspace:*",
      "@slicemachine/adapter-next@workspace:*",
      "concurrently",
    ],
    {
      cwd: projectRoot,
      dryRun: options?.dryRun ?? false,
    },
  );

  if (!options.dryRun) {
    const originalPackageJSON = await fs.readFile(
      path.join(projectRoot, "package.json"),
      "utf8",
    );
    const newPackageJSON = JSON.parse(originalPackageJSON);
    newPackageJSON.scripts = {
      ...newPackageJSON.scripts,
      dev: 'concurrently --prefix-colors auto "yarn:dev:*"',
      "dev:next": `${newPackageJSON.scripts.dev} --port=8001`,
      "dev:slicemachine": `SM_ENV=staging yarn slicemachine`,
    };
    await fs.writeFile(
      path.join(projectRoot, "package.json"),
      JSON.stringify(newPackageJSON, null, 2),
    );

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

  console.info();
  console.info("Ready to play!");
  console.info(
    chalk.magenta(`cd playgrounds/${uniqueProjectName} && yarn dev`),
  );

  console.info();
  await exec("yarn", ["dev"], {
    cwd: projectRoot,
    dryRun: options?.dryRun ?? false,
    stdio: "inherit",
  });
}

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

function appendHash(input: string) {
  const hash = crypto
    .createHash("sha1")
    .update(crypto.randomUUID())
    .digest("hex")
    .toString()
    .slice(-7);

  return `${input}-${hash}`;
}
