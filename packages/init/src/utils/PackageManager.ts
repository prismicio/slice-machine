import { execCommand } from "../utils";

import { Files } from "@slicemachine/core/build/src/internals";
import { YarnLockPath } from "@slicemachine/core/build/src/fs-utils";

export type Dependency = string | { name: string; version: string };
export const Dependencies = {
  fromPkgFormat(
    pkgDeps: Record<string, string> | undefined
  ): ReadonlyArray<Dependency> | undefined {
    if (!pkgDeps) return;

    return Object.entries(pkgDeps).map(([name, version]) => ({
      name,
      version,
    }));
  },
};
function formatDeps(dependencies: ReadonlyArray<Dependency>): string {
  return dependencies
    .map((dep) => {
      if (typeof dep === "string") return dep;
      return `${dep.name}@${dep.version}`;
    })
    .join(" ");
}

export interface PackageManager {
  install(dependencies: ReadonlyArray<Dependency>): Promise<{ stderr: string }>;
  installDev(
    dependencies: ReadonlyArray<Dependency>
  ): Promise<{ stderr: string }>;
}

export const PackageManager = {
  get(cwd: string): PackageManager {
    if (Files.exists(YarnLockPath(cwd))) {
      return Yarn;
    }
    return Npm;
  },
};

export const Yarn: PackageManager = {
  install(
    dependencies: ReadonlyArray<Dependency>
  ): Promise<{ stderr: string }> {
    return execCommand(`yarn add ${formatDeps(dependencies)}`);
  },
  installDev(
    dependencies: ReadonlyArray<Dependency>
  ): Promise<{ stderr: string }> {
    return execCommand(`yarn add --dev ${formatDeps(dependencies)}`);
  },
};

export const Npm: PackageManager = {
  install(
    dependencies: ReadonlyArray<Dependency>
  ): Promise<{ stderr: string }> {
    return execCommand(`npm i --save ${formatDeps(dependencies)}`);
  },
  installDev(
    dependencies: ReadonlyArray<Dependency>
  ): Promise<{ stderr: string }> {
    return execCommand(`npm i --save-dev ${formatDeps(dependencies)}`);
  },
};
