import { writeFile, access, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import chalk from "chalk";
import type { NextEnvironment } from "../detectEnvironment";

export async function createSliceSimulator(
  cwd: string,
  env: NextEnvironment,
  verbose: boolean,
): Promise<void> {
  const extension = env.isTypeScript ? "tsx" : "jsx";
  const basePath = env.hasSrcDirectory ? "src" : ".";

  const filename = env.hasAppRouter
    ? join(cwd, basePath, "app", "slice-simulator", `page.${extension}`)
    : join(cwd, basePath, "pages", `slice-simulator.${extension}`);

  // Check if file already exists
  try {
    await access(filename);
    if (verbose) {
      const displayPath = filename.replace(cwd + "/", "");
      console.log(chalk.gray(`⏭️  Skipped ${displayPath} (exists)`));
    }
    return;
  } catch {
    // File doesn't exist, create it
  }

  // Ensure directory exists
  await mkdir(dirname(filename), { recursive: true });

  let contents: string;

  if (env.hasAppRouter) {
    if (env.isTypeScript) {
      contents = `import {
  SliceSimulator,
  SliceSimulatorParams,
  getSlices,
} from "@slicemachine/adapter-next/simulator";
import { SliceZone } from "@prismicio/react";

import { components } from "../../slices";

export default async function SliceSimulatorPage({
  searchParams,
}: SliceSimulatorParams) {
  const { state } = await searchParams;
  const slices = getSlices(state);

  return (
    <SliceSimulator>
      <SliceZone slices={slices} components={components} />
    </SliceSimulator>
  );
}
`;
    } else {
      contents = `import {
  SliceSimulator,
  getSlices,
} from "@slicemachine/adapter-next/simulator";
import { SliceZone } from "@prismicio/react";

import { components } from "../../slices";

export default async function SliceSimulatorPage({ searchParams }) {
  const { state } = await searchParams;
  const slices = getSlices(state);

  return (
    <SliceSimulator>
      <SliceZone slices={slices} components={components} />
    </SliceSimulator>
  );
}
`;
    }
  } else {
    contents = `import { SliceSimulator } from "@slicemachine/adapter-next/simulator";
import { SliceZone } from "@prismicio/react";

import { components } from "../slices";

export default function SliceSimulatorPage() {
  return (
    <SliceSimulator
      sliceZone={(props) => <SliceZone {...props} components={components} />}
    />
  );
}
`;
  }

  await writeFile(filename, contents, "utf8");

  if (verbose) {
    const displayPath = filename.replace(cwd + "/", "");
    console.log(chalk.green(`✅ Created ${displayPath}`));
  }
}
