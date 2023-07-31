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
    height: "100%", // not working :/
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

export const list = style([
  reset,
  sprinkles({
    display: "flex",
    flexShrink: 0,
    backgroundColor: colors.grey2,
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
    // squash tab
    overflow: "hidden",
    whiteSpace: "nowrap",
  }),
  {
    padding: "8px 8px 8px 0px",
    selectors: {
      [`&[data-state='active']`]: {
        color: vars.color.greyLight12,
        borderRadius: "6px 6px 0px 0px",
        backgroundColor: vars.color.greyLight1,
        boxShadow: vars.boxShadow[3],
        borderColor: vars.color.greyLight1,
        borderBottomColor: vars.color.transparent,
        // unsquash tab
        overflow: "visible",
      },
    },
  },
]);

export const triggerSeperator = style([
  reset,
  sprinkles({
    width: 1,
    backgroundColor: colors.transparent,
    flexShrink: 0,
  }),
  {
    marginRight: "15px",
    height: "66%",
    selectors: {
      [`${trigger}:not([data-state='active']) + ${trigger}:not([data-state='active']) &`]:
        {
          backgroundColor: vars.color.greyLight7,
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
    },
  },
]);

export const content = style([
  reset,
  sprinkles({
    flexGrow: 1,
    backgroundColor: colors.grey1,
  }),
]);
