import * as t from "io-ts";

export enum Frameworks {
  none = "none",
  nuxt = "nuxt",
  previousNuxt = "previous-nuxt",
  next = "next",
  gatsby = "gatsby",
  vue = "vue",
  react = "react",
  svelte = "svelte",
  vanillajs = "vanillajs",
}

export const FrameworksC = t.keyof({
  [Frameworks.none]: null,
  [Frameworks.nuxt]: null,
  [Frameworks.previousNuxt]: null,
  [Frameworks.next]: null,
  [Frameworks.gatsby]: null,
  [Frameworks.vue]: null,
  [Frameworks.react]: null,
  [Frameworks.svelte]: null,
  [Frameworks.vanillajs]: null,
});

export const SupportedFrameworks: Frameworks[] = [
  Frameworks.none,
  Frameworks.nuxt,
  Frameworks.next,
  Frameworks.vue,
  Frameworks.react,
  Frameworks.svelte,
];
