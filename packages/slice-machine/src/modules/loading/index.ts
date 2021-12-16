import { Reducer } from "redux";
import mapValues from "lodash/mapValues";
import { SliceMachineStoreType } from "src/redux/type";
import { LoadingStoreType, LoadingKeysEnum } from "./types";
import { ActionType, createAction, getType } from "typesafe-actions";

export const initialState: LoadingStoreType = {
  ...(mapValues(LoadingKeysEnum, () => false) as Record<
    LoadingKeysEnum,
    boolean
  >),
};

// Action Creators
export const startLoadingActionCreator = createAction("LOADING/START")<{
  loadingKey: LoadingKeysEnum;
}>();

export const stopLoadingActionCreator = createAction("LOADING/STOP")<{
  loadingKey: LoadingKeysEnum;
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
        [action.payload.loadingKey]: true,
      };
    case getType(stopLoadingActionCreator):
      return {
        ...state,
        [action.payload.loadingKey]: false,
      };
    default:
      return state;
  }
};
