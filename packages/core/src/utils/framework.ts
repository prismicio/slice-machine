import { retrieveJsonPackage } from "../filesystem";
import { Frameworks, SupportedFrameworks } from "../models/Framework";
import { Manifest } from "../models/Manifest";

export const UnsupportedFrameWorks = Object.values(Frameworks).filter(
  (framework) => SupportedFrameworks.includes(framework) === false
);

export const isUnsupported = (framework: Frameworks): boolean =>
  UnsupportedFrameWorks.includes(framework);

function capitaliseFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function fancyName(str: Frameworks): string {
  switch (str) {
    case Frameworks.next:
      return "Next.js";
    default:
      return capitaliseFirstLetter(str);
  }
}

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

export function isValidFramework(framework: Frameworks): boolean {
  return SupportedFrameworks.includes(framework);
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
