import toVue from "./vue";
import toReact from "./react";
import toSvelte from "./svelte";
import toLegacyReact from "./react-legacy";

export const svelte = toSvelte;

export const vue = toVue;
export const react = toReact;
export const legacyReact = toLegacyReact;

export const next = toReact;
export const legacyNext = toLegacyReact;
export const nuxt = toVue;

export const vanillajs = (): null => null;
