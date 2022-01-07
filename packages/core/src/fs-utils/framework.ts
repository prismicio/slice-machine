import { retrieveJsonPackage } from "../fs-utils";
import { Frameworks } from "../models/Framework";
import { Manifest } from "../models/Manifest";

import { isValidFramework } from "../utils/framework";

import { SupportedFrameworks } from "../models/Framework";

export function detectFramework(
  cwd: string,
  supportedFrameworks: Frameworks[]
): Frameworks {
  const pkg = retrieveJsonPackage(cwd);
  if (!pkg.exists || !pkg.content) {
    const message =
      "[api/env]: Unrecoverable error. Could not find package.json. Exiting..";
    console.error(message);
    throw new Error(message);
  }

  const { dependencies, devDependencies, peerDependencies } = pkg.content;
  const deps = { ...peerDependencies, ...devDependencies, ...dependencies };

  const frameworkEntry: Frameworks | undefined = Object.values(
    supportedFrameworks
  ).find((f) => deps[f] && deps[f].length);
  return frameworkEntry || Frameworks.vanillajs;
}

export function defineFramework(
  manifest: Manifest | null,
  cwd: string,
  supportedFrameworks: Frameworks[]
): Frameworks {
  const userDefinedFramework: Frameworks | null =
    manifest?.framework && isValidFramework(manifest.framework)
      ? manifest.framework
      : null;
  return userDefinedFramework || detectFramework(cwd, supportedFrameworks);
}

export function autodetectFramework(cwd: string): Frameworks {
  return detectFramework(cwd, SupportedFrameworks);
}
