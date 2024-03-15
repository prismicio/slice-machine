import { fork, put, takeLeading, race, take, delay } from "redux-saga/effects";
import { Reducer } from "redux";
import { ActionType, createAsyncAction, getType } from "typesafe-actions";

import { LoadingKeysEnum } from "@src/modules/loading/types";
import { SliceMachineStoreType } from "@src/redux/type";
import { withLoader } from "@src/modules/loading";

import { SimulatorStoreType } from "./types";

export const initialState: SimulatorStoreType = {
  iframeStatus: null,
  isWaitingForIframeCheck: false,
};

export const connectToSimulatorIframeCreator = createAsyncAction(
  "SIMULATOR/CONNECT_TO_SIMULATOR_IFRAME.REQUEST",
  "SIMULATOR/CONNECT_TO_SIMULATOR_IFRAME.SUCCESS",
  "SIMULATOR/CONNECT_TO_SIMULATOR_IFRAME.FAILURE",
)<undefined, undefined, undefined>();

type SimulatorActions = ActionType<
  | typeof connectToSimulatorIframeCreator.success
  | typeof connectToSimulatorIframeCreator.request
  | typeof connectToSimulatorIframeCreator.failure
>;

// Selectors

export const selectIsWaitingForIFrameCheck = (
  state: SliceMachineStoreType,
): boolean => state.simulator.isWaitingForIframeCheck;

export const selectIframeStatus = (
  state: SliceMachineStoreType,
): string | null => state.simulator.iframeStatus;

// Reducer
export const simulatorReducer: Reducer<SimulatorStoreType, SimulatorActions> = (
  state = initialState,
  action,
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
    default:
      return state;
  }
};

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

function* watchIframeCheck() {
  yield takeLeading(
    getType(connectToSimulatorIframeCreator.request),
    withLoader(
      connectToSimulatorIframe,
      LoadingKeysEnum.CHECK_SIMULATOR_IFRAME,
    ),
  );
}

// Saga Exports
export function* watchSimulatorSagas() {
  yield fork(watchIframeCheck);
}
