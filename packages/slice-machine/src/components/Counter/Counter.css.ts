import { colors, sprinkles } from "@prismicio/editor-ui";
import { style } from "@vanilla-extract/css";

export const root = sprinkles({
  all: "unset",
  display: "inline-flex",
  alignItems: "center",
  position: "relative",
});

export const count = style([
  sprinkles({
    all: "unset",
    color: colors.grey1,
    position: "absolute",
  }),
  {
    fontSize: "9px",
    fontWeight: 500,
    left: "50%",
    lineHeight: "32px",
    top: "50%",
    transform: "translate(-50%, -50%)",
  },
]);
