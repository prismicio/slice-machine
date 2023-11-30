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
      borderColor: colors.currentColor,
      borderTopStyle: "dashed",
      borderWidth: 1,
    }),
  ],
  edgeFaded: [
    base,
    sprinkles({
      height: 1,
    }),
    {
      backgroundImage:
        "linear-gradient(to right, color-mix(in srgb, currentColor, transparent 100%), currentColor, color-mix(in srgb, currentColor, transparent 100%))",
    },
  ],
});
