import { writeFile, access, mkdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import chalk from "chalk";
import semver from "semver";
import type { NextEnvironment } from "../detectEnvironment";

export async function createAPIRoutes(
  cwd: string,
  env: NextEnvironment,
  verbose: boolean,
): Promise<void> {
  await createPreviewRoute(cwd, env, verbose);
  await createExitPreviewRoute(cwd, env, verbose);

  if (env.hasAppRouter) {
    await createRevalidateRoute(cwd, env, verbose);
  }
}

async function createPreviewRoute(
  cwd: string,
  env: NextEnvironment,
  verbose: boolean,
): Promise<void> {
  const extension = env.isTypeScript ? "ts" : "js";
  const basePath = env.hasSrcDirectory ? "src" : ".";

  const filename = env.hasAppRouter
    ? join(cwd, basePath, "app", "api", "preview", `route.${extension}`)
    : join(cwd, basePath, "pages", "api", `preview.${extension}`);

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
      contents = `import { NextRequest } from "next/server";
import { redirectToPreviewURL } from "@prismicio/next";

import { createClient } from "../../../prismicio";

export async function GET(request: NextRequest) {
  const client = createClient();

  return await redirectToPreviewURL({ client, request });
}
`;
    } else {
      contents = `import { redirectToPreviewURL } from "@prismicio/next";

import { createClient } from "../../../prismicio";

export async function GET(request) {
  const client = createClient();

  return await redirectToPreviewURL({ client, request });
}
`;
    }
  } else {
    if (env.isTypeScript) {
      contents = `import { NextApiRequest, NextApiResponse } from "next";
import { setPreviewData, redirectToPreviewURL } from "@prismicio/next/pages";

import { createClient } from "../../prismicio";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = createClient({ req });

  setPreviewData({ req, res });

  return await redirectToPreviewURL({ req, res, client });
}
`;
    } else {
      contents = `import { setPreviewData, redirectToPreviewURL } from "@prismicio/next/pages";

import { createClient } from "../../prismicio";

export default async function handler(req, res) {
  const client = createClient({ req });

  setPreviewData({ req, res });

  return await redirectToPreviewURL({ req, res, client });
}
`;
    }
  }

  await writeFile(filename, contents, "utf8");

  if (verbose) {
    const displayPath = filename.replace(cwd + "/", "");
    console.log(chalk.green(`✅ Created ${displayPath}`));
  }
}

async function createExitPreviewRoute(
  cwd: string,
  env: NextEnvironment,
  verbose: boolean,
): Promise<void> {
  const extension = env.isTypeScript ? "ts" : "js";
  const basePath = env.hasSrcDirectory ? "src" : ".";

  const filename = env.hasAppRouter
    ? join(cwd, basePath, "app", "api", "exit-preview", `route.${extension}`)
    : join(cwd, basePath, "pages", "api", `exit-preview.${extension}`);

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
    contents = `import { exitPreview } from "@prismicio/next";

export function GET() {
  return exitPreview();
}
`;
  } else {
    if (env.isTypeScript) {
      contents = `import { NextApiRequest, NextApiResponse } from "next";
import { exitPreview } from "@prismicio/next/pages";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return exitPreview({ req, res });
}
`;
    } else {
      contents = `import { exitPreview } from "@prismicio/next/pages";

export default function handler(req, res) {
  return exitPreview({ req, res });
}
`;
    }
  }

  await writeFile(filename, contents, "utf8");

  if (verbose) {
    const displayPath = filename.replace(cwd + "/", "");
    console.log(chalk.green(`✅ Created ${displayPath}`));
  }
}

async function createRevalidateRoute(
  cwd: string,
  env: NextEnvironment,
  verbose: boolean,
): Promise<void> {
  const extension = env.isTypeScript ? "ts" : "js";
  const basePath = env.hasSrcDirectory ? "src" : ".";
  const filename = join(
    cwd,
    basePath,
    "app",
    "api",
    "revalidate",
    `route.${extension}`,
  );

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

  // Check if Next.js 16+ (supports cacheLife)
  const supportsCacheLife = await checkNextJSVersionSupportsCache(cwd);
  const revalidateArgs = supportsCacheLife ? '"prismic", "max"' : '"prismic"';

  const contents = `import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST() {
  revalidateTag(${revalidateArgs});

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
`;

  await writeFile(filename, contents, "utf8");

  if (verbose) {
    const displayPath = filename.replace(cwd + "/", "");
    console.log(chalk.green(`✅ Created ${displayPath}`));
  }
}

async function checkNextJSVersionSupportsCache(cwd: string): Promise<boolean> {
  try {
    const pkgPath = join(cwd, "package.json");
    const content = await readFile(pkgPath, "utf-8");
    const pkg = JSON.parse(content);

    const allDependencies = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };

    const nextVersion = allDependencies.next;
    if (!nextVersion) {
      return false;
    }

    // Try to parse the version
    const minVersion = semver.minVersion(nextVersion);
    if (!minVersion) {
      // If we can't parse (e.g., "latest", "beta"), assume it's new
      return true;
    }

    return semver.gte(minVersion, "16.0.0-beta.0");
  } catch {
    // If we can't determine, use the old API (safer)
    return false;
  }
}
