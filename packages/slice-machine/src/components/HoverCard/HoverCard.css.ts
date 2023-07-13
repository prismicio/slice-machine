import { colors, sprinkles } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";

const reset = sprinkles({
  all: "unset",
  boxSizing: "border-box",
  fontFamily: "body",
});

export const container = style([
  reset,
  sprinkles({
    borderRadius: 6,
    backgroundColor: colors.grey1,
    boxShadow: 2,
  }),
]);

export const arrow = style([
  reset,
  sprinkles({
    fill: colors.grey1,
    boxShadow: 2,
  }),
]);
