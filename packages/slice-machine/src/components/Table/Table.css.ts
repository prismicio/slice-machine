import { colors, selectors, sprinkles, vars } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";

const block = sprinkles({
  all: "unset",
  boxSizing: "border-box",
  display: "revert",
});

export const root = style([
  block,
  sprinkles({
    borderColor: colors.grey6,
    borderRadius: 6,
    borderStyle: "solid",
    borderWidth: 1,
  }),
  {
    minWidth: 600,
  },
]);

export const table = style([
  block,
  sprinkles({
    boxShadow: 1,
    width: "100%",
  }),
  { borderCollapse: "collapse" },
]);

export const head = style([
  block,
  sprinkles({
    backgroundColor: colors.grey2,
  }),
  {},
]);

export const body = style([block, {}]);

export const row = style([block, {}]);

export const bodyRow = sprinkles({
  backgroundColor: {
    ...colors.grey1,
    ...selectors.focusVisible(colors.grey5),
    ...selectors.hover(colors.grey4),
  },
  transitionDuration: 250,
  transitionProperty: "background-color",
  transitionTimingFunction: "easeInOut",
});

export const rowClickable = sprinkles({
  cursor: "pointer",
});

export const cell = style([
  block,
  sprinkles({
    borderColor: colors.grey6,
    borderWidth: 1,
    color: colors.grey11,
    fontFamily: "body",
    paddingInline: 8,
    paddingBlock: 16,
  }),
  {
    verticalAlign: "middle",
    ":first-child": {
      paddingRight: vars.space[0],
      width: vars.size[32],
    },
    ":last-child": {
      paddingRight: vars.space[16],
    },
    selectors: {
      [`${head} &`]: {
        fontSize: 12,
        fontWeight: 500,
      },
      [`${head} ${row}:first-child > &:first-child`]: {
        borderTopLeftRadius: vars.borderRadius[6],
      },
      [`${head} ${row}:first-child > &:last-child`]: {
        borderTopRightRadius: vars.borderRadius[6],
      },
      [`${body} ${row}:last-child > &:first-child`]: {
        borderBottomLeftRadius: vars.borderRadius[6],
      },
      [`${body} ${row}:last-child > &:last-child`]: {
        borderBottomRightRadius: vars.borderRadius[6],
      },
      [`${body} &`]: {
        borderTopStyle: vars.borderStyle["solid"],
        fontSize: 14,
        fontWeight: 400,
      },
      [`${body} &:nth-child(2)`]: {
        // TODO: DT-1362 - Condition for dark and light mode, need mode export
        color: vars.color.greyLight12,
        fontWeight: 600,
      },
    },
  },
]);

export const cellContent = style([
  sprinkles({
    all: "unset",
    boxSizing: "border-box",
    alignItems: "center",
    display: "flex",
  }),
  {
    selectors: {
      [`${head} &`]: {
        height: vars.size[16],
      },
      [`${head} ${cell}:first-child > &`]: {
        paddingLeft: vars.size[8],
      },
      [`${body} &`]: {
        height: vars.size[32],
      },
      [`${body} ${cell}:last-child > &`]: {
        justifyContent: "flex-end",
      },
    },
  },
]);
