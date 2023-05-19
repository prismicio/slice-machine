import { colors, sprinkles } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";

export const root = style([
  sprinkles({
    all: "unset",
    borderColor: colors.grey6,
    borderRadius: 6,
    borderStyle: "solid",
    borderWidth: 1,
    fontFamily: "body",
    width: "100%",
  }),
  {
    display: "block",
  },
]);

export const table = style([
  sprinkles({
    all: "unset",
    boxShadow: 1,
    boxSizing: "border-box",
    width: "100%",
  }),
  {
    borderCollapse: "collapse",
    display: "table",
  },
]);
