import toVue from "./vue";
import toPreviousVue from "./previous-vue";
import toReact from "./react";
import toSvelte from "./svelte";

export const svelte = toSvelte;

export const vue = toVue;
export const react = toReact;

export const next = toReact;
export const nuxt = toVue;
export const previousNuxt = toPreviousVue;

export const vanillajs = (): null => null;
