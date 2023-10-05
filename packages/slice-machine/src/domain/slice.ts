import type {
  CompositeSlice,
  LegacySlice,
} from "@prismicio/types-internal/lib/customtypes/widgets/slices";

import type { ComponentUI } from "@lib/models/common/ComponentUI";
import type { VariationSM } from "@lib/models/common/Slice";

export type NonSharedSlice = CompositeSlice | LegacySlice;

export const NON_SHARED_SLICE_LIBRARY_NAME = "Default";

export function countMissingScreenshots(slice: ComponentUI): number {
  return slice.model.variations.length - Object.keys(slice.screenshots).length;
}

export function getNonSharedSliceLabel(slice: NonSharedSlice): string {
  return (
    slice.config?.label ??
    (slice.type === "Group" ||
    slice.type === "Slice" ||
    (slice.type !== "Boolean" && slice.type !== "Separator")
      ? slice.fieldset
      : undefined) ??
    slice.type
  );
}

export function getScreenshotUrl(
  slice: ComponentUI,
  variation: VariationSM
): string | undefined {
  return slice.screenshots[variation.id]?.url;
}

export function getSharedSliceLibraryName(slice: ComponentUI): string {
  return slice.from.length > 0 ? slice.from : "Default";
}
