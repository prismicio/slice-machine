import path from "path";

import Files from "../utils/files";
import { Framework } from "../models/common/Framework";
import { SupportedFrameworks } from "../consts";
import { Manifest } from "./manifest";

export function detectFramework(cwd: string): Framework {
  const pkgFilePath = path.resolve(cwd, "package.json");
  if (!Files.exists(pkgFilePath)) {
    const message =
      "[api/env]: Unrecoverable error. Could not find package.json. Exiting..";
    console.error(message);
    throw new Error(message);
  }

  try {
    const pkg = JSON.parse(Files.readString(pkgFilePath));
    const { dependencies, devDependencies, peerDependencies } = pkg;

    const deps = { ...peerDependencies, ...devDependencies, ...dependencies };

    const frameworkEntry = Object.entries(SupportedFrameworks).find(
      ([, value]) => deps[value]
    );

    return (frameworkEntry && frameworkEntry.length
      ? frameworkEntry[0]
      : Framework.vanillajs) as Framework;
  } catch (e) {
    const message =
      "[api/env]: Unrecoverable error. Could not parse package.json. Exiting..";
    console.error(message);
    throw new Error(message);
  }
}

export function isValidFramework(framework: string): framework is Framework {
  return SupportedFrameworks.hasOwnProperty(framework);
}

export function defineFramework(manifest: Manifest | null, cwd: string) {
  const userDefinedFramework = (() => {
    if (
      manifest &&
      manifest.framework &&
      isValidFramework(manifest.framework)
    ) {
      return manifest.framework;
    }
    return null;
  })();

  return userDefinedFramework || detectFramework(cwd);
}
