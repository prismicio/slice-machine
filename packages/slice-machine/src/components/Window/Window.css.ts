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
    overflowX: "auto",
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
    padding: "8px 8px 8px 15px",
    selectors: {
      [`&[data-state='active']`]: {
        // active
        color: vars.color.greyLight12,
        borderRadius: "6px 6px 0px 0px",
        backgroundColor: vars.color.greyLight1,
        boxShadow: vars.boxShadow[3],
        borderColor: vars.color.greyLight1,
        borderBottomColor: vars.color.transparent,
      },

      [`&:not([data-state='active']):hover`]: {
        // hover state
        backgroundColor: vars.color.greyLight1,
        borderRadius: "6px 6px 0px 0px",
        borderColor: vars.color.greyLight6,
        borderBottomColor: vars.color.transparent,
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
    height: "21px",
    selectors: {
      [`${trigger}:not([data-state='active']) ~ &`]: {
        // all of non active triggers
        backgroundColor: vars.color.greyLight7,
      },
      [`${trigger}[data-state='active'] + &`]: {
        // end of the active trigger
        backgroundColor: vars.color.transparent,
      },
      [`&:has(+${trigger}[data-state='active'])`]: {
        // before the active trigger
        backgroundColor: vars.color.transparent,
      },
      [`${list} &:last-child`]: {
        // last item in the list should not have a visable seperator.
        backgroundColor: vars.color.transparent,
      },

      // hover states
      [`${trigger}:hover + &`]: {
        // end
        backgroundColor: vars.color.transparent,
      },
      [`&:has(+${trigger}:hover)`]: {
        // start
        backgroundColor: vars.color.transparent,
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

export const content = style([
  reset,
  sprinkles({
    flexGrow: 1,
    backgroundColor: colors.grey1,
  }),
]);
