import { retrieveJsonPackage, JsonPackage } from "./pkg";
import { Frameworks, SupportedFrameworks, Version } from "../models/Framework";
import { Manifest } from "../models/Manifest";

export { Frameworks } from "../models/Framework";

export const UnsupportedFrameWorks = Object.values(Frameworks).filter(
  (framework) => !SupportedFrameworks.includes(framework)
);

export function isFrameworkSupported(framework: Frameworks): boolean {
  return SupportedFrameworks.includes(framework);
}

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
  pkg: JsonPackage,
  supportedFrameworks: Frameworks[] = SupportedFrameworks
): Frameworks {
  const { dependencies, devDependencies, peerDependencies } = pkg;
  const deps = { ...peerDependencies, ...devDependencies, ...dependencies };

  const frameworkEntry: Frameworks | undefined = Object.values(
    supportedFrameworks
  ).find((f) => deps[f] && deps[f].length);

  return frameworkEntry || Frameworks.vanillajs;
}

export type FrameworkWithVersion = {
  framework: Frameworks;
  version: Version;
};

export function defineFramework({
  cwd,
  supportedFrameworks = SupportedFrameworks,
  manifest,
}: {
  cwd: string;
  supportedFrameworks?: Frameworks[];
  manifest?: Manifest;
}): Frameworks {
  if (manifest?.framework && isFrameworkSupported(manifest.framework))
    return manifest.framework;

  const pkg = retrieveJsonPackage(cwd);
  if (!pkg.exists || !pkg.content) {
    const message =
      "[api/env]: Unrecoverable error. Could not find package.json. Exiting..";
    console.error(message);
    throw new Error(message);
  }

  return detectFramework(pkg.content, supportedFrameworks);
}

export function defineFrameworkWithVersion({
  cwd,
  supportedFrameworks = SupportedFrameworks,
  manifest,
}: {
  cwd: string;
  supportedFrameworks?: Frameworks[];
  manifest?: Manifest;
}): FrameworkWithVersion {
  const framework = defineFramework({ cwd, supportedFrameworks, manifest });

  const pkg = retrieveJsonPackage(cwd);
  if (!pkg.exists || !pkg.content) {
    const message =
      "[api/env]: Unrecoverable error. Could not find package.json. Exiting..";
    console.error(message);
    throw new Error(message);
  }

  const { dependencies, devDependencies, peerDependencies } = pkg.content;
  const deps = { ...peerDependencies, ...devDependencies, ...dependencies };

  const version = deps[framework];

  return {
    framework,
    version,
  };
}
