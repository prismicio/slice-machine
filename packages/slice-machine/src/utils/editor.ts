import { SharedSliceContent } from "@prismicio/types-internal/lib/content";

export const defaultSharedSliceContent = (
  variationId: string
): SharedSliceContent => ({
  __TYPE__: "SharedSliceContent",
  variation: variationId,
  primary: {},
  items: [],
});
