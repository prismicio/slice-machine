import { sprinkles, vars, colors } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";

export const content = sprinkles({
  outline: "none",
  padding: 16,
});

export const list = sprinkles({
  backgroundColor: colors.grey1,
  borderBottomColor: colors.grey5,
  borderBottomStyle: "solid",
  borderBottomWidth: 1,
  padding: 8,
  paddingBottom: 0,
  position: "sticky",
  top: 0,
});

export const trigger = style([
  sprinkles({
    backgroundColor: colors.transparent,
    borderColor: colors.transparent,
    color: colors.grey11,
    paddingBottom: 6,
  }),
  {
    selectors: {
      '&[data-state="active"]': {
        color: vars.color.purple11,
        borderBottomColor: vars.color.purple11,
      },
    },
  },
]);
