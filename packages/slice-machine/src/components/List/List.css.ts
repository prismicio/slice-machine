import { sprinkles, colors } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";

export const root = sprinkles({
  all: "unset",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
});

const row = style([
  sprinkles({
    all: "unset",
    display: "flex",
    flexDirection: "row",
    boxSizing: "border-box",
  }),
  {
    height: "48px",
  },
]);

export const header = style([
  row,
  sprinkles({
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    backgroundColor: colors.grey1,
    borderBottomColor: colors.grey6,
    borderBottomStyle: "dashed",
    borderBottomWidth: 1,
    padding: 8,
    paddingLeft: 16,
  }),
]);
