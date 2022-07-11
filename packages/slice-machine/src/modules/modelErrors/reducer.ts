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
      const modelErrors = checkModelErrorsInVariation(action.payload.model);

      return {
        ...state,
        variations: {
          ...state.variations,
          [action.payload.model.id]: modelErrors,
        },
      };
    }

    default:
      return state;
  }
};
