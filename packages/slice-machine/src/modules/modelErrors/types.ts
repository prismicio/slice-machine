import { SliceSM, VariationSM } from "@slicemachine/core/build/models/Slice";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import { variationStoreKey } from "./helpers";

export enum ModelErrors {
  EMPTY_API_ID = "empty_api_id",
}

export type ModelErrorsEntry = Record<
  string, // complete API ID of the field
  ModelErrors
>;

export type ModelErrorsStoreType = {
  customTypes: Record<CustomTypeSM["id"], ModelErrorsEntry>;
  variations: Record<string, ModelErrorsEntry>; // key is composite of sliceID and variationID for unicity
};

export function findModelErrorsForVariation(
  modelErrors: ModelErrorsStoreType,
  sliceId: SliceSM["id"],
  variationId: VariationSM["id"]
): ModelErrorsEntry {
  return modelErrors.variations[variationStoreKey(sliceId, variationId)] || {};
}
