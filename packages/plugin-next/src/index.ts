import type { Plugin } from "@slicemachine/plugin-middleware";
export {
  slice,
  story,
  index,
  snippets,
  syntax,
} from "@slicemachine/plugin-react";

export const framework: Plugin["framework"] = "next";
