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
    position: "relative",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.grey2,
  }),
  {
    selectors: {
      [`&:before`]: {
        content: "",
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        borderBottom: "1px solid #e4e2e4",
      },
    },
  },
]);

export const scroll = style([
  {
    scrollbarWidth: "none",
    "::-webkit-scrollbar": {
      display: "none",
    },
  },
]);

export const addButton = style([
  reset,
  sprinkles({
    padding: 8,
    borderStyle: "none",
    borderWidth: 1,
    borderColor: colors.grey6,
    borderLeftStyle: "solid",
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
    position: "relative",
    alignItems: "center",
    gap: 8,
    color: colors.grey11,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.transparent,
    backgroundColor: colors.transparent,
    whiteSpace: "nowrap",
    flexGrow: 1,
    justifyContent: "space-between",
  }),
  {
    minWidth: "150px",
    maxWidth: "300px",
    padding: "8px 8px 8px 16px",
    selectors: {
      // when two inactive tabs that are not being interacted with, there should be a psuedo boarder inbetween them.
      ["&:not([data-state='active']):not(:hover):not(:focus) + &:not([data-state='active']):not(:hover):not(:focus):before"]:
        {
          content: "",
          position: "absolute",
          width: "1px",
          background: vars.color.greyLight7,
          left: "-1px",
          top: "8px",
          bottom: "8px",
          transition: "all 0.2s",
        },

      [`&:focus, &[data-state='active'], &:not([data-state='active']):hover`]: {
        color: vars.color.greyLight11,
        borderRadius: "6px 6px 0px 0px",
        backgroundColor: vars.color.greyLight1,
        borderColor: vars.color.greyLight6,
        borderBottomColor: vars.color.transparent,
      },

      [`&[data-state='active']`]: {
        boxShadow: vars.boxShadow[3],
        zIndex: 1,
        color: vars.color.greyLight12,
      },

      [`&:first-child`]: {
        borderLeftColor: "transparent",
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
    height: "100%",
    flexGrow: 1,
    backgroundColor: colors.grey1,
  }),
]);
