import { colors, sprinkles } from "@prismicio/editor-ui";
import { style, styleVariants } from "@vanilla-extract/css";

const base = style([
  sprinkles({
    width: "100%",
    borderStyle: "none",
    margin: 0,
  }),
]);

export const variants = styleVariants({
  dashed: [
    base,
    sprinkles({
      borderColor: colors.grey6,
      borderTopStyle: "dashed",
      borderWidth: 1,
    }),
  ],
});
