import { colors, sprinkles } from "@prismicio/editor-ui";

export const root = sprinkles({
  all: "unset",
  display: "revert",
  borderWidth: 1,
  borderRadius: 4,
  borderStyle: "solid",
  borderColor: colors.grey6,
});

export const header = sprinkles({
  all: "unset",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderTopRightRadius: 4,
  borderTopLeftRadius: 4,
  borderBottomStyle: "solid",
  borderBottomWidth: 1,
  backgroundColor: colors.grey2,
  borderBottomColor: colors.grey6,
  paddingBlock: 4,
  paddingInline: 10,
});

export const fileInfo = sprinkles({
  all: "unset",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 8,
});
