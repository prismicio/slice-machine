import { Adapter, Framework } from "../types";

export function getFrameworkFromAdapter(adapter: Adapter): Framework;
export function getFrameworkFromAdapter(adapter: string): Framework | undefined;
export function getFrameworkFromAdapter(
  adapter: string,
): Framework | undefined {
  switch (adapter) {
    case "@slicemachine/adapter-next":
      return "next";
    case "@slicemachine/adapter-nuxt":
    case "@slicemachine/adapter-nuxt2":
      return "nuxt";
    case "@slicemachine/adapter-sveltekit":
      return "sveltekit";
    default:
      return undefined;
  }
}
