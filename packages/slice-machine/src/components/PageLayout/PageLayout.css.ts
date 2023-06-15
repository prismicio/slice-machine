import { colors, sprinkles } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";

export const root = style([
  sprinkles({
    all: "unset",
    backgroundColor: colors.grey2,
    display: "grid",
    height: "100%",
    position: "absolute",
    width: "100%",
  }),
  {
    gridTemplateAreas: `
    "pane header"
    "pane content"
  `,
  },
]);
