import { colors, selectors, sprinkles, vars } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";

export const root = sprinkles({
  all: "unset",
  borderBottomColor: colors.grey6,
  borderBottomStyle: "solid",
  borderBottomWidth: 1,
  display: "revert",
});

export const tableRowBody = style([
  sprinkles({
    backgroundColor: {
      ...selectors.focusVisible(colors.grey5),
      ...selectors.hover(colors.grey4),
    },
    transitionDuration: 250,
    transitionProperty: "background-color",
    transitionTimingFunction: "easeInOut",
  }),
  {
    ":last-child": {
      border: vars.borderStyle.none,
    },
  },
]);

export const tableRowClickable = sprinkles({
  cursor: "pointer",
});
