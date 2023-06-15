import { sprinkles } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";

import { vars } from "@prismicio/editor-ui";

export const root = style([
  sprinkles({
    all: "unset",
    display: "grid",
    height: "100%",
    position: "relative",
    width: "100%",
  }),
  {
    gridTemplateAreas: `
      "header"
      "content"
    `,
    margin: `${vars.size[16]} 0`,
  },
]);
