import { style } from "@vanilla-extract/css";
import { colors, sprinkles, vars } from "@prismicio/editor-ui";

const block = sprinkles({
  all: "unset",
  boxSizing: "border-box",
});

export const root = style([
  block,
  sprinkles({
    alignItems: "center",
    animationDuration: 300,
    animationName: "fadeIn",
    animationTimingFunction: "easeInOut",
    display: "flex",
    flexDirection: "column",
  }),
]);

export const centeredBlock = style([
  block,
  sprinkles({
    borderColor: colors.grey6,
    borderRadius: 6,
    borderStyle: "solid",
    borderWidth: 1,
    display: "revert",
    overflow: "hidden",
  }),
  { maxWidth: 498 },
]);

export const image = style([
  block,
  sprinkles({
    borderColor: colors.grey6,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    display: "revert",
  }),
  { height: 314 },
]);

export const content = style([
  block,
  sprinkles({
    padding: 32,
    display: "revert",
  }),
]);

export const title = style([
  block,
  {
    fontSize: 18,
    lineHeight: "32px",
    fontWeight: 600,
  },
]);

export const desc = style([
  block,
  {
    fontWeight: 400,
  },
]);

export const actions = style({ marginTop: vars.size[16] });
