import { ActionType, createAction } from "typesafe-actions";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import { VariationSM } from "@slicemachine/core/build/models";

export type ModelErrorsActions =
  | ActionType<typeof checkCustomTypeModelErrorsCreator>
  | ActionType<typeof checkVariationModelErrorsCreator>;

export const checkCustomTypeModelErrorsCreator = createAction(
  "MODEL_ERRORS/CHECK_CUSTOM_TYPE"
)<{
  model: CustomTypeSM;
}>();

export const checkVariationModelErrorsCreator = createAction(
  "MODEL_ERRORS/CHECK_SLICE"
)<{
  model: VariationSM;
}>();
