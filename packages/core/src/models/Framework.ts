import * as t from "io-ts";

export enum Frameworks {
  none = "none",
  nuxt = "nuxt",
  next = "next",
  gatsby = "gatsby",
  vue = "vue",
  react = "react",
  svelte = "svelte",
  vanillajs = "vanillajs",
  previousNext = "previousNext",
  previousReact = "previousReact",
}

export const FrameworksC = t.keyof({
  [Frameworks.none]: null,
  [Frameworks.nuxt]: null,
  [Frameworks.next]: null,
  [Frameworks.gatsby]: null,
  [Frameworks.vue]: null,
  [Frameworks.react]: null,
  [Frameworks.svelte]: null,
  [Frameworks.vanillajs]: null,
  [Frameworks.previousNext]: null,
  [Frameworks.previousReact]: null,
});

export const SupportedFrameworks: Frameworks[] = [
  Frameworks.none,
  Frameworks.nuxt,
  Frameworks.next,
  Frameworks.vue,
  Frameworks.react,
  Frameworks.svelte,
  Frameworks.previousReact,
  Frameworks.previousNext,
];
