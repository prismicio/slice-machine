import { Reducer } from "redux";
import { SliceMachineStoreType } from "@src/redux/type";
import {
  ActionType,
  createAction,
  createAsyncAction,
  getType,
} from "typesafe-actions";
import { PreviewStoreType, SetupStatus } from "./types";
import {
  call,
  fork,
  put,
  select,
  takeLatest,
  race,
  take,
  delay,
} from "redux-saga/effects";
import { checkPreviewSetup } from "@src/apiClient";
import {
  getFramework,
  selectIsPreviewAvailableForFramework,
} from "@src/modules/environment";
import { Frameworks } from "@slicemachine/core/build/src/models";
import { withLoader } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { PreviewCheckResponse } from "@models/common/Preview";

import * as previewSteps from "@builders/SliceBuilder/SetupDrawer/steps";

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
  isWaitingForIframeCheck: false,
};

// Actions Creators
export const openSetupPreviewDrawerCreator = createAction(
  "PREVIEW/OPEN_SETUP_DRAWER"
)<{
  stepToOpen?: number;
}>();

export const closeSetupPreviewDrawerCreator = createAction(
  "PREVIEW/CLOSE_SETUP_DRAWER"
)();

export const checkPreviewSetupCreator = createAsyncAction(
  "PREVIEW/CHECK_SETUP.REQUEST",
  "PREVIEW/CHECK_SETUP.SUCCESS",
  "PREVIEW/CHECK_SETUP.FAILURE"
)<
  {
    withFirstVisitCheck: boolean;
    callback?: () => void;
  },
  {
    setupStatus: SetupStatus;
  },
  Error
>();

export const connectToPreviewIframeCreator = createAsyncAction(
  "PREVIEW/CONNECT_TO_PREVIEW_IFRAME.REQUEST",
  "PREVIEW/CONNECT_TO_PREVIEW_IFRAME.SUCCESS",
  "PREVIEW/CONNECT_TO_PREVIEW_IFRAME.FAILURE"
)<undefined, undefined, undefined>();

export const toggleSetupDrawerStepCreator = createAction(
  "PREVIEW/TOGGLE_SETUP_DRAWER_STEP"
)<{
  stepNumber: number;
}>();

type PreviewActions = ActionType<
  | typeof openSetupPreviewDrawerCreator
  | typeof closeSetupPreviewDrawerCreator
  | typeof toggleSetupDrawerStepCreator
  | typeof connectToPreviewIframeCreator.success
  | typeof connectToPreviewIframeCreator.request
  | typeof connectToPreviewIframeCreator.failure
  | typeof checkPreviewSetupCreator.success
>;

// Selectors
export const selectIsSetupDrawerOpen = (
  state: SliceMachineStoreType
): boolean => state.preview.setupDrawer.isOpen;

export const selectSetupStatus = (state: SliceMachineStoreType): SetupStatus =>
  state.preview.setupStatus;

export const selectIsWaitingForIFrameCheck = (
  state: SliceMachineStoreType
): boolean => state.preview.isWaitingForIframeCheck;

export const selectUserHasAtLeastOneStepMissing = (
  state: SliceMachineStoreType
): boolean =>
  state.preview.setupStatus.dependencies === "ko" ||
  state.preview.setupStatus.iframe === "ko" ||
  state.preview.setupStatus.manifest === "ko";

export const selectUserHasConfiguredAllSteps = (
  state: SliceMachineStoreType
): boolean =>
  state.preview.setupStatus.dependencies === "ok" &&
  state.preview.setupStatus.iframe === "ok" &&
  state.preview.setupStatus.manifest === "ok";

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
    case getType(connectToPreviewIframeCreator.request):
      return {
        ...state,
        isWaitingForIframeCheck: true,
      };
    case getType(connectToPreviewIframeCreator.success):
      return {
        ...state,
        setupStatus: {
          ...state.setupStatus,
          iframe: "ok",
        },
        isWaitingForIframeCheck: false,
      };
    case getType(connectToPreviewIframeCreator.failure):
      return {
        ...state,
        setupStatus: {
          ...state.setupStatus,
          iframe: "ko",
        },
        isWaitingForIframeCheck: false,
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
function* checkSetupSaga(
  action: ReturnType<typeof checkPreviewSetupCreator.request>
) {
  try {
    const { data: setupStatus }: { data: PreviewCheckResponse } = yield call(
      checkPreviewSetup
    );

    // All the backend checks are ok ask for the frontend Iframe check
    if ("ok" === setupStatus.manifest && "ok" === setupStatus.dependencies) {
      yield put(
        checkPreviewSetupCreator.success({
          setupStatus: { iframe: null, ...setupStatus },
        })
      );
      yield put(connectToPreviewIframeCreator.request());
      const { timeout, iframeCheckKO, iframeCheckOk } = yield race({
        iframeCheckOk: take(getType(connectToPreviewIframeCreator.success)),
        iframeCheckKO: take(getType(connectToPreviewIframeCreator.failure)),
        timeout: delay(2500),
      });

      if (iframeCheckOk && action.payload.callback) {
        action.payload.callback();
        return;
      }

      if (timeout) {
        yield put(connectToPreviewIframeCreator.failure());
        yield call(failCheckSetupSaga);
        return;
      }

      if (iframeCheckKO) {
        yield call(failCheckSetupSaga);
        return;
      }
      return;
    }

    // All the backend checks are ko and the request is coming from the "start"
    const isTheFirstTime =
      "ko" === setupStatus.manifest &&
      "ko" === setupStatus.dependencies &&
      action.payload.withFirstVisitCheck;

    if (isTheFirstTime) {
      yield put(openSetupPreviewDrawerCreator({}));
      return;
    }

    yield put(
      checkPreviewSetupCreator.success({
        setupStatus: { iframe: null, ...setupStatus },
      })
    );
    yield call(failCheckSetupSaga);
  } catch (error) {
    yield put(checkPreviewSetupCreator.failure(error));
  }
}

function* failCheckSetupSaga() {
  const framework: Frameworks = yield select(getFramework);
  const isPreviewAvailableForFramework: boolean = yield select(
    selectIsPreviewAvailableForFramework
  );

  if (!isPreviewAvailableForFramework) {
    return;
  }

  const { length } =
    previewSteps[framework as Frameworks.next | Frameworks.nuxt];

  yield put(
    openSetupPreviewDrawerCreator({
      stepToOpen: length,
    })
  );
}

// Saga watchers
function* watchCheckSetup() {
  yield takeLatest(
    getType(checkPreviewSetupCreator.request),
    withLoader(checkSetupSaga, LoadingKeysEnum.CHECK_PREVIEW)
  );
}

// Saga Exports
export function* watchPreviewSagas() {
  yield fork(watchCheckSetup);
}
