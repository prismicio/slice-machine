import { fork } from "redux-saga/effects";

import { watchSimulatorSagas } from "@src/modules/simulator";
import { watchAvailableCustomTypesSagas } from "@src/modules/availableCustomTypes";
import { watchSelectedCustomTypeSagas } from "@src/modules/selectedCustomType";
import { selectedSliceSagas } from "@src/modules/selectedSlice/sagas";
import { watchSliceSagas } from "@src/modules/slices";
import { watchToasterSagas } from "@src/modules/toaster";
import { screenshotsSagas } from "@src/modules/screenshots/sagas";
import { watchChangesPushSagas } from "@src/modules/pushChangesSaga";
import { watchChangelogSagas } from "@src/modules/environment";

// Single entry point to start all Sagas at once
export default function* rootSaga() {
  yield fork(watchSimulatorSagas);
  yield fork(watchAvailableCustomTypesSagas);
  yield fork(watchSliceSagas);
  yield fork(watchToasterSagas);
  yield fork(watchSelectedCustomTypeSagas);
  yield fork(screenshotsSagas);
  yield fork(selectedSliceSagas);
  yield fork(watchChangesPushSagas);
  yield fork(watchChangelogSagas);
}
