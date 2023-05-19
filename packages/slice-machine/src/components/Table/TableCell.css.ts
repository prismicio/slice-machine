import { colors, sprinkles, vars } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";

export const root = style([
  sprinkles({
    all: "unset",
    color: colors.grey11,
  }),
  {
    display: "table-cell",
    selectors: {
      "&:last-child": {
        padding: `${vars.size[16]} ${vars.size[16]} ${vars.size[16]} ${vars.size[8]}`,
      },
      "&:first-child": {
        padding: `${vars.size[16]} ${vars.size[0]} ${vars.size[16]} ${vars.size[8]}`,
        width: vars.size[32],
      },
      "&:not(last-child):not(first-child)": {
        padding: `${vars.size[16]} ${vars.size[8]}`,
      },
    },
    verticalAlign: "middle",
  },
]);

export const tableHeadCell = style([
  {
    fontSize: 12,
    fontWeight: "initial",
    selectors: {
      [`&:first-child`]: {
        borderTopLeftRadius: vars.borderRadius[6],
      },
      [`&:last-child`]: {
        borderTopRightRadius: vars.borderRadius[6],
      },
    },
  },
]);

export const tableDataCell = style([
  sprinkles({
    color: colors.dark2,
  }),
  {
    fontSize: 14,
  },
]);

export const tableCellContent = style([
  sprinkles({
    alignItems: "center",
    all: "unset",
    display: "flex",
    height: 32,
  }),
  {
    selectors: {
      [`${tableDataCell}:last-child > &`]: {
        justifyContent: "flex-end",
      },
    },
  },
]);
