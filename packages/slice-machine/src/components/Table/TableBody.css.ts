import { sprinkles } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";

export const root = style([
  sprinkles({
    all: "unset",
  }),
  {
    display: "table-row-group",
  },
]);
