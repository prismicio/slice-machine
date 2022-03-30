import { Reducer } from "redux";
import { SliceMachineStoreType } from "@src/redux/type";
import {
  ActionType,
  createAction,
  createAsyncAction,
  getType,
} from "typesafe-actions";
import { SimulatorStoreType, SetupStatus } from "./types";
import {
  call,
  fork,
  put,
  select,
  takeLatest,
  race,
  take,
  delay,
  CallEffect,
} from "redux-saga/effects";
import { checkSimulatorSetup } from "@src/apiClient";
import {
  getCurrentVersion,
  getFramework,
  selectIsSimulatorAvailableForFramework,
} from "@src/modules/environment";
import { Frameworks } from "@slicemachine/core/build/models";
import { withLoader } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { SimulatorCheckResponse } from "@models/common/Simulator";

import { getStepperConfigurationByFramework } from "@lib/builders/SliceBuilder/SetupDrawer/steps";
import Tracker from "@src/tracker";

const NoStepSelected = 0;

export const initialState: SimulatorStoreType = {
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
export const openSetupDrawerCreator = createAction(
  "SIMULATOR/OPEN_SETUP_DRAWER"
)<{
  stepToOpen?: number;
}>();

export const closeSetupDrawerCreator = createAction(
  "SIMULATOR/CLOSE_SETUP_DRAWER"
)();

export const checkSimulatorSetupCreator = createAsyncAction(
  "SIMULATOR/CHECK_SETUP.REQUEST",
  "SIMULATOR/CHECK_SETUP.SUCCESS",
  "SIMULATOR/CHECK_SETUP.FAILURE"
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

export const connectToSimulatorIframeCreator = createAsyncAction(
  "SIMULATOR/CONNECT_TO_SIMULATOR_IFRAME.REQUEST",
  "SIMULATOR/CONNECT_TO_SIMULATOR_IFRAME.SUCCESS",
  "SIMULATOR/CONNECT_TO_SIMULATOR_IFRAME.FAILURE"
)<undefined, undefined, undefined>();

export const toggleSetupDrawerStepCreator = createAction(
  "SIMULATOR/TOGGLE_SETUP_DRAWER_STEP"
)<{
  stepNumber: number;
}>();

type SimulatorActions = ActionType<
  | typeof openSetupDrawerCreator
  | typeof closeSetupDrawerCreator
  | typeof toggleSetupDrawerStepCreator
  | typeof connectToSimulatorIframeCreator.success
  | typeof connectToSimulatorIframeCreator.request
  | typeof connectToSimulatorIframeCreator.failure
  | typeof checkSimulatorSetupCreator.success
>;

// Selectors
export const selectIsSetupDrawerOpen = (
  state: SliceMachineStoreType
): boolean => state.simulator.setupDrawer.isOpen;

export const selectSetupStatus = (state: SliceMachineStoreType): SetupStatus =>
  state.simulator.setupStatus;

export const selectIsWaitingForIFrameCheck = (
  state: SliceMachineStoreType
): boolean => state.simulator.isWaitingForIframeCheck;

export const selectUserHasAtLeastOneStepMissing = (
  state: SliceMachineStoreType
): boolean =>
  state.simulator.setupStatus.dependencies === "ko" ||
  state.simulator.setupStatus.iframe === "ko" ||
  state.simulator.setupStatus.manifest === "ko";

export const selectUserHasConfiguredAllSteps = (
  state: SliceMachineStoreType
): boolean =>
  state.simulator.setupStatus.dependencies === "ok" &&
  state.simulator.setupStatus.iframe === "ok" &&
  state.simulator.setupStatus.manifest === "ok";

export const selectOpenedStep = (state: SliceMachineStoreType): number =>
  state.simulator.setupDrawer.openedStep;

// Reducer
export const simulatorReducer: Reducer<SimulatorStoreType, SimulatorActions> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case getType(openSetupDrawerCreator):
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
    case getType(connectToSimulatorIframeCreator.request):
      return {
        ...state,
        isWaitingForIframeCheck: true,
      };
    case getType(connectToSimulatorIframeCreator.success):
      return {
        ...state,
        setupStatus: {
          ...state.setupStatus,
          iframe: "ok",
        },
        isWaitingForIframeCheck: false,
      };
    case getType(connectToSimulatorIframeCreator.failure):
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
    case getType(checkSimulatorSetupCreator.success):
      return {
        ...state,
        setupStatus: {
          ...state.setupStatus,
          ...action.payload.setupStatus,
        },
      };
    case getType(closeSetupDrawerCreator):
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
  action: ReturnType<typeof checkSimulatorSetupCreator.request>
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data: setupStatus }: { data: SimulatorCheckResponse } = yield call(
      checkSimulatorSetup
    );

    // All the backend checks are ok ask for the frontend Iframe check
    if ("ok" === setupStatus.manifest && "ok" === setupStatus.dependencies) {
      yield put(
        checkSimulatorSetupCreator.success({
          setupStatus: { iframe: null, ...setupStatus },
        })
      );
      yield put(connectToSimulatorIframeCreator.request());
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const {
        timeout,
        iframeCheckKO,
        iframeCheckOk,
      }: {
        iframeCheckOk: ReturnType<
          typeof connectToSimulatorIframeCreator.success
        >;
        iframeCheckKO: ReturnType<
          typeof connectToSimulatorIframeCreator.failure
        >;
        timeout: CallEffect<true>;
      } = yield race({
        iframeCheckOk: take(getType(connectToSimulatorIframeCreator.success)),
        iframeCheckKO: take(getType(connectToSimulatorIframeCreator.failure)),
        timeout: delay(10000),
      });

      if (iframeCheckOk && action.payload.callback) {
        action.payload.callback();
        return;
      }

      if (timeout) {
        yield put(connectToSimulatorIframeCreator.failure());
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
      yield put(openSetupDrawerCreator({}));
      return;
    }

    yield put(
      checkSimulatorSetupCreator.success({
        setupStatus: { iframe: null, ...setupStatus },
      })
    );
    yield call(failCheckSetupSaga);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    yield put(checkSimulatorSetupCreator.failure(error));
  }
}

export function* failCheckSetupSaga() {
  const framework = (yield select(getFramework)) as ReturnType<
    typeof getFramework
  >;
  const isPreviewAvailableForFramework = (yield select(
    selectIsSimulatorAvailableForFramework
  )) as ReturnType<typeof selectIsSimulatorAvailableForFramework>;

  if (!isPreviewAvailableForFramework) {
    return;
  }

  const { length } = getStepperConfigurationByFramework(framework).steps;

  yield put(
    openSetupDrawerCreator({
      stepToOpen: length,
    })
  );
}

function* trackOpenSetupDrawerSaga() {
  const framework: Frameworks = (yield select(getFramework)) as ReturnType<
    typeof getFramework
  >;
  const version: string = (yield select(getCurrentVersion)) as ReturnType<
    typeof getCurrentVersion
  >;

  void Tracker.get().trackSliceSimulatorSetup(framework, version);
}

// Saga watchers
function* watchCheckSetup() {
  yield takeLatest(
    getType(checkSimulatorSetupCreator.request),
    withLoader(checkSetupSaga, LoadingKeysEnum.CHECK_SIMULATOR)
  );
  yield takeLatest(getType(openSetupDrawerCreator), trackOpenSetupDrawerSaga);
}

// Saga Exports
export function* watchSimulatorSagas() {
  yield fork(watchCheckSetup);
}
