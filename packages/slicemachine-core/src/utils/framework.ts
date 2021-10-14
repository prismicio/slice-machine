import { Manifest } from "../filesystem";
import { retrieveJsonPackage } from "../filesystem";

export enum Framework {
  none = "none",
  nuxt = "nuxt",
  next = "next",
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
  Framework.svelte
]

export function detectFramework(cwd: string): Framework {
  const pkg = retrieveJsonPackage(cwd);
  if (!pkg.exists || !pkg.content) {
    const message =
      "[api/env]: Unrecoverable error. Could not find package.json. Exiting..";
    console.error(message);
    throw new Error(message);
  }

  try {
    const { dependencies, devDependencies, peerDependencies } = pkg.content;
    const deps = { ...peerDependencies, ...devDependencies, ...dependencies };
    const frameworkEntry: Framework | undefined = SupportedFrameworks.find(f => deps[f] && deps[f].length)
    return frameworkEntry || Framework.vanillajs
  } catch (e) {
    const message =
      "[api/env]: Unrecoverable error. Could not parse package.json. Exiting..";
    console.error(message);
    throw new Error(message);
  }
}

export function isValidFramework(framework: Framework): boolean {
  return SupportedFrameworks.includes(framework)
}

export function defineFramework(manifest: Manifest | null, cwd: string): Framework {
  const userDefinedFramework: Framework | null = manifest?.framework && isValidFramework(manifest.framework) ? manifest.framework : null
  return userDefinedFramework || detectFramework(cwd);
}
