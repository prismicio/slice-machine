import { colors, sprinkles } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";

const reset = sprinkles({
  all: "unset",
  boxSizing: "border-box",
  display: "revert",
  fontFamily: "body",
});

export const container = style([
  reset,
  sprinkles({
    backgroundColor: colors.grey1,
    borderRadius: 6,
    boxShadow: 3,
  }),
]);

export const arrow = style([
  reset,
  sprinkles({
    fill: colors.grey1,
  }),
]);
