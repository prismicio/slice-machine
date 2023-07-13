import { Reducer } from "redux";
import { EnvironmentStoreType } from "./types";
import {
  ActionType,
  createAction,
  createAsyncAction,
  getType,
} from "typesafe-actions";
import type { PackageManager, APIEndpoints } from "@slicemachine/manager";
import { SliceMachineStoreType } from "@src/redux/type";
import { FrontEndEnvironment } from "@models/common/Environment";
import { LibraryUI } from "@models/common/LibraryUI";
import { PackageChangelog } from "@lib/models/common/versions";
import { SliceSM } from "@lib/models/common/Slice";
import { CustomTypeSM } from "@lib/models/common/CustomType";
import ErrorWithStatus from "@lib/models/common/ErrorWithStatus";
import { AuthStatus } from "../userContext/types";
import { getChangelogApiClient } from "@src/apiClient";
import { call, fork, put, takeLatest } from "redux-saga/effects";
import { withLoader } from "../loading";
import { LoadingKeysEnum } from "../loading/types";

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
export const getChangelogCreator = createAsyncAction(
  "CHANGELOG.REQUEST",
  "CHANGELOG.RESPONSE",
  "CHANGELOG.FAILURE"
)<
  undefined,
  {
    changelog: PackageChangelog;
  },
  undefined
>();

type EnvironmentActions = ActionType<
  | typeof refreshStateCreator
  | typeof getChangelogCreator
  | typeof updateManifestCreator
>;

// Selectors
export const getEnvironment = (
  store: SliceMachineStoreType
): FrontEndEnvironment => store.environment;

export const selectSimulatorUrl = (
  store: SliceMachineStoreType
): string | undefined => {
  return store.environment.manifest.localSliceSimulatorURL;
};

export const getRepoName = (store: SliceMachineStoreType): string =>
  store.environment.repo;

export const getApiEndpoint = (store: SliceMachineStoreType): string =>
  store.environment.manifest.apiEndpoint;

export const selectEndpoints = (store: SliceMachineStoreType): APIEndpoints =>
  store.environment.endpoints;

export const selectIsSimulatorAvailableForFramework = (
  store: SliceMachineStoreType
): boolean => {
  return store.environment.supportsSliceSimulator;
};

export const getChangelog = (store: SliceMachineStoreType) => {
  return (
    store.environment.changelog ?? {
      sliceMachine: {
        currentVersion: "",
        updateAvailable: false,
        latestNonBreakingVersion: null,
        versions: [],
      },
      adapter: {
        updateAvailable: false,
        versions: [],
        name: "",
      },
    }
  );
};

export const getPackageManager = (
  store: SliceMachineStoreType
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
    case getType(getChangelogCreator.success):
      return { ...state, changelog: action.payload.changelog };
    default:
      return state;
  }
};

export function* getChangelogSaga(): Generator<
  unknown,
  void,
  PackageChangelog
> {
  try {
    const changelog = yield call(getChangelogApiClient);
    yield put(getChangelogCreator.success({ changelog }));
  } catch {
    yield put(getChangelogCreator.failure());
  }
}

function* watchChangelog() {
  yield takeLatest(
    getType(getChangelogCreator.request),
    withLoader(getChangelogSaga, LoadingKeysEnum.CHANGELOG)
  );
}

// Saga Exports
export function* watchChangelogSagas() {
  yield fork(watchChangelog);
}
