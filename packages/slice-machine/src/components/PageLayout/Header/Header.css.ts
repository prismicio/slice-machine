import { sprinkles } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";

export const root = style([
  sprinkles({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    height: 32,
  }),
  {
    gridArea: "header",
  },
]);

export const flex = style([
  sprinkles({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  }),
]);
