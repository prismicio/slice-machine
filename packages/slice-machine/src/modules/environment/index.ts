import { Reducer } from "redux";
import { EnvironmentStoreType } from "./types";
import {
  ActionType,
  createAction,
  createAsyncAction,
  getType,
} from "typesafe-actions";
import { SliceMachineStoreType } from "@src/redux/type";
import { FrontEndEnvironment } from "@models/common/Environment";
import { Frameworks } from "@slicemachine/core/build/models/Framework";
import { simulatorIsSupported } from "@lib/utils";
import { LibraryUI } from "@models/common/LibraryUI";
import { PackageChangelog } from "@lib/models/common/versions";
import { PackageManager } from "@lib/models/common/PackageManager";
import { SliceSM } from "@slicemachine/core/build/models";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
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

export const getFramework = (store: SliceMachineStoreType): Frameworks =>
  store.environment.framework;

export const getShortId = (store: SliceMachineStoreType): string | undefined =>
  store.environment.shortId;

export const getIntercomHash = (
  store: SliceMachineStoreType
): string | undefined => store.environment.intercomHash;

export const getRepoName = (store: SliceMachineStoreType): string =>
  store.environment.repo;

export const selectIsSimulatorAvailableForFramework = (
  store: SliceMachineStoreType
): boolean => {
  return simulatorIsSupported(store.environment.framework);
};

export const getChangelog = (store: SliceMachineStoreType) => {
  return (
    store.environment.changelog ?? {
      currentVersion: "",
      updateAvailable: false,
      latestNonBreakingVersion: null,
      versions: [],
    }
  );
};

export const getPackageManager = (
  store: SliceMachineStoreType
): PackageManager => {
  return store.environment.packageManager;
};

export const getCurrentVersion = (store: SliceMachineStoreType): string => {
  const changelog = getChangelog(store);
  return changelog?.currentVersion;
};

export const getIsTrackingAvailable = (
  store: SliceMachineStoreType
): boolean => {
  return (
    store.environment.manifest.tracking === undefined ||
    store.environment.manifest.tracking
  );
};

export const getStorybookUrl = (
  store: SliceMachineStoreType
): string | null => {
  return store.environment.manifest.storybook || null;
};

export const getLinkToTroubleshootingDocs = (
  state: SliceMachineStoreType
): string => {
  const framework = getFramework(state);
  switch (framework) {
    case Frameworks.next:
    case Frameworks.previousNext:
      return "https://prismic.io/docs/technologies/setup-slice-simulator-nextjs";
    case Frameworks.nuxt:
    case Frameworks.previousNuxt:
      return "https://prismic.io/docs/technologies/setup-slice-simulator-nuxtjs";
    default:
      return "https://prismic.io/docs";
  }
};

export const getLinkToStorybookDocs = (
  state: SliceMachineStoreType
): string => {
  const framework = getFramework(state);
  switch (framework) {
    case Frameworks.next:
    case Frameworks.previousNext:
      return "https://prismic.io/docs/technologies/storybook-nextjs";
    case Frameworks.nuxt:
    case Frameworks.previousNuxt:
      return "https://prismic.io/docs/technologies/use-storybook-nuxtjs";
    case Frameworks.react:
      return "https://storybook.js.org/docs/react/get-started/install";
    case Frameworks.vue:
      return "https://storybook.js.org/docs/vue/get-started/install";
    case Frameworks.svelte:
      return "https://storybook.js.org/docs/svelte/get-started/install";
    default:
      return "https://prismic.io/docs";
  }
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
