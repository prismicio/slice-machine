import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join, basename } from "node:path";

import { green, greenBright, red, bold, yellow } from "chalk";
import { execaSync } from "execa";

const cwd = process.cwd();

const smWorkspaceLocation = join(cwd, "packages", "slice-machine");
const packages = [
  "@prismicio/editor-ui",
  "@prismicio/editor-fields",
  "@prismicio/editor-support",
];
const seeMoreInfoMessage =
  "see CONTRIBUTING.md section on Local development with editor for more information.";

function fail(message: string) {
  console.error(red(message));
  process.exit(1);
}

function getYalcPrismicPackages() {
  const prismicPkgsDir = join(homedir(), ".yalc", "packages", "@prismicio");
  if (!existsSync(prismicPkgsDir)) return [];
  return readdirSync(prismicPkgsDir).map((name) => `@prismicio/${name}`);
}

async function linkPackages(packages: string[]) {
  const prismicPkgs = getYalcPrismicPackages();
  if (prismicPkgs.length === 0) {
    fail(`No packages to link, ${seeMoreInfoMessage}`);
  }

  let someFailed = false;
  for await (const name of packages) {
    if (prismicPkgs.includes(name)) {
      execaSync("yalc", ["link", name, "--dev"], { cwd: smWorkspaceLocation });
      console.log(`${greenBright("✔")} Linked ${bold(green(name))}`);
    } else {
      someFailed = true;
      console.log(`${red("✘")} Package ${bold(name)} not found in yalc`);
    }
  }
  if (someFailed) {
    console.error(
      yellow(`\nSome packages were not found in yalc, ${seeMoreInfoMessage}`),
    );
  }
}

function unlinkPackages(packages: string[]) {
  for (const pkg of packages) {
    execaSync("yalc", ["remove", pkg], { cwd: smWorkspaceLocation });
    console.log(`${greenBright("✘")} Unlinked ${bold(green(pkg))}`);
  }
}

function printHelp() {
  console.log(`Slice machine Yalc helper script

USAGE
  $ ${basename(process.argv[1])} <COMMAND>

COMMANDS
  link          Link slice-machine editor packages to yalc
  unlink        Unlink slice-machine editor packages from yalc

  --help, -h    Display help`);
}

const [command, ...options] = process.argv.slice(2);
if (options.includes("--help") || options.includes("-h")) {
  printHelp();
  process.exit(0);
}

switch (command) {
  case "link": {
    void linkPackages(packages);
    break;
  }
  case "unlink": {
    void unlinkPackages(packages);
    break;
  }
  default: {
    printHelp();
    process.exit(0);
  }
}
