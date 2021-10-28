import { Manifest } from "../filesystem";
import { retrieveJsonPackage } from "../filesystem";

export enum FrameworkEnum {
  none = "none",
  nuxt = "nuxt",
  next = "next",
  gatsby = "gatsby",
  vue = "vue",
  react = "react",
  svelte = "svelte",
  vanillajs = "vanillajs",
}

export const SupportedFrameworks: FrameworkEnum[] = [
  FrameworkEnum.none,
  FrameworkEnum.nuxt,
  FrameworkEnum.next,
  FrameworkEnum.vue,
  FrameworkEnum.react,
  FrameworkEnum.svelte,
];

export const UnsupportedFrameWorks = Object.values(FrameworkEnum).filter(
  (framework) => SupportedFrameworks.includes(framework) === false
);

export const isUnsupported = (framework: FrameworkEnum): boolean =>
  UnsupportedFrameWorks.includes(framework);

function capitaliseFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function fancyName(str: FrameworkEnum): string {
  switch (str) {
    case FrameworkEnum.next:
      return "Next.js";
    default:
      return capitaliseFirstLetter(str);
  }
}

export function detectFramework(cwd: string): FrameworkEnum {
  const pkg = retrieveJsonPackage(cwd);
  if (!pkg.exists || !pkg.content) {
    const message =
      "[api/env]: Unrecoverable error. Could not find package.json. Exiting..";
    console.error(message);
    throw new Error(message);
  }

  const { dependencies, devDependencies, peerDependencies } = pkg.content;
  const deps = { ...peerDependencies, ...devDependencies, ...dependencies };

  const frameworkEntry: FrameworkEnum | undefined = Object.values(
    FrameworkEnum
  ).find((f) => deps[f] && deps[f].length);
  return frameworkEntry || FrameworkEnum.vanillajs;
}

export function isValidFramework(framework: FrameworkEnum): boolean {
  return SupportedFrameworks.includes(framework);
}

export function defineFramework(
  manifest: Manifest | null,
  cwd: string
): FrameworkEnum {
  const userDefinedFramework: FrameworkEnum | null =
    manifest?.framework && isValidFramework(manifest.framework)
      ? manifest.framework
      : null;
  return userDefinedFramework || detectFramework(cwd);
}
