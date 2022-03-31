import * as t from "io-ts";
import { withFallback } from "io-ts-types/lib/withFallback";

export enum Frameworks {
  none = "none",
  nuxt = "nuxt",
  previousNuxt = "previousNuxt",
  next = "next",
  gatsby = "gatsby",
  vue = "vue",
  react = "react",
  svelte = "svelte",
  vanillajs = "vanillajs",
  previousNext = "previousNext",
}

export const FrameworksC = withFallback(
  t.keyof({
    [Frameworks.none]: null,
    [Frameworks.nuxt]: null,
    [Frameworks.previousNuxt]: null,
    [Frameworks.next]: null,
    [Frameworks.gatsby]: null,
    [Frameworks.vue]: null,
    [Frameworks.react]: null,
    [Frameworks.svelte]: null,
    [Frameworks.vanillajs]: null,
    [Frameworks.previousNext]: null,
  }),
  Frameworks.none
);

export const SupportedFrameworks: Frameworks[] = [
  Frameworks.none,
  Frameworks.nuxt,
  Frameworks.previousNuxt,
  Frameworks.next,
  Frameworks.vue,
  Frameworks.react,
  Frameworks.svelte,
  Frameworks.previousNext,
];
