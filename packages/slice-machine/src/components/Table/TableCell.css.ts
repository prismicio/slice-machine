import { colors, sprinkles, vars } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";

export const root = style([
  sprinkles({
    all: "unset",
    color: colors.grey11,
    display: "revert",
  }),
  {
    verticalAlign: "middle",
    ":first-child": {
      padding: `${vars.size[16]} ${vars.size[0]} ${vars.size[16]} ${vars.size[8]}`,
      width: vars.size[32],
    },
    ":last-child": {
      padding: `${vars.size[16]} ${vars.size[16]} ${vars.size[16]} ${vars.size[8]}`,
    },
    selectors: {
      "&:not(last-child):not(first-child)": {
        padding: `${vars.size[16]} ${vars.size[8]}`,
      },
    },
  },
]);

export const tableHeadCell = style([
  {
    fontSize: 12,
    fontWeight: "500",
    ":first-child": {
      borderTopLeftRadius: vars.borderRadius[6],
    },
    ":last-child": {
      borderTopRightRadius: vars.borderRadius[6],
    },
  },
]);

export const tableDataCell = style([
  sprinkles({
    color: colors.dark2,
  }),
  {
    fontSize: 14,
    fontWeight: "400",
    selectors: {
      ["&:nth-child(2)"]: {
        fontWeight: "600",
        // TODO: DT-1362 - Condition for dark and light mode, need mode export
        color: colors.grey12.lightMode,
      },
    },
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
      [`${tableHeadCell}:first-child > &`]: {
        paddingLeft: vars.size[8],
      },
    },
  },
]);
