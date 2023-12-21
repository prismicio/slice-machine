import { colors, sprinkles, vars } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";

const grid = sprinkles({ all: "unset", display: "grid" });

export const root = style([
  grid,
  sprinkles({
    backgroundColor: colors.grey2,
    height: "100%",
    justifyContent: "center",
    overflowY: "auto",
    position: "absolute",
    width: "100%",
    borderStyle: "solid",
  }),
  {
    borderWidth: 0,
    borderTopWidth: 2,
    gridTemplateAreas: `
    "pane header"
    "pane content"
  `,
    gridTemplateColumns: "min-content minmax(auto, 1008px)",
    gridTemplateRows: "min-content 1fr",
  },
]);

export const borderTopColor = {
  purple: sprinkles({ borderTopColor: colors.purple9 }),
  indigo: sprinkles({ borderTopColor: colors.indigo10 }),
  amber: sprinkles({ borderTopColor: colors.amber10 }),
};

export const pane = style([
  grid,
  sprinkles({
    borderRightColor: colors.grey6,
    borderRightStyle: "dashed",
    borderRightWidth: 1,
    boxSizing: "border-box",
    overflowY: "auto",
    position: "sticky",
    top: 0,
  }),
  { gridArea: "pane", width: "320px" },
]);

export const header = style([
  grid,
  sprinkles({
    boxSizing: "border-box",
    height: 64,
    paddingBlock: 16,
    paddingInline: 32,
  }),
  { gridArea: "header" },
]);

export const content = style([
  grid,
  sprinkles({ minHeight: 0, paddingInline: 32, paddingTop: 16 }),
  {
    gridArea: "content",
    selectors: { [`${header} ~ &`]: { paddingTop: vars.space[0] } },
  },
]);

export const contentChildren = style([grid, sprinkles({ paddingBottom: 16 })]);
