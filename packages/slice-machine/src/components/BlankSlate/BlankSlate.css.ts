import { colors, sprinkles } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";

const column = sprinkles({
  all: "unset",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
});

export const root = style([
  column,
  sprinkles({
    animationDuration: 300,
    animationName: "fadeIn",
    animationTimingFunction: "easeInOut",
    borderColor: colors.grey6,
    borderRadius: 6,
    borderStyle: "solid",
    borderWidth: 1,
    overflow: "hidden",
  }),
  { maxWidth: 498, minHeight: 400 },
]);

export const image = style([
  column,
  sprinkles({
    borderBottomColor: colors.grey6,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    overflow: "hidden",
  }),
]);

export const content = style([column, sprinkles({ padding: 32 })]);

export const title = style({
  fontSize: 18,
  fontWeight: 600,
  lineHeight: "32px",
});

export const desc = style({ fontWeight: 400 });

export const actions = sprinkles({
  gap: 16,
  alignItems: "center",
  marginTop: 16,
});
