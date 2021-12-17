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
import { withLoader } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { PreviewCheckResponse } from "@models/common/Preview";

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
    redirectUrl: string;
    withFirstVisitCheck: boolean;
  },
  {
    setupStatus: SetupStatus;
  },
  Error
>();

export const waitingForIFrameCheckCreator = createAction(
  "PREVIEW/WAITING_FOR_IFRAME_CHECK"
)();

export const connectToPreviewSuccessCreator = createAction(
  "PREVIEW/CONNECT_TO_PREVIEW.SUCCESS"
)();

export const connectToPreviewFailureCreator = createAction(
  "PREVIEW/CONNECT_TO_PREVIEW.FAILURE"
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
  | typeof connectToPreviewSuccessCreator
  | typeof waitingForIFrameCheckCreator
  | typeof connectToPreviewFailureCreator
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
    case getType(waitingForIFrameCheckCreator):
      return {
        ...state,
        isWaitingForIframeCheck: true,
      };
    case getType(connectToPreviewSuccessCreator):
      return {
        ...state,
        setupStatus: {
          ...state.setupStatus,
          iframe: "ok",
        },
        isWaitingForIframeCheck: false,
      };
    case getType(connectToPreviewFailureCreator):
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
export function* checkSetupSaga(
  action: ReturnType<typeof checkPreviewSetupCreator.request>
) {
  try {
    const { data: setupStatus }: { data: PreviewCheckResponse } = yield call(
      checkPreviewSetup
    );

    // All the backend checks are ok ask for the frontend Iframe check
    if ("ok" === setupStatus.manifest && "ok" === setupStatus.dependencies) {
      checkPreviewSetupCreator.success({
        setupStatus: { iframe: null, ...setupStatus },
      });
      yield put(waitingForIFrameCheckCreator());
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

    // At this stage there is some checks that are
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

export function* failCheckSetupSaga() {
  const framework: Frameworks | undefined = yield select(getFramework);

  if (!framework) return;

  yield put(
    openSetupPreviewDrawerCreator({
      stepToOpen: framework === Frameworks.nuxt ? 5 : 4,
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

function* watchCheckIframeFailure() {
  yield takeLatest(getType(connectToPreviewFailureCreator), failCheckSetupSaga);
}

// Saga Exports
export function* watchPreviewSagas() {
  yield fork(watchCheckSetup);
  yield fork(watchCheckIframeFailure);
}
