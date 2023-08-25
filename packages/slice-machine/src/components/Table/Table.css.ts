import { colors, selectors, sprinkles, vars } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";

const revert = sprinkles({ all: "unset", display: "revert" });

export const root = style([
  revert,
  sprinkles({
    borderColor: colors.grey6,
    borderRadius: 6,
    borderStyle: "solid",
    borderWidth: 1,
    overflowX: "hidden",
  }),
]);

export const table = style([
  revert,
  sprinkles({ boxShadow: 1, width: "100%" }),
  { borderCollapse: "collapse", tableLayout: "fixed" },
]);

export const head = style([
  revert,
  sprinkles({ backgroundColor: colors.grey2 }),
]);

export const body = style([revert, {}]);

export const row = style([revert, sprinkles({ height: 48 })]);

export const bodyRow = sprinkles({
  backgroundColor: {
    ...colors.grey1,
    ...selectors.focusVisible(colors.grey5),
    ...selectors.hover(colors.grey4),
  },
  height: 64,
  transitionDuration: 250,
  transitionProperty: "background-color",
  transitionTimingFunction: "easeInOut",
});

export const rowClickable = sprinkles({ cursor: "pointer" });

export const cell = style([
  revert,
  sprinkles({
    borderColor: colors.grey6,
    borderWidth: 1,
    boxSizing: "border-box",
    color: colors.grey11,
    fontFamily: "body",
    paddingInline: 8,
  }),
  {
    verticalAlign: "middle",
    ":first-child": { paddingRight: vars.space[0], width: vars.size[40] },
    ":last-child": {
      paddingLeft: vars.space[0],
      paddingRight: vars.space[16],
      width: vars.size[48],
    },
    selectors: {
      [`${head} &`]: { fontSize: 12, fontWeight: 500 },
      [`${body} &`]: {
        borderTopStyle: vars.borderStyle.solid,
        fontSize: 14,
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
  sprinkles({ all: "unset", display: "flex" }),
  {
    selectors: {
      [`${head} ${cell}:first-child > &`]: { paddingLeft: vars.space[6] },
      [`:is(${body}, ${head}) ${cell}:not(:first-child):not(:last-child) > &`]:
        {
          display: "revert",
          overflowX: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        },
    },
  },
]);
