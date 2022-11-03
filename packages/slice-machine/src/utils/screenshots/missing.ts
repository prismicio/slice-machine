import { ComponentUI } from "@lib/models/common/ComponentUI";

export const countMissingScreenshots = (slice: ComponentUI) =>
  slice.model.variations.length - Object.entries(slice.screenshots).length;
