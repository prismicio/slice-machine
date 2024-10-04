import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { green, greenBright, red, bold } from "chalk";
import { execaSync } from "execa";

const cwd = process.cwd();

const smWorkspaceLocation = join(cwd, "packages", "slice-machine");
const packages = [
  "@prismicio/editor-ui",
  "@prismicio/editor-fields",
  "@prismicio/editor-support",
];

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
    fail("No packaged to link");
  }

  for await (const name of packages) {
    if (prismicPkgs.includes(name)) {
      execaSync("yalc", ["link", name, "--dev"], { cwd: smWorkspaceLocation });
      console.log(`${greenBright("✔")} Linked ${bold(green(name))}`);
    } else {
      console.log(`${red('✘')} Package ${bold(name)} not found in yalc`);
    }
  }
}

function unlinkPackages(packages: string[]) {
  for (const pkg of packages) {
    execaSync("yalc", ["remove", pkg], { cwd: smWorkspaceLocation });
    console.log(`${greenBright("✘")} Unlinked ${bold(green(pkg))}`);
  }
}

const [command] = process.argv.slice(2);
switch (command) {
  case "link": {
    void linkPackages(packages);
    break;
  }
  case "clean": {
    void unlinkPackages(packages);
    break;
  }
  default: {
    fail("Command not found");
  }
}
