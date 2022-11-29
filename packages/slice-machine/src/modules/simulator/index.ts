import { Reducer } from "redux";
import { SliceMachineStoreType } from "@src/redux/type";
import {
  ActionType,
  createAction,
  createAsyncAction,
  getType,
} from "typesafe-actions";
import { SimulatorStoreType } from "./types";
import {
  call,
  fork,
  put,
  select,
  takeLeading,
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
  updateManifestCreator,
} from "@src/modules/environment";
import { Frameworks } from "@slicemachine/core/build/models";
import { withLoader } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { SimulatorCheckResponse } from "@models/common/Simulator";

import Tracker from "@src/tracking/client";
import { modalOpenCreator } from "../modal";
import { ModalKeysEnum } from "../modal/types";

export const initialState: SimulatorStoreType = {
  iframeStatus: null,
  setupStatus: {
    manifest: null,
  },
  isWaitingForIframeCheck: false,
};

export const checkSimulatorSetupCreator = createAsyncAction(
  "SIMULATOR/CHECK_SETUP.REQUEST",
  "SIMULATOR/CHECK_SETUP.SUCCESS",
  "SIMULATOR/CHECK_SETUP.FAILURE"
)<
  {
    callback?: () => void;
  },
  {
    setupStatus: SimulatorStoreType["setupStatus"];
  },
  Error
>();

export const connectToSimulatorIframeCreator = createAsyncAction(
  "SIMULATOR/CONNECT_TO_SIMULATOR_IFRAME.REQUEST",
  "SIMULATOR/CONNECT_TO_SIMULATOR_IFRAME.SUCCESS",
  "SIMULATOR/CONNECT_TO_SIMULATOR_IFRAME.FAILURE"
)<undefined, undefined, undefined>();

type SimulatorActions = ActionType<
  | typeof connectToSimulatorIframeCreator.success
  | typeof connectToSimulatorIframeCreator.request
  | typeof connectToSimulatorIframeCreator.failure
  | typeof checkSimulatorSetupCreator.success
  | typeof checkSimulatorSetupCreator.failure
>;

// Selectors
export const selectSetupStatus = (
  state: SliceMachineStoreType
): SimulatorStoreType["setupStatus"] => state.simulator.setupStatus;

export const selectIsWaitingForIFrameCheck = (
  state: SliceMachineStoreType
): boolean => state.simulator.isWaitingForIframeCheck;

export const selectIframeStatus = (
  state: SliceMachineStoreType
): string | null => state.simulator.iframeStatus;

// Reducer
export const simulatorReducer: Reducer<SimulatorStoreType, SimulatorActions> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case getType(connectToSimulatorIframeCreator.request):
      return {
        ...state,
        isWaitingForIframeCheck: true,
      };
    case getType(connectToSimulatorIframeCreator.success):
      return {
        ...state,
        iframeStatus: "ok",
        isWaitingForIframeCheck: false,
      };
    case getType(connectToSimulatorIframeCreator.failure):
      return {
        ...state,
        iframeStatus: "ko",
        isWaitingForIframeCheck: false,
      };
    case getType(checkSimulatorSetupCreator.failure):
      return {
        ...state,
        setupStatus: {
          ...state.setupStatus,
          manifest: "ko",
        },
      };
    case getType(checkSimulatorSetupCreator.success):
      return {
        ...state,
        setupStatus: {
          ...state.setupStatus,
          manifest: "ok",
        },
      };
    default:
      return state;
  }
};

// Sagas
export function* checkSetupSaga(
  action: ReturnType<typeof checkSimulatorSetupCreator.request>
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data: setupStatus }: { data: SimulatorCheckResponse } = yield call(
      checkSimulatorSetup
    );

    if (setupStatus.manifest === "ok") {
      yield put(
        checkSimulatorSetupCreator.success({
          setupStatus,
        })
      );
      yield put(updateManifestCreator({ value: setupStatus.value }));
      if (action.payload.callback) {
        action.payload.callback();
      }
      return;
    }
    yield call(failCheckSetupSaga);
    yield call(trackOpenSetupModalSaga);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    yield put(checkSimulatorSetupCreator.failure(error as Error));
  }
}

function* connectToSimulatorIframe() {
  yield put(connectToSimulatorIframeCreator.request());
  const {
    timeout,
    iframeCheckKO,
  }: {
    iframeCheckKO: ReturnType<typeof connectToSimulatorIframeCreator.failure>;
    timeout: CallEffect<true>;
  } = yield race({
    iframeCheckOk: take(getType(connectToSimulatorIframeCreator.success)),
    iframeCheckKO: take(getType(connectToSimulatorIframeCreator.failure)),
    timeout: delay(5000),
  });
  if (timeout || iframeCheckKO) {
    yield put(connectToSimulatorIframeCreator.failure());
    return;
  }
  yield put(connectToSimulatorIframeCreator.success());
}

export function* failCheckSetupSaga() {
  const framework = (yield select(getFramework)) as ReturnType<
    typeof getFramework
  >;
  // This should be used in track event
  framework;
  const isPreviewAvailableForFramework = (yield select(
    selectIsSimulatorAvailableForFramework
  )) as ReturnType<typeof selectIsSimulatorAvailableForFramework>;

  if (!isPreviewAvailableForFramework) {
    return;
  }
  yield put(checkSimulatorSetupCreator.failure(new Error()));
  yield put(modalOpenCreator({ modalKey: ModalKeysEnum.SIMULATOR_SETUP }));
}

export function* trackOpenSetupModalSaga() {
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
  yield takeLeading(
    getType(checkSimulatorSetupCreator.request),
    withLoader(checkSetupSaga, LoadingKeysEnum.CHECK_SIMULATOR)
  );
}

function* watchIframeCheck() {
  yield takeLeading(
    getType(connectToSimulatorIframeCreator.request),
    withLoader(connectToSimulatorIframe, LoadingKeysEnum.CHECK_SIMULATOR_IFRAME)
  );
}

// Saga Exports
export function* watchSimulatorSagas() {
  yield fork(watchCheckSetup);
  yield fork(watchIframeCheck);
}
