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

export const selectPreviewUrl = (
  store: SliceMachineStoreType
): string | undefined => {
  return store.environment.env.manifest.localSlicePreviewURL;
};

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

export const getCurrentVersion = (store: SliceMachineStoreType): string => {
  const { currentVersion } = getUpdateVersionInfo(store);
  return currentVersion;
};

export const getStorybookUrl = (
  store: SliceMachineStoreType
): string | null => {
  return store.environment.env.manifest.storybook || null;
};

export const getLinkToStorybookDocs = (
  state: SliceMachineStoreType
): string => {
  const framework = getFramework(state);
  switch (framework) {
    case Frameworks.next:
      return "https://prismic.io/docs/technologies/storybook-nextjs";
    case Frameworks.nuxt:
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
