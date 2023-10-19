import { colors, sprinkles, vars } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";

import * as windowStyles from "../Window/Window.css";

const flex = sprinkles({ all: "unset", display: "flex" });

const row = style([flex, sprinkles({ flexDirection: "row" })]);

export const root = style([
  flex,
  sprinkles({
    borderColor: colors.grey6,
    borderRadius: 6,
    borderStyle: "solid",
    borderWidth: 1,
    flexDirection: "column",
    overflowX: "hidden",
  }),
  {
    selectors: {
      [`:is(${windowStyles.root}, ${windowStyles.tabsContent}) > &`]: {
        borderRadius: vars.borderRadius[0],
        borderStyle: vars.borderStyle.none,
      },
    },
  },
]);

const child = style([
  row,
  sprinkles({
    alignItems: "center",
    borderBottomColor: colors.grey6,
    borderBottomWidth: 1,
    boxSizing: "border-box",
    height: 48,
    paddingRight: 8,
  }),
  { ":last-child": { borderBottomColor: vars.color.transparent } },
]);

export const header = style([
  child,
  sprinkles({
    backgroundColor: colors.grey2,
    borderBottomStyle: "solid",
    gap: 8,
    paddingLeft: 16,
  }),
  {
    selectors: {
      [`${windowStyles.tabsContent} > ${root} > &:not(:first-child)`]: {
        marginTop: vars.space[16],
      },
    },
  },
]);

export const headerActions = style([
  row,
  sprinkles({
    alignItems: "center",
    flexGrow: 1,
    gap: 8,
    justifyContent: "end",
    minWidth: 0,
  }),
]);

export const item = style([
  child,
  sprinkles({
    backgroundColor: colors.grey1,
    borderBottomStyle: "dashed",
    paddingLeft: 12,
  }),
]);
