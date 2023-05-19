import { colors, selectors, sprinkles } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";

export const root = style([
  sprinkles({
    alignItems: "center",
    all: "unset",
    borderColor: {
      ...colors.grey7,
      ...selectors.focusVisible(colors.purple9),
      ...selectors.hover(colors.purple9),
      ...selectors.open(colors.purple9),
    },
    borderRadius: 6,
    borderStyle: "solid",
    borderWidth: 1,
    boxSizing: "border-box",
    cursor: "pointer",
    display: "flex",
    height: 32,
    justifyContent: "center",
    transitionDuration: 150,
    transitionProperty: "border-color",
    transitionTimingFunction: "easeInOut",
    width: 32,
  }),
  {
    backgroundColor: "white",
    ":focus": { outline: "none" },
    selectors: {
      "&[data-state=open]": {
        boxShadow: "0px 0px 0px 2px rgba(124, 102, 220, 0.3)",
      },
    },
  },
]);
