import { colors, selectors, sprinkles, vars } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";

import * as stylesTableBody from "./TableBody.css";

export const root = style([
  sprinkles({
    all: "unset",
    borderBottomColor: colors.grey6,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
  }),
  {
    display: "table-row",
    selectors: {
      [`${stylesTableBody.root} > &:last-child`]: {
        border: vars.borderStyle.none,
      },
    },
  },
]);

export const tableRowBody = sprinkles({
  backgroundColor: {
    ...selectors.focusVisible(colors.grey5),
    ...selectors.hover(colors.grey4),
  },
  transitionDuration: 250,
  transitionProperty: "background-color",
  transitionTimingFunction: "easeInOut",
});

export const tableRowClickable = sprinkles({
  cursor: "pointer",
});
