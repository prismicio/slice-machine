import { style } from "@vanilla-extract/css";
import { colors, sprinkles } from "@prismicio/editor-ui";

export const root = style([
  sprinkles({
    paddingInline: 4,
    color: colors.grey11,
  }),
  {
    border: "1px solid #E4E2E4",
    backgroundColor: "#F4F2F4",
    borderRadius: "3px",
  },
]);
