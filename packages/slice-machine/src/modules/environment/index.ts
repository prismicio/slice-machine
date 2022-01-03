import { Reducer } from "redux";
import { EnvironmentStoreType } from "./types";
import { ActionType, createAction, getType } from "typesafe-actions";
import { SliceMachineStoreType } from "@src/redux/type";
import {
  FrontEndEnvironment,
  UpdateVersionInfo,
} from "@models/common/Environment";
import Warning from "@models/common/Warning";
import { ConfigErrors } from "@models/server/ServerState";
import { Frameworks } from "@slicemachine/core/build/src/models/Framework";
import { previewIsSupported } from "@lib/utils";

// Action Creators
export const getEnvironmentCreator = createAction(
  "ENVIRONMENT/GET.RESPONSE"
)<EnvironmentStoreType>();

type EnvironmentActions = ActionType<typeof getEnvironmentCreator>;

// Selectors
export const getEnvironment = (
  store: SliceMachineStoreType
): FrontEndEnvironment => store.environment.env;

export const selectIsThePreviewSetUp = (
  store: SliceMachineStoreType
): boolean => !!store.environment.env.manifest.localSliceCanvasURL;

export const getFramework = (store: SliceMachineStoreType): Frameworks =>
  store.environment.env.framework;

export const selectIsPreviewAvailableForFramework = (
  store: SliceMachineStoreType
): boolean => {
  return previewIsSupported(store.environment.env.framework);
};

export const getWarnings = (
  store: SliceMachineStoreType
): ReadonlyArray<Warning> => store.environment.warnings;

export const getConfigErrors = (store: SliceMachineStoreType): ConfigErrors =>
  store.environment.configErrors;

export const getUpdateVersionInfo = (
  store: SliceMachineStoreType
): UpdateVersionInfo => {
  return store.environment.env.updateVersionInfo;
};

export const getStorybookUrl = (state: SliceMachineStoreType) => {
  return state.environment.env.manifest.storybook || null;
};

// Reducer
// This reducer is preloaded by a state coming from the /state call in the _app component
export const environmentReducer: Reducer<
  EnvironmentStoreType | null,
  EnvironmentActions
> = (state, action) => {
  if (!state) return null;

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
