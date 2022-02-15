import { fork } from "redux-saga/effects";

import { watchSimulatorSagas } from "@src/modules/simulator";
import { watchCustomTypeSagas } from "@src/modules/customTypes";
import { watchSliceSagas } from "@src/modules/slices";
import { watchToasterSagas } from "@src/modules/toaster";

// Single entry point to start all Sagas at once
export default function* rootSaga() {
  yield fork(watchSimulatorSagas);
  yield fork(watchCustomTypeSagas);
  yield fork(watchSliceSagas);
  yield fork(watchToasterSagas);
}
