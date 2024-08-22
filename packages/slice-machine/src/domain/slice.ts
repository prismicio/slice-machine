import { GroupFieldType } from "@prismicio/types-internal/lib/customtypes";
import type {
  CompositeSlice,
  LegacySlice,
  SharedSlice,
  SlicePrimaryWidget,
} from "@prismicio/types-internal/lib/customtypes/widgets/slices";

import type { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";
import { Groups } from "@/legacy/lib/models/common/Group";
import {
  type VariationSM,
  WidgetsArea,
} from "@/legacy/lib/models/common/Slice";
import { pascalize, snakelize } from "@/legacy/lib/utils/str";

type CopySliceVariationArgs = {
  copiedVariation: VariationSM;
  id: string;
  name: string;
  slice: ComponentUI;
};

type DeleteFieldArgs = {
  slice: ComponentUI;
  variationId: string;
  widgetArea: WidgetsArea;
  fieldId: string;
};

type UpdateFieldArgs = {
  slice: ComponentUI;
  variationId: string;
  widgetArea: WidgetsArea;
  previousFieldId: string;
  newFieldId: string;
  newField: SlicePrimaryWidget;
};

type AddFieldArgs = {
  slice: ComponentUI;
  variationId: string;
  widgetArea: WidgetsArea;
  newFieldId: string;
  newField: SlicePrimaryWidget;
};

type ReorderFieldArgs = {
  slice: ComponentUI;
  variationId: string;
  widgetArea: WidgetsArea;
  sourceIndex: number;
  destinationIndex: number;
};

type DeleteRepeatableZoneArgs = {
  slice: ComponentUI;
  variationId: string;
};

const DEFAULT_VARIATION_ID = "default";

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

export function copySliceVariation(args: CopySliceVariationArgs) {
  const { slice, id, name, copiedVariation } = args;
  const newVariation = { ...copiedVariation, id, name };

  return {
    slice: {
      ...slice,
      model: {
        ...slice.model,
        variations: slice.model.variations.concat([newVariation]),
      },
    },
    variation: newVariation,
  };
}

export function deleteField(args: DeleteFieldArgs): ComponentUI {
  const { slice, variationId, widgetArea, fieldId } = args;

  return {
    ...slice,
    model: {
      ...slice.model,
      variations: slice.model.variations.map((v) => {
        if (v.id === variationId) {
          return {
            ...v,
            [widgetArea]: v[widgetArea]?.filter((w) => w.key !== fieldId),
          };
        }
        return v;
      }),
    },
  };
}

export function updateField(args: UpdateFieldArgs): ComponentUI {
  const {
    slice,
    variationId,
    widgetArea,
    previousFieldId,
    newFieldId,
    newField,
  } = args;

  return {
    ...slice,
    model: {
      ...slice.model,
      variations: slice.model.variations.map((v) => {
        if (v.id === variationId) {
          return {
            ...v,
            [widgetArea]: v[widgetArea]?.map((w) => {
              if (w.key === previousFieldId) {
                return {
                  key: newFieldId,
                  value: newField,
                };
              }
              return w;
            }),
          };
        }
        return v;
      }),
    },
  };
}

export function addField(args: AddFieldArgs): ComponentUI {
  const { slice, variationId, widgetArea, newFieldId, newField } = args;

  return {
    ...slice,
    model: {
      ...slice.model,
      variations: slice.model.variations.map((v) => {
        if (v.id !== variationId) {
          return v;
        }

        if (newField.type === GroupFieldType) {
          if (widgetArea === WidgetsArea.Items) {
            return v;
          } else {
            return {
              ...v,
              [widgetArea]: v[widgetArea]?.concat([
                { key: newFieldId, value: Groups.toSM(newField) },
              ]),
            };
          }
        } else {
          return {
            ...v,
            [widgetArea]: v[widgetArea]?.concat([
              { key: newFieldId, value: newField },
            ]),
          };
        }
      }),
    },
  };
}

export function reorderField(args: ReorderFieldArgs): ComponentUI {
  const { slice, variationId, widgetArea, sourceIndex, destinationIndex } =
    args;

  const fields =
    slice.model.variations.find((v) => v.id === variationId)?.[widgetArea] ??
    [];

  const reorderedFields = [...fields];
  const [removedField] = reorderedFields.splice(sourceIndex, 1);
  reorderedFields.splice(destinationIndex, 0, removedField);

  return {
    ...slice,
    model: {
      ...slice.model,
      variations: slice.model.variations.map((v) => {
        if (v.id === variationId) {
          return {
            ...v,
            [widgetArea]: reorderedFields,
          };
        }
        return v;
      }),
    },
  };
}

export function buildEmptySliceModel(sliceName: string): SharedSlice {
  return {
    id: snakelize(sliceName),
    type: "SharedSlice",
    name: sliceName,
    description: sliceName,
    variations: [
      {
        id: DEFAULT_VARIATION_ID,
        name: pascalize(DEFAULT_VARIATION_ID),
        // Property not used yet. Fallback to "...".
        docURL: "...",
        // "initial" is fine here as default value.
        version: "initial",
        description: pascalize(DEFAULT_VARIATION_ID),
        // Empty string is fine, we don't want to save imageUrl.
        // We don't want to compare local and remote image with imageUrl.
        // It will be striped anyway when doing the comparison.
        imageUrl: "",
      },
    ],
  };
}

export function rename(slice: ComponentUI, newSliceName: string): ComponentUI {
  return {
    ...slice,
    model: {
      ...slice.model,
      name: newSliceName,
    },
  };
}

export function deleteRepeatableZone(args: DeleteRepeatableZoneArgs) {
  const { slice, variationId } = args;

  return {
    ...slice,
    model: {
      ...slice.model,
      variations: slice.model.variations.map((v) => {
        if (v.id === variationId) {
          const newVariation = { ...v };
          delete newVariation.items;

          return newVariation;
        }
        return v;
      }),
    },
  };
}
