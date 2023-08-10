import { style } from "@vanilla-extract/css";
import { selectors, colors, sprinkles } from "@prismicio/editor-ui";

export const root = style([
  sprinkles({
    all: "unset",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    borderColor: {
      ...colors.transparent,
      ...selectors.focusVisible(colors.grey7),
      ...selectors.hover(colors.grey7),
      ...selectors.open(colors.grey7),
    },
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 6,
    transitionProperty: "border-color",
    transitionDuration: 150,
    transitionTimingFunction: "easeInOut",
  }),
  {
    ":focus": { outline: "none" },
  },
]);

export const cursor = {
  default: sprinkles({ cursor: "default" }),
  pointer: sprinkles({ cursor: "pointer" }),
};

export const size = {
  small: sprinkles({ height: 28, width: 28 }),
  medium: sprinkles({ height: 32, width: 32 }),
  large: sprinkles({ height: 40, width: 40 }),
};

export const noPaddingSize = {
  small: sprinkles({ height: 16, width: 16 }),
  medium: sprinkles({ height: 20, width: 20 }),
  large: sprinkles({ height: 24, width: 24 }),
};
