import { colors, sprinkles, vars } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";
import { calc } from "@vanilla-extract/css-utils";

const flex = sprinkles({ all: "unset", display: "flex" });

const column = style([flex, sprinkles({ flexDirection: "column" })]);

const row = style([flex, sprinkles({ flexDirection: "row" })]);

export const root = style([
  column,
  sprinkles({
    backgroundColor: colors.grey2,
    borderColor: colors.grey6,
    borderRadius: 6,
    borderStyle: "solid",
    borderWidth: 1,
    overflowX: "hidden",
  }),
]);

export const frame = style([
  row,
  sprinkles({ alignItems: "center", paddingInline: 16 }),
  { height: calc.subtract(vars.size[48], vars.borderWidth[1]) },
]);

export const titleBarOptions = style([row, sprinkles({ gap: 8 })]);

export const titleBarOption = style([
  column,
  sprinkles({ backgroundColor: colors.grey5, borderRadius: "50%" }),
  {
    height: calc.subtract(vars.size[12], vars.size[1]),
    width: calc.subtract(vars.size[12], vars.size[1]),
  },
]);

export const tabs = style([column, sprinkles({ flexGrow: 1 })]);

export const tabsList = style([
  row,
  sprinkles({ overflowX: "auto" }),
  {
    boxShadow: `inset 0 ${calc.multiply(-1, vars.borderWidth[1])} 0 0 ${
      vars.color.greyLight6
    }`,
    height: calc.subtract(vars.size[48], vars.borderWidth[1]),
    msOverflowStyle: "none",
    scrollbarWidth: "none",
    "::-webkit-scrollbar": { display: "none" },
    selectors: {
      [`${frame} + ${tabs} > &`]: { paddingTop: vars.borderWidth[1] },
    },
  },
]);

export const tabsTrigger = style([
  row,
  sprinkles({
    alignItems: "center",
    boxSizing: "border-box",
    color: colors.grey11,
    gap: 8,
    paddingBottom: 1,
    paddingLeft: 16,
    paddingRight: 8,
  }),
  {
    ":last-child": {
      backgroundColor: vars.color.greyLight2,
      boxShadow: `inset 0 ${calc.multiply(-1, vars.borderWidth[1])} 0 0 ${
        vars.color.greyLight6
      }, 0 ${calc.multiply(-1, vars.borderWidth[1])} 0 0 ${
        vars.color.greyLight2
      }`,
      position: "sticky",
      right: vars.space[0],
    },
    selectors: {
      "&:not(:last-child)": {
        cursor: vars.cursor.pointer,
        maxWidth: "256px",
        position: "relative",
      },
      '&[data-state="active"]:not(:last-child)': {
        color: vars.color.greyLight12,
      },
      '&:is(:focus, :hover, [data-state="active"]):not(:last-child)::before': {
        backgroundColor: vars.color.greyLight1,
        borderBottomStyle: vars.borderStyle.none,
        borderColor: vars.color.greyLight6,
        borderLeftStyle: vars.borderStyle.solid,
        borderRightStyle: vars.borderStyle.solid,
        borderTopLeftRadius: vars.borderRadius[6],
        borderTopRightRadius: vars.borderRadius[6],
        borderTopStyle: vars.borderStyle.solid,
        borderWidth: vars.borderWidth[1],
        boxSizing: "border-box",
        content: "",
        height: calc.add(vars.size["100%"], vars.borderWidth[1]),
        left: calc.multiply(-1, vars.borderWidth[1]),
        position: "absolute",
        top: calc.multiply(-1, vars.borderWidth[1]),
        width: calc.add(vars.size["100%"], vars.borderWidth[1]),
      },
      ':not(:is(:focus, :hover, [data-state="active"])) + &::before, &:last-child::before':
        {
          backgroundColor: vars.color.greyLight7,
          bottom: vars.space[8],
          content: "",
          height: vars.size[32],
          left: calc.multiply(-1, vars.space[1]),
          position: "absolute",
          width: vars.borderWidth[1],
        },
    },
  },
]);

export const tabsTriggerText = sprinkles({ flexGrow: 1, position: "relative" });

export const tabsContent = sprinkles({
  backgroundColor: colors.grey1,
  flexGrow: 1,
});
