import type {
  CompositeSlice,
  LegacySlice,
} from "@prismicio/types-internal/lib/customtypes/widgets/slices";

import type { ComponentUI } from "@lib/models/common/ComponentUI";
import type { VariationSM } from "@lib/models/common/Slice";

export function countMissingScreenshots(slice: ComponentUI): number {
  return slice.model.variations.length - Object.keys(slice.screenshots).length;
}

export function getNonSharedSliceLabel(
  slice: CompositeSlice | LegacySlice,
): string {
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
  variation: VariationSM,
): string | undefined {
  return slice.screenshots[variation.id]?.url;
}

export function getFieldMappingFingerprint(
  slice: LegacySlice | CompositeSlice | VariationSM,
  sliceName: string,
): {
  primary: string;
  items: string;
} {
  const primary: Record<string, string> = {};
  const items: Record<string, string> = {};

  if ("type" in slice) {
    if (slice.type === "Slice") {
      for (const key in slice["non-repeat"]) {
        primary[key] = slice["non-repeat"][key].type;
      }
      for (const key in slice.repeat) {
        items[key] = slice.repeat[key].type;
      }
    } else if (slice.type === "Group") {
      for (const key in slice.config?.fields) {
        items[key] = slice.config?.fields[key].type ?? "";
      }
    } else {
      primary[sliceName] = slice.type;
    }
  } else if ("id" in slice) {
    for (const { key, value } of slice.primary ?? []) {
      primary[key] = value.type;
    }
    for (const { key, value } of slice.items ?? []) {
      items[key] = value.type;
    }
  }

  return {
    primary: JSON.stringify(
      Object.keys(primary)
        .sort()
        .map((key) => [key, primary[key]]),
    ),
    items: JSON.stringify(
      Object.keys(items)
        .sort()
        .map((key) => [key, items[key]]),
    ),
  };
}
