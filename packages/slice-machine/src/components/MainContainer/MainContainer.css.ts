import { sprinkles } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";

import { vars } from "@prismicio/editor-ui";

export const root = style([
  sprinkles({
    all: "unset",
    display: "grid",
  }),
  {
    gridTemplateAreas: `
      "header"
      "content"
    `,
    gridTemplateRows: "min-content 1fr",
    padding: vars.size[16],
  },
]);

export const content = style({
  gridArea: "content",
});
