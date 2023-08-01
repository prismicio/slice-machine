import { sprinkles, colors, vars } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";

const reset = sprinkles({
  all: "unset",
  boxSizing: "border-box",
  fontFamily: "body",
});

const resetAndRevert = style([reset, { display: "revert" }]);

export const root = style([
  resetAndRevert,
  sprinkles({
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: "100%",
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.grey6,
    backgroundColor: colors.grey6,
  }),
]);

export const frame = style([
  reset,
  sprinkles({
    display: "flex",
    width: "100%",
    backgroundColor: colors.grey2,
  }),
  {
    height: "53px",
  },
]);

export const frameIcon = sprinkles({ fill: colors.grey5 });

export const frameIconContainer = style([
  reset,
  sprinkles({
    display: "inline-flex",
    alignItems: "center",
  }),
  {
    padding: "8px 16px",
  },
]);

export const tabs = style([
  reset,
  sprinkles({
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  }),
]);

export const listContainer = style([
  reset,
  sprinkles({
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.grey2,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
  }),
  {
    borderBottomColor: vars.color.greyLight6,
  },
]);

export const addButton = style([
  reset,
  sprinkles({
    padding: 8,
  }),
]);

export const list = style([
  reset,
  sprinkles({
    display: "flex",
    flexShrink: 0,
    backgroundColor: colors.grey2,
    overflow: "hidden",
    alignItems: "center",
  }),
]);

export const trigger = style([
  reset,
  sprinkles({
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: colors.grey11,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.transparent,
    backgroundColor: colors.grey2,
    whiteSpace: "nowrap",
  }),
  {
    padding: "8px 8px 8px 0px",
    selectors: {
      [`&:hover`]: {
        borderColor: vars.color.transparent,
        borderStyle: "soild",
        borderBottomColor: vars.color.transparent,
      },

      [`&:hover + &`]: {
        borderRightStyle: "none",
        borderLeftColor: "none",
      },

      [`&[data-state='active']`]: {
        // active
        color: vars.color.greyLight12,
        borderRadius: "6px 6px 0px 0px",
        backgroundColor: vars.color.greyLight1,
        boxShadow: vars.boxShadow[3],
        borderColor: vars.color.greyLight1,
      },

      [`&[data-state='active']:hover`]: {
        borderBottomColor: vars.color.transparent,
      },

      [`&:not([data-state='active']):hover`]: {
        borderLeftStyle: "none",
        backgroundColor: vars.color.greyLight1,
        borderRadius: "6px 6px 0px 0px",
        borderColor: vars.color.greyLight6,
        borderBottomColor: vars.color.transparent,
      },
    },
  },
]);

export const triggerIcon = style([
  reset,
  sprinkles({
    fill: colors.transparent,
  }),
  {
    selectors: {
      [`${trigger}[data-state='active'] &`]: {
        fill: vars.color.greyLight11,
      },
      [`${trigger}:hover &`]: {
        fill: vars.color.greyLight11,
      },
    },
  },
]);

export const tabLabel = style([
  reset,
  sprinkles({
    borderWidth: 1,
    borderStyle: "solid",
    paddingLeft: 16,
  }),
  {
    borderColor: vars.color.transparent,
    selectors: {
      [`${trigger}:not([data-state='active']):not(:hover) + ${trigger}:not([data-state='active']):not(:hover) &`]:
        {
          borderLeftColor: vars.color.greyLight8,
        },
    },
  },
]);

export const content = style([
  reset,
  sprinkles({
    height: "100%",
    flexGrow: 1,
    backgroundColor: colors.grey1,
  }),
]);
