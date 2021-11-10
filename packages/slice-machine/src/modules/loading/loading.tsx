import { Reducer } from "redux";
import mapValues from "lodash/mapValues";
import { SliceMachineStoreType } from "src/redux/type";
import { LoadingStoreType, LoadingKeysEnum } from "./types";
import { ActionType, createAction, getType } from "typesafe-actions";

const initialState: LoadingStoreType = {
  ...mapValues(LoadingKeysEnum, () => false),
};

// Action Creators
export const startLoadingActionCreator = createAction("LOADING/START")<{
  key: LoadingKeysEnum;
}>();

export const stopLoadingActionCreator = createAction("LOADING/STOP")<{
  key: LoadingKeysEnum;
}>();

type LoadingActions = ActionType<
  typeof startLoadingActionCreator | typeof stopLoadingActionCreator
>;

// Selectors
export const isLoading = (
  store: SliceMachineStoreType,
  key: LoadingKeysEnum
): boolean => store.loading[key];

// Reducer
export const loadingReducer: Reducer<LoadingStoreType, LoadingActions> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case getType(startLoadingActionCreator):
      return {
        ...state,
        [action.payload.key]: true,
      };
    case getType(stopLoadingActionCreator):
      return {
        ...state,
        [action.payload.key]: false,
      };
    default:
      return state;
  }
};
