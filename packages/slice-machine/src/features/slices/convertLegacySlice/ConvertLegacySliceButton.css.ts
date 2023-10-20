import { sprinkles } from "@prismicio/editor-ui";

export const scrollArea = sprinkles({
  height: "100%",
  display: "flex",
  gap: 8,
  paddingInline: 16,
  paddingBlock: 16,
});

export const label = sprinkles({
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
});
