import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import { TabFields } from "@slicemachine/core/build/models/CustomType";
import { VariationSM } from "@slicemachine/core/build/models";
import { ModelErrorsEntry, ModelErrors } from "./types";
import { renderCustomTypeStaticFieldKeyAccessor } from "@utils/str";

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
  model;
  return {};
}
