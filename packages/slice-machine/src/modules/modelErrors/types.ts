import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import { VariationSM } from "@slicemachine/core/build/models";

export enum ModelErrors {
  EMPTY_API_ID = "empty_api_id",
}

export type ModelErrorsEntry = Record<
  string, // complete API ID of the field
  ModelErrors
>;

export type ModelErrorsStoreType = {
  customTypes: Record<CustomTypeSM["id"], ModelErrorsEntry>;
  variations: Record<VariationSM["id"], ModelErrorsEntry>;
};
