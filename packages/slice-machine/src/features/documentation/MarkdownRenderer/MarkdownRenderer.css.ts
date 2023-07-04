import { colors, sprinkles } from "@prismicio/editor-ui";

export const section = sprinkles({
  paddingBottom: 16,
});

export const inlineCode = sprinkles({
  fontFamily: "code",
  backgroundColor: colors.grey2,
  borderRadius: 6,
  paddingBlock: 2,
  paddingInline: 4,
});
