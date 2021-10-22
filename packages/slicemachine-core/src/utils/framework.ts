import { Manifest } from "../filesystem";
import { retrieveJsonPackage } from "../filesystem";

export enum Framework {
  none = "none",
  nuxt = "nuxt",
  next = "next",
  gatsby = "gatsby",
  vue = "vue",
  react = "react",
  svelte = "svelte",
  vanillajs = "vanillajs",
}

export const SupportedFrameworks: Framework[] = [
  Framework.none,
  Framework.nuxt,
  Framework.next,
  Framework.vue,
  Framework.react,
  Framework.svelte,
];

export const UnsupportedFrameWorks = Object.values(Framework).filter(
  (framework) => SupportedFrameworks.includes(framework) === false
);

export const isUnsupported = (framework: Framework) =>
  UnsupportedFrameWorks.includes(framework);

function capitaliseFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function fancyName(str: Framework) {
  switch (str) {
    case Framework.next:
      return "Next.js";
    default:
      return capitaliseFirstLetter(str);
  }
}

export function detectFramework(cwd: string): Framework {
  const pkg = retrieveJsonPackage(cwd);
  if (!pkg.exists || !pkg.content) {
    const message =
      "[api/env]: Unrecoverable error. Could not find package.json. Exiting..";
    console.error(message);
    throw new Error(message);
  }

  const { dependencies, devDependencies, peerDependencies } = pkg.content;
  const deps = { ...peerDependencies, ...devDependencies, ...dependencies };

  const frameworkEntry: Framework | undefined = Object.values(Framework).find(
    (f) => deps[f] && deps[f].length
  );
  return frameworkEntry || Framework.vanillajs;
}

export function isValidFramework(framework: Framework): boolean {
  return SupportedFrameworks.includes(framework);
}

export function defineFramework(
  manifest: Manifest | null,
  cwd: string
): Framework {
  const userDefinedFramework: Framework | null =
    manifest?.framework && isValidFramework(manifest.framework)
      ? manifest.framework
      : null;
  return userDefinedFramework || detectFramework(cwd);
}
