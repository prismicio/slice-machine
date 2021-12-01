import { Reducer } from "redux";
import { EnvironmentStoreType } from "./types";
import { ActionType, createAction, getType } from "typesafe-actions";
import { SliceMachineStoreType } from "@src/redux/type";

const initialState: EnvironmentStoreType = {
  warnings: [],
  configErrors: {},
  env: null,
};

// Action Creators
export const getEnvironmentCreator = createAction(
  "ENVIRONMENT/GET.RESPONSE"
)<EnvironmentStoreType>();

type EnvironmentActions = ActionType<typeof getEnvironmentCreator>;

// Selectors
export const getEnvironment = (store: SliceMachineStoreType) =>
  store.environment.env;

export const selectIsThePreviewSetUp = (store: SliceMachineStoreType) =>
  !!store.environment.env?.userConfig.localSliceCanvasURL;

export const getWarnings = (store: SliceMachineStoreType) =>
  store.environment.warnings;

export const getConfigErrors = (store: SliceMachineStoreType) =>
  store.environment.configErrors;

export const getUpdateVersionInfo = (store: SliceMachineStoreType) => {
  if (!store.environment.env) {
    return null;
  }

  return store.environment.env.updateVersionInfo;
};

// Reducer
export const environmentReducer: Reducer<
  EnvironmentStoreType,
  EnvironmentActions
> = (state = initialState, action) => {
  switch (action.type) {
    case getType(getEnvironmentCreator):
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};
