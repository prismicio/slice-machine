import { Reducer } from "redux";
import { getType } from "typesafe-actions";
import { ModelErrorsStoreType } from "./types";
import {
  ModelErrorsActions,
  checkCustomTypeModelErrorsCreator,
  checkVariationModelErrorsCreator,
} from "./actions";
import {
  checkModelErrorsInCustomType,
  checkModelErrorsInVariation,
  variationStoreKey,
} from "./helpers";

export const initialState: ModelErrorsStoreType = {
  customTypes: {},
  variations: {},
};

export const modelErrorsReducer: Reducer<
  ModelErrorsStoreType,
  ModelErrorsActions
> = (state = initialState, action) => {
  switch (action.type) {
    case getType(checkCustomTypeModelErrorsCreator): {
      const modelErrors = checkModelErrorsInCustomType(action.payload.model);

      return {
        ...state,
        customTypes: {
          ...state.customTypes,
          [action.payload.model.id]: modelErrors,
        },
      };
    }

    case getType(checkVariationModelErrorsCreator): {
      const key = variationStoreKey(
        action.payload.sliceId,
        action.payload.model.id
      );
      const modelErrors = checkModelErrorsInVariation(action.payload.model);

      return {
        ...state,
        variations: {
          ...state.variations,
          [key]: modelErrors,
        },
      };
    }

    default:
      return state;
  }
};
