import { colors, sprinkles, vars } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";

const flex = sprinkles({ all: "unset", display: "flex" });

export const root = style([flex, sprinkles({ flexDirection: "column" })]);

export const header = style([
  flex,
  sprinkles({
    alignItems: "center",
    backgroundColor: colors.grey1,
    borderBottomColor: colors.grey6,
    borderBottomStyle: "dashed",
    borderBottomWidth: 1,
    boxSizing: "border-box",
    flexDirection: "row",
    gap: 8,
    height: 48,
    paddingLeft: 16,
    paddingRight: 8,
  }),
  {
    selectors: {
      [`${root}:last-child > &`]: { borderBottomColor: vars.color.transparent },
    },
  },
]);
