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

const tabsListChild = style([
  row,
  sprinkles({ alignItems: "center", paddingBottom: 1 }),
  {
    selectors: {
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

export const tabsTrigger = style([
  tabsListChild,
  sprinkles({
    boxSizing: "border-box",
    color: colors.grey11,
    cursor: "pointer",
    gap: 8,
    paddingInline: 16,
    position: "relative",
  }),
  {
    maxWidth: "256px",
    selectors: {
      '&[data-state="active"]': {
        color: vars.color.greyLight12,
      },
      '&:is(:focus, :hover, [data-state="active"])::before': {
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
    },
  },
]);

const tabsTriggerChild = sprinkles({ position: "relative" });

export const tabsTriggerText = style([
  tabsTriggerChild,
  sprinkles({ flexGrow: 1 }),
]);

export const tabsTriggerMenu = style([
  tabsTriggerChild,
  sprinkles({ visibility: "hidden" }),
  {
    marginRight: calc.multiply(-1, vars.space[8]),
    selectors: {
      ':is(:focus, :hover, [data-state="active"]) > &': {
        visibility: "visible",
      },
      '&:has(> [data-state="open"])': { visibility: "visible" },
    },
  },
]);

export const newTabButton = style([
  tabsListChild,
  sprinkles({
    backgroundColor: colors.grey2,
    paddingInline: 8,
    position: "sticky",
    right: 0,
  }),
  {
    boxShadow: `inset 0 ${calc.multiply(-1, vars.borderWidth[1])} 0 0 ${
      vars.color.greyLight6
    }, 0 ${calc.multiply(-1, vars.borderWidth[1])} 0 0 ${
      vars.color.greyLight2
    }`,
  },
]);

export const tabsContent = sprinkles({
  backgroundColor: colors.grey1,
  flexGrow: 1,
  outline: "none",
});
