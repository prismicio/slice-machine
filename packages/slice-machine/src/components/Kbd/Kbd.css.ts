import { style } from "@vanilla-extract/css";
import { colors, sprinkles } from "@prismicio/editor-ui";

export const root = style([
  sprinkles({
    paddingInline: 4,
    color: colors.grey11,
    backgroundColor: colors.grey2,
    borderColor: colors.grey6,
    borderStyle: "solid",
    borderWidth: 1,
  }),
  {
    borderRadius: "3px",
  },
]);
