import { Reducer } from "redux";
import { SliceMachineStoreType } from "@src/redux/type";
import {
  ActionType,
  createAction,
  createAsyncAction,
  getType,
} from "typesafe-actions";
import { PreviewStoreType, SetupStatus } from "./types";
import { call, fork, put, select, takeLatest } from "redux-saga/effects";
import { checkPreviewSetup } from "@src/apiClient";
import { getFramework } from "@src/modules/environment";
import { Frameworks } from "@slicemachine/core/build/src/models";

const NoStepSelected: number = 0;

export const initialState: PreviewStoreType = {
  setupStatus: {
    manifest: null,
    iframe: null,
    dependencies: null,
  },
  setupDrawer: {
    isOpen: false,
    openedStep: NoStepSelected,
  },
};

// Actions Creators
export const openSetupPreviewDrawerCreator = createAction(
  "PREVIEW/OPEN_SETUP_DRAWER"
)<{
  stepToOpen?: number;
}>();

export const checkPreviewSetupCreator = createAsyncAction(
  "PREVIEW/CHECK_SETUP.REQUEST",
  "PREVIEW/CHECK_SETUP.SUCCESS",
  "PREVIEW/CHECK_SETUP.FAILURE"
)<
  {
    redirectUrl: string;
  },
  {
    setupStatus: SetupStatus;
  },
  Error
>();

export const closeSetupPreviewDrawerCreator = createAction(
  "PREVIEW/CLOSE_SETUP_DRAWER"
)();

export const toggleSetupDrawerStepCreator = createAction(
  "PREVIEW/TOGGLE_SETUP_DRAWER_STEP"
)<{
  stepNumber: number;
}>();

type PreviewActions = ActionType<
  | typeof openSetupPreviewDrawerCreator
  | typeof closeSetupPreviewDrawerCreator
  | typeof toggleSetupDrawerStepCreator
  | typeof checkPreviewSetupCreator.success
>;

// Selectors
export const selectIsSetupDrawerOpen = (
  state: SliceMachineStoreType
): boolean => state.preview.setupDrawer.isOpen;

export const selectSetupStatus = (state: SliceMachineStoreType): SetupStatus =>
  state.preview.setupStatus;

export const selectUserHasAtLeastOneStepMissing = (
  state: SliceMachineStoreType
): boolean =>
  state.preview.setupStatus.dependencies !== "ok" ||
  state.preview.setupStatus.iframe !== "ok" ||
  state.preview.setupStatus.manifest !== "ok";

export const selectOpenedStep = (state: SliceMachineStoreType): number =>
  state.preview.setupDrawer.openedStep;

// Reducer
export const previewReducer: Reducer<PreviewStoreType, PreviewActions> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case getType(openSetupPreviewDrawerCreator):
      return {
        ...state,
        setupDrawer: {
          ...state.setupDrawer,
          isOpen: true,
          ...(!!action.payload.stepToOpen
            ? { openedStep: action.payload.stepToOpen }
            : null),
        },
      };
    case getType(toggleSetupDrawerStepCreator):
      return {
        ...state,
        setupDrawer: {
          ...state.setupDrawer,
          openedStep:
            state.setupDrawer.openedStep === action.payload.stepNumber
              ? NoStepSelected
              : action.payload.stepNumber,
        },
      };
    case getType(checkPreviewSetupCreator.success):
      return {
        ...state,
        setupStatus: {
          ...state.setupStatus,
          ...action.payload.setupStatus,
        },
      };
    case getType(closeSetupPreviewDrawerCreator):
      return {
        ...state,
        setupDrawer: {
          openedStep: NoStepSelected,
          isOpen: false,
        },
      };
    default:
      return state;
  }
};

// Sagas
export function* checkSetupSaga(
  action: ReturnType<typeof checkPreviewSetupCreator.request>
) {
  try {
    const framework: Frameworks | undefined = yield select(getFramework);

    if (!framework) return;

    const { data: setupStatus } = yield call(checkPreviewSetup);

    // All the backend checks are ok
    if ("ok" === setupStatus.manifest && "ok" === setupStatus.dependencies) {
      window.open(action.payload.redirectUrl);
      return;
    }

    yield put(checkPreviewSetupCreator.success({ setupStatus }));
    yield put(
      openSetupPreviewDrawerCreator({
        stepToOpen: framework === Frameworks.nuxt ? 5 : 4,
      })
    );
  } catch (error) {
    yield put(checkPreviewSetupCreator.failure(error));
  }
}

// Saga watchers
function* watchCheckSetup() {
  yield takeLatest(getType(checkPreviewSetupCreator.request), checkSetupSaga);
}

// Saga Exports
export function* watchPreviewSagas() {
  yield fork(watchCheckSetup);
}
