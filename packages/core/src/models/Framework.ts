import * as t from "io-ts";

export enum Frameworks {
  none = "none",
  nuxt = "nuxt",
  next = "next",
  "next-legacy" = "next-legacy",
  gatsby = "gatsby",
  vue = "vue",
  react = "react",
  "react-legacy" = "react-legacy",
  svelte = "svelte",
  vanillajs = "vanillajs",
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
  [Frameworks["next-legacy"]]: null,
  [Frameworks["react-legacy"]]: null,
});

export const SupportedFrameworks: Frameworks[] = [
  Frameworks.none,
  Frameworks.nuxt,
  Frameworks.next,
  Frameworks.vue,
  Frameworks.react,
  Frameworks.svelte,
  Frameworks["react-legacy"],
  Frameworks["next-legacy"],
];
