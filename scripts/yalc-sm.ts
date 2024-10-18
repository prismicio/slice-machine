import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join, basename } from "node:path";
import { exit } from "node:process";
import { green, greenBright, red, bold, yellow } from "chalk";

import {
  CommandError,
  execSync,
  handleUncaughtException,
} from "./utils/commandUtils";

const cwd = process.cwd();
const smWorkspaceLocation = join(cwd, "packages", "slice-machine");

const packages = [
  "@prismicio/editor-ui",
  "@prismicio/editor-fields",
  "@prismicio/editor-support",
];
const seeMoreInfoMessage =
  "see CONTRIBUTING.md section on Local development with editor for more information.";

function getYalcPrismicPackages() {
  const prismicPkgsDir = join(homedir(), ".yalc", "packages", "@prismicio");
  if (!existsSync(prismicPkgsDir)) return [];
  return readdirSync(prismicPkgsDir).map((name) => `@prismicio/${name}`);
}

function linkPackages(packages: string[]) {
  process.on("uncaughtException", handleUncaughtException);

  const prismicPkgs = getYalcPrismicPackages();
  if (prismicPkgs.length === 0) {
    throw new CommandError(`No packages to link, ${seeMoreInfoMessage}`);
  }

  let someFailed = false;
  for (const name of packages) {
    if (prismicPkgs.includes(name)) {
      execSync("yalc", ["link", name, "--dev"], { cwd: smWorkspaceLocation });
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

  process.off("uncaughtException", handleUncaughtException);
}

function unlinkPackages(packages: string[]) {
  process.on("uncaughtException", handleUncaughtException);

  for (const pkg of packages) {
    execSync("yalc", ["remove", pkg], { cwd: smWorkspaceLocation });
    console.log(`${greenBright("✘")} Unlinked ${bold(green(pkg))}`);
  }

  process.off("uncaughtException", handleUncaughtException);
}

function printHelp() {
  console.log(`Slice machine Yalc helper script

USAGE
  $ ${basename(process.argv[1])} <COMMAND> [OPTIONS...]

COMMANDS
  link          Link slice-machine editor packages to yalc
  unlink        Unlink slice-machine editor packages from yalc

OPTIONS
  --help, -h    Display help`);
}

const [command, ...options] = process.argv.slice(2);
if (options.includes("--help") || options.includes("-h")) {
  printHelp();
  exit(0);
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
    exit(0);
  }
}
