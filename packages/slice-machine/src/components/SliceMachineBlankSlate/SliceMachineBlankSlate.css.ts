import { keyframes, style } from "@vanilla-extract/css";
import { colors, tokens } from "@prismicio/editor-ui";
import { sprinkles } from "@prismicio/editor-ui";

const column = sprinkles({
  all: "unset",
  display: "flex",
  flexDirection: "column",
});

export const root = style([
  column,
  sprinkles({
    animationDuration: 300,
    animationTimingFunction: "easeInOut",
    alignItems: "center",
  }),
  {
    animationName: keyframes({ from: { opacity: 0 }, to: { opacity: 1 } }),
  },
]);

export const image = style([
  sprinkles({
    borderColor: colors.grey6,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
  }),
  { order: 0, height: 314 },
]);

export const content = style([
  sprinkles({
    padding: 32,
  }),
]);

export const centeredBlock = style([
  sprinkles({
    borderColor: colors.grey6,
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 6,
  }),
  { order: 0, maxWidth: 498 },
]);

export const title = style({
  order: 1,
  fontSize: 18,
  lineHeight: "32px",
  fontWeight: 600,
});

export const desc = style({
  order: 1,
  fontSize: 14,
  lineHeight: "24px",
  fontWeight: 400,
});

export const actions = style({ order: 3, marginTop: tokens.space[16] });
