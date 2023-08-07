import { sprinkles, colors } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";

const reset = sprinkles({
  all: "unset",
  boxSizing: "border-box",
  fontFamily: "body",
});

export const root = style([
  reset,
  sprinkles({
    width: "100%",
  }),
]);

export const header = style([
  reset,
  sprinkles({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    backgroundColor: colors.grey1,
    color: colors.grey11,
    borderBottomColor: colors.grey6,
    borderBottomStyle: "dashed",
    borderBottomWidth: 1,
  }),
  {
    padding: "8px 8px 8px 16px",
  },
]);

export const headerLeftItem = style([
  reset,
  {
    padding: "8px 0px",
    fontSize: "12px",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "16px",
  },
]);
