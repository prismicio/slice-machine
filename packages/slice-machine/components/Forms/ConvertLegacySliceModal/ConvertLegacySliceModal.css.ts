import { sprinkles } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";

export const form = style([
  sprinkles({
    display: "flex",
    flexDirection: "column",
  }),
]);

export const scrollArea = style([
  sprinkles({
    height: "100%",
    display: "flex",
    gap: 8,
    paddingInline: 16,
    paddingBlock: 16,
  }),
]);

export const field = style([
  sprinkles({
    display: "flex",
    flexDirection: "column",
    gap: 4,
  }),
]);

export const label = style([
  sprinkles({
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
  }),
]);
