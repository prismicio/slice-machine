import type { APIEndpoints, PackageManager } from "@slicemachine/manager";
import { Reducer } from "redux";
import { ActionType, createAction, getType } from "typesafe-actions";

import { CustomTypeSM } from "@/legacy/lib/models/common/CustomType";
import { FrontEndEnvironment } from "@/legacy/lib/models/common/Environment";
import ErrorWithStatus from "@/legacy/lib/models/common/ErrorWithStatus";
import { LibraryUI } from "@/legacy/lib/models/common/LibraryUI";
import { SliceSM } from "@/legacy/lib/models/common/Slice";
import { SliceMachineStoreType } from "@/redux/type";

import { AuthStatus } from "../userContext/types";
import { EnvironmentStoreType } from "./types";

// Action Creators
export const refreshStateCreator = createAction("STATE/REFRESH.RESPONSE")<{
  env: FrontEndEnvironment;
  localCustomTypes: ReadonlyArray<CustomTypeSM>;
  remoteCustomTypes: ReadonlyArray<CustomTypeSM>;
  libraries: ReadonlyArray<LibraryUI>;
  remoteSlices: ReadonlyArray<SliceSM>;
  clientError?: ErrorWithStatus;
}>();

export const updateManifestCreator = createAction("STATE/UPDATE_MANIFEST")<{
  value: string | undefined;
}>();

// Actions Creators
type EnvironmentActions = ActionType<
  typeof refreshStateCreator | typeof updateManifestCreator
>;

// Selectors
export const getEnvironment = (
  store: SliceMachineStoreType,
): FrontEndEnvironment => store.environment;

export const selectSimulatorUrl = (
  store: SliceMachineStoreType,
): string | undefined => {
  return store.environment.manifest.localSliceSimulatorURL;
};

export const getRepoName = (store: SliceMachineStoreType): string =>
  store.environment.repo;

export const getApiEndpoint = (store: SliceMachineStoreType): string =>
  store.environment.manifest.apiEndpoint;

export const selectEndpoints = (store: SliceMachineStoreType): APIEndpoints =>
  store.environment.endpoints;

export const getPackageManager = (
  store: SliceMachineStoreType,
): PackageManager => {
  return store.environment.packageManager;
};

export const getAuthStatus = (state: SliceMachineStoreType): AuthStatus => {
  return state.userContext.authStatus;
};

// Reducer
// This reducer is preloaded by a state coming from the /state call in the _app component
export const environmentReducer: Reducer<
  EnvironmentStoreType | null,
  EnvironmentActions
> = (state, action) => {
  if (!state) return null;

  switch (action.type) {
    case getType(refreshStateCreator):
      return {
        ...state,
        ...action.payload.env,
      };
    case getType(updateManifestCreator):
      return {
        ...state,
        manifest: {
          ...state.manifest,
          localSliceSimulatorURL: action.payload.value,
        },
      };
    default:
      return state;
  }
};
