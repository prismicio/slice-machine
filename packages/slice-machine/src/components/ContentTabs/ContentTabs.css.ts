import { colors, sprinkles, vars } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";

const flex = sprinkles({ all: "unset", display: "flex" });

const column = style([flex, sprinkles({ flexDirection: "column" })]);

const row = style([flex, sprinkles({ flexDirection: "row" })]);

export const root = style([
  column,
  sprinkles({ backgroundColor: colors.grey1, minHeight: 0 }),
]);

export const list = style([
  row,
  sprinkles({
    borderBottomColor: colors.grey5,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    paddingInline: 16,
  }),
]);

export const trigger = style([
  column,
  sprinkles({ color: colors.grey11, cursor: "pointer", paddingBlock: 8 }),
  {
    selectors: {
      "&:not(:last-child)": { marginRight: vars.space[16] },
      '&[data-state="active"]': {
        boxShadow: "inset 0 -1px 0 0 currentColor, 0 1px 0 0 currentColor",
        color: vars.color.purple9,
      },
    },
  },
]);

export const triggerText = style({
  lineHeight: "32px",
});

export const content = style([
  column,
  sprinkles({ minHeight: 0, outline: "none" }),
  { flex: 1, selectors: { '&[data-state="inactive"]': { display: "none" } } },
]);

export const scrollArea = sprinkles({ padding: 16 });
