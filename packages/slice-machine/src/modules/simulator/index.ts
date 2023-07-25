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
} from "redux-saga/effects";
import {
  checkSimulatorSetup,
  getSimulatorSetupSteps,
  saveSliceMock,
  SaveSliceMockRequest,
} from "@src/apiClient";
import {
  selectIsSimulatorAvailableForFramework,
  updateManifestCreator,
} from "@src/modules/environment";
import { withLoader } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { SimulatorCheckResponse } from "@models/common/Simulator";

import { openToasterCreator, ToasterType } from "@src/modules/toaster";
import { updateSliceMock } from "../slices";

import { modalOpenCreator } from "../modal";
import { ModalKeysEnum } from "../modal/types";
import { updateSelectedSliceMocks } from "../selectedSlice/actions";

export const initialState: SimulatorStoreType = {
  setupSteps: null,
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
    setupSteps: NonNullable<SimulatorStoreType["setupSteps"]>;
    setupStatus: SimulatorStoreType["setupStatus"];
  },
  {
    setupSteps?: NonNullable<SimulatorStoreType["setupSteps"]>;
    error: Error;
  }
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

export const selectSetupSteps = (
  state: SliceMachineStoreType
): SimulatorStoreType["setupSteps"] => state.simulator.setupSteps;

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
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        setupSteps: action.payload.setupSteps || null,
        setupStatus: {
          ...state.setupStatus,
          manifest: "ko",
        },
      };
    case getType(checkSimulatorSetupCreator.success):
      return {
        ...state,
        setupSteps: action.payload.setupSteps,
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
    const setupStatus: SimulatorCheckResponse = yield call(checkSimulatorSetup);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const setupSteps: Awaited<ReturnType<typeof getSimulatorSetupSteps>> =
      yield call(getSimulatorSetupSteps);

    if (setupStatus.manifest === "ok") {
      yield put(
        checkSimulatorSetupCreator.success({
          setupSteps: setupSteps.steps,
          setupStatus,
        })
      );
      yield put(updateManifestCreator({ value: setupStatus.value }));
      if (action.payload.callback) {
        action.payload.callback();
      }
      return;
    }
    yield call(failCheckSetupSaga, { setupSteps: setupSteps.steps });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    yield put(checkSimulatorSetupCreator.failure({ error: error as Error }));
  }
}

function* connectToSimulatorIframe() {
  yield put(connectToSimulatorIframeCreator.request());
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const {
    iframeCheckOk,
  }: {
    iframeCheckOk: ReturnType<typeof connectToSimulatorIframeCreator.success>;
  } = yield race({
    iframeCheckOk: take(getType(connectToSimulatorIframeCreator.success)),
    iframeCheckKO: take(getType(connectToSimulatorIframeCreator.failure)),
    timeout: delay(20000),
  });

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (iframeCheckOk) {
    yield put(connectToSimulatorIframeCreator.success());
    return;
  }

  yield put(connectToSimulatorIframeCreator.failure());
}

export function* failCheckSetupSaga({
  setupSteps,
}: { setupSteps?: NonNullable<SimulatorStoreType["setupSteps"]> } = {}) {
  const isPreviewAvailableForFramework = (yield select(
    selectIsSimulatorAvailableForFramework
  )) as ReturnType<typeof selectIsSimulatorAvailableForFramework>;

  if (!isPreviewAvailableForFramework) {
    return;
  }

  yield put(
    checkSimulatorSetupCreator.failure({
      setupSteps,
      error: new Error(),
    })
  );
  yield put(modalOpenCreator({ modalKey: ModalKeysEnum.SIMULATOR_SETUP }));
}

export function* saveSliceMockSaga({
  payload,
}: ReturnType<typeof saveSliceMockCreator.request>): Generator {
  try {
    const { errors } = (yield call(saveSliceMock, payload)) as Awaited<
      ReturnType<typeof saveSliceMock>
    >;
    if (errors.length) {
      throw errors;
    }
    yield put(
      openToasterCreator({
        type: ToasterType.SUCCESS,
        content: "Saved",
      })
    );
    yield put(updateSliceMock(payload));

    yield put(updateSelectedSliceMocks({ mocks: payload.mocks }));
    yield put(saveSliceMockCreator.success());
  } catch (error) {
    yield put(
      openToasterCreator({
        type: ToasterType.ERROR,
        content: "Error saving content",
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
