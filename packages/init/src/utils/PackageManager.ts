import { Utils, FileSystem } from "@slicemachine/core";

export type Dependency = string | { name: string; version: string };
export const Dependencies = {
  fromPkgFormat(pkgDeps: Record<string, string>): ReadonlyArray<Dependency> {
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
  install(dependencies: ReadonlyArray<Dependency>): string;
  installDev(dependencies: ReadonlyArray<Dependency>): string;
}

export const PackageManager = {
  get(cwd: string): PackageManager {
    if (Utils.Files.exists(FileSystem.YarnLockPath(cwd))) {
      return Yarn;
    }
    return Npm;
  },
};

export const Yarn: PackageManager = {
  install(dependencies: ReadonlyArray<Dependency>): string {
    return `yarn add ${formatDeps(dependencies)}`;
  },
  installDev(dependencies: ReadonlyArray<Dependency>): string {
    return `yarn add --dev ${formatDeps(dependencies)}`;
  },
};

export const Npm: PackageManager = {
  install(dependencies: ReadonlyArray<Dependency>): string {
    return `npm i --save ${formatDeps(dependencies)}`;
  },
  installDev(dependencies: ReadonlyArray<Dependency>): string {
    return `npm i --save-dev ${formatDeps(dependencies)}`;
  },
};
