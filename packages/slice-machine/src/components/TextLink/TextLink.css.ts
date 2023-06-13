import { style } from "@vanilla-extract/css";

import { colors, selectors, sprinkles } from "@prismicio/editor-ui";

export const root = style([
  sprinkles({
    all: "unset",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    color: {
      ...colors.indigo11,
      ...selectors.hover(colors.indigo10),
      ...selectors.active(colors.indigo11),
    },
  }),
  {
    ":focus-visible": {
      outline: "none",
      textDecorationLine: "underline",
    },
  },
]);

export const text = style([
  sprinkles({
    display: "flex",
    alignItems: "center",
  }),
]);

export const endIcon = style([
  sprinkles({
    paddingLeft: 4,
  }),
]);
