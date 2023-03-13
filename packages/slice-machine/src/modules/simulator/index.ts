import { Reducer } from "redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { ActionType, createAsyncAction, getType } from "typesafe-actions";
import { SimulatorStoreType } from "./types";
import {
  call,
  fork,
  put,
  select,
  takeLeading,
  takeLatest,
  race,
  take,
  delay,
  SagaReturnType,
} from "redux-saga/effects";
import {
  checkSimulatorSetup,
  saveSliceMock,
  SaveSliceMockRequest,
} from "@src/apiClient";
import {
  getFramework,
  selectIsSimulatorAvailableForFramework,
  updateManifestCreator,
} from "@src/modules/environment";
import { Frameworks } from "@slicemachine/core/build/models";
import { withLoader } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { SimulatorCheckResponse } from "@models/common/Simulator";

import Tracker from "@src/tracking/client";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";
import { updateSliceMock } from "../slices";

import { modalOpenCreator } from "../modal";
import { ModalKeysEnum } from "../modal/types";
import { updateSelectedSliceMocks } from "../selectedSlice/actions";

export const initialState: SimulatorStoreType = {
  iframeStatus: null,
  setupStatus: {
    manifest: null,
  },
  isWaitingForIframeCheck: false,
  savingMock: false,
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

export const saveSliceMockCreator = createAsyncAction(
  "SIMULATOR/SAVE_MOCK.REQUEST",
  "SIMULATOR/SAVE_MOCK.SUCCESS",
  "SIMULATOR/SAVE_MOCK.FAILURE"
)<SaveSliceMockRequest, undefined, undefined>();

type SimulatorActions = ActionType<
  | typeof connectToSimulatorIframeCreator.success
  | typeof connectToSimulatorIframeCreator.request
  | typeof connectToSimulatorIframeCreator.failure
  | typeof checkSimulatorSetupCreator.success
  | typeof saveSliceMockCreator.request
  | typeof saveSliceMockCreator.success
  | typeof saveSliceMockCreator.failure
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

export const selectSavingMock = (state: SliceMachineStoreType): boolean =>
  state.simulator.savingMock;

// Reducer
export const simulatorReducer: Reducer<SimulatorStoreType, SimulatorActions> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case getType(connectToSimulatorIframeCreator.request):
      return {
        ...state,
        iframeStatus: null,
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
    case getType(saveSliceMockCreator.request): {
      return {
        ...state,
        savingMock: true,
      };
    }

    case getType(saveSliceMockCreator.success): {
      return {
        ...state,
        savingMock: false,
      };
    }

    case getType(saveSliceMockCreator.failure): {
      return {
        ...state,
        savingMock: false,
      };
    }
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const {
    iframeCheckOk
  }: {
    iframeCheckOk: ReturnType<typeof connectToSimulatorIframeCreator.success>;
  } = yield race({
    iframeCheckOk: take(getType(connectToSimulatorIframeCreator.success)),
    iframeCheckKO: take(getType(connectToSimulatorIframeCreator.failure)),
    timeout: delay(20000),
  });

  if(iframeCheckOk) {
    yield put(connectToSimulatorIframeCreator.success());
    return;
  }

  yield put(connectToSimulatorIframeCreator.failure());
  
}

export function* failCheckSetupSaga() {
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

  void Tracker.get().trackSliceSimulatorSetup(framework);
}

export function* saveSliceMockSaga({
  payload,
}: ReturnType<typeof saveSliceMockCreator.request>): Generator {
  try {
    const data = (yield call(saveSliceMock, payload)) as SagaReturnType<
      typeof saveSliceMock
    >;
    yield put(
      openToasterCreator({
        type: ToasterType.SUCCESS,
        content: "Saved",
      })
    );
    yield put(updateSliceMock(data));

    yield put(updateSelectedSliceMocks({ mocks: data.mock }));
    yield put(saveSliceMockCreator.success());
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error saving content";
    yield put(
      openToasterCreator({
        type: ToasterType.ERROR,
        content: message,
      })
    );
    yield put(saveSliceMockCreator.failure());
  }
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

function* watchSaveSliceMock() {
  yield takeLatest(
    getType(saveSliceMockCreator.request),
    withLoader(saveSliceMockSaga, LoadingKeysEnum.SIMULATOR_SAVE_MOCK)
  );
}

// Saga Exports
export function* watchSimulatorSagas() {
  yield fork(watchCheckSetup);
  yield fork(watchSaveSliceMock);
  yield fork(watchIframeCheck);
}
