import {
  CustomTypeSM,
  TabFields,
} from "@slicemachine/core/build/models/CustomType";
import { SliceSM } from "@slicemachine/core/build/models/Slice";
import { VariationSM } from "@slicemachine/core/build/models";
import { ModelErrorsEntry, ModelErrors } from "./types";
import {
  renderCustomTypeStaticFieldKeyAccessor,
  renderSliceRepeatableFieldKeyAccessor,
  renderSliceStaticFieldKeyAccessor,
} from "@utils/str";

export const variationStoreKey = (
  sliceId: SliceSM["id"],
  variationId: VariationSM["id"]
) => `${sliceId}.${variationId}`;

export function checkModelErrorsInCustomType(
  model: CustomTypeSM
): ModelErrorsEntry {
  const fields: TabFields = model.tabs.reduce(
    (acc: TabFields, tab) => [...acc, ...tab.value],
    []
  );

  const modelErrors: ModelErrorsEntry = fields.reduce(
    (acc: ModelErrorsEntry, field) => {
      if (field.key.length === 0) {
        return {
          ...acc,
          [renderCustomTypeStaticFieldKeyAccessor(field.key)]:
            ModelErrors.EMPTY_API_ID,
        };
      }

      return acc; // no error detected for this field
    },
    {}
  );

  return modelErrors;
}

export function checkModelErrorsInVariation(
  model: VariationSM
): ModelErrorsEntry {
  const staticFieldsModelErrors: ModelErrorsEntry = (
    model.primary || []
  ).reduce((acc, field) => {
    if (field.key.length === 0) {
      return {
        ...acc,
        [renderSliceStaticFieldKeyAccessor(field.key)]:
          ModelErrors.EMPTY_API_ID,
      };
    }

    return acc;
  }, {});

  const repeatableFieldsModelErrors: ModelErrorsEntry = (
    model.items || []
  ).reduce((acc, field) => {
    if (field.key.length === 0) {
      return {
        ...acc,
        [renderSliceRepeatableFieldKeyAccessor(field.key)]:
          ModelErrors.EMPTY_API_ID,
      };
    }

    return acc;
  }, {});

  return { ...staticFieldsModelErrors, ...repeatableFieldsModelErrors };
}
