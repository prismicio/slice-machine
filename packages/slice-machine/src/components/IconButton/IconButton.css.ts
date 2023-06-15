import { style, styleVariants } from "@vanilla-extract/css";

import { colors, selectors, sprinkles, vars } from "@prismicio/editor-ui";

export const root = style([
  sprinkles({
    all: "unset",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 6,
    transitionProperty: "border-color",
    transitionDuration: 150,
    transitionTimingFunction: "easeInOut",
  }),
  {
    ":focus": { outline: "none" },
    selectors: {
      "&:not(:disabled)": { cursor: vars.cursor.pointer },
    },
  },
]);

export const variant = styleVariants({
  primary: [
    sprinkles({
      borderColor: {
        ...colors.grey7,
        ...selectors.focusVisible(colors.grey7),
        ...selectors.hover(colors.grey7),
        ...selectors.open(colors.grey7),
      },
    }),
  ],
  transparent: [
    sprinkles({
      borderColor: {
        ...colors.transparent,
        ...selectors.focusVisible(colors.grey7),
        ...selectors.hover(colors.grey7),
        ...selectors.open(colors.grey7),
      },
    }),
  ],
});

export const size = {
  small: sprinkles({ height: 28, width: 28 }),
  medium: sprinkles({ height: 32, width: 32 }),
  large: sprinkles({ height: 40, width: 40 }),
};
