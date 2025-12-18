import { readFile, access } from "node:fs/promises";
import { join } from "node:path";

export type NextEnvironment = {
  hasAppRouter: boolean;
  hasPagesRouter: boolean;
  isTypeScript: boolean;
  hasSrcDirectory: boolean;
  packageManager: "npm" | "yarn" | "pnpm" | "bun";
};

export async function detectEnvironment(cwd: string): Promise<NextEnvironment> {
  // First, validate this is a Next.js project
  await validateNextJsProject(cwd);

  const [
    hasAppRouter,
    hasPagesRouter,
    isTypeScript,
    hasSrcDirectory,
    packageManager,
  ] = await Promise.all([
    checkHasAppRouter(cwd),
    checkHasPagesRouter(cwd),
    checkIsTypeScript(cwd),
    checkHasSrcDirectory(cwd),
    detectPackageManager(cwd),
  ]);

  // Ensure we detected at least one router
  if (!hasAppRouter && !hasPagesRouter) {
    throw new Error(
      "Could not detect Next.js project structure. Expected to find either an 'app' or 'pages' directory.",
    );
  }

  return {
    hasAppRouter,
    hasPagesRouter,
    isTypeScript,
    hasSrcDirectory,
    packageManager,
  };
}

async function validateNextJsProject(cwd: string): Promise<void> {
  try {
    const pkgPath = join(cwd, "package.json");
    const content = await readFile(pkgPath, "utf-8");
    const pkg = JSON.parse(content);

    const allDependencies = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };

    if (!allDependencies.next) {
      throw new Error(
        "This does not appear to be a Next.js project. 'next' was not found in package.json dependencies.",
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Next.js")) {
      throw error;
    }
    throw new Error(
      "Could not find or read package.json. Please run this command in a Next.js project directory.",
    );
  }
}

async function checkHasAppRouter(cwd: string): Promise<boolean> {
  try {
    await access(join(cwd, "app"));
    return true;
  } catch {
    try {
      await access(join(cwd, "src", "app"));
      return true;
    } catch {
      return false;
    }
  }
}

async function checkHasPagesRouter(cwd: string): Promise<boolean> {
  try {
    await access(join(cwd, "pages"));
    return true;
  } catch {
    try {
      await access(join(cwd, "src", "pages"));
      return true;
    } catch {
      return false;
    }
  }
}

async function checkIsTypeScript(cwd: string): Promise<boolean> {
  try {
    await access(join(cwd, "tsconfig.json"));
    return true;
  } catch {
    return false;
  }
}

async function checkHasSrcDirectory(cwd: string): Promise<boolean> {
  try {
    await access(join(cwd, "src"));
    return true;
  } catch {
    return false;
  }
}

async function detectPackageManager(
  cwd: string,
): Promise<"npm" | "yarn" | "pnpm" | "bun"> {
  // Check for lock files in order of preference
  try {
    await access(join(cwd, "bun.lockb"));
    return "bun";
  } catch {
    // continue
  }

  try {
    await access(join(cwd, "pnpm-lock.yaml"));
    return "pnpm";
  } catch {
    // continue
  }

  try {
    await access(join(cwd, "yarn.lock"));
    return "yarn";
  } catch {
    // continue
  }

  // Default to npm
  return "npm";
}
