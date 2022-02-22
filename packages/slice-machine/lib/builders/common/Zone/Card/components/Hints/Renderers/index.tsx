import toVue from "./vue";
import toReact from "./react";
import toSvelte from "./svelte";
import toPreviousReact from "./previous-react";

export const svelte = toSvelte;

export const vue = toVue;
export const react = toReact;

export const next = toReact;
export const previousNext = toPreviousReact;
export const nuxt = toVue;

export const vanillajs = (): null => null;
