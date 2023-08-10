import { colors, sprinkles, vars } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";
import { calc } from "@vanilla-extract/css-utils";

const column = sprinkles({
  all: "unset",
  display: "flex",
  flexDirection: "column",
});

const row = sprinkles({ all: "unset", display: "flex", flexDirection: "row" });

export const root = sprinkles({ color: colors.grey1 });

export const frame = sprinkles({ color: colors.grey1 });

export const tabs = style([
  column,
  sprinkles({
    backgroundColor: colors.grey2,
    borderColor: colors.grey6,
    borderRadius: 6,
    borderStyle: "solid",
    borderWidth: 1,
  }),
]);

export const tabsList = style([row, sprinkles({ overflowX: "auto" })]);

export const tabsTrigger = style([
  row,
  sprinkles({
    alignItems: "center",
    backgroundColor: colors.grey2,
    boxSizing: "border-box",
    flexGrow: 1,
    gap: 8,
    height: 48,
    paddingLeft: 16,
    paddingRight: 8,
    position: "relative",
  }),
  {
    maxWidth: "300px",
    minWidth: "150px",
    ":last-child": {
      position: "sticky",
      right: vars.space[0],
    },
    selectors: {
      "&:not(:first-child)::before": {
        backgroundColor: vars.color.greyLight7,
        content: "",
        height: vars.size[32],

        left: calc.multiply(-1, 1 /* vars.space[1] */),
        position: "absolute",
        top: vars.space[8],
        width: vars.size[1],
      },
    },
  },
]);

export const tabsTriggerText = sprinkles({ flexGrow: 1 });

export const tabsContent = sprinkles({ color: colors.grey1 });
