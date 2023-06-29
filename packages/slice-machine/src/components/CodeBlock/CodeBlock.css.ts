import { style } from "@vanilla-extract/css";
import { colors, sprinkles, vars } from "@prismicio/editor-ui";

export const root = sprinkles({
  borderWidth: 1,
  borderRadius: 4,
  borderStyle: "solid",
  borderColor: colors.grey6,
});

export const header = style([
  sprinkles({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopRightRadius: 4,
    borderTopLeftRadius: 4,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    backgroundColor: colors.grey2,
    borderBottomColor: colors.grey6,
  }),
  {
    padding: `${vars.space[4]} ${vars.space[10]}`,
  },
]);

export const fileInfo = sprinkles({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 8,
});
