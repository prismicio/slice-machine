import { fork } from "redux-saga/effects";

import { watchSimulatorSagas } from "@src/modules/simulator";
import { watchAvailableCustomTypesSagas } from "@src/modules/availableCustomTypes";
import { watchSliceSagas } from "@src/modules/slices";
import { watchToasterSagas } from "@src/modules/toaster";
import { watchChangelogSagas } from "@src/modules/environment";

// Single entry point to start all Sagas at once
export default function* rootSaga() {
  yield fork(watchSimulatorSagas);
  yield fork(watchAvailableCustomTypesSagas);
  yield fork(watchSliceSagas);
  yield fork(watchToasterSagas);
  yield fork(watchChangelogSagas);
}
