import { sprinkles } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";

export const content = style([
  sprinkles({
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    gap: 12,
  }),
  { gridArea: "content", overflow: "hidden" },
]);
